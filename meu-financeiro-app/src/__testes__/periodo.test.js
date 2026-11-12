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
