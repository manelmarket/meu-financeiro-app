// Lembretes de vencimento: notificação no celular antes do vencimento das faturas dos cartões
// e das contas fixas. Quem mostra a notificação é o app Android (APK), mesmo com o app fechado.
//
// Os ajustes ficam NESTE aparelho (cada celular escolhe se quer ser avisado, quando e o quê).
// O app monta a "agenda" (os próximos avisos, já com dia e hora) e entrega ao app Android
// (ver appAndroid.js). O app Android guarda a agenda e agenda cada aviso no próprio celular.

import { useSyncExternalStore } from "react";
import { resumoDoMes } from "./mes.js";
import { diaMesBR, hojeISO, lerData, mesDaData, money, somarDias, somarMeses } from "./formato.js";

const CHAVE = "meu_financeiro_lembretes";

// quantos dias antes do vencimento avisar (0 = no dia)
export const OPCOES_DE_DIAS = [0, 1, 2, 3, 5];
// horário do aviso: das 6h às 22h
export const HORAS = Array.from({ length: 17 }, (_, i) => i + 6);
// a agenda cobre este mês e os 3 seguintes (o app renova sempre que abre)
export const MESES_NA_AGENDA = 4;
export const MAXIMO_DE_LEMBRETES = 60;

const PADRAO = { ativo: false, dias: 1, hora: 9, faturas: true, contas: true, enviadoEm: 0, assinatura: "" };

function normalizar(v) {
  const a = v && typeof v === "object" ? v : {};
  return {
    ativo: a.ativo === true,
    dias: OPCOES_DE_DIAS.includes(a.dias) ? a.dias : PADRAO.dias,
    hora: HORAS.includes(a.hora) ? a.hora : PADRAO.hora,
    faturas: a.faturas !== false,
    contas: a.contas !== false,
    enviadoEm: Number(a.enviadoEm) || 0,
    assinatura: typeof a.assinatura === "string" ? a.assinatura : ""
  };
}

// ---------- ajustes deste aparelho ----------

let atual = null;
const ouvintes = new Set();

export function lerAjustes() {
  if (!atual) {
    try {
      atual = normalizar(JSON.parse(localStorage.getItem(CHAVE) || "null"));
    } catch {
      atual = normalizar(null);
    }
  }
  return atual;
}

export function mudarAjustes(parcial) {
  atual = normalizar({ ...lerAjustes(), ...parcial });
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    // sem espaço: vale até fechar o app
  }
  ouvintes.forEach((f) => f());
  return atual;
}

export function usarAjustes() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    lerAjustes
  );
}

// mudou em outra aba do mesmo aparelho
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== CHAVE) return;
    atual = null;
    ouvintes.forEach((f) => f());
  });
}

// ---------- textos (os mesmos que o app Android mostra) ----------

export function quandoVence(dias) {
  if (dias === 0) return "vence hoje";
  if (dias === 1) return "vence amanhã";
  return `vence em ${dias} dias`;
}

export function tituloDoLembrete(l) {
  return `${l.nome} ${quandoVence(l.dias)}`;
}

export function textoDoLembrete(l) {
  return `${money(l.valor)} · vencimento em ${diaMesBR(l.vence)}`;
}

export function rotuloDeDias(dias) {
  if (dias === 0) return "No dia";
  if (dias === 1) return "1 dia antes";
  return `${dias} dias antes`;
}

// "09/10 às 9h"
export function quandoAvisa(ms) {
  const d = new Date(ms);
  const dia = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const min = d.getMinutes();
  return `${dia} às ${d.getHours()}h${min ? String(min).padStart(2, "0") : ""}`;
}

// ---------- agenda ----------

function momento(iso, hora) {
  const { y, m, d } = lerData(iso);
  return new Date(y, m - 1, d, hora, 0, 0, 0).getTime();
}

// Próximos avisos: [{ id, tipo, nome, valor, vence, dias, quando }]
// - "quando" é o dia e a hora do aviso (milissegundos), no fuso deste aparelho;
// - se o momento escolhido já passou mas o vencimento ainda não, avisa no próprio dia do vencimento.
export function montarAgenda(dados, ajustes, agora = new Date()) {
  const a = normalizar(ajustes);
  const hoje = hojeISO(agora);
  const agoraMs = agora.getTime();
  const mes = mesDaData(hoje);
  const itens = [];
  const vistos = new Set();

  for (let i = 0; i < MESES_NA_AGENDA; i += 1) {
    for (const v of resumoDoMes(dados, somarMeses(mes, i), hoje).vencimentos) {
      if (v.tipo === "fatura" ? !a.faturas : !a.contas) continue;
      if (!(Number(v.valor) > 0) || v.data < hoje) continue;

      let dias = a.dias;
      let quando = momento(somarDias(v.data, -dias), a.hora);
      if (quando <= agoraMs && dias > 0) {
        dias = 0;
        quando = momento(v.data, a.hora);
      }
      if (quando <= agoraMs) continue;

      const id = `${v.id}-${v.data}-${dias}`;
      if (vistos.has(id)) continue;
      vistos.add(id);
      itens.push({
        id,
        tipo: v.tipo,
        nome: String(v.descricao || "").slice(0, 60),
        valor: Math.round(Number(v.valor) * 100) / 100,
        vence: v.data,
        dias,
        quando
      });
    }
  }

  itens.sort((x, y) => x.quando - y.quando || x.id.localeCompare(y.id));
  return itens.slice(0, MAXIMO_DE_LEMBRETES);
}

// Muda quando mudam os cartões, as contas fixas ou os ajustes (não muda com o passar dos dias).
// Serve para avisar que os lembretes do celular precisam ser atualizados quando o app não
// consegue entregar a agenda sozinho.
export function assinaturaDasRegras(dados, ajustes) {
  const a = normalizar(ajustes);
  const texto = JSON.stringify([
    (dados.cartoes || []).map((c) => [c.id, c.nome, c.vencimento, c.fechamento]),
    (dados.contasFixas || []).map((c) => [c.id, c.nome, c.dia, c.valor, c.ativa !== false, c.periodos || null]),
    a.dias,
    a.hora,
    a.faturas,
    a.contas
  ]);
  let h = 5381;
  for (let i = 0; i < texto.length; i += 1) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return `${texto.length}-${(h >>> 0).toString(36)}`;
}

// a agenda enviada ao celular ficou velha (mudaram cartões/contas/ajustes ou já faz tempo)
export function agendaDesatualizada(dados, ajustes, agora = Date.now()) {
  const a = normalizar(ajustes);
  if (!a.ativo) return false;
  if (a.assinatura !== assinaturaDasRegras(dados, a)) return true;
  return agora - a.enviadoEm > 45 * 24 * 60 * 60 * 1000;
}
