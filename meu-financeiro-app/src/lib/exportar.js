// Relatório do mês para baixar: planilha do Excel (.xlsx) com as abas Resumo, Categorias, Lançamentos,
// Cartões e Contas fixas. Sempre com os valores de verdade (mesmo com "Esconder valores" ligado).
// A tela de impressão (PDF) usa o mesmo conteúdo (ver pages/RelatorioImpressao.jsx).

import { resumoDoMes } from "./mes.js";
import { faturaDoMes } from "./cartao.js";
import { arredondar, rotuloMes } from "./formato.js";
import { ehTransferencia } from "./transferencias.js";

const REAIS = '"R$" #,##0.00;-"R$" #,##0.00';

function titulo(texto) {
  return { value: texto, fontWeight: "bold" };
}

function reais(v) {
  return { value: arredondar(Number(v) || 0), type: Number, format: REAIS };
}

function data(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y) return null;
  return { value: new Date(Date.UTC(y, m - 1, d)), type: Date, format: "dd/mm/yyyy" };
}

function texto(v) {
  return { value: String(v ?? ""), type: String };
}

// Tudo o que o relatório do mês mostra (o mesmo para a planilha e para a impressão)
export function conteudoDoMes(dados, mes, hoje) {
  const r = resumoDoMes(dados, mes, hoje);
  const lancamentos = (dados.lancamentos || [])
    .filter((l) => l && String(l.data || "").startsWith(mes))
    .sort((a, b) => String(a.data).localeCompare(String(b.data)) || Number(a.id) - Number(b.id));
  const compras = [];
  for (const c of dados.cartoes || []) {
    const f = faturaDoMes(c, mes, hoje);
    for (const p of f.itens || []) {
      compras.push({ cartao: c.nome, descricao: p.descricao, categoria: p.categoria, parcela: p.total > 1 ? `${p.numero}/${p.total}` : "à vista", valor: p.valor, vence: f.vencimento });
    }
  }
  const contas = r.vencimentos.filter((v) => v.tipo === "conta");
  return { r, lancamentos, compras, contas, titulo: rotuloMes(mes) };
}

// As abas da planilha (formato da write-excel-file)
export function planilhaDoMes(dados, mes, hoje) {
  const { r, lancamentos, compras, contas, titulo: nome } = conteudoDoMes(dados, mes, hoje);

  const resumo = [
    [titulo(`Meu Financeiro · ${nome}`), null],
    [null, null],
    [texto("Receitas"), reais(r.receitas)],
    [texto("Despesas"), reais(r.despesas)],
    [texto("   lançamentos"), reais(r.origem.lancamentos)],
    [texto("   faturas de cartão"), reais(r.origem.cartoes)],
    [texto("   contas fixas"), reais(r.origem.fixas)],
    [titulo("Saldo do mês"), { ...reais(r.saldo), fontWeight: "bold" }]
  ];

  const categorias = [
    [titulo("Categoria"), titulo("Valor"), titulo("% das despesas")],
    ...r.categorias.map(([cat, v]) => [texto(cat), reais(v), { value: r.despesas > 0 ? v / r.despesas : 0, type: Number, format: "0%" }])
  ];

  const linhasLanc = [
    [titulo("Data"), titulo("Tipo"), titulo("Descrição"), titulo("Categoria"), titulo("Forma"), titulo("Valor"), titulo("Observação")],
    ...lancamentos.map((l) => {
      const transf = ehTransferencia(l);
      const tipo = transf ? "Transferência" : l.tipo === "entrada" ? "Receita" : "Gasto";
      const v = Number(l.valor) || 0;
      return [
        data(l.data),
        texto(tipo),
        texto(l.descricao),
        texto(transf ? "" : l.categoria),
        texto(transf ? "" : l.pagamento),
        reais(l.tipo === "saida" ? -v : v),
        texto(l.obs || "")
      ];
    })
  ];

  const linhasCartao = [
    [titulo("Cartão"), titulo("Descrição"), titulo("Categoria"), titulo("Parcela"), titulo("Valor"), titulo("Vence")],
    ...compras.map((c) => [texto(c.cartao), texto(c.descricao), texto(c.categoria), texto(c.parcela), reais(c.valor), data(c.vence)])
  ];

  const linhasContas = [
    [titulo("Conta"), titulo("Vence"), titulo("Valor"), titulo("Situação")],
    ...contas.map((c) => [texto(c.descricao), data(c.data), reais(c.valor), texto(c.status === "paga" ? "paga" : "em aberto")])
  ];

  return [
    { sheet: "Resumo", data: resumo, columns: [{ width: 28 }, { width: 16 }] },
    { sheet: "Categorias", data: categorias, columns: [{ width: 22 }, { width: 14 }, { width: 14 }] },
    { sheet: "Lançamentos", data: linhasLanc, columns: [{ width: 12 }, { width: 13 }, { width: 30 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 30 }], stickyRowsCount: 1 },
    { sheet: "Cartões", data: linhasCartao, columns: [{ width: 16 }, { width: 30 }, { width: 16 }, { width: 10 }, { width: 14 }, { width: 12 }], stickyRowsCount: 1 },
    { sheet: "Contas fixas", data: linhasContas, columns: [{ width: 24 }, { width: 12 }, { width: 14 }, { width: 12 }], stickyRowsCount: 1 }
  ];
}

export function nomeDoArquivo(mes) {
  return `meu-financeiro-${mes}.xlsx`;
}

export async function baixarPlanilha(dados, mes, hoje) {
  const { default: escrever } = await import("write-excel-file/browser");
  await escrever(planilhaDoMes(dados, mes, hoje)).toFile(nomeDoArquivo(mes));
}
