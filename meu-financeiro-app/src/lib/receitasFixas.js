// Receitas fixas: dinheiro que entra todo mês (salário, aluguel recebido, pensão...).
//
// Ficam em usuario.receitasFixas (junto do perfil, como os bancos):
//   { id, nome, valor, dia, forma, bancoId?, automatica, desde: "AAAA-MM", ativa, pulados: ["AAAA-MM"] }
// - automatica: no dia, o app lança a receita sozinho. Senão, ela aparece no Início para confirmar ("Recebi").
// - desde: o primeiro mês que conta (cadastrada depois do dia, começa no mês seguinte, para não duplicar
//   o que a pessoa já lançou na mão).
// - pulados: meses em que não veio (a pessoa tocou "Não veio" ou apagou o lançamento automático).
//
// O lançamento de cada mês leva receitaFixa: { id, mes } e um id calculado (o mesmo em todos os aparelhos):
// assim, dois aparelhos que lançam a mesma receita geram o MESMO registro e a sincronia não duplica.

import { arredondar, dataValida, diasNoMes, lerMes, mesDaData, montarData, somarMeses } from "./formato.js";
import { acharBanco } from "./saldos.js";

const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;
export const FORMAS_DE_RECEITA_FIXA = ["Transferência", "Pix", "Dinheiro", "Débito"];

function lista(v) {
  return Array.isArray(v) ? v : [];
}

export function lerReceitasFixas(dados) {
  return lista(dados?.usuario?.receitasFixas).filter((r) => r && typeof r === "object" && r.id != null && Number(r.valor) > 0);
}

function comLista(dados, receitasFixas) {
  return { ...dados, usuario: { ...(dados.usuario || {}), receitasFixas } };
}

// dia do mês em que cai (31 num mês de 30 dias vira 30)
export function diaNoMes(receita, mes) {
  const { y, m } = lerMes(mes);
  return montarData(y, m, Math.min(Math.max(1, parseInt(receita.dia, 10) || 1), diasNoMes(y, m)));
}

// id do lançamento do mês: meio-dia do dia em que cai + um pedacinho do id da receita
export function idDoLancamento(receita, mes) {
  const [y, m, d] = diaNoMes(receita, mes).split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime() + (Math.abs(Number(receita.id) || 0) % 997) + 1;
}

export function lancamentoDoMes(dados, receita, mes) {
  return (
    lista(dados?.lancamentos).find(
      (l) => l && l.receitaFixa && String(l.receitaFixa.id) === String(receita.id) && l.receitaFixa.mes === mes
    ) || null
  );
}

// Situação no mês: "recebida" | "pulada" | "a-receber" (ainda não chegou o dia) | "pendente" (já passou o dia e
// não foi lançada: as manuais esperam o "Recebi") | "fora" (antes do "desde" ou desligada)
export function situacaoNoMes(dados, receita, mes, hoje) {
  if (receita.ativa === false || (MES_VALIDO.test(receita.desde || "") && mes < receita.desde)) return "fora";
  if (lancamentoDoMes(dados, receita, mes)) return "recebida";
  if (lista(receita.pulados).includes(mes)) return "pulada";
  return diaNoMes(receita, mes) > hoje ? "a-receber" : "pendente";
}

// Valida e grava (nova sem id; edição com id). Devolve { erro } ou { dados }.
export function salvarReceitaFixa(dados, form, hoje, agora = Date.now()) {
  const nome = String(form.nome || "").trim().slice(0, 40);
  const valor = arredondar(Number(form.valor) || 0);
  const dia = parseInt(form.dia, 10);
  if (!nome) return { erro: "Informe o nome (ex.: Salário)." };
  if (!(valor > 0)) return { erro: "Informe o valor (ex.: 3.500,00)." };
  if (!(dia >= 1 && dia <= 31)) return { erro: "Informe o dia do mês (1 a 31)." };
  const forma = FORMAS_DE_RECEITA_FIXA.includes(form.forma) ? form.forma : "Transferência";
  const banco = form.bancoId != null && form.bancoId !== "" ? acharBanco(dados, form.bancoId) : null;
  const campos = { nome, valor, dia, forma, automatica: form.automatica !== false, ...(banco ? { bancoId: banco.id } : { bancoId: null }) };
  const receitas = lerReceitasFixas(dados);

  if (form.id != null) {
    if (!receitas.some((r) => String(r.id) === String(form.id))) return { erro: "Essa receita fixa não existe mais." };
    return { dados: comLista(dados, receitas.map((r) => (String(r.id) === String(form.id) ? { ...r, ...campos } : r))) };
  }
  // cadastrada depois do dia deste mês: começa no mês que vem (o deste mês a pessoa já deve ter lançado)
  const mes = mesDaData(hoje);
  const desde = Number(hoje.slice(8, 10)) > dia ? somarMeses(mes, 1) : mes;
  return { dados: comLista(dados, [...receitas, { id: agora, ...campos, desde, ativa: true, pulados: [] }]) };
}

export function excluirReceitaFixa(dados, id) {
  return comLista(dados, lerReceitasFixas(dados).filter((r) => String(r.id) !== String(id)));
}

export function ligarReceitaFixa(dados, id, ativa) {
  return comLista(dados, lerReceitasFixas(dados).map((r) => (String(r.id) === String(id) ? { ...r, ativa } : r)));
}

// "Não veio" (ou o lançamento automático foi apagado): o mês fica pulado
export function pularMes(dados, id, mes) {
  return comLista(
    dados,
    lerReceitasFixas(dados).map((r) =>
      String(r.id) === String(id) ? { ...r, pulados: [...new Set([...lista(r.pulados), mes])].slice(-24) } : r
    )
  );
}

// O lançamento da receita num mês
export function montarLancamentoDaReceita(receita, mes, valor = receita.valor) {
  const id = idDoLancamento(receita, mes);
  const v = arredondar(Number(valor) || 0);
  const temBanco = receita.bancoId != null && receita.bancoId !== "";
  return {
    id,
    tipo: "entrada",
    descricao: receita.nome,
    categoria: "Receita",
    valor: v,
    pagamento: receita.forma || "Transferência",
    data: diaNoMes(receita, mes),
    receitaFixa: { id: receita.id, mes },
    ...(temBanco ? { formas: [{ forma: receita.forma || "Transferência", valor: v, bancoId: receita.bancoId }], criadoEm: id } : {})
  };
}

// "Recebi": lança a receita do mês (se ainda não foi). Devolve os dados (iguais, se não havia o que lançar).
export function receber(dados, id, mes, valor) {
  const receita = lerReceitasFixas(dados).find((r) => String(r.id) === String(id));
  if (!receita || lancamentoDoMes(dados, receita, mes)) return dados;
  return { ...dados, lancamentos: [...lista(dados.lancamentos), montarLancamentoDaReceita(receita, mes, valor)] };
}

// Meses que contam para as pendências: o mês atual e os 2 anteriores
function mesesRecentes(hoje) {
  const mes = mesDaData(hoje);
  return [somarMeses(mes, -2), somarMeses(mes, -1), mes];
}

// Lança sozinho as automáticas que já chegaram no dia. Sem nada a lançar, devolve o MESMO objeto.
export function lancarReceitasDoDia(dados, hoje) {
  if (!dataValida(hoje)) return dados;
  let atual = dados;
  for (const receita of lerReceitasFixas(dados)) {
    if (receita.automatica === false) continue;
    for (const mes of mesesRecentes(hoje)) {
      if (situacaoNoMes(atual, receita, mes, hoje) === "pendente") atual = receber(atual, receita.id, mes);
    }
  }
  return atual;
}

// As manuais que já passaram do dia e esperam o "Recebi" / "Não veio"
export function receitasParaConfirmar(dados, hoje) {
  const r = [];
  for (const receita of lerReceitasFixas(dados)) {
    if (receita.automatica !== false) continue;
    for (const mes of mesesRecentes(hoje)) {
      if (situacaoNoMes(dados, receita, mes, hoje) === "pendente") r.push({ receita, mes, data: diaNoMes(receita, mes) });
    }
  }
  return r;
}

// Ainda vão entrar neste mês (o dia não chegou, ou a manual não foi confirmada)
export function receitasAReceber(dados, hoje) {
  const mes = mesDaData(hoje);
  return lerReceitasFixas(dados)
    .map((receita) => ({ receita, situacao: situacaoNoMes(dados, receita, mes, hoje) }))
    .filter((x) => x.situacao === "a-receber" || x.situacao === "pendente")
    .map(({ receita }) => ({ id: receita.id, descricao: receita.nome, valor: Number(receita.valor) || 0, data: diaNoMes(receita, mes) }));
}
