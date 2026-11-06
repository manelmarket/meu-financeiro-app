// Testes das contas principais do app (rodam com "npm test").
import { describe, expect, it } from "vitest";
import { criarSeed } from "../storage/storage.js";
import { money, moneyReal, parseValor, somarMeses } from "../lib/formato.js";
import { esconderValores } from "../lib/privacidade.js";
import { faturaDoMes, mesDaFatura, novoPagamento, valoresDasParcelas } from "../lib/cartao.js";
import { editarLancamento, montarLancamento } from "../lib/lancar.js";
import { resumoDoMes } from "../lib/mes.js";
import { resumoDosBancos, salvarBanco } from "../lib/saldos.js";
import { mesclarDados } from "../lib/mesclar.js";

const HOJE = "2026-11-06";

describe("formato", () => {
  it("entende valores escritos de vários jeitos", () => {
    expect(parseValor("1.250,50")).toBe(1250.5);
    expect(parseValor("R$ 1.250")).toBe(1250);
    expect(parseValor("12.5")).toBe(12.5);
    expect(parseValor("0,5")).toBe(0.5);
    expect(parseValor(",50")).toBe(0.5);
    expect(Number.isNaN(parseValor("abc"))).toBe(true);
  });

  it("esconde os valores na tela, mas não o valor real", () => {
    esconderValores(true);
    expect(money(10)).toBe("R$ ••••");
    expect(moneyReal(10)).toMatch(/10,00/);
    esconderValores(false);
    expect(money(10)).toMatch(/10,00/);
  });

  it("soma meses virando o ano", () => {
    expect(somarMeses("2026-11", 2)).toBe("2027-01");
    expect(somarMeses("2026-01", -1)).toBe("2025-12");
  });
});

describe("cartão de crédito", () => {
  const cartao = { id: 1, nome: "Nubank", limite: 5000, fechamento: 3, vencimento: 10, compras: [] };

  it("compra antes do fechamento cai na fatura do mês; no dia do fechamento, na seguinte", () => {
    expect(mesDaFatura(cartao, "2026-11-02")).toBe("2026-11");
    expect(mesDaFatura(cartao, "2026-11-03")).toBe("2026-12");
  });

  it("divide as parcelas em centavos sem perder nada", () => {
    const v = valoresDasParcelas(100, 3);
    expect(v).toEqual([33.34, 33.33, 33.33]);
    expect(v.reduce((t, x) => t + x, 0)).toBeCloseTo(100, 2);
  });

  it("pagamento parcial deixa o restante em aberto", () => {
    const c = { ...cartao, compras: [{ id: 5, descricao: "TV", categoria: "Casa", data: "2026-10-20", valorTotal: 600, parcelas: 1 }] };
    const fatura = faturaDoMes(c, "2026-11", HOJE);
    expect(fatura.valor).toBe(600);
    const pag = novoPagamento(fatura, 200, "aberto", HOJE, 99);
    const depois = faturaDoMes({ ...c, pagamentos: [pag] }, "2026-11", HOJE);
    expect(depois.aPagar).toBe(400);
  });
});

describe("lançamentos", () => {
  it("gasto dividido entre Pix e cartão vira lançamento + compra", () => {
    const cartoes = [{ id: 1, nome: "Nubank", fechamento: 3, vencimento: 10, compras: [] }];
    const r = montarLancamento(
      {
        tipo: "saida",
        descricao: "Tênis",
        categoria: "Compras",
        data: HOJE,
        valor: 300,
        partes: [
          { forma: "Pix", valor: 100 },
          { forma: "Cartão", valor: 200, cartaoId: 1, parcelas: 2 }
        ]
      },
      cartoes,
      1000
    );
    expect(r.lancamento.valor).toBe(100);
    expect(r.compras).toHaveLength(1);
    expect(r.compras[0].compra.parcelas).toBe(2);
    expect(r.lancamento.grupo).toBe(r.compras[0].compra.grupo);
  });

  it("formas que não somam o total dão erro", () => {
    const r = montarLancamento({ tipo: "saida", descricao: "X", data: HOJE, valor: 100, partes: [{ forma: "Pix", valor: 50 }, { forma: "Dinheiro", valor: 20 }] });
    expect(r.erro).toMatch(/faltam/);
  });

  it("editar muda valor, observação e foto", () => {
    const d = criarSeed(HOJE);
    const r = editarLancamento(d, 2, { valor: 199.9, obs: "compra do mês", cupomId: "anexo-1" });
    const l = r.dados.lancamentos.find((x) => x.id === 2);
    expect(l).toMatchObject({ valor: 199.9, obs: "compra do mês", cupomId: "anexo-1" });
    const sem = editarLancamento(r.dados, 2, { cupomId: null, obs: "" });
    expect(sem.dados.lancamentos.find((x) => x.id === 2).cupomId).toBeUndefined();
    expect(editarLancamento(d, 999, { valor: 1 }).erro).toBeTruthy();
  });

  it("não muda o valor de um gasto pago de várias formas", () => {
    const d = { lancamentos: [{ id: 1, tipo: "saida", descricao: "X", valor: 100, data: HOJE, formas: [{ forma: "Pix", valor: 50 }, { forma: "Dinheiro", valor: 50 }] }] };
    expect(editarLancamento(d, 1, { valor: 80 }).erro).toMatch(/várias formas/);
  });
});

describe("mês e bancos", () => {
  it("despesas do mês = lançamentos + faturas + contas fixas", () => {
    const r = resumoDoMes(criarSeed(HOJE), "2026-11", HOJE);
    expect(r.receitas).toBe(5000);
    expect(r.origem).toEqual({ lancamentos: 250, cartoes: 300, fixas: 126 });
    expect(r.despesas).toBe(676);
    expect(r.saldo).toBe(4324);
  });

  it("o saldo do banco só conta o que foi lançado depois do valor informado", () => {
    let d = salvarBanco(criarSeed(HOJE), { id: null, nome: "Nubank", saldo: 1000 }, 500);
    const id = d.usuario.bancos[0].id;
    d = { ...d, lancamentos: [...d.lancamentos, { id: 600, criadoEm: 600, tipo: "saida", descricao: "Uber", valor: 30, data: HOJE, formas: [{ forma: "Pix", valor: 30, bancoId: id }] }] };
    expect(resumoDosBancos(d).total).toBe(970);
  });
});

describe("sincronia entre aparelhos", () => {
  it("junta lançamentos novos dos dois lados sem duplicar o mesmo id", () => {
    const base = criarSeed(HOJE);
    const novo = { id: 777, tipo: "entrada", descricao: "Salário", valor: 10, data: HOJE };
    const local = { ...base, lancamentos: [...base.lancamentos, novo, { id: 1, ...base.lancamentos[0], descricao: "Salário" }].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i) };
    const remoto = { ...base, lancamentos: [...base.lancamentos, novo, { id: 888, tipo: "saida", descricao: "Café", valor: 5, data: HOJE }] };
    const junto = mesclarDados(base, local, remoto);
    const ids = junto.lancamentos.map((l) => l.id);
    expect(ids.filter((x) => x === 777)).toHaveLength(1);
    expect(ids).toContain(888);
  });
});
