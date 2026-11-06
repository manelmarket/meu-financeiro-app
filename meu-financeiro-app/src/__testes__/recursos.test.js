// Testes dos recursos novos: receitas fixas, previsão, assinaturas, semana, importar, Jarvis e relatório.
import { describe, expect, it } from "vitest";
import { criarSeed } from "../storage/storage.js";
import { salvarBanco } from "../lib/saldos.js";
import { somarDias } from "../lib/formato.js";
import * as rf from "../lib/receitasFixas.js";
import { previsaoDoMes } from "../lib/previsao.js";
import { acharAssinaturas, chaveDaAssinatura } from "../lib/assinaturas.js";
import { inicioDaSemana, resumoDaSemana } from "../lib/semana.js";
import { aplicarImportacao, converterLinhas, dataDeCelula, entenderAba, lerCsv, melhorAba, numeroDeCelula } from "../lib/importar.js";
import { executarAcoes, respostaCurta } from "../lib/conversa.js";
import { planilhaDoMes } from "../lib/exportar.js";

const HOJE = "2026-11-06";

function comBancoESalario() {
  let d = salvarBanco(criarSeed(HOJE), { id: null, nome: "Nubank", saldo: 1000 }, new Date(2026, 10, 1).getTime());
  d = rf.salvarReceitaFixa(d, { nome: "Salário", valor: 5000, dia: 5, bancoId: d.usuario.bancos[0].id }, "2026-11-03", 111).dados;
  return d;
}

describe("receitas fixas", () => {
  it("lança no dia, uma vez só, com o mesmo id em qualquer aparelho", () => {
    const d = comBancoESalario();
    expect(rf.lancarReceitasDoDia(d, "2026-11-04")).toBe(d);
    const depois = rf.lancarReceitasDoDia(d, HOJE);
    const sal = depois.lancamentos.filter((l) => l.receitaFixa);
    expect(sal).toHaveLength(1);
    expect(sal[0]).toMatchObject({ valor: 5000, data: "2026-11-05", tipo: "entrada" });
    expect(rf.lancarReceitasDoDia(depois, HOJE)).toBe(depois);
    const outro = rf.lancarReceitasDoDia(structuredClone(d), "2026-11-07");
    expect(outro.lancamentos.find((l) => l.receitaFixa).id).toBe(sal[0].id);
  });

  it("cadastrada depois do dia começa no mês seguinte", () => {
    const d = rf.salvarReceitaFixa(criarSeed(HOJE), { nome: "Aluguel", valor: 900, dia: 2 }, HOJE, 5).dados;
    expect(rf.lerReceitasFixas(d)[0].desde).toBe("2026-12");
    expect(rf.lancarReceitasDoDia(d, HOJE)).toBe(d);
  });

  it("manual espera o Recebi; Não veio tira da lista", () => {
    const d = rf.salvarReceitaFixa(criarSeed(HOJE), { nome: "Freela", valor: 800, dia: 20, automatica: false }, "2026-11-03", 7).dados;
    expect(rf.receitasParaConfirmar(d, "2026-11-21")).toHaveLength(1);
    expect(rf.receitasParaConfirmar(rf.pularMes(d, 7, "2026-11"), "2026-11-21")).toHaveLength(0);
    const recebida = rf.receber(d, 7, "2026-11");
    expect(rf.receitasParaConfirmar(recebida, "2026-11-21")).toHaveLength(0);
  });
});

describe("previsão", () => {
  it("bancos + a receber − contas e faturas a pagar", () => {
    let d = comBancoESalario();
    d = rf.salvarReceitaFixa(d, { nome: "Freela", valor: 800, dia: 20, automatica: false }, "2026-11-03", 222).dados;
    d = rf.lancarReceitasDoDia(d, HOJE);
    const p = previsaoDoMes(d, HOJE);
    expect(p.base).toBe(6000);
    expect(p.totalReceber).toBe(800);
    expect(p.totalPagar).toBe(426);
    expect(p.previsto).toBe(6374);
  });
});

describe("assinaturas e semana", () => {
  const lanc = [];
  let id = 1;
  const add = (descricao, valor, data, categoria = "Lazer") => lanc.push({ id: id++, tipo: "saida", descricao, valor, data, categoria });
  for (let m = 6; m <= 11; m++) add(`NETFLIX.COM ${m}9`, 55.9, `2026-${String(m).padStart(2, "0")}-03`);
  for (let k = 0; k < 120; k += 7) add("Mercado", 200, somarDias(HOJE, -k), "Alimentação");
  const dados = { lancamentos: lanc, cartoes: [], contasFixas: [], usuario: {} };

  it("acha a assinatura e ignora o mercado de toda semana", () => {
    expect(chaveDaAssinatura("Pg *Spotify 123")).toBe("spotify");
    const a = acharAssinaturas(dados, HOJE);
    expect(a.map((x) => x.chave)).toEqual(["netflix com"]);
    expect(a[0].anual).toBeCloseTo(670.8, 2);
  });

  it("a semana começa na segunda e a assinatura não vira 'fora do padrão'", () => {
    expect(inicioDaSemana("2026-11-06")).toBe("2026-11-02");
    const r = resumoDaSemana(dados, HOJE);
    expect(r.foraDoPadrao.map((f) => f.categoria)).not.toContain("Lazer");
  });
});

describe("importar planilha", () => {
  it("lê CSV com aspas e ponto e vírgula", () => {
    expect(lerCsv('a;b\n"x;y";"2"\n')).toEqual([["a", "b"], ["x;y", "2"]]);
  });

  it("entende datas e valores brasileiros", () => {
    expect(dataDeCelula("05/11/2026")).toBe("2026-11-05");
    expect(dataDeCelula("05/11/26")).toBe("2026-11-05");
    expect(dataDeCelula(46331)).toBe("2026-11-05");
    expect(numeroDeCelula("R$ 1.234,56")).toBe(1234.56);
    expect(numeroDeCelula("(50,00)")).toBe(-50);
    expect(numeroDeCelula("50,00 D")).toBe(-50);
  });

  it("acha a aba e o cabeçalho, separa gasto, receita e cartão, e marca repetidos", () => {
    const abas = [
      { nome: "Resumo", linhas: [["Total", 10]] },
      {
        nome: "Lançamentos",
        linhas: [
          ["Controle"],
          [],
          ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)", "Forma de pagamento", "Cartão", "Parcelas"],
          ["02/11/2026", "Supermercado", "Mercado", "Despesa", 312.4, "Débito", "", ""],
          ["05/11/2026", "Salário", "", "Receita", 5000, "Pix", "", ""],
          ["07/11/2026", "Geladeira", "Casa", "Despesa", 3000, "Crédito", "Nubank", "10x"],
          ["", "Total", "", "", 8312.4, "", "", ""]
        ]
      }
    ];
    const d = criarSeed(HOJE);
    const i = melhorAba(abas);
    expect(abas[i].nome).toBe("Lançamentos");
    const mapa = entenderAba(abas[i]);
    expect(mapa.cabecalho).toBe(2);
    const { itens } = converterLinhas(abas[i], mapa, d, { hoje: HOJE });
    expect(itens.map((x) => [x.tipo, x.categoria, x.cartaoNome, x.parcelas, Boolean(x.erro), x.duplicado])).toEqual([
      ["saida", "Alimentação", null, 1, false, false],
      ["entrada", "Receita", null, 1, false, true],
      ["saida", "Casa", "Nubank", 10, false, false],
      ["saida", "Outros", null, 1, true, false]
    ]);
    const r = aplicarImportacao(d, itens, { agora: 1800000000000 });
    expect(r.contagem).toMatchObject({ gastos: 1, receitas: 0, noCartao: 1 });
    expect(r.dados.cartoes[0].compras.find((c) => c.descricao === "Geladeira").parcelas).toBe(10);
  });
});

describe("Jarvis", () => {
  it("executa só ações conhecidas e confere os dados", () => {
    const d = criarSeed(HOJE);
    const r = executarAcoes(
      d,
      [
        { acao: "lancar", tipo: "gasto", valor: 25, descricao: "Uber", categoria: "Transporte", formas: [{ forma: "Pix" }] },
        { acao: "editar_lancamento", id: 2, valor: 245 },
        { acao: "apagar_lancamento", id: 999 },
        { acao: "hackear" }
      ],
      { hoje: HOJE, agora: 1000 }
    );
    expect(r.mudou).toBe(true);
    expect(r.itens.filter((i) => i.erro)).toHaveLength(2);
    expect(r.dados.lancamentos.find((l) => l.id === 2).valor).toBe(245);
    expect(r.dados.lancamentos.some((l) => l.descricao === "Uber")).toBe(true);
  });

  it("entende sim e não curtos", () => {
    expect(respostaCurta("Pode sim")).toBe("sim");
    expect(respostaCurta("cancela")).toBe("nao");
    expect(respostaCurta("sim mas muda pra 30")).toBe(null);
  });
});

describe("relatório", () => {
  it("a planilha do mês tem as abas e o saldo certo", () => {
    const abas = planilhaDoMes(criarSeed(HOJE), "2026-11", HOJE);
    expect(abas.map((a) => a.sheet)).toEqual(["Resumo", "Categorias", "Lançamentos", "Cartões", "Contas fixas"]);
    expect(abas[0].data[7][1].value).toBe(4324);
  });
});
