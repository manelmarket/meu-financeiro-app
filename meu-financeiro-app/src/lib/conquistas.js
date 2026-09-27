// Gamificação: conquistas (medalhas) e desafios do mês.
//
// Tudo é calculado a partir dos dados (nada novo é gravado): a conquista aparece quando a condição
// acontece. Quais conquistas este aparelho já mostrou fica guardado só aqui (para o aviso de "nova").

import { arredondar, hojeISO, mesDaData, somarMeses } from "./formato.js";
import { resumoDoMes } from "./mes.js";
import { contasDasFaturas, datasDaFatura } from "./cartao.js";
import { lerOrcamentos, nivelDoOrcamento } from "./orcamento.js";
import { lerBancos } from "./saldos.js";

const MESES_OLHADOS = 24;

function lista(v) {
  return Array.isArray(v) ? v : [];
}

function contarRegistros(dados) {
  return lista(dados.lancamentos).length + lista(dados.cartoes).reduce((t, c) => t + lista(c?.compras).length, 0);
}

// meses já terminados, do mais antigo para o mais novo
function mesesPassados(hoje, quantidade = MESES_OLHADOS) {
  const atual = mesDaData(hoje);
  return Array.from({ length: quantidade }, (_, i) => somarMeses(atual, i - quantidade));
}

function mesNoAzul(r) {
  return r.receitas > 0 && r.saldo >= 0;
}

// faturas pagas pelo botão Pagar: [{ inteira, emDia }]
function faturasPagas(dados) {
  const r = [];
  for (const cartao of lista(dados.cartoes)) {
    for (const conta of contasDasFaturas(cartao).values()) {
      if (!(conta.pago > 0) || conta.restante > 0) continue;
      const vencimento = datasDaFatura(cartao, conta.mes).vencimento;
      const ultimo = conta.pagamentos.reduce((m, p) => (String(p.data) > m ? String(p.data) : m), "");
      r.push({ inteira: conta.paraProxima === 0, emDia: ultimo !== "" && ultimo <= vencimento });
    }
  }
  return r;
}

function mesDentroDosOrcamentos(r, limites) {
  if (!(r.despesas > 0)) return false;
  const gastos = Object.fromEntries(r.categorias);
  return Object.entries(limites).every(([categoria, limite]) => (gastos[categoria] || 0) <= limite);
}

// Lista de conquistas: { id, icone, titulo, descricao, conquistada, progresso?: { atual, total } }
// extras: { familia: true } quando a pessoa usa o modo família
export function conquistas(dados, hoje = hojeISO(), extras = {}) {
  const registros = contarRegistros(dados);
  const passados = mesesPassados(hoje).map((mes) => ({ mes, r: resumoDoMes(dados, mes, hoje) }));
  let seguidos = 0;
  let melhor = 0;
  for (const { r } of passados) {
    seguidos = mesNoAzul(r) ? seguidos + 1 : 0;
    melhor = Math.max(melhor, seguidos);
  }
  const pagas = faturasPagas(dados);
  const inteiras = pagas.filter((f) => f.inteira).length;
  const limites = lerOrcamentos(dados);
  const temLimites = Object.keys(limites).length > 0;
  const orcamentoOk =
    temLimites && passados.slice(-12).some(({ r }) => mesDentroDosOrcamentos(r, limites));
  const metaBatida = lista(dados.metas).some((m) => Number(m?.objetivo) > 0 && Number(m?.atual) >= Number(m?.objetivo));

  const itens = [
    { id: "primeiro-registro", icone: "🚀", titulo: "Primeiro passo", descricao: "Registrou o primeiro gasto ou receita.", atual: registros, total: 1 },
    { id: "organizado", icone: "📒", titulo: "Organizado", descricao: "30 gastos e receitas registrados.", atual: registros, total: 30 },
    { id: "disciplina", icone: "🏅", titulo: "Disciplina de ferro", descricao: "100 gastos e receitas registrados.", atual: registros, total: 100 },
    { id: "mes-no-azul", icone: "💙", titulo: "Mês no azul", descricao: "Terminou um mês com a receita maior que as despesas.", atual: Math.min(melhor, 1), total: 1 },
    { id: "tres-meses-no-azul", icone: "🏆", titulo: "Três meses no azul", descricao: "Três meses seguidos com a receita maior que as despesas.", atual: Math.min(melhor, 3), total: 3 },
    { id: "fatura-em-dia", icone: "💳", titulo: "Fatura em dia", descricao: "Pagou uma fatura inteira pelo botão Pagar, até o vencimento.", atual: pagas.some((f) => f.inteira && f.emDia) ? 1 : 0, total: 1 },
    { id: "longe-do-rotativo", icone: "✨", titulo: "Longe do rotativo", descricao: "Pagou 3 faturas inteiras, sem deixar resto para a próxima.", atual: Math.min(inteiras, 3), total: 3 },
    { id: "meta-batida", icone: "🎯", titulo: "Meta batida", descricao: "Chegou ao valor de uma meta.", atual: metaBatida ? 1 : 0, total: 1 },
    { id: "dentro-do-orcamento", icone: "🧭", titulo: "Dentro do orçamento", descricao: "Terminou um mês com todos os orçamentos respeitados.", atual: orcamentoOk ? 1 : 0, total: 1 },
    { id: "bancos", icone: "🏦", titulo: "Tudo no lugar", descricao: "Cadastrou seus bancos com o saldo de cada um.", atual: lerBancos(dados).length > 0 ? 1 : 0, total: 1 },
    { id: "investidor", icone: "📈", titulo: "Investidor", descricao: "Registrou um investimento.", atual: lista(dados.investimentos).length > 0 ? 1 : 0, total: 1 },
    { id: "familia", icone: "👨‍👩‍👧", titulo: "Em família", descricao: "Usa o app junto com a família.", atual: extras.familia ? 1 : 0, total: 1 }
  ];

  return itens.map(({ atual, total, ...c }) => ({
    ...c,
    conquistada: atual >= total,
    progresso: total > 1 ? { atual: Math.min(atual, total), total } : null
  }));
}

// Desafios de um mês: { id, icone, titulo, descricao, status, atual, alvo, texto }
// status: "andamento" | "cumprido" | "falhou"
export function desafiosDoMes(dados, mes, hoje = hojeISO()) {
  const passou = mes < mesDaData(hoje);
  const r = resumoDoMes(dados, mes, hoje);
  const anterior = resumoDoMes(dados, somarMeses(mes, -1), hoje);
  const desafios = [];

  if (anterior.despesas > 0) {
    const cabe = r.despesas <= anterior.despesas;
    desafios.push({
      id: "menos-que-mes-passado",
      icone: "📉",
      titulo: "Gastar menos que no mês passado",
      descricao: "As despesas do mês ficam abaixo das do mês anterior.",
      status: !cabe ? "falhou" : passou ? "cumprido" : "andamento",
      atual: r.despesas,
      alvo: anterior.despesas,
      dinheiro: true,
      noCaminho: cabe
    });
  }

  const limites = lerOrcamentos(dados);
  const categorias = Object.entries(limites);
  if (categorias.length) {
    const gastos = Object.fromEntries(r.categorias);
    const dentro = categorias.filter(([c, limite]) => nivelDoOrcamento(gastos[c] || 0, limite) !== "estourado").length;
    const estourou = categorias.some(([c, limite]) => (gastos[c] || 0) > limite);
    desafios.push({
      id: "orcamentos",
      icone: "🧭",
      titulo: "Ficar dentro dos orçamentos",
      descricao: "Nenhuma categoria passa do limite do mês.",
      status: estourou ? "falhou" : passou ? "cumprido" : "andamento",
      atual: dentro,
      alvo: categorias.length,
      unidade: "categorias",
      noCaminho: !estourou
    });
  }

  if (r.receitas > 0) {
    const alvo = arredondar(r.receitas * 0.1);
    const sobra = Math.max(0, r.saldo);
    desafios.push({
      id: "guardar-10",
      icone: "💰",
      titulo: "Guardar 10% da receita",
      descricao: "Sobrar pelo menos 10% do que entrou no mês.",
      status: sobra >= alvo ? (passou ? "cumprido" : "andamento") : passou ? "falhou" : "andamento",
      atual: sobra,
      alvo,
      dinheiro: true,
      noCaminho: sobra >= alvo
    });
  }

  const dias = new Set();
  for (const l of lista(dados.lancamentos)) {
    if (l?.tipo !== "entrada" && mesDaData(l?.data) === mes) dias.add(l.data);
  }
  for (const c of lista(dados.cartoes)) {
    for (const x of lista(c?.compras)) if (mesDaData(x?.data) === mes) dias.add(x.data);
  }
  desafios.push({
    id: "registrar-15-dias",
    icone: "🗓️",
    titulo: "Registrar gastos em 15 dias",
    descricao: "Anotar os gastos em pelo menos 15 dias diferentes do mês.",
    status: dias.size >= 15 ? "cumprido" : passou ? "falhou" : "andamento",
    atual: Math.min(dias.size, 15),
    alvo: 15,
    unidade: "dias"
  });

  const faturas = r.vencimentos.filter((v) => v.tipo === "fatura");
  if (faturas.length) {
    const pagas = faturas.filter((v) => v.pago > 0 && v.aPagar === 0 && v.status === "paga").length;
    desafios.push({
      id: "faturas-pelo-app",
      icone: "💳",
      titulo: "Pagar as faturas pelo app",
      descricao: "Marcar como pagas, no botão Pagar, as faturas que vencem no mês.",
      status: pagas === faturas.length ? "cumprido" : passou ? "falhou" : "andamento",
      atual: pagas,
      alvo: faturas.length,
      unidade: "faturas"
    });
  }

  return desafios;
}

// ---------- quais conquistas este aparelho já mostrou ----------

const CHAVE_VISTAS = "meu_financeiro_conquistas_vistas";

function lerVistas() {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_VISTAS) || "null");
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function marcarConquistasVistas(ids) {
  try {
    localStorage.setItem(CHAVE_VISTAS, JSON.stringify([...new Set(ids)]));
  } catch {
    // sem espaço: o aviso volta na próxima vez
  }
}

// Conquistas que este aparelho ainda não mostrou. Na primeira vez, tudo o que já existe
// conta como visto (sem avisos de coisas antigas).
export function conquistasNovas(lista) {
  const feitas = lista.filter((c) => c.conquistada).map((c) => c.id);
  const vistas = lerVistas();
  if (!vistas) {
    marcarConquistasVistas(feitas);
    return [];
  }
  return lista.filter((c) => c.conquistada && !vistas.includes(c.id));
}
