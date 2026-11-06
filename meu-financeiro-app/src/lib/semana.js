// Resumo da semana e gastos fora do padrão.
//
// Gastos da semana = lançamentos de gasto + compras no cartão (pela data da compra), dos últimos 7 dias.
// A comparação é com a média semanal das 8 semanas anteriores.
// Fora do padrão: categoria que na semana passou de 1,5x a média dela (e de R$ 50).

import { arredondar, mesDaData, money, somarDias, somarMeses } from "./formato.js";
import { resumoDoMes } from "./mes.js";
import { acharAssinaturas, chaveDaAssinatura } from "./assinaturas.js";

const SEMANAS_DE_COMPARACAO = 8;

function gastosEntre(dados, inicio, fim) {
  const r = [];
  for (const l of Array.isArray(dados?.lancamentos) ? dados.lancamentos : []) {
    if (!l || l.tipo !== "saida" || !(l.data >= inicio && l.data <= fim)) continue;
    r.push({ categoria: l.categoria || "Outros", valor: Number(l.valor) || 0, descricao: l.descricao });
  }
  for (const c of Array.isArray(dados?.cartoes) ? dados.cartoes : []) {
    for (const x of Array.isArray(c.compras) ? c.compras : []) {
      if (!x || !(x.data >= inicio && x.data <= fim)) continue;
      r.push({ categoria: x.categoria || "Outros", valor: Number(x.valorTotal) || 0, descricao: x.descricao });
    }
  }
  return r;
}

function porCategoria(lista) {
  const m = {};
  for (const g of lista) m[g.categoria] = arredondar((m[g.categoria] || 0) + g.valor);
  return m;
}

// segunda-feira da semana de uma data (id da semana)
export function inicioDaSemana(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dia = new Date(y, m - 1, d).getDay(); // 0 = domingo
  return somarDias(iso, -((dia + 6) % 7));
}

export function resumoDaSemana(dados, hoje) {
  const inicio = somarDias(hoje, -6);
  const semana = gastosEntre(dados, inicio, hoje);
  const total = arredondar(semana.reduce((t, g) => t + g.valor, 0));
  const cats = porCategoria(semana);
  // assinaturas (cobrança mensal) não contam para o "fora do padrão": caem numa semana só
  const mensais = new Set(acharAssinaturas(dados, hoje).map((a) => a.chave));
  const semMensais = (lista) => lista.filter((g) => !mensais.has(chaveDaAssinatura(g.descricao || "")));
  const catsVariaveis = porCategoria(semMensais(semana));

  const antesInicio = somarDias(inicio, -7 * SEMANAS_DE_COMPARACAO);
  const antes = gastosEntre(dados, antesInicio, somarDias(inicio, -1));
  const mediaSemanal = arredondar(antes.reduce((t, g) => t + g.valor, 0) / SEMANAS_DE_COMPARACAO);
  const mediaCat = porCategoria(semMensais(antes));
  const temHistorico = antes.length > 0;

  const foraDoPadrao = temHistorico
    ? Object.entries(catsVariaveis)
        .map(([categoria, valor]) => ({ categoria, valor, media: arredondar((mediaCat[categoria] || 0) / SEMANAS_DE_COMPARACAO) }))
        .filter((c) => c.valor >= 50 && c.valor > c.media * 1.5)
        .map((c) => ({ ...c, mais: arredondar(c.valor - c.media), pct: c.media > 0 ? Math.round((c.valor / c.media - 1) * 100) : null }))
        .sort((a, b) => b.mais - a.mais)
    : [];

  // contas e faturas dos próximos 7 dias
  const ate = somarDias(hoje, 7);
  const mes = mesDaData(hoje);
  const aPagar = [...resumoDoMes(dados, mes, hoje).vencimentos, ...resumoDoMes(dados, somarMeses(mes, 1), hoje).vencimentos]
    .filter((v) => v.data >= hoje && v.data <= ate && v.status !== "paga")
    .map((v) => ({ descricao: v.descricao, valor: v.aPagar !== undefined ? v.aPagar : v.valor, data: v.data }))
    .filter((v) => v.valor > 0);

  return {
    semana: inicioDaSemana(hoje),
    inicio,
    fim: hoje,
    total,
    mediaSemanal,
    variacao: temHistorico && mediaSemanal > 0 ? Math.round((total / mediaSemanal - 1) * 100) : null,
    categorias: Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3),
    foraDoPadrao,
    aPagar,
    totalAPagar: arredondar(aPagar.reduce((t, v) => t + v.valor, 0))
  };
}

// O resumo em poucas frases (para ler na tela ou em voz alta)
export function textoDoResumo(r) {
  const partes = [];
  if (r.total > 0) {
    let frase = `Nos últimos 7 dias você gastou ${money(r.total)}`;
    if (r.variacao !== null && Math.abs(r.variacao) >= 10) frase += `, ${Math.abs(r.variacao)}% ${r.variacao > 0 ? "a mais" : "a menos"} que numa semana normal`;
    partes.push(`${frase}.`);
  } else {
    partes.push("Nenhum gasto lançado nos últimos 7 dias.");
  }
  if (r.categorias.length) partes.push(`Onde mais foi: ${r.categorias.map(([c, v]) => `${c} (${money(v)})`).join(", ")}.`);
  for (const f of r.foraDoPadrao.slice(0, 2)) {
    partes.push(`${f.categoria} está fora do padrão: ${money(f.valor)}${f.pct !== null ? `, ${f.pct}% acima do normal` : ""}.`);
  }
  if (r.aPagar.length) {
    partes.push(`Nos próximos 7 dias ${r.aPagar.length === 1 ? "vence 1 conta" : `vencem ${r.aPagar.length} contas`}: ${money(r.totalAPagar)}.`);
  }
  return partes;
}
