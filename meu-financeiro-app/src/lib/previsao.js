// Previsão: quanto sobra no fim do mês se nada mudar.
//
// Com bancos cadastrados:  hoje nos bancos + receitas que ainda vão entrar − contas fixas em aberto − faturas a pagar
// Sem bancos:              receitas do mês + receitas que ainda vão entrar − despesas do mês
//                          (as despesas do mês já contam as contas fixas e as compras das faturas)

import { arredondar, diasNoMes, lerMes, mesDaData, montarData } from "./formato.js";
import { resumoDosBancos } from "./saldos.js";
import { resumoDoMes } from "./mes.js";
import { faturaDoMes } from "./cartao.js";
import { situacaoNoMes } from "./contasFixas.js";
import { receitasAReceber } from "./receitasFixas.js";

export function previsaoDoMes(dados, hoje) {
  const mes = mesDaData(hoje);
  const { y, m } = lerMes(mes);
  const fim = montarData(y, m, diasNoMes(y, m));
  const bancos = resumoDosBancos(dados);
  const comBancos = bancos.bancos.length > 0;

  const receber = receitasAReceber(dados, hoje);

  const pagar = [];
  for (const conta of Array.isArray(dados?.contasFixas) ? dados.contasFixas : []) {
    if (!conta || typeof conta !== "object") continue;
    const s = situacaoNoMes(conta, mes, hoje);
    if (s.situacao === "paga" || s.situacao === "fora") continue;
    const falta = arredondar(s.valor - (s.pago || 0));
    if (falta > 0) pagar.push({ id: `conta-${conta.id}`, tipo: "conta", descricao: conta.nome, valor: falta, data: s.vence });
  }
  for (const cartao of Array.isArray(dados?.cartoes) ? dados.cartoes : []) {
    const f = faturaDoMes(cartao, mes, hoje);
    if (f.aPagar > 0 && f.vencimento >= hoje && f.vencimento <= fim) {
      pagar.push({ id: `fatura-${cartao.id}`, tipo: "fatura", cartaoId: cartao.id, descricao: `Fatura ${cartao.nome}`, valor: f.aPagar, data: f.vencimento });
    }
  }
  receber.sort((a, b) => a.data.localeCompare(b.data));
  pagar.sort((a, b) => a.data.localeCompare(b.data));

  const totalReceber = arredondar(receber.reduce((t, x) => t + x.valor, 0));
  const totalPagar = arredondar(pagar.reduce((t, x) => t + x.valor, 0));

  if (comBancos) {
    return {
      comBancos,
      mes,
      fim,
      base: bancos.total,
      receber,
      pagar,
      totalReceber,
      totalPagar,
      previsto: arredondar(bancos.total + totalReceber - totalPagar)
    };
  }
  const r = resumoDoMes(dados, mes, hoje);
  return {
    comBancos,
    mes,
    fim,
    base: r.saldo,
    receber,
    pagar,
    totalReceber,
    totalPagar,
    // sem bancos, as contas e faturas já estão nas despesas do mês: só somam as receitas que faltam
    previsto: arredondar(r.saldo + totalReceber)
  };
}
