// Totais de Investimentos e do Patrimônio.

import { arredondar } from "./formato.js";

export function totaisDeInvestimentos(lista = []) {
  const investido = arredondar(lista.reduce((t, i) => t + Number(i.investido || 0), 0));
  const total = arredondar(lista.reduce((t, i) => t + Number(i.atual || 0), 0));
  return { investido, total, rendimento: arredondar(total - investido) };
}

// Patrimônio líquido = bens + investimentos − dívidas
export function patrimonio(dados) {
  const itens = dados.bens || [];
  const bens = itens.filter((b) => b.tipo !== "Dívida");
  const dividas = itens.filter((b) => b.tipo === "Dívida");
  const totalBens = arredondar(bens.reduce((t, b) => t + Number(b.valor || 0), 0));
  const totalDividas = arredondar(dividas.reduce((t, b) => t + Number(b.valor || 0), 0));
  const investimentos = totaisDeInvestimentos(dados.investimentos || []).total;
  return {
    bens,
    dividas,
    totalBens,
    totalDividas,
    investimentos,
    liquido: arredondar(totalBens + investimentos - totalDividas)
  };
}
