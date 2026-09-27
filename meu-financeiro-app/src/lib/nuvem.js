// Conversa com o Firebase: login com Google e dados na nuvem (Firestore).
// Este arquivo só é carregado quando a pessoa usa a nuvem (o app abre mais rápido sem ele).
//
// Como os dados ficam no Firestore (cada conta só acessa a própria pasta):
//   usuarios/<uid>                 -> versão atual, quantas partes, lista de fotos
//   usuarios/<uid>/partes/<n>      -> os dados do app (JSON compactado), em partes
//   usuarios/<uid>/cupons/<id>     -> as fotos dos cupons
//   usuarios/<uid>/config/familia  -> { familia: <id> } quando a conta está numa família
// Modo família (só quem está na lista "membros" acessa):
//   familias/<id>                  -> igual a usuarios/<uid> + dono, membros, nomes, convites, nome
//   familias/<id>/partes/<n>, familias/<id>/cupons/<id>
//   convites/<código>              -> { familia, criadoPor, expiraEm, usadoPor? } (serve para uma pessoa)

import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "firebase/auth";
import {
  Bytes,
  Timestamp,
  arrayRemove,
  arrayUnion,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore/lite";
import { FIREBASE_CONFIG, NUVEM_EMULADOR } from "../config/firebase.js";
import { normalizar } from "../storage/storage.js";
import { ehAppAndroid } from "./modoApp.js";

const FORMATO = 1;
const TAMANHO_PARTE = 700 * 1024;
const LIMITE_FOTO = 1000 * 1000;
const FOTOS_POR_VEZ = 400;

let app = null;
let auth = null;
let db = null;

// No app Android o login vai para a página do Google e volta. Para isso funcionar, o "authDomain"
// é o próprio endereço do app: os arquivos de login do Firebase ficam em public/__/auth/
// (e o endereço .../__/auth/handler precisa estar autorizado no Google Cloud).
function configuracao() {
  if (!NUVEM_EMULADOR && ehAppAndroid() && typeof window !== "undefined") {
    return { ...FIREBASE_CONFIG, authDomain: window.location.host };
  }
  return FIREBASE_CONFIG;
}

function iniciar() {
  if (app) return;
  app = initializeApp(configuracao());
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
  if (NUVEM_EMULADOR && typeof window !== "undefined" && window.__contaDeTeste && !window.__testarRedirect) {
    const c = window.__contaDeTeste;
    const token = JSON.stringify({ sub: c.sub, email: c.email, email_verified: true, name: c.nome });
    const r = await signInWithCredential(auth, GoogleAuthProvider.credential(token));
    return usuarioDe(r.user);
  }
  const provedor = new GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: "select_account" });
  if (ehAppAndroid()) {
    // app Android: vai para a página do Google e volta para o app (ver concluirRedirect)
    await signInWithRedirect(auth, provedor);
    return new Promise(() => {});
  }
  const resultado = await signInWithPopup(auth, provedor);
  return usuarioDe(resultado.user);
}

// Volta da página do Google (app Android): a conta que entrou, ou null se não entrou
export async function concluirRedirect() {
  iniciar();
  const resultado = await getRedirectResult(auth);
  await auth.authStateReady();
  const u = resultado?.user || auth.currentUser;
  return u ? usuarioDe(u) : null;
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
const CANCELADO = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
  "auth/redirect-cancelled-by-user"
]);

export function mensagemDaNuvem(erro) {
  const codigo = String(erro?.code || "");
  if (CANCELADO.has(codigo)) return { tipo: "cancelado", texto: "Login cancelado." };
  if (SEM_CONEXAO.has(codigo) || (typeof navigator !== "undefined" && navigator.onLine === false)) {
    return { tipo: "offline", texto: "Sem conexão com a nuvem. Tento de novo sozinho." };
  }
  if (SESSAO.has(codigo)) return { tipo: "sessao", texto: "Entre de novo na sua conta para continuar sincronizando." };
  if (erro?.familia) return { tipo: "erro", texto: erro.message };
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

// Onde ficam os dados: a pasta da conta (uid) ou a da família ({ tipo: "familia", id })
function pastaDos(espaco) {
  if (espaco && typeof espaco === "object" && espaco.tipo === "familia") return ["familias", espaco.id];
  return ["usuarios", typeof espaco === "object" && espaco ? espaco.id : espaco];
}

export function criarAdaptador(espaco) {
  iniciar();
  const [colecao, id] = pastaDos(espaco);
  const refInfo = doc(db, colecao, id);
  const refParte = (i) => doc(db, colecao, id, "partes", String(i));
  const refFoto = (fid) => doc(db, colecao, id, "cupons", fid);

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

// ---------- família ----------

const DIAS_DO_CONVITE = 7;

const refPonteiro = (uid) => doc(db, "usuarios", uid, "config", "familia");
const refFamilia = (fid) => doc(db, "familias", fid);
const refConvite = (codigo) => doc(db, "convites", codigo);

function erroDaFamilia(codigo, texto) {
  const erro = new Error(texto);
  erro.code = codigo;
  erro.familia = true;
  return erro;
}

// Família da conta (id) ou null
export async function lerFamiliaDaConta(uid) {
  iniciar();
  const s = await getDoc(refPonteiro(uid));
  const fid = s.exists() ? s.data().familia : null;
  return typeof fid === "string" && fid ? fid : null;
}

export async function marcarFamiliaDaConta(uid, fid) {
  iniciar();
  if (fid) await setDoc(refPonteiro(uid), { familia: fid, desde: new Date().toISOString() });
  else await deleteDoc(refPonteiro(uid));
}

// { id, nome, dono, membros: [{ uid, nome, email }], convites } (só quem é da família consegue ler)
export async function lerFamilia(fid) {
  iniciar();
  const s = await getDoc(refFamilia(fid));
  if (!s.exists()) return null;
  const d = s.data();
  const nomes = d.nomes && typeof d.nomes === "object" ? d.nomes : {};
  const membros = (Array.isArray(d.membros) ? d.membros : []).map((uid) => ({
    uid,
    nome: String(nomes[uid]?.nome || ""),
    email: String(nomes[uid]?.email || "")
  }));
  return {
    id: fid,
    nome: String(d.nome || "Família"),
    dono: String(d.dono || ""),
    membros,
    convites: Array.isArray(d.convites) ? d.convites.filter((c) => typeof c === "string") : [],
    partes: Number(d.partes) || 0,
    fotos: Array.isArray(d.fotos) ? d.fotos.filter((x) => typeof x === "string") : []
  };
}

// Cria a família (a conta vira a dona e a única pessoa da lista). Os dados são enviados depois.
export async function criarFamilia(usuario, nome) {
  iniciar();
  const ref = doc(collection(db, "familias"));
  await setDoc(ref, {
    dono: usuario.uid,
    membros: [usuario.uid],
    nomes: { [usuario.uid]: { nome: usuario.nome || "", email: usuario.email || "" } },
    convites: [],
    nome: String(nome || "Família").slice(0, 60),
    criadaEm: new Date().toISOString(),
    fotos: []
  });
  return ref.id;
}

// Código novo (vale por 7 dias); só a dona/o dono da família cria
export async function criarConvite(fid, uid, codigo) {
  iniciar();
  await setDoc(refConvite(codigo), {
    familia: fid,
    criadoPor: uid,
    expiraEm: Timestamp.fromMillis(Date.now() + DIAS_DO_CONVITE * 24 * 60 * 60 * 1000)
  });
  await updateDoc(refFamilia(fid), { convites: arrayUnion(codigo) });
  return codigo;
}

// Entra na família do código. Devolve o id da família.
// Cada código serve para uma pessoa: ao entrar, o código fica marcado como usado (junto, na mesma gravação).
export async function entrarComConvite(codigo, usuario) {
  iniciar();
  const s = await getDoc(refConvite(codigo));
  if (!s.exists()) throw erroDaFamilia("convite-invalido", "Código não encontrado. Confira as letras e tente de novo.");
  const c = s.data();
  const expira = c.expiraEm && typeof c.expiraEm.toMillis === "function" ? c.expiraEm.toMillis() : 0;
  if (!(expira > Date.now())) throw erroDaFamilia("convite-vencido", "Este código já venceu. Peça um código novo.");
  const fid = String(c.familia || "");
  const usadoPor = typeof c.usadoPor === "string" ? c.usadoPor : "";
  if (usadoPor && usadoPor !== usuario.uid) {
    throw erroDaFamilia("convite-usado", "Este código já foi usado por outra pessoa. Peça um código novo (cada código serve para uma pessoa).");
  }
  // já é da família (ex.: entrou por outro aparelho)
  try {
    const f = await lerFamilia(fid);
    if (f && f.membros.some((m) => m.uid === usuario.uid)) return fid;
  } catch {
    // ainda não é da família: não consegue ler
  }
  if (usadoPor) throw erroDaFamilia("convite-usado", "Este código já foi usado. Peça um código novo.");
  const lote = writeBatch(db);
  lote.update(refConvite(codigo), { usadoPor: usuario.uid, usadoEm: new Date().toISOString() });
  lote.update(refFamilia(fid), {
    membros: arrayUnion(usuario.uid),
    [`nomes.${usuario.uid}`]: { nome: usuario.nome || "", email: usuario.email || "" },
    ultimoConvite: codigo
  });
  await lote.commit();
  return fid;
}

// Sai da família (a própria conta) ou tira alguém (só a dona/o dono)
export async function tirarDaFamilia(fid, uid) {
  iniciar();
  await updateDoc(refFamilia(fid), { membros: arrayRemove(uid), [`nomes.${uid}`]: deleteField() });
}

// Apaga a família inteira (só a dona/o dono): dados, fotos, convites
export async function apagarFamilia(fid) {
  iniciar();
  const f = await lerFamilia(fid);
  if (!f) return;
  for (let i = 0; i < f.partes; i += 1) await deleteDoc(doc(db, "familias", fid, "partes", String(i)));
  for (const id of f.fotos) if (idValido(id)) await deleteDoc(doc(db, "familias", fid, "cupons", id));
  for (const codigo of f.convites) await deleteDoc(refConvite(codigo)).catch(() => {});
  await deleteDoc(refFamilia(fid));
}
