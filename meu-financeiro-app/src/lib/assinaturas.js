// Assinaturas: gastos que se repetem todo mês com valor parecido (streaming, apps, academia...).
//
// Olha os gastos dos últimos 12 meses (lançamentos e compras à vista no cartão), agrupa pela descrição
// e considera assinatura o que aparece em pelo menos 3 meses diferentes, no máximo ~1 vez por mês
// (assim o mercado de toda semana não entra), com valores próximos (até 25% de diferença da mediana).
// O que já é conta fixa e o que a pessoa mandou ignorar ficam de fora.

import { arredondar, mesDaData, somarDias, somarMeses } from "./formato.js";
import { chaveDoNome } from "./categorias.js";

const MESES = 12;

// "NETFLIX.COM 123*ABC" -> "netflix com"; "Pg *Spotify" -> "spotify"
export function chaveDaAssinatura(descricao) {
  return chaveDoNome(descricao)
    .replace(/\b(pg|pag|pagto|pagamento|compra|deb|debito|credito|aut|autom|automatico|recorrente|assinatura|mensalidade)\b/g, " ")
    .replace(/[0-9]+/g, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((p) => p.length > 1)
    .slice(0, 3)
    .join(" ");
}

function mediana(valores) {
  const v = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

export function lerIgnoradas(dados) {
  const l = dados?.usuario?.assinaturasIgnoradas;
  return Array.isArray(l) ? l.filter((x) => typeof x === "string") : [];
}

export function ignorarAssinatura(dados, chave) {
  const lista = [...new Set([...lerIgnoradas(dados), chave])].slice(-200);
  return { ...dados, usuario: { ...(dados.usuario || {}), assinaturasIgnoradas: lista } };
}

export function acharAssinaturas(dados, hoje) {
  const desde = `${somarMeses(mesDaData(hoje), -(MESES - 1))}-01`;
  const eventos = [];
  for (const l of Array.isArray(dados?.lancamentos) ? dados.lancamentos : []) {
    if (l && l.tipo === "saida" && l.data >= desde && l.data <= hoje) eventos.push({ descricao: l.descricao, categoria: l.categoria, valor: Number(l.valor) || 0, data: l.data, onde: l.pagamento || "" });
  }
  for (const c of Array.isArray(dados?.cartoes) ? dados.cartoes : []) {
    for (const x of Array.isArray(c.compras) ? c.compras : []) {
      if (x && (Number(x.parcelas) || 1) === 1 && x.data >= desde && x.data <= hoje) eventos.push({ descricao: x.descricao, categoria: x.categoria, valor: Number(x.valorTotal) || 0, data: x.data, onde: c.nome });
    }
  }

  const contas = new Set((dados?.contasFixas || []).map((c) => chaveDaAssinatura(c?.nome || "")).filter(Boolean));
  const ignoradas = new Set(lerIgnoradas(dados));
  const grupos = new Map();
  for (const e of eventos) {
    const chave = chaveDaAssinatura(e.descricao);
    if (!chave || !(e.valor > 0)) continue;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(e);
  }

  const lista = [];
  for (const [chave, itens] of grupos) {
    if (contas.has(chave) || ignoradas.has(chave)) continue;
    const meses = new Set(itens.map((i) => mesDaData(i.data)));
    if (meses.size < 3 || itens.length > meses.size * 1.34) continue;
    const med = mediana(itens.map((i) => i.valor));
    const parecidos = itens.filter((i) => Math.abs(i.valor - med) <= med * 0.25);
    if (parecidos.length < itens.length * 0.75) continue;
    const ultima = [...itens].sort((a, b) => b.data.localeCompare(a.data))[0];
    const mensal = arredondar(med);
    lista.push({
      chave,
      nome: ultima.descricao,
      categoria: ultima.categoria || "Outros",
      onde: ultima.onde,
      mensal,
      anual: arredondar(mensal * 12),
      meses: meses.size,
      ultima: ultima.data,
      // sem cobrança há mais de 45 dias: talvez já tenha sido cancelada
      ativa: ultima.data >= somarDias(hoje, -45)
    });
  }
  return lista.sort((a, b) => Number(b.ativa) - Number(a.ativa) || b.anual - a.anual);
}
