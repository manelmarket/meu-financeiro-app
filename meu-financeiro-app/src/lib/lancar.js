// Novo lançamento: monta o que vai ser gravado a partir do formulário.
//
// Um gasto pode ser pago de várias formas ao mesmo tempo (ex.: R$ 100 = R$ 50 no Pix + R$ 50 em espécie,
// ou parte no cartão em 3x). Cada forma é uma "parte":
//   { forma, valor, bancoId?, cartaoId?, parcelas? }
// - Partes no cartão viram compras no cartão escolhido (entram na fatura, com as parcelas de cada uma).
// - As outras partes viram UM lançamento, com a lista de formas em "formas" (e de que banco saiu cada uma).
// - "pagamento" guarda o texto das formas (ex.: "Pix + Dinheiro"), que as versões anteriores do app mostram.
// - Quando o gasto foi dividido entre cartão e outras formas, o lançamento e as compras levam o mesmo "grupo".

import { arredondar, dataValida } from "./formato.js";

export const MAXIMO_DE_PARCELAS = 12;

function valorDe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? arredondar(n) : NaN;
}

function temBanco(bancoId) {
  return bancoId != null && bancoId !== "";
}

// form = { tipo: "saida" | "entrada", descricao, categoria, data, valor, partes, cupomId? }
// cartoes: lista de cartões (para conferir o cartão de cada parte)
// Devolve { erro } ou { lancamento, compras: [{ cartaoId, compra }] }
export function montarLancamento(form, cartoes = [], agora = Date.now()) {
  const total = valorDe(form.valor);
  const descricao = String(form.descricao || "").trim();
  if (!(total > 0)) return { erro: "Informe um valor maior que zero (ex.: 1.250,50)." };
  if (!descricao) return { erro: "Informe a descrição." };
  if (!dataValida(form.data)) return { erro: "Informe a data." };

  const partes = (Array.isArray(form.partes) && form.partes.length ? form.partes : [{ forma: "Pix", valor: total }]).map(
    (p) => ({ ...p, valor: valorDe(p.valor) })
  );

  // receita: uma forma só (a primeira)
  if (form.tipo === "entrada") {
    const p = partes[0];
    const forma = String(p.forma || "Pix");
    return {
      lancamento: {
        id: agora,
        tipo: "entrada",
        descricao,
        categoria: "Receita",
        valor: total,
        pagamento: forma,
        data: form.data,
        ...(temBanco(p.bancoId) ? { formas: [{ forma, valor: total, bancoId: p.bancoId }], criadoEm: agora } : {})
      },
      compras: []
    };
  }

  if (partes.some((p) => !(p.valor > 0))) {
    return { erro: partes.length > 1 ? "Informe o valor de cada forma de pagamento." : "Informe o valor." };
  }
  const soma = arredondar(partes.reduce((t, p) => t + p.valor, 0));
  if (Math.abs(soma - total) > 0.004) {
    const dif = arredondar(total - soma);
    return {
      erro:
        dif > 0
          ? `As formas de pagamento somam menos que o total: faltam R$ ${dif.toFixed(2).replace(".", ",")}.`
          : `As formas de pagamento passam do total em R$ ${(-dif).toFixed(2).replace(".", ",")}.`
    };
  }

  const categoria = String(form.categoria || "Outros");
  const noCartao = [];
  const outras = [];
  for (const p of partes) {
    const cartao = p.forma === "Cartão" ? cartoes.find((c) => String(c.id) === String(p.cartaoId)) : null;
    if (p.forma === "Cartão" && cartoes.length > 0) {
      if (!cartao) return { erro: "Escolha o cartão." };
      noCartao.push({ ...p, cartao });
    } else {
      outras.push(p);
    }
  }

  const dividido = noCartao.length > 0 && outras.length > 0;
  const grupo = dividido || noCartao.length > 1 ? { grupo: agora } : {};

  const compras = noCartao.map((p, i) => {
    const parcelas = Math.min(MAXIMO_DE_PARCELAS, Math.max(1, parseInt(p.parcelas, 10) || 1));
    return {
      cartaoId: p.cartao.id,
      compra: {
        id: agora + i + 1,
        descricao,
        categoria,
        data: form.data,
        valorTotal: p.valor,
        parcelas,
        ...grupo,
        // a foto do cupom fica na primeira compra
        ...(i === 0 && form.cupomId ? { cupomId: form.cupomId } : {})
      }
    };
  });

  let lancamento = null;
  if (outras.length) {
    const valor = arredondar(outras.reduce((t, p) => t + p.valor, 0));
    const formas = outras.map((p) => ({
      forma: String(p.forma || "Pix"),
      valor: p.valor,
      ...(temBanco(p.bancoId) ? { bancoId: p.bancoId } : {})
    }));
    const comBanco = formas.some((f) => temBanco(f.bancoId));
    lancamento = {
      id: agora,
      tipo: "saida",
      descricao,
      categoria,
      valor,
      pagamento: [...new Set(formas.map((f) => f.forma))].join(" + "),
      data: form.data,
      ...(formas.length > 1 || comBanco ? { formas } : {}),
      ...(comBanco ? { criadoEm: agora } : {}),
      ...grupo
    };
  }

  return { lancamento, compras };
}
