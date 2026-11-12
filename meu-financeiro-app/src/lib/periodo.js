// Períodos do Histórico/Extrato: hoje, ontem, esta semana (de segunda até hoje), este mês, outro mês ou tudo.

import { diasNoMes, lerMes, mesDaData, montarData, nomeMes, somarDias } from "./formato.js";
import { inicioDaSemana } from "./semana.js";

export const PERIODOS = [
  ["hoje", "Hoje"],
  ["ontem", "Ontem"],
  ["semana", "Esta semana"],
  ["mes", "Este mês"],
  ["outro", "Outro mês"],
  ["tudo", "Tudo"]
];

// { inicio, fim, rotulo } ("AAAA-MM-DD"; null = sem limite)
export function intervaloDoPeriodo(periodo, hoje, mesEscolhido = mesDaData(hoje)) {
  const doMes = (mes) => {
    const { y, m } = lerMes(mes);
    return { inicio: montarData(y, m, 1), fim: montarData(y, m, diasNoMes(y, m)) };
  };
  switch (periodo) {
    case "hoje":
      return { inicio: hoje, fim: hoje, rotulo: "hoje" };
    case "ontem": {
      const ontem = somarDias(hoje, -1);
      return { inicio: ontem, fim: ontem, rotulo: "ontem" };
    }
    case "semana":
      return { inicio: inicioDaSemana(hoje), fim: hoje, rotulo: "esta semana" };
    case "outro":
      return { ...doMes(mesEscolhido), rotulo: `em ${nomeMes(mesEscolhido)}` };
    case "tudo":
      return { inicio: null, fim: null, rotulo: "no total" };
    default:
      return { ...doMes(mesDaData(hoje)), rotulo: `em ${nomeMes(mesDaData(hoje))}` };
  }
}

export function dentroDoPeriodo(iso, intervalo) {
  if (!intervalo.inicio) return true;
  return typeof iso === "string" && iso >= intervalo.inicio && iso <= intervalo.fim;
}
