// Modo família: duas ou mais contas Google usando os MESMOS dados (lançamentos, cartões, bancos,
// contas fixas, metas...). Quem conversa com a nuvem é nuvem.js/useNuvem.js; aqui ficam as regras
// que não dependem da nuvem.
//
// O perfil (nome, apelido, telefone, nascimento) é de cada pessoa: na família ele fica em
// usuario.perfis[<uid da conta>], para cada um continuar sendo chamado pelo próprio nome.

import { juntarDados } from "./juntar.js";
import { lerBancos } from "./saldos.js";

const CAMPOS_DO_PERFIL = ["nome", "apelido", "telefone", "nascimento"];

function ehObjeto(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function perfilLimpo(perfil) {
  const r = {};
  for (const campo of CAMPOS_DO_PERFIL) {
    if (typeof perfil?.[campo] === "string" && perfil[campo].trim()) r[campo] = perfil[campo];
  }
  return r;
}

// Perfil de quem está usando o app: na família, o da própria conta; fora dela, o do usuario.
export function perfilDaPessoa(dados, conta, emFamilia) {
  const u = dados?.usuario || {};
  if (!emFamilia || !conta?.uid) return u;
  const perfis = ehObjeto(u.perfis) ? u.perfis : {};
  return ehObjeto(perfis[conta.uid]) ? perfis[conta.uid] : { nome: conta.nome || "" };
}

// Grava o perfil da pessoa (na família, só o dela)
export function comPerfilDaPessoa(dados, perfil, conta, emFamilia) {
  const u = dados.usuario || {};
  if (!emFamilia || !conta?.uid) return { ...dados, usuario: { ...u, ...perfil } };
  const perfis = ehObjeto(u.perfis) ? { ...u.perfis } : {};
  perfis[conta.uid] = { ...(ehObjeto(perfis[conta.uid]) ? perfis[conta.uid] : {}), ...perfil };
  return { ...dados, usuario: { ...u, perfis } };
}

// Coloca o perfil da pessoa dentro dos dados da família (sem apagar o que ela já tinha lá)
export function comPerfilNaFamilia(dados, uid, perfil) {
  const u = dados.usuario || {};
  const perfis = ehObjeto(u.perfis) ? { ...u.perfis } : {};
  perfis[uid] = { ...perfilLimpo(perfil), ...(ehObjeto(perfis[uid]) ? perfis[uid] : {}) };
  return { ...dados, usuario: { ...u, perfis } };
}

// Dados da família que voltam a ser só de uma pessoa (ex.: quem encerrou a família):
// o perfil dela volta a ser o perfil principal e a lista de perfis sai.
export function dadosSemFamilia(dados, uid) {
  const u = { ...(dados.usuario || {}) };
  const meu = ehObjeto(u.perfis) && ehObjeto(u.perfis[uid]) ? u.perfis[uid] : null;
  delete u.perfis;
  return { ...dados, usuario: meu ? { ...u, ...perfilLimpo(meu) } : u };
}

// O perfil principal (fora da família) a partir do "usuario" dos dados
export function perfilPrincipal(usuario) {
  return perfilLimpo(usuario);
}

function juntarBancos(daFamilia, meus) {
  const lista = [...daFamilia];
  const ids = new Set(lista.map((b) => String(b.id)));
  for (const b of meus) if (!ids.has(String(b.id))) lista.push(b);
  return lista;
}

// empréstimos (usuario.emprestimos): ficam os da família e os meus (o mesmo, pelo id, fica o da família)
function juntarEmprestimos(daFamilia, meus) {
  const lista = (v) => (Array.isArray(v) ? v.filter(ehObjeto) : []);
  return juntarBancos(lista(daFamilia), lista(meus));
}

// Entrar na família levando os próprios dados: os registros dos dois lados ficam (ver juntar.js);
// bancos, orçamentos e empréstimos também (no mesmo orçamento, vale o da família); o perfil de cada um fica separado.
export function juntarNaFamilia(pessoal, familia, uid, perfil) {
  const junto = juntarDados(familia, pessoal);
  const uFam = familia.usuario || {};
  const uMeu = pessoal.usuario || {};
  const usuario = { ...uFam };
  const bancos = juntarBancos(lerBancos(familia), lerBancos(pessoal));
  if (bancos.length || Array.isArray(uFam.bancos)) usuario.bancos = bancos;
  if (ehObjeto(uMeu.orcamentos) || ehObjeto(uFam.orcamentos)) {
    usuario.orcamentos = { ...(ehObjeto(uMeu.orcamentos) ? uMeu.orcamentos : {}), ...(ehObjeto(uFam.orcamentos) ? uFam.orcamentos : {}) };
  }
  const emprestimos = juntarEmprestimos(uFam.emprestimos, uMeu.emprestimos);
  if (emprestimos.length || Array.isArray(uFam.emprestimos)) usuario.emprestimos = emprestimos;
  return comPerfilNaFamilia({ ...junto, usuario }, uid, perfil);
}

// Código de convite: 8 letras/números fáceis de ler (sem 0/O, 1/I/L), mostrado como "ABCD-EFGH"
const LETRAS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function novoCodigo(aleatorio = null) {
  const bytes = aleatorio || (typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(8)) : null);
  let codigo = "";
  for (let i = 0; i < 8; i += 1) {
    const n = bytes ? bytes[i] : Math.floor(Math.random() * 256);
    codigo += LETRAS[n % LETRAS.length];
  }
  return codigo;
}

// "abcd efgh", "ABCD-EFGH" -> "ABCDEFGH" (ou "" se não parece um código)
export function limparCodigo(texto) {
  const c = String(texto || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return c.length === 8 ? c : "";
}

export function mostrarCodigo(codigo) {
  return codigo ? `${codigo.slice(0, 4)}-${codigo.slice(4)}` : "";
}
