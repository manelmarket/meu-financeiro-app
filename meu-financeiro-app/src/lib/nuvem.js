// Conversa com o Firebase: login com Google e dados na nuvem (Firestore).
// Este arquivo só é carregado quando a pessoa usa a nuvem (o app abre mais rápido sem ele).
//
// Como os dados ficam no Firestore (cada conta só acessa a própria pasta):
//   usuarios/<uid>                 -> versão atual, quantas partes, lista de fotos
//   usuarios/<uid>/partes/<n>      -> os dados do app (JSON compactado), em partes
//   usuarios/<uid>/cupons/<id>     -> as fotos dos cupons

import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  Bytes,
  arrayRemove,
  arrayUnion,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  setDoc,
  updateDoc
} from "firebase/firestore/lite";
import { FIREBASE_CONFIG, NUVEM_EMULADOR } from "../config/firebase.js";
import { normalizar } from "../storage/storage.js";

const FORMATO = 1;
const TAMANHO_PARTE = 700 * 1024;
const LIMITE_FOTO = 1000 * 1000;
const FOTOS_POR_VEZ = 400;

let app = null;
let auth = null;
let db = null;

function iniciar() {
  if (app) return;
  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
  if (NUVEM_EMULADOR) {
    connectAuthEmulator(auth, `http://${NUVEM_EMULADOR}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, NUVEM_EMULADOR, 8080);
  }
}

// ---------- login ----------

function usuarioDe(u) {
  return { uid: u.uid, email: u.email || "", nome: u.displayName || "", foto: u.photoURL || "" };
}

// Carrega o login antes do toque no botão: no celular/Safari a janela do Google
// só abre se for logo em seguida ao toque.
export function prepararLogin() {
  iniciar();
}

export async function usuarioAtual() {
  iniciar();
  await auth.authStateReady();
  return auth.currentUser ? usuarioDe(auth.currentUser) : null;
}

export function observarUsuario(callback) {
  iniciar();
  return onAuthStateChanged(auth, (u) => callback(u ? usuarioDe(u) : null));
}

export async function entrarComGoogle() {
  iniciar();
  // Só nos testes automáticos com o emulador (nunca no app publicado): entra sem abrir janela
  if (NUVEM_EMULADOR && typeof window !== "undefined" && window.__contaDeTeste) {
    const c = window.__contaDeTeste;
    const token = JSON.stringify({ sub: c.sub, email: c.email, email_verified: true, name: c.nome });
    const r = await signInWithCredential(auth, GoogleAuthProvider.credential(token));
    return usuarioDe(r.user);
  }
  const provedor = new GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: "select_account" });
  const resultado = await signInWithPopup(auth, provedor);
  return usuarioDe(resultado.user);
}

export async function sairDaConta() {
  iniciar();
  await signOut(auth);
}

// ---------- mensagens de erro ----------

const MENSAGENS = {
  "auth/popup-blocked": "O navegador bloqueou a janela de login. Permita pop-ups para este site e tente de novo.",
  "auth/unauthorized-domain":
    "Este endereço não está autorizado no Firebase. Abra o app por meu-financeiro-app-kxb.pages.dev (ou adicione este domínio em Authentication → Configurações → Domínios autorizados).",
  "auth/operation-not-allowed": "O login com Google não está ligado no Firebase (Authentication → Método de login → Google).",
  "auth/configuration-not-found": "O Authentication ainda não foi ativado no Firebase (Authentication → Vamos começar).",
  "auth/invalid-api-key": "A configuração do Firebase dentro do app está errada.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "A configuração do Firebase dentro do app está errada.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
  "auth/user-disabled": "Esta conta foi desativada no Firebase.",
  "permission-denied": "A nuvem recusou o acesso. Confira se as Regras do Firestore foram publicadas.",
  "not-found": "O banco de dados ainda não foi criado no Firebase (Firestore Database → Criar banco de dados).",
  "resource-exhausted": "O limite grátis de hoje da nuvem acabou. Amanhã volta a sincronizar sozinho.",
  "failed-precondition": "O banco de dados da nuvem ainda não está pronto. Tente de novo em alguns minutos."
};

const SEM_CONEXAO = new Set(["unavailable", "deadline-exceeded", "auth/network-request-failed", "auth/timeout"]);
const SESSAO = new Set([
  "unauthenticated",
  "auth/user-token-expired",
  "auth/invalid-user-token",
  "auth/requires-recent-login",
  "auth/user-not-found"
]);
const CANCELADO = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"]);

export function mensagemDaNuvem(erro) {
  const codigo = String(erro?.code || "");
  if (CANCELADO.has(codigo)) return { tipo: "cancelado", texto: "Login cancelado." };
  if (SEM_CONEXAO.has(codigo) || (typeof navigator !== "undefined" && navigator.onLine === false)) {
    return { tipo: "offline", texto: "Sem conexão com a nuvem. Tento de novo sozinho." };
  }
  if (SESSAO.has(codigo)) return { tipo: "sessao", texto: "Entre de novo na sua conta para continuar sincronizando." };
  if (MENSAGENS[codigo]) return { tipo: "erro", texto: MENSAGENS[codigo] };
  if (erro?.conflito) return { tipo: "erro", texto: "A nuvem mudou várias vezes seguidas. Tento de novo daqui a pouco." };
  const detalhe = erro?.message ? ` (${String(erro.message).slice(0, 140)})` : "";
  return { tipo: "erro", texto: `Não foi possível sincronizar${detalhe}.` };
}

// ---------- dados ----------

function nomeDoAparelho() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "outro aparelho";
}

function erroDeConflito() {
  const erro = new Error("A nuvem mudou enquanto este aparelho enviava.");
  erro.conflito = true;
  return erro;
}

// Os dados vão sem compactar: assim qualquer navegador (inclusive iPhone antigo) lê.
// (a leitura ainda entende dados compactados com gzip, se algum dia existirem)
async function descompactar(bytes, gzip) {
  if (!gzip) return new TextDecoder().decode(bytes);
  if (typeof DecompressionStream !== "function") {
    throw new Error("este navegador é antigo demais para ler os dados da nuvem");
  }
  const fluxo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(fluxo).text();
}

function idValido(id) {
  return typeof id === "string" && /^[A-Za-z0-9_.-]{1,200}$/.test(id) && id !== "." && id !== ".." && !/^__.*__$/.test(id);
}

export function criarAdaptador(uid) {
  iniciar();
  const refInfo = doc(db, "usuarios", uid);
  const refParte = (i) => doc(db, "usuarios", uid, "partes", String(i));
  const refFoto = (id) => doc(db, "usuarios", uid, "cupons", id);

  async function lerInfo() {
    const s = await getDoc(refInfo);
    if (!s.exists()) return null;
    const d = s.data();
    if (!(Number(d.versao) > 0)) return null;
    return {
      versao: Number(d.versao),
      partes: Number(d.partes) || 0,
      gzip: d.gzip !== false,
      formato: Number(d.formato) || 1,
      fotos: Array.isArray(d.fotos) ? d.fotos.filter((x) => typeof x === "string") : [],
      atualizadoEm: typeof d.atualizadoEm === "string" ? d.atualizadoEm : null,
      aparelho: typeof d.aparelho === "string" ? d.aparelho : ""
    };
  }

  async function baixarDados(infoInicial) {
    let info = infoInicial;
    for (let tentativa = 0; tentativa < 4; tentativa += 1) {
      if (info.formato > FORMATO) {
        throw new Error("os dados da nuvem são de uma versão mais nova do app; atualize a página");
      }
      if (!(info.partes > 0)) throw new Error("dados da nuvem incompletos");
      const snaps = await Promise.all(Array.from({ length: info.partes }, (_, i) => getDoc(refParte(i))));
      const completos = snaps.every((s) => s.exists() && Number(s.data().versao) === info.versao);
      if (completos) {
        const pedacos = snaps.map((s) => s.data().dados.toUint8Array());
        const bytes = new Uint8Array(pedacos.reduce((t, p) => t + p.length, 0));
        let pos = 0;
        for (const p of pedacos) {
          bytes.set(p, pos);
          pos += p.length;
        }
        const texto = await descompactar(bytes, info.gzip);
        return { versao: info.versao, dados: normalizar(JSON.parse(texto)) };
      }
      // outro aparelho gravou no meio da leitura: lê de novo
      info = (await lerInfo()) || info;
    }
    throw erroDeConflito();
  }

  async function enviarDados(dados, versaoEsperada) {
    const bytes = new TextEncoder().encode(JSON.stringify(dados));
    const gzip = false;
    const partes = [];
    for (let i = 0; i < bytes.length; i += TAMANHO_PARTE) partes.push(bytes.slice(i, i + TAMANHO_PARTE));
    if (!partes.length) partes.push(new Uint8Array(0));

    return runTransaction(db, async (t) => {
      const s = await t.get(refInfo);
      const atual = s.exists() ? Number(s.data().versao) || 0 : 0;
      if (atual !== versaoEsperada) throw erroDeConflito();
      const nova = atual + 1;
      const antes = s.exists() ? Number(s.data().partes) || 0 : 0;
      partes.forEach((p, i) => t.set(refParte(i), { versao: nova, dados: Bytes.fromUint8Array(p) }));
      for (let i = partes.length; i < antes; i += 1) t.delete(refParte(i));
      const campos = {
        versao: nova,
        partes: partes.length,
        gzip,
        formato: FORMATO,
        atualizadoEm: new Date().toISOString(),
        aparelho: nomeDoAparelho()
      };
      if (s.exists()) t.update(refInfo, campos);
      else t.set(refInfo, { ...campos, fotos: [] });
      return nova;
    });
  }

  async function enviarFoto(id, blob) {
    if (!idValido(id)) return false;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (!bytes.length || bytes.length > LIMITE_FOTO) return false;
    await setDoc(refFoto(id), {
      tipo: blob.type || "image/jpeg",
      dados: Bytes.fromUint8Array(bytes),
      criadoEm: new Date().toISOString()
    });
    await updateDoc(refInfo, { fotos: arrayUnion(id) });
    return true;
  }

  async function baixarFoto(id) {
    if (!idValido(id)) return null;
    const s = await getDoc(refFoto(id));
    if (!s.exists()) return null;
    const d = s.data();
    return new Blob([d.dados.toUint8Array()], { type: d.tipo || "image/jpeg" });
  }

  // Só apaga se a nuvem ainda estiver na versão esperada (senão outro aparelho
  // pode ter acabado de usar a foto; fica para a próxima sincronização).
  async function apagarFotos(ids, versaoEsperada) {
    let tudo = true;
    for (let i = 0; i < ids.length; i += FOTOS_POR_VEZ) {
      const grupo = ids.slice(i, i + FOTOS_POR_VEZ);
      const ok = await runTransaction(db, async (t) => {
        const s = await t.get(refInfo);
        if (!s.exists() || Number(s.data().versao) !== versaoEsperada) return false;
        for (const id of grupo) if (idValido(id)) t.delete(refFoto(id));
        t.update(refInfo, { fotos: arrayRemove(...grupo) });
        return true;
      });
      if (!ok) tudo = false;
    }
    return tudo;
  }

  return { lerInfo, baixarDados, enviarDados, enviarFoto, baixarFoto, apagarFotos };
}
