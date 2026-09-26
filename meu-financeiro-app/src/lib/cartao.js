// Regras do cartão de crédito.
//
// - Cada fatura é identificada pelo mês do VENCIMENTO ("AAAA-MM").
// - Compra feita antes do dia de fechamento cai na fatura que fecha naquele mês;
//   compra feita no dia do fechamento ou depois cai na fatura seguinte.
// - Se o vencimento é depois do fechamento (ex.: fecha 3, vence 10), a fatura vence
//   no mesmo mês em que fecha; senão (ex.: fecha 28, vence 5), vence no mês seguinte.
// - Uma parcela conta como paga quando a data de vencimento da fatura dela já passou.
// - O limite usado é a soma de todas as parcelas ainda não pagas.

import {
  arredondar,
  chaveMes,
  diasNoMes,
  hojeISO,
  lerData,
  lerMes,
  montarData,
  somarMeses
} from "./formato.js";

function diaNoMes(dia, y, m) {
  return Math.min(Math.max(1, parseInt(dia, 10) || 1), diasNoMes(y, m));
}

function venceNoMesDoFechamento(cartao) {
  return Number(cartao.vencimento) > Number(cartao.fechamento);
}

export function mesDaFatura(cartao, dataISO) {
  const { y, m, d } = lerData(dataISO);
  let mesFechamento = chaveMes(y, m);
  if (d >= diaNoMes(cartao.fechamento, y, m)) mesFechamento = somarMeses(mesFechamento, 1);
  return venceNoMesDoFechamento(cartao) ? mesFechamento : somarMeses(mesFechamento, 1);
}

export function datasDaFatura(cartao, mes) {
  const mesFechamento = venceNoMesDoFechamento(cartao) ? mes : somarMeses(mes, -1);
  const f = lerMes(mesFechamento);
  const v = lerMes(mes);
  return {
    fechamento: montarData(f.y, f.m, diaNoMes(cartao.fechamento, f.y, f.m)),
    vencimento: montarData(v.y, v.m, diaNoMes(cartao.vencimento, v.y, v.m))
  };
}

// "paga" | "fechada" | "aberta" | "futura"
export function statusDaFatura(cartao, mes, hoje = hojeISO()) {
  const { fechamento, vencimento } = datasDaFatura(cartao, mes);
  if (hoje > vencimento) return "paga";
  if (hoje >= fechamento) return "fechada";
  if (mes === mesDaFatura(cartao, hoje)) return "aberta";
  return "futura";
}

export const ROTULO_STATUS = {
  paga: "Paga",
  fechada: "Fatura fechada",
  aberta: "Fatura atual",
  futura: "Prevista"
};

// Divide o total em centavos; a diferença de arredondamento vai na 1ª parcela.
export function valoresDasParcelas(valorTotal, quantidade) {
  const n = Math.max(1, parseInt(quantidade, 10) || 1);
  const centavos = Math.round(Number(valorTotal || 0) * 100);
  const base = Math.floor(centavos / n);
  const resto = centavos - base * n;
  return Array.from({ length: n }, (_, i) => (base + (i === 0 ? resto : 0)) / 100);
}

export function parcelasDaCompra(compra, cartao) {
  const valores = valoresDasParcelas(compra.valorTotal, compra.parcelas);
  const primeira = mesDaFatura(cartao, compra.data);
  return valores.map((valor, i) => ({
    compraId: compra.id,
    descricao: compra.descricao,
    categoria: compra.categoria,
    numero: i + 1,
    total: valores.length,
    valor,
    mes: somarMeses(primeira, i)
  }));
}

export function resumoDaCompra(compra, cartao, hoje = hojeISO()) {
  const parcelas = parcelasDaCompra(compra, cartao);
  let pagas = 0;
  let restante = 0;
  for (const p of parcelas) {
    if (statusDaFatura(cartao, p.mes, hoje) === "paga") pagas += 1;
    else restante += p.valor;
  }
  return {
    parcelas,
    total: parcelas.length,
    valorParcela: parcelas[parcelas.length - 1].valor,
    pagas,
    restante: arredondar(restante),
    quitada: pagas === parcelas.length,
    primeiraFatura: parcelas[0].mes,
    ultimaFatura: parcelas[parcelas.length - 1].mes
  };
}

// Map "AAAA-MM" -> { mes, valor, itens }
export function faturasDoCartao(cartao) {
  const mapa = new Map();
  for (const compra of cartao.compras || []) {
    for (const p of parcelasDaCompra(compra, cartao)) {
      if (!mapa.has(p.mes)) mapa.set(p.mes, { mes: p.mes, valor: 0, itens: [] });
      const fatura = mapa.get(p.mes);
      fatura.valor = arredondar(fatura.valor + p.valor);
      fatura.itens.push(p);
    }
  }
  return mapa;
}

function faturaVazia(mes) {
  return { mes, valor: 0, itens: [] };
}

// Faturas que já fecharam e ainda não venceram, da mais antiga para a mais nova.
// Normalmente 0 ou 1; podem ser 2 quando o vencimento fica um mês inteiro depois
// do fechamento (ex.: fecha dia 10 e vence dia 10 do mês seguinte).
export function mesesFechados(cartao, hoje = hojeISO()) {
  const mesAtual = mesDaFatura(cartao, hoje);
  const meses = [];
  for (let i = 1; i <= 3; i += 1) {
    const mes = somarMeses(mesAtual, -i);
    if (statusDaFatura(cartao, mes, hoje) !== "fechada") break;
    meses.unshift(mes);
  }
  return meses;
}

export function resumoDoCartao(cartao, hoje = hojeISO()) {
  const faturas = faturasDoCartao(cartao);
  const mesAtual = mesDaFatura(cartao, hoje);

  let usado = 0;
  for (const fatura of faturas.values()) {
    if (statusDaFatura(cartao, fatura.mes, hoje) !== "paga") usado += fatura.valor;
  }
  usado = arredondar(usado);

  const limite = Number(cartao.limite || 0);
  const faturaAtual = {
    ...(faturas.get(mesAtual) || faturaVazia(mesAtual)),
    ...datasDaFatura(cartao, mesAtual),
    status: "aberta"
  };

  const faturasFechadas = mesesFechados(cartao, hoje)
    .map((mes) => ({ ...(faturas.get(mes) || faturaVazia(mes)), ...datasDaFatura(cartao, mes), status: "fechada" }))
    .filter((f) => f.valor > 0);

  return {
    limite,
    usado,
    disponivel: arredondar(limite - usado),
    percentual: limite > 0 ? Math.min(100, Math.max(0, (usado / limite) * 100)) : 0,
    faturaAtual,
    faturasFechadas
  };
}

function ordenarItens(itens) {
  return [...itens].sort((a, b) => a.descricao.localeCompare(b.descricao) || a.numero - b.numero);
}

// Parcelas que caem DEPOIS da fatura atual, agrupadas por mês.
export function lancamentosFuturos(cartao, hoje = hojeISO()) {
  const mesAtual = mesDaFatura(cartao, hoje);
  return [...faturasDoCartao(cartao).values()]
    .filter((f) => f.mes > mesAtual)
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .map((f) => ({ ...f, itens: ordenarItens(f.itens) }));
}

// Visão mensal das faturas (um cartão ou vários), da fatura a pagar em diante.
export function calendarioDeFaturas(cartoes, hoje = hojeISO()) {
  const porMes = new Map();

  for (const cartao of cartoes) {
    const faturas = faturasDoCartao(cartao);
    const mesAtual = mesDaFatura(cartao, hoje);
    const inicio = mesesFechados(cartao, hoje)[0] || mesAtual;
    const meses = new Set([mesAtual, ...[...faturas.keys()].filter((m) => m >= inicio)]);

    for (const mes of meses) {
      const valor = faturas.get(mes)?.valor || 0;
      if (valor === 0 && mes !== mesAtual) continue;
      if (!porMes.has(mes)) porMes.set(mes, { mes, total: 0, cartoes: [] });
      const linha = porMes.get(mes);
      linha.total = arredondar(linha.total + valor);
      linha.cartoes.push({
        cartaoId: cartao.id,
        nome: cartao.nome,
        valor,
        status: statusDaFatura(cartao, mes, hoje),
        vencimento: datasDaFatura(cartao, mes).vencimento
      });
    }
  }

  return [...porMes.values()].sort((a, b) => a.mes.localeCompare(b.mes));
}
