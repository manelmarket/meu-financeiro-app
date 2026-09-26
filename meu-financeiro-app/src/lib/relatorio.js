// Números para os Relatórios: evolução mês a mês e fatias da pizza.

import { arredondar, somarMeses } from "./formato.js";
import { resumoDoMes } from "./mes.js";

// Últimos `quantidade` meses terminando em `mesFinal` (do mais antigo para o mais novo)
export function serieMensal(dados, mesFinal, quantidade = 6, hoje) {
  const meses = [];
  for (let i = quantidade - 1; i >= 0; i -= 1) {
    const mes = somarMeses(mesFinal, -i);
    const r = resumoDoMes(dados, mes, hoje);
    meses.push({ mes, receitas: r.receitas, despesas: r.despesas, saldo: r.saldo });
  }
  return meses;
}

// Pizza: as `maximo` maiores categorias + "Outros" com o resto (como no exemplo:
// Casa 40%, Comida 25%, Transporte 15%, Outros 20%).
export function fatiasDaPizza(categorias, maximo = 3) {
  const total = categorias.reduce((t, [, v]) => t + v, 0);
  if (total <= 0) return { total: 0, fatias: [] };

  // a categoria "Outros" nunca ocupa uma fatia própria: vai sempre para a fatia cinza
  const ordenadas = [...categorias].filter(([nome]) => nome !== "Outros").sort((a, b) => b[1] - a[1]);
  const principais = ordenadas.slice(0, maximo);
  const resto = [...ordenadas.slice(maximo), ...categorias.filter(([nome]) => nome === "Outros")];

  const fatias = principais.map(([nome, valor], i) => ({ nome, valor, posicao: i + 1 }));
  const valorResto = arredondar(resto.reduce((t, [, v]) => t + v, 0));
  if (valorResto > 0) {
    fatias.push({
      nome: resto.length === 1 ? resto[0][0] : "Outros",
      valor: valorResto,
      posicao: 0,
      agrupadas: resto.map(([nome]) => nome)
    });
  }

  // porcentagens inteiras que somam 100 (maior resto recebe o ajuste)
  const brutas = fatias.map((f) => (f.valor / total) * 100);
  const inteiras = brutas.map(Math.floor);
  let falta = 100 - inteiras.reduce((t, v) => t + v, 0);
  const ordemResto = brutas
    .map((v, i) => ({ i, r: v - Math.floor(v) }))
    .sort((a, b) => b.r - a.r);
  for (const { i } of ordemResto) {
    if (falta <= 0) break;
    inteiras[i] += 1;
    falta -= 1;
  }

  return {
    total: arredondar(total),
    fatias: fatias.map((f, i) => ({ ...f, percentual: inteiras[i] }))
  };
}
