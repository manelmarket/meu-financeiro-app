// Resumo de um mês ("Meu mês"): receitas, despesas, saldo, categorias e vencimentos.
//
// Despesas do mês = gastos lançados no mês
//                 + faturas de cartão que VENCEM no mês (as compras de cada fatura)
//                 + contas fixas ativas no mês.
// O restante de uma fatura lançado na próxima fatura não conta de novo como despesa
// (já contou no mês da fatura de origem), mas entra no valor a pagar da próxima fatura.

import { arredondar, diasNoMes, hojeISO, lerData, lerMes, mesDaData, montarData, somarMeses } from "./formato.js";
import { contasDasFaturas, faturaDoMes } from "./cartao.js";

// Cada conta fixa guarda os períodos em que esteve ativa:
// [{ inicio: "AAAA-MM", fim: "AAAA-MM" | null }]  (o mês "fim" já não conta)
export function contaValeNoMes(conta, mes) {
  if (!Array.isArray(conta.periodos) || conta.periodos.length === 0) return conta.ativa !== false;
  return conta.periodos.some((p) => mes >= (p.inicio || "") && (!p.fim || mes < p.fim));
}

// Liga/desliga a conta na data de hoje, mantendo os meses anteriores.
// - Desligar: se o vencimento deste mês já chegou, este mês ainda conta; senão, sai deste mês.
// - Ligar: se o vencimento deste mês ainda não passou, já conta neste mês; senão, a partir do próximo.
export function alternarConta(conta, hoje = hojeISO()) {
  const mesAtual = mesDaData(hoje);
  const diaHoje = lerData(hoje).d;
  const diaConta = parseInt(conta.dia, 10) || 1;
  const periodos = Array.isArray(conta.periodos) ? conta.periodos.map((p) => ({ ...p })) : [];

  if (conta.ativa !== false) {
    const fim = diaHoje >= diaConta ? somarMeses(mesAtual, 1) : mesAtual;
    const aberto = periodos.find((p) => !p.fim);
    if (aberto) aberto.fim = fim;
    return { ...conta, ativa: false, periodos: periodos.filter((p) => !p.fim || p.fim > p.inicio) };
  }

  const inicio = diaHoje <= diaConta ? mesAtual : somarMeses(mesAtual, 1);
  const ultimo = periodos[periodos.length - 1];
  if (ultimo && ultimo.fim && ultimo.fim >= inicio) ultimo.fim = null;
  else periodos.push({ inicio, fim: null });
  return { ...conta, ativa: true, periodos };
}

export function resumoDoMes(dados, mes, hoje = hojeISO()) {
  const categorias = {};
  const somar = (categoria, valor) => {
    const nome = categoria || "Outros";
    categorias[nome] = arredondar((categorias[nome] || 0) + valor);
  };

  // transferência entre bancos, saque e depósito não são receita nem despesa (ficam só no Histórico)
  const lancamentos = (dados.lancamentos || [])
    .filter((l) => l && l.tipo !== "transferencia" && mesDaData(l.data) === mes)
    .sort((a, b) => String(b.data).localeCompare(String(a.data)) || b.id - a.id);

  let receitas = 0;
  let gastosLancados = 0;
  for (const l of lancamentos) {
    const valor = Number(l.valor) || 0;
    if (l.tipo === "entrada") {
      receitas += valor;
    } else {
      gastosLancados += valor;
      somar(l.categoria, valor);
    }
  }

  const vencimentos = [];

  let faturas = 0;
  for (const cartao of dados.cartoes || []) {
    if (!contasDasFaturas(cartao).has(mes)) continue;
    const fatura = faturaDoMes(cartao, mes, hoje);
    if (fatura.valorDasCompras > 0) {
      faturas += fatura.valorDasCompras;
      for (const parcela of fatura.itens) somar(parcela.categoria, parcela.valor);
    }
    if (fatura.valor <= 0) continue;
    vencimentos.push({
      id: `fatura-${cartao.id}`,
      tipo: "fatura",
      cartaoId: cartao.id,
      descricao: `Fatura ${cartao.nome}`,
      valor: fatura.valor,
      data: fatura.vencimento,
      status: fatura.status,
      pago: fatura.pago,
      paraProxima: fatura.paraProxima,
      aPagar: fatura.aPagar,
      saldoAnterior: fatura.saldoAnterior,
      // o que conta como despesa deste mês (só as compras; o saldo anterior já contou antes)
      despesa: fatura.valorDasCompras
    });
  }

  let fixas = 0;
  const { y, m } = lerMes(mes);
  for (const conta of dados.contasFixas || []) {
    if (!contaValeNoMes(conta, mes)) continue;
    const valor = Number(conta.valor) || 0;
    fixas += valor;
    somar(conta.categoria, valor);
    vencimentos.push({
      id: `conta-${conta.id}`,
      tipo: "conta",
      descricao: conta.nome,
      valor,
      data: montarData(y, m, Math.min(Math.max(1, parseInt(conta.dia, 10) || 1), diasNoMes(y, m)))
    });
  }

  vencimentos.sort((a, b) => a.data.localeCompare(b.data) || a.descricao.localeCompare(b.descricao));

  const despesas = arredondar(gastosLancados + faturas + fixas);
  receitas = arredondar(receitas);

  return {
    mes,
    receitas,
    despesas,
    saldo: arredondar(receitas - despesas),
    origem: {
      lancamentos: arredondar(gastosLancados),
      cartoes: arredondar(faturas),
      fixas: arredondar(fixas)
    },
    categorias: Object.entries(categorias).sort((a, b) => b[1] - a[1]),
    vencimentos,
    lancamentos
  };
}
