// Regras do cartão de crédito.
//
// - Cada fatura é identificada pelo mês do VENCIMENTO ("AAAA-MM").
// - Compra feita antes do dia de fechamento cai na fatura que fecha naquele mês;
//   compra feita no dia do fechamento ou depois cai na fatura seguinte.
// - Se o vencimento é depois do fechamento (ex.: fecha 3, vence 10), a fatura vence
//   no mesmo mês em que fecha; senão (ex.: fecha 28, vence 5), vence no mês seguinte.
// - Pagamento da fatura (botão Pagar, depois que a fatura fecha): valor cheio ou parcial.
//   No parcial, a pessoa escolhe o que fazer com o restante: deixar em aberto até o vencimento
//   ou lançar na próxima fatura (entra nela como "Saldo da fatura anterior").
//   Cada pagamento libera no limite o valor pago.
// - Fatura sem pagamento marcado conta como paga quando a data de vencimento passa (como antes).
// - O limite usado é a soma do que falta pagar nas faturas que ainda não venceram.
//
// Os pagamentos ficam no próprio cartão:
//   pagamentos: [{ id, fatura: "AAAA-MM", valor, data: "AAAA-MM-DD", restante?: "aberto" | "proxima" }]
//   ("restante" só existe no pagamento parcial)

import {
  arredondar,
  chaveMes,
  diasNoMes,
  hojeISO,
  lerData,
  lerMes,
  money,
  montarData,
  somarMeses
} from "./formato.js";

export const RESTANTE_EM_ABERTO = "aberto";
export const RESTANTE_NA_PROXIMA = "proxima";

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

// Só pelas datas: "paga" (o vencimento já passou) | "fechada" | "aberta" | "futura"
export function statusPelaData(cartao, mes, hoje = hojeISO()) {
  const { fechamento, vencimento } = datasDaFatura(cartao, mes);
  if (hoje > vencimento) return "paga";
  if (hoje >= fechamento) return "fechada";
  if (mes === mesDaFatura(cartao, hoje)) return "aberta";
  return "futura";
}

// Com os pagamentos marcados: "paga" (não falta nada) ou "parcial" (pagou uma parte)
function statusComPagamentos(pelaData, conta) {
  if (pelaData === "paga") return "paga";
  if (!conta || (conta.pago <= 0 && conta.paraProxima <= 0)) return pelaData;
  return conta.restante > 0 ? "parcial" : "paga";
}

// "paga" | "parcial" | "fechada" | "aberta" | "futura"
export function statusDaFatura(cartao, mes, hoje = hojeISO()) {
  return statusComPagamentos(statusPelaData(cartao, mes, hoje), contasDasFaturas(cartao).get(mes));
}

export const ROTULO_STATUS = {
  paga: "Paga",
  parcial: "Pagamento parcial",
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

// Uma parcela conta como paga quando a fatura dela está paga
// (pelo botão Pagar ou porque o vencimento já passou).
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

// Só as compras: Map "AAAA-MM" -> { mes, valor, itens }
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

// ---------- pagamento da fatura ----------

function ehMes(v) {
  return /^\d{4}-\d{2}$/.test(String(v ?? ""));
}

export function pagamentosDoCartao(cartao) {
  return (Array.isArray(cartao?.pagamentos) ? cartao.pagamentos : []).filter(
    (p) => p && typeof p === "object" && ehMes(p.fatura) && Number(p.valor) > 0
  );
}

function porData(a, b) {
  return String(a.data || "").localeCompare(String(b.data || "")) || Number(a.id) - Number(b.id);
}

function calcularContas(cartao) {
  const compras = faturasDoCartao(cartao);
  const porFatura = new Map();
  for (const p of pagamentosDoCartao(cartao)) {
    if (!porFatura.has(p.fatura)) porFatura.set(p.fatura, []);
    porFatura.get(p.fatura).push(p);
  }

  const meses = new Set([...compras.keys(), ...porFatura.keys()]);
  const fila = [...meses].sort();
  const mapa = new Map();
  let saldo = 0; // o que a fatura anterior lançou na próxima
  let anterior = null;

  for (let i = 0; i < fila.length; i += 1) {
    const mes = fila[i];
    const saldoAnterior = anterior !== null && somarMeses(anterior, 1) === mes ? saldo : 0;
    const base = compras.get(mes);
    const pagamentos = (porFatura.get(mes) || []).slice().sort(porData);
    const valorDasCompras = base ? base.valor : 0;
    const valor = arredondar(valorDasCompras + saldoAnterior);
    const pago = arredondar(pagamentos.reduce((t, p) => t + Number(p.valor), 0));
    const falta = arredondar(Math.max(0, valor - pago));
    const paraProxima = pagamentos.some((p) => p.restante === RESTANTE_NA_PROXIMA) ? falta : 0;

    mapa.set(mes, {
      mes,
      valorDasCompras,
      saldoAnterior,
      valor,
      itens: base ? base.itens : [],
      pagamentos,
      pago,
      paraProxima,
      restante: arredondar(falta - paraProxima)
    });

    // o restante lançado na próxima fatura cria a próxima fatura, se ela ainda não tinha compras
    const proximo = somarMeses(mes, 1);
    if (paraProxima > 0 && !meses.has(proximo)) {
      meses.add(proximo);
      fila.splice(i + 1, 0, proximo);
    }
    saldo = paraProxima;
    anterior = mes;
  }
  return mapa;
}

const guardadas = new WeakMap();

// Cada fatura com as compras e os pagamentos: Map "AAAA-MM" -> {
//   mes, valorDasCompras, saldoAnterior (veio da fatura anterior), valor (compras + saldo anterior),
//   itens (parcelas), pagamentos, pago, paraProxima (lançado na próxima fatura),
//   restante (o que falta pagar) }
export function contasDasFaturas(cartao) {
  const g = guardadas.get(cartao);
  if (
    g &&
    g.compras === cartao.compras &&
    g.pagamentos === cartao.pagamentos &&
    g.fechamento === cartao.fechamento &&
    g.vencimento === cartao.vencimento
  ) {
    return g.mapa;
  }
  const mapa = calcularContas(cartao);
  guardadas.set(cartao, {
    compras: cartao.compras,
    pagamentos: cartao.pagamentos,
    fechamento: cartao.fechamento,
    vencimento: cartao.vencimento,
    mapa
  });
  return mapa;
}

function faturaVazia(mes) {
  return {
    mes,
    valorDasCompras: 0,
    saldoAnterior: 0,
    valor: 0,
    itens: [],
    pagamentos: [],
    pago: 0,
    paraProxima: 0,
    restante: 0
  };
}

// Fatura pronta para mostrar: valores, datas, status e quanto falta pagar ("aPagar")
export function faturaDoMes(cartao, mes, hoje = hojeISO()) {
  const conta = contasDasFaturas(cartao).get(mes) || faturaVazia(mes);
  const pelaData = statusPelaData(cartao, mes, hoje);
  return {
    ...conta,
    ...datasDaFatura(cartao, mes),
    status: statusComPagamentos(pelaData, conta),
    aPagar: pelaData === "paga" ? 0 : conta.restante
  };
}

// Dá para pagar pelo botão: a fatura já fechou, não venceu e ainda falta pagar
export function podePagar(fatura) {
  return (fatura.status === "fechada" || fatura.status === "parcial") && fatura.aPagar > 0;
}

// Pagamento novo da fatura. Quando paga menos do que falta, "restante" diz o que fazer com o resto:
// "aberto" (fica nesta fatura até o vencimento) ou "proxima" (vai para a próxima fatura).
export function novoPagamento(fatura, valor, restante, hoje = hojeISO(), id = Date.now()) {
  const pago = arredondar(Math.min(Number(valor) || 0, fatura.aPagar));
  const parcial = pago < fatura.aPagar;
  return {
    id,
    fatura: fatura.mes,
    valor: pago,
    data: hoje,
    ...(parcial ? { restante: restante === RESTANTE_NA_PROXIMA ? RESTANTE_NA_PROXIMA : RESTANTE_EM_ABERTO } : {})
  };
}

// Texto curto sobre o pagamento ("" quando a fatura não tem pagamento marcado)
export function textoDoPagamento(fatura) {
  if (fatura.status === "parcial") return `falta ${money(fatura.aPagar)}`;
  if (fatura.status === "paga" && fatura.paraProxima > 0) return `paga · ${money(fatura.paraProxima)} foi para a próxima`;
  if (fatura.status === "paga" && fatura.pago > 0) return "paga";
  return "";
}

// Faturas que já fecharam e ainda não venceram, da mais antiga para a mais nova.
// Normalmente 0 ou 1; podem ser 2 quando o vencimento fica um mês inteiro depois
// do fechamento (ex.: fecha dia 10 e vence dia 10 do mês seguinte).
export function mesesFechados(cartao, hoje = hojeISO()) {
  const mesAtual = mesDaFatura(cartao, hoje);
  const meses = [];
  for (let i = 1; i <= 3; i += 1) {
    const mes = somarMeses(mesAtual, -i);
    if (statusPelaData(cartao, mes, hoje) !== "fechada") break;
    meses.unshift(mes);
  }
  return meses;
}

export function resumoDoCartao(cartao, hoje = hojeISO()) {
  const contas = contasDasFaturas(cartao);
  const mesAtual = mesDaFatura(cartao, hoje);

  let usado = 0;
  for (const conta of contas.values()) {
    if (statusPelaData(cartao, conta.mes, hoje) !== "paga") usado += conta.restante;
  }
  usado = arredondar(usado);

  const limite = Number(cartao.limite || 0);
  const faturaAtual = faturaDoMes(cartao, mesAtual, hoje);
  const faturasFechadas = mesesFechados(cartao, hoje)
    .map((mes) => faturaDoMes(cartao, mes, hoje))
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
    const contas = contasDasFaturas(cartao);
    const mesAtual = mesDaFatura(cartao, hoje);
    const inicio = mesesFechados(cartao, hoje)[0] || mesAtual;
    const meses = new Set([mesAtual, ...[...contas.keys()].filter((m) => m >= inicio)]);

    for (const mes of meses) {
      const fatura = faturaDoMes(cartao, mes, hoje);
      if (fatura.valor === 0 && mes !== mesAtual) continue;
      if (!porMes.has(mes)) porMes.set(mes, { mes, total: 0, cartoes: [] });
      const linha = porMes.get(mes);
      linha.total = arredondar(linha.total + fatura.valor);
      linha.cartoes.push({
        cartaoId: cartao.id,
        nome: cartao.nome,
        valor: fatura.valor,
        status: fatura.status,
        vencimento: fatura.vencimento,
        pago: fatura.pago,
        aPagar: fatura.aPagar,
        paraProxima: fatura.paraProxima,
        saldoAnterior: fatura.saldoAnterior
      });
    }
  }

  return [...porMes.values()].sort((a, b) => a.mes.localeCompare(b.mes));
}
