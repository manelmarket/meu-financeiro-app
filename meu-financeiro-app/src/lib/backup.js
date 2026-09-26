// Backup em arquivo: um .json com todos os dados do app e as fotos dos cupons.

import { normalizar } from "../storage/storage.js";

export const APP_DO_BACKUP = "meu-financeiro";
export const FORMATO_DO_BACKUP = 1;

const CHAVE_ULTIMO_BACKUP = "meu_financeiro_backup";
const CHAVE_COPIA = "meu_financeiro_copia";

// Fotos de cupom usadas pelos registros (lançamentos e compras dos cartões)
export function idsDasFotos(dados) {
  const ids = new Set();
  const pegar = (item) => {
    if (item && typeof item.cupomId === "string" && item.cupomId) ids.add(item.cupomId);
  };
  for (const l of Array.isArray(dados?.lancamentos) ? dados.lancamentos : []) pegar(l);
  for (const c of Array.isArray(dados?.cartoes) ? dados.cartoes : []) {
    for (const x of Array.isArray(c?.compras) ? c.compras : []) pegar(x);
  }
  return ids;
}

export function blobParaDataURL(blob) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

export async function montarBackup(dados, lerFoto, agora = new Date()) {
  const fotos = {};
  for (const id of idsDasFotos(dados)) {
    try {
      const blob = await lerFoto(id);
      if (blob) fotos[id] = await blobParaDataURL(blob);
    } catch {
      // foto que não abriu fica de fora; os dados vão inteiros
    }
  }
  return { app: APP_DO_BACKUP, formato: FORMATO_DO_BACKUP, criadoEm: agora.toISOString(), dados, fotos };
}

export function nomeDoBackup(hoje) {
  return `meu-financeiro-backup-${hoje}.json`;
}

const NAO_EH_BACKUP = "Esse arquivo não é um backup do Meu Financeiro.";

export function lerBackup(texto) {
  let obj;
  try {
    obj = JSON.parse(String(texto ?? "").replace(/^﻿/, ""));
  } catch {
    throw new Error(NAO_EH_BACKUP);
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error(NAO_EH_BACKUP);

  const ehArquivoDoApp = obj.app === APP_DO_BACKUP;
  if (ehArquivoDoApp && Number(obj.formato) > FORMATO_DO_BACKUP) {
    throw new Error("Esse backup foi feito numa versão mais nova do app. Atualize o app e tente de novo.");
  }
  const dados = ehArquivoDoApp ? obj.dados : obj;
  const temListas =
    dados && typeof dados === "object" && (Array.isArray(dados.lancamentos) || Array.isArray(dados.cartoes));
  if (!temListas) throw new Error(NAO_EH_BACKUP);

  const fotos = {};
  if (ehArquivoDoApp && obj.fotos && typeof obj.fotos === "object") {
    for (const [id, url] of Object.entries(obj.fotos)) {
      if (id && typeof url === "string" && url.startsWith("data:image")) fotos[id] = url;
    }
  }
  const criadoEm = ehArquivoDoApp && typeof obj.criadoEm === "string" ? obj.criadoEm : null;
  return { dados: normalizar(dados), fotos, criadoEm };
}

export function contarDados(dados) {
  const cartoes = Array.isArray(dados?.cartoes) ? dados.cartoes : [];
  const tamanho = (lista) => (Array.isArray(lista) ? lista.length : 0);
  return {
    lancamentos: tamanho(dados?.lancamentos),
    cartoes: cartoes.length,
    compras: cartoes.reduce((t, c) => t + tamanho(c?.compras), 0),
    contas: tamanho(dados?.contasFixas),
    metas: tamanho(dados?.metas),
    investimentos: tamanho(dados?.investimentos),
    bens: tamanho(dados?.bens)
  };
}

function plural(n, um, varios) {
  return `${n} ${n === 1 ? um : varios}`;
}

export function descreverContagem(c) {
  const partes = [
    plural(c.lancamentos, "lançamento", "lançamentos"),
    `${plural(c.cartoes, "cartão", "cartões")} (${plural(c.compras, "compra", "compras")})`,
    plural(c.contas, "conta fixa", "contas fixas"),
    plural(c.metas, "meta", "metas"),
    plural(c.investimentos, "investimento", "investimentos"),
    plural(c.bens, "bem", "bens")
  ];
  return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
}

// ---------- datas para mostrar na tela ----------

function doisDigitos(n) {
  return String(n).padStart(2, "0");
}

// "26/09/2026 às 14:20"
export function dataHoraBR(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()} às ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

// "agora", "há 5 min", "hoje às 14:20", "em 25/09 às 18:00"
export function quandoFoi(iso, agora = new Date()) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  const minutos = Math.floor((agora - d) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const hora = `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
  if (d.toDateString() === agora.toDateString()) return `hoje às ${hora}`;
  return `em ${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)} às ${hora}`;
}

// ---------- lembrete de backup ----------

export function lerUltimoBackup() {
  try {
    const valor = JSON.parse(localStorage.getItem(CHAVE_ULTIMO_BACKUP) || "null");
    return valor && typeof valor.em === "string" ? valor.em : null;
  } catch {
    return null;
  }
}

export function marcarBackupFeito(agora = new Date()) {
  try {
    localStorage.setItem(CHAVE_ULTIMO_BACKUP, JSON.stringify({ em: agora.toISOString() }));
  } catch {
    // sem problema: só o lembrete não é atualizado
  }
  return agora.toISOString();
}

// dias inteiros entre uma data/hora ISO e hoje (AAAA-MM-DD, horário local)
export function diasDesde(iso, hoje) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const inicio = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const [y, m, dia] = String(hoje).split("-").map(Number);
  const fim = Date.UTC(y, m - 1, dia);
  return Math.max(0, Math.round((fim - inicio) / 86400000));
}

// ---------- cópia de segurança antes de substituir os dados ----------

export function guardarCopia(dados, motivo, agora = new Date()) {
  try {
    localStorage.setItem(CHAVE_COPIA, JSON.stringify({ em: agora.toISOString(), motivo, dados }));
    return true;
  } catch {
    return false;
  }
}

export function lerCopia() {
  try {
    const copia = JSON.parse(localStorage.getItem(CHAVE_COPIA) || "null");
    return copia && copia.dados && typeof copia.em === "string" ? copia : null;
  } catch {
    return null;
  }
}

export function apagarCopia() {
  try {
    localStorage.removeItem(CHAVE_COPIA);
  } catch {
    // nada a fazer
  }
}
