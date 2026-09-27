// Categorias de gasto: as do app (fixas) + as que a pessoa cria, cada uma com ícone e cor.
//
// As personalizadas ficam em usuario.categorias (junto do perfil, como os bancos e os orçamentos,
// para um aparelho numa versão anterior não apagar a lista ao sincronizar):
//   { id, nome, icone, cor }            → categoria criada pela pessoa (id numérico)
//   { id: "app:Casa", nome, icone, cor } → categoria do app com ícone/cor trocados
//
// Os lançamentos, compras do cartão e contas fixas guardam só o NOME da categoria (como sempre);
// o ícone e a cor vêm daqui na hora de mostrar.

import { arredondar } from "./formato.js";

export const CATEGORIAS_DO_APP = [
  { nome: "Casa", icone: "🏠", cor: "#2563eb" },
  { nome: "Alimentação", icone: "🛒", cor: "#ea580c" },
  { nome: "Transporte", icone: "🚗", cor: "#0284c7" },
  { nome: "Lazer", icone: "🎉", cor: "#db2777" },
  { nome: "Saúde", icone: "💊", cor: "#16a34a" },
  { nome: "Filhos", icone: "🧸", cor: "#9333ea" },
  { nome: "Trabalho", icone: "💼", cor: "#b45309" },
  { nome: "Outros", icone: "📦", cor: "#64748b" }
];

// Só os nomes (as telas antigas usam esta lista)
export const CATEGORIAS = CATEGORIAS_DO_APP.map((c) => c.nome);

export const CATEGORIA_RECEITA = { nome: "Receita", icone: "💰", cor: "#059669" };
export const CATEGORIA_PADRAO = "Outros";

// Ícones e cores que dá para escolher ao criar/editar uma categoria
export const ICONES_DE_CATEGORIA = [
  "🏠", "🛒", "🍔", "🛋️", "☕", "🍺", "🍕",
  "🚗", "⛽", "🚌", "✈️", "🏍️", "💡", "💧",
  "📶", "📱", "💻", "🏥", "💊", "🦷", "🧴",
  "👕", "👟", "💇", "🎉", "🎁", "🎬", "🎮",
  "🎵", "⚽", "🏋️", "📚", "🎓", "🧸", "🐾",
  "💼", "🧾", "🔧", "🧹", "🐶", "🌱", "❤️",
  "💰", "🏦", "💳", "🎯", "📦", "🏷️", "✨"
];

export const CORES_DE_CATEGORIA = [
  "#2563eb", "#0ea5e9", "#0f766e", "#16a34a", "#65a30d", "#d97706", "#ea580c",
  "#dc2626", "#db2777", "#9333ea", "#4f46e5", "#92400e", "#64748b"
];

export const BANDEIRAS = [
  "Mastercard",
  "Visa",
  "Elo",
  "American Express",
  "Hipercard",
  "Outra"
];

export const FORMAS_PAGAMENTO = ["Pix", "Cartão", "Dinheiro", "Débito", "Transferência"];

// Sugestões rápidas para contas fixas
export const SUGESTOES_CONTAS = [
  { nome: "Internet", categoria: "Casa" },
  { nome: "Energia", categoria: "Casa" },
  { nome: "Água", categoria: "Casa" },
  { nome: "Streaming", categoria: "Lazer" },
  { nome: "Academia", categoria: "Saúde" },
  { nome: "Escola", categoria: "Filhos" }
];

export const TIPOS_INVESTIMENTO = ["CDB", "Tesouro", "Ações", "Fundos", "Cripto"];

// "Dívida" entra subtraindo no patrimônio líquido
export const TIPOS_BEM = ["Imóvel", "Veículo", "Outros bens", "Dívida"];

// ---------- leitura ----------

function ehTexto(v) {
  return typeof v === "string" && v.trim() !== "";
}

function corValida(v) {
  return typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
}

// texto sem acento, minúsculo (para comparar nomes)
export function chaveDoNome(nome) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function mesmoNome(a, b) {
  return chaveDoNome(a) === chaveDoNome(b);
}

export function lerCategoriasSalvas(dados) {
  const lista = dados?.usuario?.categorias;
  return Array.isArray(lista) ? lista.filter((c) => c && typeof c === "object" && c.id != null && ehTexto(c.nome)) : [];
}

function ehDoApp(id) {
  return typeof id === "string" && id.startsWith("app:");
}

// Todas as categorias de gasto, na ordem: as do app (com o visual da pessoa, se trocou) e depois as
// que ela criou (as mais antigas primeiro). Cada uma: { id, nome, icone, cor, doApp }
export function listarCategorias(dados) {
  const salvas = lerCategoriasSalvas(dados);
  const doApp = CATEGORIAS_DO_APP.map((c) => {
    const troca = salvas.find((s) => s.id === `app:${c.nome}`);
    return {
      id: `app:${c.nome}`,
      nome: c.nome,
      icone: troca && ehTexto(troca.icone) ? troca.icone : c.icone,
      cor: troca && corValida(troca.cor) ? troca.cor : c.cor,
      doApp: true
    };
  });
  const proprias = salvas
    .filter((s) => !ehDoApp(s.id) && !CATEGORIAS_DO_APP.some((c) => mesmoNome(c.nome, s.nome)))
    .sort((a, b) => Number(a.id) - Number(b.id) || String(a.nome).localeCompare(String(b.nome)))
    .map((s) => ({
      id: s.id,
      nome: String(s.nome).trim(),
      icone: ehTexto(s.icone) ? s.icone : "🏷️",
      cor: corValida(s.cor) ? s.cor : "#64748b",
      doApp: false
    }));
  return [...doApp, ...proprias];
}

// Só os nomes (para os <select>)
export function nomesDasCategorias(dados) {
  return listarCategorias(dados).map((c) => c.nome);
}

// { nome → { id, nome, icone, cor, doApp } } com a Receita junto
export function mapaDeCategorias(dados) {
  const mapa = new Map();
  for (const c of listarCategorias(dados)) mapa.set(chaveDoNome(c.nome), c);
  mapa.set(chaveDoNome(CATEGORIA_RECEITA.nome), { id: "app:Receita", ...CATEGORIA_RECEITA, doApp: true });
  return mapa;
}

// Ícone e cor de uma categoria pelo nome. Categoria que já foi apagada continua com o nome que
// está no registro, com um visual neutro.
export function infoDaCategoria(dados, nome, mapa = null) {
  const m = mapa || mapaDeCategorias(dados);
  const achada = m.get(chaveDoNome(nome));
  if (achada) return achada;
  return { id: null, nome: String(nome || CATEGORIA_PADRAO), icone: "🏷️", cor: "#64748b", doApp: false };
}

export function acharCategoria(dados, id) {
  return listarCategorias(dados).find((c) => String(c.id) === String(id)) || null;
}

export function acharCategoriaPeloNome(dados, nome) {
  return listarCategorias(dados).find((c) => mesmoNome(c.nome, nome)) || null;
}

// Quantos registros usam a categoria (lançamentos, compras dos cartões e contas fixas)
export function usosDaCategoria(dados, nome) {
  let n = 0;
  for (const l of Array.isArray(dados?.lancamentos) ? dados.lancamentos : []) {
    if (l && l.tipo === "saida" && mesmoNome(l.categoria, nome)) n += 1;
  }
  for (const c of Array.isArray(dados?.cartoes) ? dados.cartoes : []) {
    for (const x of Array.isArray(c?.compras) ? c.compras : []) if (x && mesmoNome(x.categoria, nome)) n += 1;
  }
  for (const c of Array.isArray(dados?.contasFixas) ? dados.contasFixas : []) {
    if (c && mesmoNome(c.categoria, nome)) n += 1;
  }
  return n;
}

// ---------- escrita ----------

function comLista(dados, categorias) {
  return { ...dados, usuario: { ...(dados.usuario || {}), categorias } };
}

// Troca o nome da categoria em todos os registros (lançamentos, compras, contas fixas e orçamentos)
function renomearNosRegistros(dados, antigo, novo) {
  const troca = (r) => (r && mesmoNome(r.categoria, antigo) ? { ...r, categoria: novo } : r);
  const usuario = { ...(dados.usuario || {}) };
  const orcamentos = usuario.orcamentos && typeof usuario.orcamentos === "object" ? { ...usuario.orcamentos } : null;
  if (orcamentos) {
    const chave = Object.keys(orcamentos).find((k) => mesmoNome(k, antigo));
    if (chave !== undefined && chave !== novo) {
      const limite = orcamentos[chave];
      delete orcamentos[chave];
      if (novo) orcamentos[novo] = arredondar(Number(limite) || 0);
    }
    usuario.orcamentos = orcamentos;
  }
  return {
    ...dados,
    usuario,
    lancamentos: (Array.isArray(dados.lancamentos) ? dados.lancamentos : []).map(troca),
    cartoes: (Array.isArray(dados.cartoes) ? dados.cartoes : []).map((c) =>
      Array.isArray(c?.compras) ? { ...c, compras: c.compras.map(troca) } : c
    ),
    contasFixas: (Array.isArray(dados.contasFixas) ? dados.contasFixas : []).map(troca)
  };
}

// Confere o formulário antes de salvar. Devolve a mensagem de erro ou "".
export function validarCategoria(dados, { id, nome, icone, cor }) {
  const limpo = String(nome || "").trim();
  if (!limpo) return "Informe o nome da categoria.";
  if (limpo.length > 30) return "Use um nome mais curto (até 30 letras).";
  if (mesmoNome(limpo, CATEGORIA_RECEITA.nome)) return "Esse nome é usado pelas receitas. Escolha outro.";
  const igual = listarCategorias(dados).find((c) => mesmoNome(c.nome, limpo) && String(c.id) !== String(id ?? ""));
  if (igual) return `Já existe a categoria ${igual.nome}.`;
  if (!ehTexto(icone)) return "Escolha um ícone.";
  if (!corValida(cor)) return "Escolha uma cor.";
  return "";
}

// Categoria nova (sem id) ou edição. Nas categorias do app só o ícone e a cor mudam.
// Ao renomear uma categoria própria, os registros que usam o nome antigo passam para o novo.
export function salvarCategoria(dados, { id, nome, icone, cor }, agora = Date.now()) {
  const limpo = String(nome || "").trim();
  const lista = lerCategoriasSalvas(dados);

  if (id == null || id === "") {
    if (!limpo || listarCategorias(dados).some((c) => mesmoNome(c.nome, limpo))) return dados;
    return comLista(dados, [...lista, { id: agora, nome: limpo, icone: String(icone || "🏷️"), cor: corValida(cor) ? cor : "#64748b" }]);
  }

  if (ehDoApp(id)) {
    const padrao = CATEGORIAS_DO_APP.find((c) => `app:${c.nome}` === id);
    if (!padrao) return dados;
    const novoIcone = ehTexto(icone) ? icone : padrao.icone;
    const novaCor = corValida(cor) ? cor : padrao.cor;
    const semEla = lista.filter((s) => s.id !== id);
    // voltou ao visual original: não precisa guardar nada
    if (novoIcone === padrao.icone && novaCor === padrao.cor) return comLista(dados, semEla);
    return comLista(dados, [...semEla, { id, nome: padrao.nome, icone: novoIcone, cor: novaCor }]);
  }

  const atual = lista.find((s) => String(s.id) === String(id));
  if (!atual) return dados;
  const antigo = String(atual.nome).trim();
  const novoNome = limpo || antigo;
  let resultado = comLista(
    dados,
    lista.map((s) =>
      String(s.id) === String(id)
        ? { ...s, nome: novoNome, icone: ehTexto(icone) ? icone : s.icone, cor: corValida(cor) ? cor : s.cor }
        : s
    )
  );
  if (antigo !== novoNome) resultado = renomearNosRegistros(resultado, antigo, novoNome);
  return resultado;
}

// Exclui uma categoria própria: os registros dela passam para "Outros" e o limite de orçamento sai.
export function excluirCategoria(dados, id) {
  if (ehDoApp(id)) return dados;
  const lista = lerCategoriasSalvas(dados);
  const atual = lista.find((s) => String(s.id) === String(id));
  if (!atual) return dados;
  let base = comLista(dados, lista.filter((s) => String(s.id) !== String(id)));
  // o limite de orçamento da categoria apagada não vai para "Outros"
  const orcamentos = base.usuario?.orcamentos;
  if (orcamentos && typeof orcamentos === "object") {
    const chave = Object.keys(orcamentos).find((k) => mesmoNome(k, atual.nome));
    if (chave !== undefined) {
      const { [chave]: _fora, ...resto } = orcamentos;
      base = { ...base, usuario: { ...base.usuario, orcamentos: resto } };
    }
  }
  return renomearNosRegistros(base, atual.nome, CATEGORIA_PADRAO);
}
