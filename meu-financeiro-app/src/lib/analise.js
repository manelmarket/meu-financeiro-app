// Análise do mês e alertas calculados pelo próprio app (sem IA, sem custo).

import { arredondar, diaMesBR, hojeISO, mesDaData, money, nomeMes, rotuloMes, somarDias, somarMeses } from "./formato.js";
import { resumoDoMes } from "./mes.js";
import { resumoDoCartao } from "./cartao.js";

// categorias essenciais: a sugestão de economia prefere as outras
const ESSENCIAIS = ["Casa", "Saúde", "Filhos", "Trabalho"];

function porcento(n) {
  return `${Math.round(n)}%`;
}

// valor "redondo" para a sugestão de corte
function valorRedondo(v) {
  if (v >= 1000) return Math.round(v / 100) * 100;
  if (v >= 100) return Math.round(v / 10) * 10;
  return Math.max(5, Math.round(v / 5) * 5);
}

function nomeDoCartao(vencimento) {
  return vencimento.descricao.replace(/^Fatura\s+/, "");
}

// Frases como: "Você gastou 32% a mais em Alimentação este mês."
// Cada frase: { tipo: "aviso" | "ok" | "info" | "dica", texto }
export function analiseDoMes(dados, mes, hoje = hojeISO()) {
  const atual = resumoDoMes(dados, mes, hoje);
  const anterior = resumoDoMes(dados, somarMeses(mes, -1), hoje);
  const nome = nomeMes(mes);
  const frases = [];

  if (atual.receitas === 0 && atual.despesas === 0) {
    return [{ tipo: "info", texto: `Ainda não há movimentações em ${nome}.` }];
  }

  // 1. categoria que mais subiu em relação ao mês anterior (ou a que mais caiu)
  const antes = Object.fromEntries(anterior.categorias);
  const variacoes = atual.categorias
    .filter(([categoria]) => antes[categoria] > 0)
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      antes: antes[categoria],
      diferenca: valor - antes[categoria],
      pct: ((valor - antes[categoria]) / antes[categoria]) * 100
    }));

  const subiu = variacoes
    .filter((v) => v.pct >= 10 && v.diferenca >= 20)
    .sort((a, b) => b.diferenca - a.diferenca)[0];
  if (subiu) {
    frases.push({
      tipo: "aviso",
      texto:
        subiu.pct >= 100
          ? `Seus gastos com ${subiu.categoria} mais que dobraram em ${nome}: ${money(subiu.valor)} contra ${money(subiu.antes)} no mês anterior.`
          : `Você gastou ${porcento(subiu.pct)} a mais em ${subiu.categoria} em ${nome} (${money(subiu.valor)} contra ${money(subiu.antes)} no mês anterior).`
    });
  } else {
    const caiu = variacoes
      .filter((v) => v.pct <= -10 && -v.diferenca >= 20)
      .sort((a, b) => a.diferenca - b.diferenca)[0];
    if (caiu) {
      frases.push({
        tipo: "ok",
        texto: `Boa! Você gastou ${porcento(-caiu.pct)} a menos em ${caiu.categoria} que no mês anterior.`
      });
    }
  }

  // 2. maior despesa do mês
  const candidatas = [
    ...atual.lancamentos
      .filter((l) => l.tipo !== "entrada")
      .map((l) => ({ texto: `o gasto "${l.descricao}"`, valor: Number(l.valor) || 0 })),
    ...atual.vencimentos.map((v) => ({
      texto: v.tipo === "fatura" ? `a fatura do cartão ${nomeDoCartao(v)}` : `a conta fixa ${v.descricao}`,
      valor: v.valor
    }))
  ].sort((a, b) => b.valor - a.valor);
  if (candidatas[0] && candidatas[0].valor > 0) {
    frases.push({ tipo: "info", texto: `Sua maior despesa foi ${candidatas[0].texto} (${money(candidatas[0].valor)}).` });
  }

  // 3. sugestão de economia na maior categoria que dá para cortar
  const alvo = atual.categorias.find(([categoria]) => !ESSENCIAIS.includes(categoria)) || atual.categorias[0];
  if (alvo && alvo[1] >= 50) {
    const corte = valorRedondo(alvo[1] * 0.15);
    frases.push({
      tipo: "dica",
      texto: `Se reduzir ${money(corte)}/mês em ${alvo[0]}, você economiza ${money(corte * 12)} no ano.`
    });
  }

  // 4. quanto sobrou da receita
  if (atual.receitas > 0) {
    if (atual.saldo >= 0) {
      frases.push({
        tipo: "ok",
        texto: `Sobrou ${porcento((atual.saldo / atual.receitas) * 100)} da sua receita em ${nome} (${money(atual.saldo)}).`
      });
    } else {
      frases.push({ tipo: "aviso", texto: `As despesas de ${nome} passam a receita em ${money(-atual.saldo)}.` });
    }
  } else if (atual.despesas > 0) {
    frases.push({
      tipo: "aviso",
      texto: `Nenhuma receita lançada em ${nome}, e as despesas somam ${money(atual.despesas)}.`
    });
  }

  return frases;
}

// Alertas do momento. Cada um: { id, tipo: "aviso" | "ok" | "info", texto, cartaoId?, pagina? }
export function alertas(dados, hoje = hojeISO()) {
  const lista = [];

  // 1. cartão com 85% ou mais do limite em uso
  for (const cartao of dados.cartoes || []) {
    const r = resumoDoCartao(cartao, hoje);
    if (r.limite > 0 && r.usado / r.limite >= 0.85) {
      const pct = Math.round((r.usado / r.limite) * 100);
      lista.push({
        id: `limite-${cartao.id}`,
        tipo: "aviso",
        cartaoId: cartao.id,
        texto:
          r.usado > r.limite
            ? `O cartão ${cartao.nome} passou do limite: ${money(r.usado)} em uso de ${money(r.limite)}.`
            : `O cartão ${cartao.nome} já está com ${pct}% do limite em uso (${money(r.usado)} de ${money(r.limite)}).`
      });
    }
  }

  // 2. gastos do mês acima do mês passado
  const mes = mesDaData(hoje);
  const mesPassado = somarMeses(mes, -1);
  const atual = resumoDoMes(dados, mes, hoje);
  const anterior = resumoDoMes(dados, mesPassado, hoje);
  const diferenca = arredondar(atual.despesas - anterior.despesas);
  if (anterior.despesas > 0 && diferenca >= 100 && diferenca / anterior.despesas >= 0.1) {
    lista.push({
      id: "gasto-acima",
      tipo: "aviso",
      pagina: "reports",
      texto: `Você gastou ${money(diferenca)} a mais que no mês passado (${money(atual.despesas)} em ${nomeMes(mes)} contra ${money(anterior.despesas)} em ${nomeMes(mesPassado)}).`
    });
  }

  // 3. metas atingidas
  for (const meta of dados.metas || []) {
    if (Number(meta.objetivo) > 0 && Number(meta.atual) >= Number(meta.objetivo)) {
      lista.push({ id: `meta-${meta.id}`, tipo: "ok", pagina: "goals", texto: `Meta atingida: ${meta.nome}!` });
    }
  }

  // 4. faturas e contas fixas que vencem nos próximos 3 dias
  const amanha = somarDias(hoje, 1);
  const limite = somarDias(hoje, 3);
  const proximos = [...atual.vencimentos, ...resumoDoMes(dados, somarMeses(mes, 1), hoje).vencimentos].filter(
    (v) => v.data >= hoje && v.data <= limite && v.status !== "paga"
  );
  for (const v of proximos) {
    const quando = v.data === hoje ? "vence hoje" : v.data === amanha ? "vence amanhã" : `vence em ${diaMesBR(v.data)}`;
    lista.push({
      id: `vence-${v.id}-${v.data}`,
      tipo: "info",
      cartaoId: v.cartaoId,
      texto: `${v.descricao} ${quando} (${money(v.valor)}).`
    });
  }

  return lista;
}

// Resumo enxuto do mês para mandar à IA (só números e nomes, sem a chave nem fotos)
export function resumoParaIA(dados, mes, hoje = hojeISO()) {
  const atual = resumoDoMes(dados, mes, hoje);
  const anterior = resumoDoMes(dados, somarMeses(mes, -1), hoje);
  return {
    mes: rotuloMes(mes),
    receitas: atual.receitas,
    despesas: atual.despesas,
    saldo: atual.saldo,
    despesas_por_origem: {
      lancamentos: atual.origem.lancamentos,
      faturas_de_cartao: atual.origem.cartoes,
      contas_fixas: atual.origem.fixas
    },
    despesas_por_categoria: Object.fromEntries(atual.categorias),
    mes_anterior: {
      mes: rotuloMes(anterior.mes),
      receitas: anterior.receitas,
      despesas: anterior.despesas,
      despesas_por_categoria: Object.fromEntries(anterior.categorias)
    },
    vencimentos_do_mes: atual.vencimentos.map((v) => ({ descricao: v.descricao, valor: v.valor, data: v.data })),
    maiores_gastos_lancados: atual.lancamentos
      .filter((l) => l.tipo !== "entrada")
      .sort((a, b) => (Number(b.valor) || 0) - (Number(a.valor) || 0))
      .slice(0, 5)
      .map((l) => ({ descricao: l.descricao, categoria: l.categoria, valor: Number(l.valor) || 0 })),
    cartoes: (dados.cartoes || []).map((c) => {
      const r = resumoDoCartao(c, hoje);
      return { nome: c.nome, limite: r.limite, limite_em_uso: r.usado, fatura_atual: r.faturaAtual.valor };
    }),
    metas: (dados.metas || []).map((m) => ({ nome: m.nome, objetivo: Number(m.objetivo) || 0, guardado: Number(m.atual) || 0 }))
  };
}
