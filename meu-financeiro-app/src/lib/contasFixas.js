// Pagar conta fixa (botão Pagar da aba Contas fixas).
//
// Cada pagamento fica na própria conta:
//   pagamentos: [{ id, mes: "AAAA-MM", valor, data: "AAAA-MM-DD", bancoId?, criadoEm? }]
// "mes" é o mês da conta que foi paga (pode ser outro que o mês da data, ex.: pagar adiantado).
// Com um banco escolhido, o valor sai do saldo dele (ver lib/saldos.js). No Meu mês, a conta paga
// entra com o valor pago e não gera mais aviso nem lembrete (ver lib/mes.js e lib/lembretes.js).
//
// O app acompanha mês a mês a partir do mês atual, ou do primeiro pagamento marcado aqui (o que vier
// antes): os meses anteriores ficam como estavam e não aparecem como atrasados.

import {
  arredondar,
  dataValida,
  diasNoMes,
  hojeISO,
  lerMes,
  mesDaData,
  montarData,
  nomeMes,
  parseValor,
  somarMeses
} from "./formato.js";
import { contaValeNoMes, valorPagoNoMes } from "./mes.js";
import { acharBanco } from "./saldos.js";

// na janela de pagar: no máximo estes meses atrasados (os mais recentes)
const ATRASADOS_NA_JANELA = 6;
// até quantos meses à frente procura o próximo mês para pagar adiantado
const MESES_PARA_ADIANTAR = 12;

const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;

function lista(v) {
  return Array.isArray(v) ? v : [];
}

// ---------- leitura ----------

export function pagamentosDaConta(conta) {
  return lista(conta?.pagamentos).filter(
    (p) => p && typeof p === "object" && p.id != null && MES_VALIDO.test(String(p.mes || "")) && Number(p.valor) > 0
  );
}

// Vencimento da conta no mês (dia 31 num mês de 30 dias vira 30, como no Meu mês)
export function vencimentoNoMes(conta, mes) {
  const { y, m } = lerMes(mes);
  return montarData(y, m, Math.min(Math.max(1, parseInt(conta?.dia, 10) || 1), diasNoMes(y, m)));
}

// Situação da conta num mês: { mes, vence, valor, pago, pagamentos, situacao }
// situacao: "paga" | "atrasada" (venceu e não foi paga) | "hoje" | "aberta" | "fora" (a conta não vale nesse mês)
export function situacaoNoMes(conta, mes, hoje = hojeISO()) {
  const pagamentos = pagamentosDaConta(conta)
    .filter((p) => p.mes === mes)
    .sort((a, b) => String(a.data).localeCompare(String(b.data)) || Number(a.id) - Number(b.id));
  const pago = valorPagoNoMes({ pagamentos }, mes);
  const vence = vencimentoNoMes(conta, mes);
  let situacao = "aberta";
  if (pago > 0) situacao = "paga";
  else if (!contaValeNoMes(conta, mes)) situacao = "fora";
  else if (vence < hoje) situacao = "atrasada";
  else if (vence === hoje) situacao = "hoje";
  return { mes, vence, valor: arredondar(Number(conta?.valor) || 0), pago, pagamentos, situacao };
}

// Primeiro mês acompanhado: o mês atual ou o do primeiro pagamento marcado (o que vier antes)
function primeiroMes(conta, mesAtual) {
  const meses = pagamentosDaConta(conta)
    .map((p) => p.mes)
    .sort();
  return meses.length && meses[0] < mesAtual ? meses[0] : mesAtual;
}

// Meses que dá para pagar agora, do mais antigo para o mais novo: os que estão em aberto até o mês
// atual e o próximo mês ainda não pago (pagar adiantado, com "adiantado": true).
export function mesesParaPagar(conta, hoje = hojeISO()) {
  const mesAtual = mesDaData(hoje);
  const abertos = [];
  for (let mes = primeiroMes(conta, mesAtual); mes <= mesAtual; mes = somarMeses(mes, 1)) {
    const s = situacaoNoMes(conta, mes, hoje);
    if (s.situacao !== "paga" && s.situacao !== "fora") abertos.push(s);
  }
  const resultado = abertos.slice(-ATRASADOS_NA_JANELA);
  for (let i = 1; i <= MESES_PARA_ADIANTAR; i += 1) {
    const s = situacaoNoMes(conta, somarMeses(mesAtual, i), hoje);
    if (s.situacao === "paga" || s.situacao === "fora") continue;
    resultado.push({ ...s, adiantado: true });
    break;
  }
  return resultado;
}

// Para a lista: o mês atual, os meses atrasados antes dele, o que dá para pagar e os pagamentos
// (o mais novo primeiro)
export function resumoDaConta(conta, hoje = hojeISO()) {
  const mesAtual = mesDaData(hoje);
  const paraPagar = mesesParaPagar(conta, hoje);
  return {
    atual: situacaoNoMes(conta, mesAtual, hoje),
    atrasados: paraPagar.filter((s) => s.mes < mesAtual),
    paraPagar,
    pagamentos: pagamentosDaConta(conta).sort(
      (a, b) =>
        String(b.mes).localeCompare(String(a.mes)) ||
        String(b.data).localeCompare(String(a.data)) ||
        Number(b.id) - Number(a.id)
    )
  };
}

// Totais do mês atual para o topo da aba: { mes, pago, falta, total, pagas, quantidade }
export function resumoDoMesDasContas(dados, hoje = hojeISO()) {
  const mes = mesDaData(hoje);
  let pago = 0;
  let falta = 0;
  let pagas = 0;
  let quantidade = 0;
  for (const conta of lista(dados?.contasFixas)) {
    if (!conta || typeof conta !== "object") continue;
    const s = situacaoNoMes(conta, mes, hoje);
    if (s.situacao === "fora") continue;
    quantidade += 1;
    if (s.situacao === "paga") {
      pagas += 1;
      pago += s.pago;
    } else {
      falta += s.valor;
    }
  }
  return { mes, pago: arredondar(pago), falta: arredondar(falta), total: arredondar(pago + falta), pagas, quantidade };
}

// ---------- escrita ----------

function comContas(dados, contasFixas) {
  return { ...dados, contasFixas };
}

// Pagamento novo: { mes, valor, data, bancoId } (bancoId vazio = não desconta de nenhum banco).
// Devolve { erro } ou { dados, pagamento }.
export function pagarConta(dados, contaId, { mes, valor, data, bancoId } = {}, agora = Date.now()) {
  const contas = lista(dados?.contasFixas);
  const conta = contas.find((c) => c && String(c.id) === String(contaId));
  if (!conta) return { erro: "Esta conta fixa não existe mais." };
  if (!MES_VALIDO.test(String(mes || ""))) return { erro: "Escolha o mês que você está pagando." };
  if (valorPagoNoMes(conta, mes) > 0) return { erro: `A conta de ${nomeMes(mes)} já está paga.` };
  if (!contaValeNoMes(conta, mes)) return { erro: `Esta conta não está ativa em ${nomeMes(mes)}.` };
  const v = parseValor(valor);
  if (!(v > 0)) return { erro: "Informe o valor pago (ex.: 126,00)." };
  if (!dataValida(data)) return { erro: "Informe a data do pagamento." };
  const temBanco = bancoId != null && bancoId !== "";
  const banco = temBanco ? acharBanco(dados, bancoId) : null;
  if (temBanco && !banco) return { erro: "Esse banco não existe mais. Escolha outro." };

  const pagamento = { id: agora, mes, valor: v, data, ...(banco ? { bancoId: banco.id, criadoEm: agora } : {}) };
  return {
    dados: comContas(
      dados,
      contas.map((c) => (c && String(c.id) === String(contaId) ? { ...c, pagamentos: [...lista(c.pagamentos), pagamento] } : c))
    ),
    pagamento
  };
}

// Desfaz um pagamento: o mês volta a ficar em aberto e, se saiu de um banco, o valor volta para ele
export function desfazerPagamentoDaConta(dados, contaId, pagamentoId) {
  const contas = lista(dados?.contasFixas);
  const conta = contas.find((c) => c && String(c.id) === String(contaId));
  if (!conta) return { erro: "Esta conta fixa não existe mais." };
  if (!lista(conta.pagamentos).some((p) => p && String(p.id) === String(pagamentoId))) {
    return { erro: "Este pagamento já foi desfeito." };
  }
  return {
    dados: comContas(
      dados,
      contas.map((c) =>
        c && String(c.id) === String(contaId)
          ? { ...c, pagamentos: lista(c.pagamentos).filter((p) => !(p && String(p.id) === String(pagamentoId))) }
          : c
      )
    )
  };
}
