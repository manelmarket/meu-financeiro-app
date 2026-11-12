// Importar planilha (Excel .xlsx ou .csv): lê as abas, acha o cabeçalho, entende o que é cada coluna
// (pelo nome, ou com a IA do Assistente) e transforma cada linha em gasto, receita ou compra no cartão.
//
// Passos:
// 1. lerArquivo(file)            -> { abas: [{ nome, linhas: [[célula, ...], ...] }] }
// 2. entenderAba(aba) / mapearComIA -> { cabecalho (índice da linha), colunas: { campo: índice }, positivos }
// 3. converterLinhas(...)        -> itens prontos para conferir (cada um com tipo, data, valor, categoria...)
// 4. aplicarImportacao(...)      -> dados com os lançamentos e as compras (e as categorias novas)
//
// Nada vai para os dados antes do passo 4, e a pessoa confere a lista antes.

import { chamarIA, extrairJSON } from "./ia.js";
import { CATEGORIA_PADRAO, chaveDoNome, listarCategorias, salvarCategoria, CORES_DE_CATEGORIA } from "./categorias.js";
import { interpretarFrase } from "./interpretar.js";
import { lerBancos } from "./saldos.js";
import { MAXIMO_DE_PARCELAS, montarLancamento, pareceFatura } from "./lancar.js";
import { arredondar, dataValida, montarData, parseValor } from "./formato.js";

export const MAXIMO_DE_LINHAS = 5000;

// Campos que uma coluna pode ser
export const CAMPOS = [
  ["data", "Data"],
  ["descricao", "Descrição"],
  ["valor", "Valor"],
  ["entrada", "Valor de entrada (crédito)"],
  ["saida", "Valor de saída (débito)"],
  ["tipo", "Tipo (receita/gasto)"],
  ["categoria", "Categoria"],
  ["forma", "Forma de pagamento"],
  ["cartao", "Cartão"],
  ["parcelas", "Parcelas"],
  ["banco", "Banco / conta"]
];

// Palavras do cabeçalho que indicam cada campo (sem acento, minúsculas)
const NOMES = {
  data: ["data", "dt", "date", "dia", "data da compra", "data compra", "data lancamento", "data do lancamento", "data movimento", "data mov"],
  descricao: ["descricao", "historico", "estabelecimento", "lancamento", "item", "nome", "titulo", "memo", "detalhe", "detalhes", "descricao do lancamento", "o que", "local", "produto", "servico"],
  valor: ["valor", "montante", "quantia", "total", "preco", "amount", "valor r$", "valor (r$)", "valor rs", "vlr", "quanto"],
  entrada: ["entrada", "entradas", "credito", "creditos", "receita", "receitas", "recebido", "ganho", "ganhos", "valor entrada", "valor credito"],
  saida: ["saida", "saidas", "debito", "debitos", "despesa", "despesas", "gasto", "gastos", "pago", "valor saida", "valor debito"],
  tipo: ["tipo", "natureza", "entrada/saida", "receita/despesa", "d/c", "c/d", "operacao", "movimento", "tipo de lancamento", "tipo lancamento"],
  categoria: ["categoria", "classificacao", "grupo", "categorias", "tipo de gasto", "area"],
  forma: ["forma de pagamento", "forma pagamento", "pagamento", "meio", "forma", "metodo", "meio de pagamento", "pago com", "como pagou"],
  cartao: ["cartao", "cartao de credito", "card", "cartoes"],
  parcelas: ["parcela", "parcelas", "parcelamento", "n parcelas", "no parcelas", "qtd parcelas", "vezes"],
  banco: ["banco", "conta", "instituicao", "conta bancaria"]
};

function texto(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return dataDeCelula(v) || "";
  return String(v).trim();
}

function vazia(linha) {
  return !linha || linha.every((c) => texto(c) === "");
}

// ---------- 1. ler o arquivo ----------

function separadorDoCsv(primeira) {
  const conta = (ch) => (primeira.match(new RegExp(ch === "\t" ? "\t" : `\\${ch}`, "g")) || []).length;
  const opcoes = [";", ",", "\t", "|"].map((ch) => [ch, conta(ch)]).sort((a, b) => b[1] - a[1]);
  return opcoes[0][1] > 0 ? opcoes[0][0] : ",";
}

// CSV com aspas ("a;b" fica numa célula só)
export function lerCsv(conteudo) {
  const textoLimpo = String(conteudo || "").replace(/^﻿/, "");
  const primeira = textoLimpo.split(/\r?\n/).find((l) => l.trim()) || "";
  const sep = separadorDoCsv(primeira);
  const linhas = [];
  let linha = [];
  let celula = "";
  let aspas = false;
  for (let i = 0; i < textoLimpo.length; i += 1) {
    const ch = textoLimpo[i];
    if (aspas) {
      if (ch === '"' && textoLimpo[i + 1] === '"') {
        celula += '"';
        i += 1;
      } else if (ch === '"') aspas = false;
      else celula += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) {
      linha.push(celula);
      celula = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && textoLimpo[i + 1] === "\n") i += 1;
      linha.push(celula);
      linhas.push(linha);
      linha = [];
      celula = "";
      if (linhas.length > MAXIMO_DE_LINHAS + 50) break;
    } else celula += ch;
  }
  if (celula !== "" || linha.length) {
    linha.push(celula);
    linhas.push(linha);
  }
  return linhas.map((l) => l.map((c) => c.trim()));
}

async function textoDoArquivo(file) {
  const bytes = await file.arrayBuffer();
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  // planilhas de banco costumam vir em Windows-1252 (acentos viram �)
  if (utf8.includes("�")) {
    try {
      return new TextDecoder("windows-1252").decode(bytes);
    } catch {
      return utf8;
    }
  }
  return utf8;
}

export class ErroImportar extends Error {}

export async function lerArquivo(file) {
  const nome = String(file?.name || "").toLowerCase();
  if (/\.xls$/.test(nome)) {
    throw new ErroImportar("Arquivo .xls (Excel antigo) não é aceito. No Excel, use Salvar como → Pasta de Trabalho do Excel (.xlsx) e envie de novo.");
  }
  if (/\.(csv|txt|tsv)$/.test(nome) || file?.type === "text/csv") {
    const linhas = lerCsv(await textoDoArquivo(file));
    return { abas: [{ nome: file.name || "Planilha", linhas: linhas.filter((l, i) => i < MAXIMO_DE_LINHAS + 50) }] };
  }
  if (/\.(xlsx|xlsm)$/.test(nome) || /spreadsheetml/.test(file?.type || "")) {
    try {
      const { default: lerXlsx } = await import("read-excel-file/universal");
      const abas = await lerXlsx(file);
      return {
        abas: abas.map((a) => ({ nome: a.sheet, linhas: (a.data || []).slice(0, MAXIMO_DE_LINHAS + 50) })).filter((a) => a.linhas.some((l) => !vazia(l)))
      };
    } catch {
      throw new ErroImportar("Não consegui abrir essa planilha. Confira se o arquivo é um .xlsx e se não está protegido por senha.");
    }
  }
  throw new ErroImportar("Envie uma planilha do Excel (.xlsx) ou um arquivo .csv.");
}

// ---------- 2. entender as colunas ----------

function campoDoCabecalho(nome) {
  const chave = chaveDoNome(nome).replace(/[^a-z0-9/ ]/g, " ").replace(/\s+/g, " ").trim();
  if (!chave) return null;
  for (const [campo, nomes] of Object.entries(NOMES)) {
    if (nomes.includes(chave)) return campo;
  }
  // começa com o nome (ex.: "Valor (R$)", "Data da transação", "Descrição completa")
  for (const [campo, nomes] of Object.entries(NOMES)) {
    if (nomes.some((n) => n.length >= 4 && (chave.startsWith(`${n} `) || chave.endsWith(` ${n}`)))) return campo;
  }
  return null;
}

function colunasPeloNome(cabecalho) {
  const colunas = {};
  cabecalho.forEach((c, i) => {
    const campo = campoDoCabecalho(texto(c));
    if (campo && colunas[campo] === undefined) colunas[campo] = i;
  });
  return colunas;
}

// Olha as primeiras linhas e escolhe a que mais parece cabeçalho
export function entenderAba(aba) {
  const limite = Math.min(aba.linhas.length, 20);
  let melhor = { cabecalho: 0, colunas: {}, pontos: -1 };
  for (let i = 0; i < limite; i += 1) {
    const linha = aba.linhas[i];
    if (vazia(linha)) continue;
    const colunas = colunasPeloNome(linha);
    const pontos = Object.keys(colunas).length;
    if (pontos > melhor.pontos) melhor = { cabecalho: i, colunas, pontos };
  }
  // sem cabeçalho reconhecido: adivinha pelo conteúdo (data, texto, número)
  if (melhor.pontos < 2) {
    const amostra = aba.linhas.slice(0, 30).filter((l) => !vazia(l));
    const largura = Math.max(0, ...amostra.map((l) => l.length));
    const colunas = {};
    for (let c = 0; c < largura; c += 1) {
      const vals = amostra.map((l) => l[c]).filter((v) => texto(v));
      if (!vals.length) continue;
      const datas = vals.filter((v) => dataDeCelula(v)).length;
      const numeros = vals.filter((v) => Number.isFinite(numeroDeCelula(v)) && !dataDeCelula(v)).length;
      if (colunas.data === undefined && datas >= vals.length * 0.6) colunas.data = c;
      else if (colunas.valor === undefined && numeros >= vals.length * 0.6) colunas.valor = c;
      else if (colunas.descricao === undefined && numeros < vals.length * 0.4 && datas < vals.length * 0.4) colunas.descricao = c;
    }
    const primeiraDeDados = aba.linhas.findIndex((l) => !vazia(l) && colunas.data !== undefined && dataDeCelula(l[colunas.data]));
    if (Object.keys(colunas).length >= 2) return { cabecalho: Math.max(-1, primeiraDeDados - 1), colunas, pontos: Object.keys(colunas).length };
  }
  return melhor;
}

// A aba com mais cara de lançamentos (mais colunas reconhecidas e mais linhas)
export function melhorAba(abas) {
  let escolhida = 0;
  let pontos = -1;
  abas.forEach((aba, i) => {
    const m = entenderAba(aba);
    const temValor = m.colunas.valor !== undefined || m.colunas.entrada !== undefined || m.colunas.saida !== undefined;
    const p = m.pontos * 10 + (temValor ? 20 : 0) + Math.min(aba.linhas.length, 500) / 50;
    if (p > pontos) {
      pontos = p;
      escolhida = i;
    }
  });
  return escolhida;
}

// A IA olha as primeiras linhas de cada aba e diz qual aba usar e o que é cada coluna
export async function mapearComIA(cfg, abas) {
  const amostras = abas.slice(0, 8).map((aba, i) => {
    const linhas = aba.linhas
      .slice(0, 25)
      .map((l, n) => `${n}: ${l.slice(0, 15).map((c, k) => `[${k}] ${texto(c).slice(0, 40)}`).join(" | ")}`);
    return `Aba ${i} "${aba.nome}" (${aba.linhas.length} linhas):\n${linhas.join("\n")}`;
  });
  const pedido = [
    "Você recebe as primeiras linhas das abas de uma planilha de finanças pessoais (Brasil).",
    "Descubra qual aba tem os lançamentos (gastos, receitas, compras no cartão) e o que é cada coluna.",
    "Cada linha vem como 'número da linha: [índice da coluna] valor | ...'.",
    "Responda SOMENTE com JSON neste formato (índices começam em 0; use null quando não existir):",
    '{"aba": 0, "linha_cabecalho": 0, "colunas": {"data": 0, "descricao": 1, "valor": 2, "entrada": null, "saida": null, "tipo": null, "categoria": null, "forma": null, "cartao": null, "parcelas": null, "banco": null}, "valores_positivos": "gasto|receita|sinal"}',
    "Regras: \"valor\" é a coluna de valor única; use \"entrada\" e \"saida\" quando a planilha tem uma coluna para créditos e outra para débitos.",
    "\"tipo\" é uma coluna que diz se é receita ou despesa (ex.: Entrada/Saída, C/D, Receita/Despesa).",
    "valores_positivos: \"sinal\" se os valores negativos são gastos e os positivos receitas; \"gasto\" se todos os valores são gastos (planilha de despesas); \"receita\" se todos são receitas.",
    "linha_cabecalho é o número da linha dos títulos das colunas (-1 se não houver).",
    "",
    amostras.join("\n\n")
  ].join("\n");
  const json = extrairJSON(await chamarIA(cfg, { texto: pedido }));
  const aba = Number.isInteger(json.aba) && json.aba >= 0 && json.aba < abas.length ? json.aba : 0;
  const colunas = {};
  for (const [campo] of CAMPOS) {
    const v = json.colunas?.[campo];
    if (Number.isInteger(v) && v >= 0 && v < 200) colunas[campo] = v;
  }
  const cab = Number.isInteger(json.linha_cabecalho) ? Math.max(-1, Math.min(json.linha_cabecalho, 40)) : 0;
  const positivos = ["gasto", "receita", "sinal"].includes(json.valores_positivos) ? json.valores_positivos : null;
  return { aba, cabecalho: cab, colunas, positivos };
}

// A IA sugere a categoria de cada descrição sem categoria
export async function categorizarComIA(cfg, descricoes, categorias) {
  const unicas = [...new Set(descricoes.map((d) => String(d || "").trim()).filter(Boolean))].slice(0, 200);
  if (!unicas.length) return {};
  const pedido = [
    "Classifique cada descrição de gasto de um app de finanças pessoais (Brasil) em UMA destas categorias:",
    categorias.join(", "),
    'Responda SOMENTE com JSON: {"categorias": {"descrição exatamente como veio": "Categoria"}}',
    "Use \"Outros\" quando não souber.",
    "",
    JSON.stringify(unicas)
  ].join("\n");
  const json = extrairJSON(await chamarIA(cfg, { texto: pedido }));
  const r = {};
  for (const [d, c] of Object.entries(json.categorias || {})) {
    if (typeof c === "string" && categorias.includes(c)) r[d] = c;
  }
  return r;
}

// ---------- 3. converter as linhas ----------

function dois(n) {
  return String(n).padStart(2, "0");
}

// Data de uma célula: Date do Excel, número de série do Excel, "05/11/2026", "05/11/26", "2026-11-05", "05/11"
export function dataDeCelula(v, anoPadrao = new Date().getFullYear()) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return `${v.getUTCFullYear()}-${dois(v.getUTCMonth() + 1)}-${dois(v.getUTCDate())}`;
  }
  if (typeof v === "number" && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())}`;
  }
  const t = String(v ?? "").trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const iso = montarData(Number(m[1]), Number(m[2]), Number(m[3]));
    return dataValida(iso) ? iso : null;
  }
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?(?:\s|$)/);
  if (m) {
    let ano = m[3] ? Number(m[3]) : anoPadrao;
    if (ano < 100) ano += 2000;
    let dia = Number(m[1]);
    let mes = Number(m[2]);
    // planilha em formato americano (mês/dia): "11/25/2026"
    if (mes > 12 && dia <= 12) [dia, mes] = [mes, dia];
    const iso = montarData(ano, mes, dia);
    return dataValida(iso) && mes <= 12 && dia <= 31 ? iso : null;
  }
  return null;
}

// Número de uma célula: 123.45, "R$ 1.234,56", "-50,00", "(50,00)", "50,00 D", "50,00 C"
export function numeroDeCelula(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  let t = String(v ?? "").trim();
  if (!t) return NaN;
  let sinal = 1;
  if (/^\(.*\)$/.test(t)) {
    sinal = -1;
    t = t.slice(1, -1);
  }
  const sufixo = t.match(/\s*([DC])$/i);
  if (sufixo) {
    if (sufixo[1].toUpperCase() === "D") sinal = -1;
    t = t.slice(0, -sufixo[0].length);
  }
  t = t.replace(/R\$/gi, "").replace(/\s/g, "");
  if (t.startsWith("+")) t = t.slice(1);
  if (t.startsWith("-")) {
    sinal *= -1;
    t = t.slice(1);
  }
  if (t.endsWith("-")) {
    sinal *= -1;
    t = t.slice(0, -1);
  }
  if (!/^[\d.,]+$/.test(t)) return NaN;
  const n = parseValor(t);
  return Number.isFinite(n) ? n * sinal : NaN;
}

function tipoDoTexto(v) {
  const t = chaveDoNome(texto(v));
  if (!t) return null;
  if (/^(c|cr|credito|creditos|entrada|entradas|receita|receitas|recebimento|recebido|ganho|deposito|salario|rendimento|\+)$/.test(t) || /^(receita|entrada|credito|recebi)/.test(t)) return "entrada";
  if (/^(d|db|debito|debitos|saida|saidas|despesa|despesas|gasto|gastos|pagamento|compra|-)$/.test(t) || /^(despesa|saida|debito|gasto|pagamento|compra)/.test(t)) return "saida";
  return null;
}

const FORMAS = [
  ["Pix", ["pix"]],
  ["Dinheiro", ["dinheiro", "especie", "em especie", "cash"]],
  ["Débito", ["debito", "cartao de debito", "debit"]],
  ["Cartão", ["credito", "cartao", "cartao de credito", "credit", "cc"]],
  ["Transferência", ["transferencia", "ted", "doc", "boleto", "transf"]]
];

function formaDoTexto(v) {
  const t = chaveDoNome(texto(v));
  if (!t) return null;
  for (const [forma, chaves] of FORMAS) if (chaves.some((c) => t === c || t.startsWith(`${c} `) || t.includes(c))) return forma;
  return null;
}

function parcelasDoTexto(v) {
  const t = texto(v).toLowerCase();
  const fracao = t.match(/(\d+)\s*(?:\/|de)\s*(\d+)/);
  if (fracao) return { atual: Number(fracao[1]), total: Number(fracao[2]) };
  const n = parseInt(t.replace(/x/g, ""), 10);
  return Number.isFinite(n) && n >= 1 ? { atual: null, total: n } : null;
}

function acharPeloNome(lista, nome) {
  const chave = chaveDoNome(nome);
  if (!chave) return null;
  return (
    lista.find((x) => chaveDoNome(x.nome) === chave) ||
    lista.find((x) => chaveDoNome(x.nome).includes(chave) || chave.includes(chaveDoNome(x.nome))) ||
    null
  );
}

// a descrição tem o nome de uma conta fixa como palavra inteira ("Conta de luz" e a conta "Luz"; não "Luzia")
function ehContaFixa(dados, descricao) {
  const d = ` ${chaveDoNome(descricao).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ")} `;
  return (dados.contasFixas || []).some((c) => {
    const n = chaveDoNome(c?.nome).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    return n.length >= 3 && d.includes(` ${n} `);
  });
}

// a categoria que o próprio app acharia pela descrição ("Uber" -> Transporte)
function categoriaPelaDescricao(descricao, dados, hoje) {
  try {
    const r = interpretarFrase(`${descricao} 1`, dados, hoje);
    return r?.categoria && r.categoria !== CATEGORIA_PADRAO ? r.categoria : null;
  } catch {
    return null;
  }
}

// Linhas -> itens para conferir. opcoes = { hoje, positivos: "auto" | "gasto" | "receita" | "sinal", sugestoes: { descricao: categoria } }
export function converterLinhas(aba, mapa, dados, opcoes = {}) {
  const hoje = opcoes.hoje;
  const col = mapa.colunas || {};
  const categorias = listarCategorias(dados);
  const cartoes = Array.isArray(dados.cartoes) ? dados.cartoes : [];
  const bancos = lerBancos(dados);
  const linhas = aba.linhas.slice(Math.max(0, (mapa.cabecalho ?? -1) + 1)).slice(0, MAXIMO_DE_LINHAS);
  const pega = (linha, campo) => (col[campo] === undefined ? undefined : linha[col[campo]]);

  // valores positivos: pelo sinal quando a coluna tem positivos e negativos; senão, gastos
  let positivos = opcoes.positivos && opcoes.positivos !== "auto" ? opcoes.positivos : mapa.positivos || null;
  if (!positivos) {
    const nums = linhas.map((l) => numeroDeCelula(pega(l, "valor"))).filter(Number.isFinite);
    positivos = nums.some((n) => n < 0) && nums.some((n) => n > 0) ? "sinal" : "gasto";
  }

  // para achar duplicados: o que já existe (data + valor + descrição)
  const chaveDup = (data, valor, descricao) => `${data}|${arredondar(valor).toFixed(2)}|${chaveDoNome(descricao)}`;
  const existentes = new Set([
    ...(dados.lancamentos || []).filter(Boolean).map((l) => chaveDup(l.data, Number(l.valor) || 0, l.descricao)),
    ...cartoes.flatMap((c) => (c.compras || []).map((x) => chaveDup(x.data, Number(x.valorTotal) || 0, x.descricao)))
  ]);

  const itens = [];
  linhas.forEach((linha, n) => {
    if (vazia(linha)) return;
    const numero = (mapa.cabecalho ?? -1) + 2 + n; // número da linha como aparece no Excel
    const descricaoBruta = texto(pega(linha, "descricao"));
    const descricao = descricaoBruta.slice(0, 80) || "";
    const data = dataDeCelula(pega(linha, "data"), Number(String(hoje || "").slice(0, 4)) || undefined);

    // valor e tipo
    let tipo = null;
    let valor = NaN;
    const ent = numeroDeCelula(pega(linha, "entrada"));
    const sai = numeroDeCelula(pega(linha, "saida"));
    if (Number.isFinite(ent) && Math.abs(ent) > 0) {
      tipo = "entrada";
      valor = Math.abs(ent);
    } else if (Number.isFinite(sai) && Math.abs(sai) > 0) {
      tipo = "saida";
      valor = Math.abs(sai);
    } else {
      const v = numeroDeCelula(pega(linha, "valor"));
      if (Number.isFinite(v)) {
        valor = Math.abs(v);
        const peloTipo = tipoDoTexto(pega(linha, "tipo"));
        if (peloTipo) tipo = peloTipo;
        else if (positivos === "sinal" || positivos === "receita") tipo = v < 0 ? "saida" : "entrada";
        else tipo = "saida"; // planilha de gastos: o sinal não importa
      }
    }
    valor = arredondar(valor);

    // linhas de total/saldo não são lançamentos
    const ehTotal = /^(total|saldo|subtotal|soma)\b/i.test(chaveDoNome(descricao));

    // categoria
    let categoria = null;
    let categoriaNova = null;
    const catTexto = texto(pega(linha, "categoria"));
    if (tipo === "entrada") categoria = "Receita";
    else if (catTexto) {
      // igual a uma do app; senão, uma parecida ("Mercado" -> Alimentação, "Streaming" -> Lazer); senão, nova
      const achada = acharPeloNome(categorias, catTexto);
      const parecida = achada ? null : categoriaPelaDescricao(catTexto, dados, hoje);
      if (achada) categoria = achada.nome;
      else if (parecida) categoria = parecida;
      else {
        categoriaNova = catTexto.slice(0, 30);
        categoria = categoriaNova;
      }
    } else {
      categoria = opcoes.sugestoes?.[descricaoBruta.trim()] || categoriaPelaDescricao(descricao, dados, hoje) || CATEGORIA_PADRAO;
    }

    // forma, cartão, parcelas, banco
    let forma = formaDoTexto(pega(linha, "forma")) || "Pix";
    const cartaoTexto = texto(pega(linha, "cartao"));
    let cartao = cartaoTexto ? acharPeloNome(cartoes, cartaoTexto) : null;
    if (cartaoTexto && !/^(nao|n|-|0)$/.test(chaveDoNome(cartaoTexto))) forma = "Cartão";
    if (forma === "Cartão" && !cartao && !cartaoTexto && cartoes.length === 1) cartao = cartoes[0];
    if (tipo === "entrada" && forma === "Cartão") forma = "Pix";
    const parc = parcelasDoTexto(pega(linha, "parcelas"));
    let parcelas = 1;
    let descricaoFinal = descricao || (tipo === "entrada" ? "Receita importada" : "Gasto importado");
    let valorTotal = valor;
    if (parc && cartao && tipo === "saida") {
      if (parc.atual && parc.total > 1) descricaoFinal = `${descricaoFinal} (parcela ${parc.atual}/${parc.total})`.slice(0, 80);
      else parcelas = Math.min(MAXIMO_DE_PARCELAS, Math.max(1, parc.total));
    }
    const banco = texto(pega(linha, "banco")) ? acharPeloNome(bancos, texto(pega(linha, "banco"))) : null;

    let erro = null;
    if (ehTotal) erro = "linha de total";
    else if (!(valor > 0)) erro = "sem valor";
    else if (!data) erro = "data não reconhecida";
    else if (!tipo) erro = "não sei se é gasto ou receita";

    const duplicado = !erro && existentes.has(chaveDup(data, valorTotal, descricaoFinal));
    // pagamento de fatura ou de conta fixa: já conta pelo cartão / pela conta fixa (vem desmarcado)
    let aviso = null;
    if (!erro && tipo === "saida" && !cartao) {
      if (pareceFatura(descricao)) aviso = "parece pagamento de fatura (as compras já estão no cartão)";
      else if (ehContaFixa(dados, descricao)) aviso = "já é conta fixa (marque como paga em Contas fixas)";
    }
    itens.push({
      linha: numero,
      tipo,
      data,
      descricao: descricaoFinal,
      valor: valorTotal,
      categoria,
      categoriaNova,
      forma,
      cartaoId: tipo === "saida" && forma === "Cartão" && cartao ? cartao.id : null,
      cartaoNome: tipo === "saida" && forma === "Cartão" && cartao ? cartao.nome : null,
      parcelas,
      bancoId: banco ? banco.id : null,
      erro,
      duplicado,
      aviso,
      marcado: !erro && !duplicado && !aviso
    });
  });
  return { itens, positivos };
}

// ---------- 4. gravar ----------

// opcoes = { agora, criarCategorias (true: cria as categorias que não existem; false: vão para Outros),
//            usarBancos (true: o valor sai/entra no banco da planilha — muda o saldo de agora) }
export function aplicarImportacao(dados, itens, opcoes = {}) {
  const agora = opcoes.agora ?? Date.now();
  let base = dados;
  const escolhidos = itens.filter((i) => i.marcado && !i.erro);

  // categorias novas
  const novas = [...new Set(escolhidos.filter((i) => i.tipo === "saida" && i.categoriaNova).map((i) => i.categoriaNova))];
  if (opcoes.criarCategorias !== false) {
    novas.forEach((nome, k) => {
      base = salvarCategoria(base, { nome, icone: "🏷️", cor: CORES_DE_CATEGORIA[k % CORES_DE_CATEGORIA.length] }, agora - 1000 - k);
    });
  }
  const existe = new Set(listarCategorias(base).map((c) => c.nome));

  const lancamentos = [];
  const compras = new Map();
  let gastos = 0;
  let receitas = 0;
  let noCartao = 0;
  let total = { gastos: 0, receitas: 0 };
  const erros = [];
  escolhidos.forEach((item, k) => {
    const categoria = item.tipo === "entrada" ? "Receita" : existe.has(item.categoria) ? item.categoria : CATEGORIA_PADRAO;
    const parte = {
      forma: item.forma,
      valor: item.valor,
      bancoId: opcoes.usarBancos && item.bancoId != null && item.forma !== "Cartão" ? item.bancoId : null,
      cartaoId: item.cartaoId,
      parcelas: item.parcelas
    };
    const form = { tipo: item.tipo, descricao: item.descricao, categoria, data: item.data, valor: item.valor, partes: [parte] };
    // "Cartão" sem cartão cadastrado: fica como lançamento comum com a forma Cartão
    const cartoes = item.cartaoId != null ? base.cartoes || [] : [];
    const r = montarLancamento(form, cartoes, agora + k * 10);
    if (r.erro) {
      erros.push({ linha: item.linha, erro: r.erro });
      return;
    }
    if (r.lancamento) {
      // sem banco, não precisa do "criadoEm" (que só serve para o saldo dos bancos)
      lancamentos.push(r.lancamento);
      if (item.tipo === "entrada") {
        receitas += 1;
        total.receitas += item.valor;
      } else {
        gastos += 1;
        total.gastos += item.valor;
      }
    }
    for (const c of r.compras || []) {
      if (!compras.has(String(c.cartaoId))) compras.set(String(c.cartaoId), []);
      compras.get(String(c.cartaoId)).push(c.compra);
      noCartao += 1;
      total.gastos += c.compra.valorTotal;
    }
  });

  const resultado = {
    ...base,
    lancamentos: [...(base.lancamentos || []), ...lancamentos],
    cartoes: (base.cartoes || []).map((c) => {
      const novasCompras = compras.get(String(c.id));
      return novasCompras ? { ...c, compras: [...(c.compras || []), ...novasCompras] } : c;
    })
  };
  total = { gastos: arredondar(total.gastos), receitas: arredondar(total.receitas) };
  return {
    dados: resultado,
    contagem: { gastos, receitas, noCartao, categoriasNovas: opcoes.criarCategorias !== false ? novas.length : 0, total },
    erros
  };
}
