import { describe, expect, it } from "vitest";
import { dentroDoPeriodo, intervaloDoPeriodo } from "../lib/periodo.js";

// 12/11/2026 é uma quinta-feira
const HOJE = "2026-11-12";

describe("períodos do Histórico", () => {
  it("hoje, ontem e esta semana (de segunda até hoje)", () => {
    expect(intervaloDoPeriodo("hoje", HOJE)).toMatchObject({ inicio: HOJE, fim: HOJE });
    expect(intervaloDoPeriodo("ontem", HOJE)).toMatchObject({ inicio: "2026-11-11", fim: "2026-11-11" });
    expect(intervaloDoPeriodo("semana", HOJE)).toMatchObject({ inicio: "2026-11-09", fim: HOJE });
  });

  it("este mês e outro mês vão do dia 1 ao último dia", () => {
    expect(intervaloDoPeriodo("mes", HOJE)).toMatchObject({ inicio: "2026-11-01", fim: "2026-11-30" });
    expect(intervaloDoPeriodo("outro", HOJE, "2026-02")).toMatchObject({ inicio: "2026-02-01", fim: "2026-02-28" });
  });

  it("separa o mês passado do mês atual", () => {
    const mes = intervaloDoPeriodo("mes", HOJE);
    expect(dentroDoPeriodo("2026-11-01", mes)).toBe(true);
    expect(dentroDoPeriodo("2026-10-31", mes)).toBe(false);
    expect(dentroDoPeriodo("2025-01-01", intervaloDoPeriodo("tudo", HOJE))).toBe(true);
  });
});

import { pareceFatura } from "../lib/lancar.js";
import { converterLinhas, dataDeCelula } from "../lib/importar.js";
import { criarSeed } from "../storage/storage.js";

describe("não contar duas vezes", () => {
  it("reconhece pagamento de fatura", () => {
    for (const t of ["Pagamento fatura Nubank", "PGTO CARTAO", "Pag. da fatura", "pagamento cartão de crédito", "Fatura Itaú"]) expect(pareceFatura(t)).toBe(true);
    for (const t of ["Mercado", "Farmácia", "Uber", "Compra no cartão de presente"]) expect(pareceFatura(t)).toBe(false);
  });

  it("na importação, fatura e conta fixa vêm desmarcadas (com o motivo)", () => {
    const d = criarSeed("2026-11-06"); // tem a conta fixa "Internet"
    d.contasFixas.push({ id: 9, nome: "Luz", valor: 100, dia: 5, ativa: true, periodos: [{ inicio: "2026-01", fim: null }] });
    const aba = { nome: "x", linhas: [["Data", "Descrição", "Valor"], ["03/11/2026", "PAGAMENTO FATURA NUBANK", "-900,00"], ["04/11/2026", "Internet Vivo", "-126,00"], ["04/11/2026", "Luzia Padaria", "-12,00"], ["05/11/2026", "Uber", "-25,00"]] };
    const { itens } = converterLinhas(aba, { cabecalho: 0, colunas: { data: 0, descricao: 1, valor: 2 } }, d, { hoje: "2026-11-06" });
    expect(itens.map((i) => [i.descricao, i.marcado, Boolean(i.aviso)])).toEqual([
      ["PAGAMENTO FATURA NUBANK", false, true],
      ["Internet Vivo", false, true],
      ["Luzia Padaria", true, false],
      ["Uber", true, false]
    ]);
  });

  it("aceita data no formato americano quando o mês passa de 12", () => {
    expect(dataDeCelula("11/25/2026")).toBe("2026-11-25");
    expect(dataDeCelula("05/11/2026")).toBe("2026-11-05");
  });
});
