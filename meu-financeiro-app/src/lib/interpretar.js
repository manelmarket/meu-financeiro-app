// Entende uma frase falada ou escrita e devolve o que preencher no Novo lançamento.
//
// Exemplos que o app entende sem IA:
//   "gastei 50 no mercado no pix do nubank"
//   "gastei 100 no mercado, 50 no pix do nubank e o resto em dinheiro"
//   "paguei 300 de luz no cartão itaú em 3x"
//   "recebi 4200 de salário na caixa"
//   "transferi 200 do nubank para a caixa"   "saquei 100 do nubank"   "depositei 50 na caixa"
//
// Resultado:
//   { entendido, tipo: "saida" | "entrada" | "transferencia", valor, descricao, categoria, data,
//     partes: [{ forma, valor | null (= o resto), bancoId | null, cartaoId | null, parcelas }],
//     subtipo, de, para, avisos: [] }
// bancoId/cartaoId null = "não falou": a tela usa o padrão dela.

import { bancoDoCartao } from "./bancos.js";
import { CATEGORIA_PADRAO, chaveDoNome, listarCategorias } from "./categorias.js";
import { dataValida, diasNoMes, hojeISO, lerData, montarData, somarDias } from "./formato.js";
import { lerBancos } from "./saldos.js";
import { CRIAR_CARTEIRA, acharCarteira } from "./transferencias.js";

// ---------- palavras ----------

const VERBOS_GASTO = ["gastei", "gasto", "paguei", "pago", "comprei", "compra", "comprando", "despesa", "torrei", "custou", "gastamos", "pagamos", "compramos"];
const VERBOS_RECEITA = ["recebi", "recebemos", "ganhei", "entrou", "caiu", "pagaram", "vendi", "recebido", "recebimento", "rendeu", "depositaram"];
// palavras que indicam receita sem ser verbo (ficam na descrição): "salário 4200 na caixa"
const PALAVRAS_DE_RECEITA = ["salario", "receita", "lucro", "freela", "freelance", "venda", "rendimento", "bonus", "comissao", "decimo", "ferias", "pagamento do cliente", "cashback", "reembolso", "restituicao"];
const VERBOS_TRANSFERIR = ["transferi", "transfiro", "transferir", "transferindo", "transferimos", "mandei", "passei", "movi", "enviei", "joguei"];
const VERBOS_SAQUE = ["saquei", "saque", "sacar", "sacando", "tirei", "retirei"];
const VERBOS_DEPOSITO = ["depositei", "deposito", "depositar", "depositando", "guardei", "coloquei"];

const FORMAS = [
  { chaves: ["cartao de credito", "no credito", "credito", "cartao", "parcelado", "parcelei"], forma: "Cartão" },
  { chaves: ["cartao de debito", "no debito", "debito"], forma: "Débito" },
  { chaves: ["pix"], forma: "Pix" },
  { chaves: ["em especie", "especie", "dinheiro vivo", "dinheiro", "em maos", "cash", "grana"], forma: "Dinheiro" },
  { chaves: ["transferencia", "ted", "doc", "boleto", "tef"], forma: "Transferência" }
];

const PALAVRAS_DE_LIGACAO = new Set([
  "no", "na", "nos", "nas", "em", "de", "do", "da", "dos", "das", "com", "para", "pra", "pro", "por", "pelo", "pela",
  "o", "a", "os", "as", "um", "uma", "uns", "umas", "ao", "aos", "e", "que", "meu", "minha", "meus", "minhas", "esse", "essa",
  "este", "esta", "isso", "isto", "la", "aqui", "ai", "hoje", "ontem", "anteontem", "agora", "reais", "real", "conto", "contos",
  "pila", "pilas", "r$", "valor", "total", "foi", "foram", "ja", "so", "tambem", "ne", "tipo", "assim", "mais", "menos",
  "num", "numa", "nuns", "numas", "dum", "duma", "neste", "nesta", "nesse", "nessa", "naquele", "naquela", "aquele", "aquela"
]);

const SEPARADORES = new Set([",", ";", "e", "mais", "+"]);

// palavras-chave → categoria (só vale se a categoria existir na lista da pessoa)
const PALAVRAS_DA_CATEGORIA = {
  Alimentação: ["mercado", "supermercado", "padaria", "lanche", "lanches", "almoco", "jantar", "cafe", "restaurante", "ifood", "pizza", "hamburguer", "comida", "feira", "acougue", "sorvete", "delivery", "marmita", "sacolao", "hortifruti", "bebida", "bebidas", "cerveja", "pao", "leite", "carne", "compras do mes", "rancho", "atacadao", "atacado", "assai", "carrefour", "mcdonalds", "burger"],
  Transporte: ["uber", "99", "taxi", "gasolina", "combustivel", "etanol", "alcool", "diesel", "onibus", "metro", "trem", "estacionamento", "pedagio", "passagem", "passagens", "carro", "moto", "oficina", "mecanico", "ipva", "lavagem", "pneu", "bilhete", "recarga do bilhete", "seguro do carro"],
  Casa: ["luz", "energia", "agua", "internet", "aluguel", "condominio", "gas", "iptu", "limpeza", "faxina", "moveis", "reforma", "wifi", "conta de luz", "conta de agua", "telefone", "celular", "manutencao", "pedreiro", "eletricista", "encanador", "diarista", "mercado da casa"],
  Saúde: ["farmacia", "remedio", "remedios", "medico", "medica", "consulta", "dentista", "academia", "exame", "exames", "plano de saude", "hospital", "psicologo", "psicologa", "terapia", "vitamina", "suplemento", "oculos", "otica", "fisioterapia"],
  Lazer: ["cinema", "netflix", "spotify", "show", "bar", "balada", "jogo", "jogos", "viagem", "hotel", "streaming", "festa", "ingresso", "ingressos", "passeio", "parque", "praia", "clube", "disney", "prime video", "hbo", "youtube premium", "playstation", "xbox", "steam"],
  Filhos: ["escola", "creche", "fralda", "fraldas", "brinquedo", "brinquedos", "filho", "filha", "crianca", "criancas", "material escolar", "mensalidade da escola", "pediatra", "uniforme", "bebe"],
  Trabalho: ["escritorio", "notebook", "ferramenta", "ferramentas", "curso", "software", "impressora", "material de trabalho", "coworking", "cliente", "fornecedor", "mei", "das", "contador"],
  Pet: ["pet", "racao", "veterinario", "veterinaria", "petshop", "pet shop", "cachorro", "gato", "banho e tosa", "vacina do cachorro"],
  Educação: ["faculdade", "curso", "livro", "livros", "escola", "apostila", "mensalidade", "udemy", "alura", "ingles"],
  Roupas: ["roupa", "roupas", "camisa", "camiseta", "calca", "tenis", "sapato", "vestido", "shein", "renner", "riachuelo", "loja de roupa"],
  Beleza: ["cabelo", "salao", "barbearia", "barbeiro", "manicure", "unha", "maquiagem", "perfume", "cosmetico", "cosmeticos", "skincare"],
  Assinaturas: ["assinatura", "assinaturas", "netflix", "spotify", "streaming", "icloud", "google one", "chatgpt", "amazon prime"],
  Investimentos: ["investimento", "investi", "cdb", "tesouro", "acoes", "cripto", "bitcoin", "poupanca", "aporte"],
  Presentes: ["presente", "presentes", "aniversario", "natal", "lembrancinha"],
  Viagem: ["viagem", "hotel", "passagem aerea", "airbnb", "hospedagem", "aeroporto"],
  Dívidas: ["divida", "dividas", "emprestimo", "parcela do emprestimo", "juros", "financiamento", "consignado"],
  Mercado: ["mercado", "supermercado", "feira", "sacolao", "atacadao"]
};

// ---------- números por extenso ----------

const UNIDADES = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19 };
const DEZENAS = { vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90 };
const CENTENAS = { cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300, quatrocentos: 400, quatrocentas: 400, quinhentos: 500, quinhentas: 500, seiscentos: 600, seiscentas: 600, setecentos: 700, setecentas: 700, oitocentos: 800, oitocentas: 800, novecentos: 900, novecentas: 900 };

function ehPalavraDeNumero(n) {
  return n in UNIDADES || n in DEZENAS || n in CENTENAS || n === "mil";
}

// junta "dois mil e quinhentos" num token só ("2500"). "um"/"uma" sozinhos são artigo, não número.
function juntarNumerosPorExtenso(tokens) {
  const saida = [];
  let i = 0;
  while (i < tokens.length) {
    if (!ehPalavraDeNumero(tokens[i].n) || (["um", "uma"].includes(tokens[i].n) && tokens[i + 1]?.n !== "mil")) {
      saida.push(tokens[i]);
      i += 1;
      continue;
    }
    let j = i;
    let total = 0;
    let grupo = 0;
    let usou = false;
    while (j < tokens.length) {
      const n = tokens[j].n;
      if (n === "e" && j + 1 < tokens.length && ehPalavraDeNumero(tokens[j + 1].n) && tokens[j + 1].n !== "mil" && usou) {
        j += 1;
        continue;
      }
      if (n === "mil") {
        total += (grupo || 1) * 1000;
        grupo = 0;
        usou = true;
      } else if (n in CENTENAS) {
        grupo += CENTENAS[n];
        usou = true;
      } else if (n in DEZENAS) {
        grupo += DEZENAS[n];
        usou = true;
      } else if (n in UNIDADES) {
        grupo += UNIDADES[n];
        usou = true;
      } else break;
      j += 1;
    }
    const valor = total + grupo;
    // "cinquenta reais e noventa centavos"
    let centavos = 0;
    let k = j;
    if (["reais", "real"].includes(tokens[k]?.n) && tokens[k + 1]?.n === "e") {
      let m = k + 2;
      let c = 0;
      let achou = false;
      while (m < tokens.length && (ehPalavraDeNumero(tokens[m].n) || tokens[m].n === "e")) {
        const n = tokens[m].n;
        if (n in DEZENAS) c += DEZENAS[n];
        else if (n in UNIDADES) c += UNIDADES[n];
        m += 1;
        achou = true;
      }
      if (achou && tokens[m]?.n === "centavos") {
        centavos = c;
        k = m + 1;
        j = k;
      }
    }
    const texto = centavos ? `${valor},${String(centavos).padStart(2, "0")}` : String(valor);
    saida.push({ o: texto, n: texto, extenso: true });
    i = j;
  }
  return saida;
}

// ---------- tokens ----------

function normalizar(t) {
  return String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function tokenizar(texto) {
  const brutos = String(texto || "")
    .replace(/r\$\s*/gi, " r$ ")
    .replace(/([^\d\s])([,;!?.])(?=\s|$)/g, "$1 $2 ")
    .replace(/(\d)([,;!?.])(?=\s|$)/g, "$1 $2 ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const tokens = brutos.map((o) => ({ o, n: normalizar(o).replace(/^["'(]+|["')]+$/g, "") })).filter((t) => t.n !== "" && t.n !== "r$");
  return juntarNumerosPorExtenso(tokens);
}

const REGEX_VALOR = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;

function valorDoToken(t) {
  const m = t.n.match(REGEX_VALOR);
  if (!m) return null;
  const inteiro = Number(m[1].replace(/\./g, ""));
  const centavos = m[2] ? Number(m[2].padEnd(2, "0")) : 0;
  return Math.round(inteiro * 100 + centavos) / 100;
}

// ---------- bancos, cartões e categorias na frase ----------

function chavesDoNome(nome, comTermosDoBanco) {
  const chaves = new Set();
  const base = chaveDoNome(nome);
  if (base) chaves.add(base);
  if (comTermosDoBanco) {
    const tema = bancoDoCartao(nome);
    if (tema) for (const termo of tema.termos) chaves.add(chaveDoNome(termo));
  }
  // "banco inter" → também "inter"
  if (base.startsWith("banco ")) chaves.add(base.slice(6));
  // palavras de forma de pagamento não valem como nome de banco (ex.: "dinheiro" do tema da Carteira)
  const deForma = new Set(FORMAS.flatMap((f) => f.chaves));
  return [...chaves].filter((c) => c.length >= 2 && !["nu"].includes(c) && !deForma.has(c));
}

// procura cada nome (pode ter várias palavras) nos tokens; devolve [{ inicio, fim, item }]
function acharMencoes(tokens, itens) {
  const achados = [];
  const ocupados = new Set();
  // nomes maiores primeiro (ex.: "nubank ultravioleta" antes de "nubank")
  const candidatos = itens
    .flatMap((item) => item.chaves.map((chave) => ({ item, palavras: chave.split(" ") })))
    .sort((a, b) => b.palavras.length - a.palavras.length);
  for (const { item, palavras } of candidatos) {
    for (let i = 0; i + palavras.length <= tokens.length; i += 1) {
      let bate = true;
      for (let k = 0; k < palavras.length; k += 1) {
        if (tokens[i + k].n !== palavras[k] || ocupados.has(i + k)) {
          bate = false;
          break;
        }
      }
      if (!bate) continue;
      for (let k = 0; k < palavras.length; k += 1) ocupados.add(i + k);
      achados.push({ inicio: i, fim: i + palavras.length, item });
    }
  }
  return achados.sort((a, b) => a.inicio - b.inicio);
}

function acharFormas(tokens) {
  const itens = FORMAS.map((f) => ({ chaves: f.chaves, forma: f.forma }));
  return acharMencoes(tokens, itens).map((m) => ({ ...m, forma: m.item.forma }));
}

// ---------- datas e parcelas ----------

function acharData(tokens, hoje) {
  const { y, m, d } = lerData(hoje);
  for (let i = 0; i < tokens.length; i += 1) {
    const n = tokens[i].n;
    if (n === "hoje") return { data: hoje, usados: [i] };
    if (n === "ontem") return { data: somarDias(hoje, -1), usados: [i] };
    if (n === "anteontem") return { data: somarDias(hoje, -2), usados: [i] };
    if (n === "semana" && tokens[i + 1]?.n === "passada") return { data: somarDias(hoje, -7), usados: [i, i + 1] };
    const barra = n.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (barra) {
      let ano = barra[3] ? Number(barra[3]) : y;
      if (ano < 100) ano += 2000;
      const iso = montarData(ano, Number(barra[2]), Number(barra[1]));
      if (dataValida(iso)) return { data: iso, usados: [i] };
    }
    if (n === "dia" && /^\d{1,2}$/.test(tokens[i + 1]?.n || "")) {
      const dia = Math.min(Number(tokens[i + 1].n), diasNoMes(y, m));
      if (dia >= 1) {
        // "dia 30" no dia 5 do mês: foi no mês passado
        let ano = y;
        let mes = m;
        if (dia > d) {
          mes -= 1;
          if (mes < 1) {
            mes = 12;
            ano -= 1;
          }
        }
        return { data: montarData(ano, mes, Math.min(dia, diasNoMes(ano, mes))), usados: [i, i + 1] };
      }
    }
  }
  return { data: hoje, usados: [] };
}

function acharParcelas(tokens) {
  for (let i = 0; i < tokens.length; i += 1) {
    const n = tokens[i].n;
    const junto = n.match(/^(\d{1,2})x$/);
    if (junto) return { parcelas: Number(junto[1]), usados: [i] };
    if (/^\d{1,2}$/.test(n) && ["x", "vezes", "parcelas", "parcela"].includes(tokens[i + 1]?.n || "")) {
      return { parcelas: Number(n), usados: [i, i + 1] };
    }
  }
  return { parcelas: 1, usados: [] };
}

// ---------- categoria ----------

function categoriaDaFrase(tokens, categorias) {
  const texto = ` ${tokens.map((t) => t.n).join(" ")} `;
  const existe = (nome) => categorias.find((c) => chaveDoNome(c.nome) === chaveDoNome(nome)) || null;
  // nome da categoria dito na frase (ex.: "na categoria lazer", "de lazer")
  for (const c of categorias) {
    const chave = chaveDoNome(c.nome);
    if (chave && texto.includes(` ${chave} `)) return { categoria: c.nome, pelaPalavra: chave };
  }
  // palavra-chave (ex.: "mercado" → Alimentação)
  let melhor = null;
  for (const [nome, palavras] of Object.entries(PALAVRAS_DA_CATEGORIA)) {
    const c = existe(nome);
    if (!c) continue;
    for (const p of palavras) {
      const pos = texto.indexOf(` ${p} `);
      if (pos >= 0 && (!melhor || pos < melhor.pos || (pos === melhor.pos && p.length > melhor.palavra.length))) {
        melhor = { categoria: c.nome, pos, palavra: p };
      }
    }
  }
  return melhor ? { categoria: melhor.categoria, pelaPalavra: null } : { categoria: null, pelaPalavra: null };
}

// ---------- a interpretação ----------

export function interpretarFrase(texto, dados, hoje = hojeISO()) {
  const avisos = [];
  const tokens = tokenizar(texto);
  const categorias = listarCategorias(dados);
  const bancos = lerBancos(dados);
  const cartoes = Array.isArray(dados?.cartoes) ? dados.cartoes : [];
  const carteira = acharCarteira(dados);

  const vazio = {
    entendido: false,
    tipo: "saida",
    valor: null,
    descricao: "",
    categoria: null,
    data: hoje,
    partes: [],
    subtipo: null,
    de: null,
    para: null,
    parcelas: 1,
    avisos
  };
  if (!tokens.length) return vazio;

  const usados = new Set();
  const marcar = (idx) => idx.forEach((i) => usados.add(i));

  // data e parcelas primeiro (para os números delas não virarem valor)
  const dataAchada = acharData(tokens, hoje);
  marcar(dataAchada.usados);
  const parcelasAchadas = acharParcelas(tokens);
  marcar(parcelasAchadas.usados);

  // bancos e cartões citados
  const itensBancos = bancos.map((b) => ({ chaves: chavesDoNome(b.nome, true), banco: b }));
  const itensCartoes = cartoes.map((c) => ({ chaves: chavesDoNome(c.nome, true), cartao: c }));
  if (!carteira) itensBancos.push({ chaves: ["carteira"], carteira: true });
  const mencoesBancos = acharMencoes(tokens, itensBancos);
  const mencoesCartoes = acharMencoes(tokens, itensCartoes);
  const formas = acharFormas(tokens);
  const palavraDeCartao = formas.some((f) => f.forma === "Cartão") || parcelasAchadas.parcelas > 1;

  // valores em dinheiro (fora os já usados por data/parcelas)
  const valores = [];
  tokens.forEach((t, i) => {
    if (usados.has(i)) return;
    const v = valorDoToken(t);
    if (v === null) return;
    const moeda = ["reais", "real", "conto", "contos", "pila", "pilas"].includes(tokens[i + 1]?.n || "");
    valores.push({ i, valor: v, extenso: Boolean(t.extenso), moeda });
  });
  // com números digitados, os por extenso sem "reais" ficam de fora (ex.: "duas passagens")
  const temDigitado = valores.some((v) => !v.extenso);
  const valoresBons = valores.filter((v) => !temDigitado || !v.extenso || v.moeda);
  valoresBons.forEach((v) => {
    usados.add(v.i);
    if (v.moeda) usados.add(v.i + 1);
  });

  // tipo: o primeiro verbo da frase manda; sem verbo, palavras como "salário" indicam receita
  // e "transferência" entre dois bancos indica transferência
  const palavras = tokens.map((t) => t.n);
  const tem = (lista) => palavras.some((p) => lista.includes(p));
  const TODOS_OS_VERBOS = [...VERBOS_GASTO, ...VERBOS_RECEITA, ...VERBOS_TRANSFERIR, ...VERBOS_SAQUE, ...VERBOS_DEPOSITO];
  let tipo = "saida";
  let subtipo = null;
  const primeiroVerbo = tokens.findIndex((t) => TODOS_OS_VERBOS.includes(t.n));
  if (primeiroVerbo >= 0) {
    const v = tokens[primeiroVerbo].n;
    if (VERBOS_GASTO.includes(v)) tipo = "saida";
    else if (VERBOS_RECEITA.includes(v)) tipo = "entrada";
    else if (VERBOS_SAQUE.includes(v)) {
      tipo = "transferencia";
      subtipo = "saque";
    } else if (VERBOS_DEPOSITO.includes(v)) {
      tipo = "transferencia";
      subtipo = "deposito";
    } else {
      tipo = "transferencia";
      subtipo = "transferencia";
    }
  } else if (tem(PALAVRAS_DE_RECEITA)) {
    tipo = "entrada";
  } else if (palavras.includes("transferencia") && mencoesBancos.length >= 2) {
    tipo = "transferencia";
    subtipo = "transferencia";
  }
  tokens.forEach((t, i) => {
    if (TODOS_OS_VERBOS.includes(t.n)) usados.add(i);
  });

  // valor total = primeiro valor da frase
  const total = valoresBons.length ? valoresBons[0].valor : null;

  // trechos: separados por vírgula, "e", "mais"
  const trechos = [];
  let atual = [];
  tokens.forEach((t, i) => {
    if (SEPARADORES.has(t.n)) {
      if (atual.length) trechos.push(atual);
      atual = [];
      usados.add(i);
    } else atual.push(i);
  });
  if (atual.length) trechos.push(atual);
  const trechoDe = (i) => trechos.findIndex((tr) => tr.includes(i));

  const idDoBancoDaMencao = (m) => (m.item.carteira ? CRIAR_CARTEIRA : String(m.item.banco.id));

  // banco "padrão" citado na frase (primeiro), para as formas sem banco no mesmo trecho
  mencoesBancos.forEach((m) => {
    for (let k = m.inicio; k < m.fim; k += 1) usados.add(k);
  });
  mencoesCartoes.forEach((m) => {
    for (let k = m.inicio; k < m.fim; k += 1) usados.add(k);
  });
  formas.forEach((f) => {
    for (let k = f.inicio; k < f.fim; k += 1) usados.add(k);
  });

  // "o resto", "restante"
  const restos = [];
  tokens.forEach((t, i) => {
    if (["resto", "restante", "sobra", "diferenca"].includes(t.n)) {
      restos.push(i);
      usados.add(i);
      if (tokens[i - 1]?.n === "o" || tokens[i - 1]?.n === "a") usados.add(i - 1);
    }
  });

  // ---------- transferência ----------
  if (tipo === "transferencia") {
    let de = null;
    let para = null;
    const ordem = mencoesBancos.map((m) => {
      const antes = tokens[m.inicio - 1]?.n || "";
      const antes2 = tokens[m.inicio - 2]?.n || "";
      const origem = ["de", "do", "da", "dos", "das"].includes(antes);
      const destino = ["para", "pra", "pro", "no", "na", "ao", "a"].includes(antes) || ["para", "pra", "pro"].includes(antes2);
      return { id: idDoBancoDaMencao(m), origem, destino };
    });
    for (const m of ordem) {
      if (m.origem && de === null) de = m.id;
      else if (m.destino && para === null) para = m.id;
      else if (de === null) de = m.id;
      else if (para === null) para = m.id;
    }
    // saque: sai do banco e vai para a Carteira; depósito: vem da Carteira e entra no banco
    const carteiraId = carteira ? String(carteira.id) : CRIAR_CARTEIRA;
    if (subtipo === "saque") {
      if (de === null && para !== null && para !== carteiraId) {
        de = para;
        para = null;
      }
      if (para === null) para = carteiraId;
    } else if (subtipo === "deposito") {
      if (para === null && de !== null && de !== carteiraId) {
        para = de;
        de = null;
      }
      if (de === null) de = carteiraId;
    }
    if (de !== null && para !== null && de === para) para = null;
    if (subtipo === "transferencia" && (de === null || para === null)) {
      avisos.push("Não entendi de qual banco sai e para qual vai. Confira os dois campos.");
    }
    const descricao = montarDescricao(tokens, usados, trechos[0] || [], null);
    return {
      ...vazio,
      entendido: total !== null,
      tipo,
      subtipo,
      valor: total,
      descricao,
      data: dataAchada.data,
      de,
      para,
      avisos
    };
  }

  // ---------- receita ----------
  if (tipo === "entrada") {
    const forma = formas.find((f) => f.forma !== "Cartão")?.forma || (mencoesBancos.length ? "Pix" : null);
    let banco = mencoesBancos[0] ? idDoBancoDaMencao(mencoesBancos[0]) : null;
    if (!banco && forma === "Dinheiro" && carteira) banco = String(carteira.id);
    const descricao = montarDescricao(tokens, usados, trechos[0] || [], null);
    return {
      ...vazio,
      entendido: total !== null,
      tipo,
      valor: total,
      descricao: descricao || "Receita",
      categoria: "Receita",
      data: dataAchada.data,
      partes: [{ forma: forma || "Pix", valor: null, bancoId: banco === CRIAR_CARTEIRA ? null : banco, cartaoId: null, parcelas: 1 }],
      avisos
    };
  }

  // ---------- gasto ----------
  const cat = categoriaDaFrase(tokens, categorias);
  if (cat.pelaPalavra) {
    // "na categoria lazer": some da descrição
    const palavrasDaCat = cat.pelaPalavra.split(" ");
    for (let i = 0; i + palavrasDaCat.length <= tokens.length; i += 1) {
      if (palavrasDaCat.every((p, k) => tokens[i + k].n === p)) {
        for (let k = 0; k < palavrasDaCat.length; k += 1) usados.add(i + k);
        if (tokens[i - 1]?.n === "categoria") usados.add(i - 1);
      }
    }
  }

  const partes = [];
  const valoresUsados = new Set([valoresBons[0]?.i]);
  const bancoDoTrecho = (idx) => {
    const m = mencoesBancos.find((x) => trechoDe(x.inicio) === idx);
    return m ? idDoBancoDaMencao(m) : null;
  };
  const cartaoDoTrecho = (idx) => {
    const m = mencoesCartoes.find((x) => trechoDe(x.inicio) === idx);
    return m ? String(m.item.cartao.id) : null;
  };

  for (const f of formas) {
    const idx = trechoDe(f.inicio);
    const trecho = trechos[idx] || [];
    // valor da forma: o valor mais perto antes dela no trecho (que não seja o total), senão o depois
    let valor = null;
    let auto = false;
    const candidatos = valoresBons.filter((v) => trecho.includes(v.i) && !valoresUsados.has(v.i));
    const antes = candidatos.filter((v) => v.i < f.inicio).sort((a, b) => b.i - a.i)[0];
    const depois = candidatos.filter((v) => v.i > f.fim).sort((a, b) => a.i - b.i)[0];
    const escolhido = antes || depois;
    if (escolhido) {
      valor = escolhido.valor;
      valoresUsados.add(escolhido.i);
    } else if (restos.some((r) => trecho.includes(r))) {
      auto = true;
    }
    const parte = { forma: f.forma, valor, auto, bancoId: null, cartaoId: null, parcelas: 1 };
    if (f.forma === "Cartão") {
      parte.cartaoId = cartaoDoTrecho(idx) || (mencoesCartoes[0] ? String(mencoesCartoes[0].item.cartao.id) : null);
      parte.parcelas = parcelasAchadas.parcelas;
      if (!parte.cartaoId && cartoes.length === 0) avisos.push("Você ainda não tem cartão cadastrado: essa parte fica como lançamento comum.");
    } else {
      const b = bancoDoTrecho(idx);
      parte.bancoId = b;
      if (f.forma === "Dinheiro" && !b && carteira) parte.bancoId = String(carteira.id);
    }
    partes.push(parte);
  }

  // sem forma dita: banco citado → Pix nele; cartão citado (ou "parcelado") → cartão; senão a tela usa o padrão
  if (!partes.length) {
    const banco = mencoesBancos[0] ? idDoBancoDaMencao(mencoesBancos[0]) : null;
    const cartao = mencoesCartoes[0] ? String(mencoesCartoes[0].item.cartao.id) : null;
    if (cartao && (palavraDeCartao || !banco)) {
      partes.push({ forma: "Cartão", valor: null, auto: false, bancoId: null, cartaoId: cartao, parcelas: parcelasAchadas.parcelas });
    } else if (banco) {
      partes.push({ forma: "Pix", valor: null, auto: false, bancoId: banco, cartaoId: null, parcelas: 1 });
    } else if (parcelasAchadas.parcelas > 1 && cartoes.length) {
      partes.push({ forma: "Cartão", valor: null, auto: false, bancoId: null, cartaoId: String(cartoes[0].id), parcelas: parcelasAchadas.parcelas });
    }
  }

  // uma forma só: o valor dela é o total
  if (partes.length === 1) {
    partes[0].valor = null;
    partes[0].auto = false;
  }
  // várias formas: a última sem valor completa o total; mais de uma sem valor, a pessoa confere
  if (partes.length > 1) {
    const semValor = partes.filter((p) => p.valor === null);
    if (semValor.length === 1) semValor[0].auto = true;
    else if (semValor.length > 1) avisos.push("Não entendi o valor de cada forma de pagamento. Confira os valores.");
    const soma = partes.reduce((t, p) => t + (p.valor || 0), 0);
    if (total !== null && semValor.length === 0 && Math.abs(soma - total) > 0.004) {
      avisos.push("As formas de pagamento não somam o total. Confira os valores.");
    }
  }

  // banco citado só uma vez: vale para as formas sem banco (fora dinheiro e cartão)
  const bancoGeral = mencoesBancos.length === 1 ? idDoBancoDaMencao(mencoesBancos[0]) : null;
  if (bancoGeral) {
    for (const p of partes) if (p.forma !== "Cartão" && p.forma !== "Dinheiro" && !p.bancoId) p.bancoId = bancoGeral;
  }
  // "Carteira" sem existir ainda: a tela não cria banco por aqui
  for (const p of partes) if (p.bancoId === CRIAR_CARTEIRA) p.bancoId = null;

  const descricao = montarDescricao(tokens, usados, trechos[0] || [], cat.categoria);
  return {
    ...vazio,
    entendido: total !== null,
    tipo: "saida",
    valor: total,
    descricao,
    categoria: cat.categoria || (descricao ? CATEGORIA_PADRAO : null),
    data: dataAchada.data,
    partes,
    parcelas: parcelasAchadas.parcelas,
    avisos
  };
}

// Descrição = o que sobrou do primeiro trecho depois de tirar verbo, valores, formas, bancos, datas...
// Usa as palavras originais (com acento e maiúsculas), até 4 palavras.
function montarDescricao(tokens, usados, primeiroTrecho, categoria) {
  const ordem = primeiroTrecho.length ? primeiroTrecho : tokens.map((_, i) => i);
  let sobra = ordem.filter((i) => !usados.has(i) && !PALAVRAS_DE_LIGACAO.has(tokens[i].n) && !/^\W+$/.test(tokens[i].n));
  // nada sobrou no primeiro trecho: tenta os outros
  if (!sobra.length) {
    sobra = tokens.map((_, i) => i).filter((i) => !usados.has(i) && !PALAVRAS_DE_LIGACAO.has(tokens[i].n) && !/^\W+$/.test(tokens[i].n));
  }
  const palavras = sobra.slice(0, 4).map((i) => tokens[i].o.replace(/^["'(]+|["'),.;!?]+$/g, ""));
  if (!palavras.length) return categoria || "";
  const texto = palavras.join(" ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// A lista de bancos e cartões que o app conhece, para a IA usar os mesmos nomes
export function contextoParaIA(dados) {
  return {
    categorias: listarCategorias(dados).map((c) => c.nome),
    bancos: lerBancos(dados).map((b) => b.nome),
    cartoes: (Array.isArray(dados?.cartoes) ? dados.cartoes : []).map((c) => c.nome)
  };
}

// Converte a resposta da IA (nomes) para o mesmo formato do interpretador (ids)
export function resultadoDaIA(json, dados, hoje = hojeISO()) {
  const bancos = lerBancos(dados);
  const cartoes = Array.isArray(dados?.cartoes) ? dados.cartoes : [];
  const categorias = listarCategorias(dados);
  const carteira = acharCarteira(dados);
  const acharBancoPeloNome = (nome) => {
    if (nome == null || nome === "") return null;
    const chave = chaveDoNome(nome);
    const b = bancos.find((x) => chaveDoNome(x.nome) === chave) || bancos.find((x) => chavesDoNome(x.nome, true).includes(chave));
    if (b) return String(b.id);
    if (chave === "carteira") return carteira ? String(carteira.id) : CRIAR_CARTEIRA;
    return null;
  };
  const acharCartaoPeloNome = (nome) => {
    if (nome == null || nome === "") return null;
    const chave = chaveDoNome(nome);
    const c = cartoes.find((x) => chaveDoNome(x.nome) === chave) || cartoes.find((x) => chavesDoNome(x.nome, true).includes(chave));
    return c ? String(c.id) : null;
  };
  const tipoIA = String(json?.tipo || "").toLowerCase();
  const tipo = tipoIA.startsWith("rec") || tipoIA === "entrada" ? "entrada" : tipoIA.startsWith("trans") || ["saque", "deposito", "depósito"].includes(tipoIA) ? "transferencia" : "saida";
  const valor = Number(json?.valor);
  const data = dataValida(json?.data) ? json.data : hoje;
  const descricao = typeof json?.descricao === "string" ? json.descricao.trim() : "";
  const categoriaIA = categorias.find((c) => chaveDoNome(c.nome) === chaveDoNome(json?.categoria))?.nome || null;
  const avisos = [];

  if (tipo === "transferencia") {
    let subtipo = tipoIA === "saque" ? "saque" : tipoIA.startsWith("dep") ? "deposito" : String(json?.subtipo || "transferencia");
    if (!["transferencia", "saque", "deposito"].includes(subtipo)) subtipo = "transferencia";
    let de = acharBancoPeloNome(json?.de);
    let para = acharBancoPeloNome(json?.para);
    const carteiraId = carteira ? String(carteira.id) : CRIAR_CARTEIRA;
    if (subtipo === "saque" && para === null) para = carteiraId;
    if (subtipo === "deposito" && de === null) de = carteiraId;
    if (de !== null && de === para) para = null;
    return { entendido: valor > 0, tipo, subtipo, valor: valor > 0 ? valor : null, descricao, categoria: null, data, partes: [], de, para, parcelas: 1, avisos };
  }

  const formasIA = Array.isArray(json?.formas) ? json.formas : [];
  const partes = formasIA
    .map((f) => {
      const nome = String(f?.forma || "");
      const forma = FORMAS.find((x) => x.forma === nome)?.forma || FORMAS.find((x) => x.chaves.includes(chaveDoNome(nome)))?.forma || null;
      if (!forma) return null;
      const v = Number(f?.valor);
      const parcelas = Math.max(1, parseInt(f?.parcelas, 10) || 1);
      const bancoId = forma === "Cartão" ? null : acharBancoPeloNome(f?.banco);
      return {
        forma,
        valor: v > 0 ? v : null,
        auto: false,
        bancoId: bancoId === CRIAR_CARTEIRA ? null : bancoId || (forma === "Dinheiro" && carteira ? String(carteira.id) : null),
        cartaoId: forma === "Cartão" ? acharCartaoPeloNome(f?.cartao) || (cartoes[0] ? String(cartoes[0].id) : null) : null,
        parcelas: forma === "Cartão" ? parcelas : 1
      };
    })
    .filter(Boolean);

  if (tipo === "entrada") {
    const p = partes.find((x) => x.forma !== "Cartão") || { forma: "Pix", valor: null, bancoId: null, cartaoId: null, parcelas: 1 };
    return { entendido: valor > 0, tipo, subtipo: null, valor: valor > 0 ? valor : null, descricao: descricao || "Receita", categoria: "Receita", data, partes: [{ ...p, valor: null }], de: null, para: null, parcelas: 1, avisos };
  }

  if (partes.length === 1) {
    partes[0].valor = null;
    partes[0].auto = false;
  } else if (partes.length > 1) {
    const semValor = partes.filter((p) => p.valor === null);
    if (semValor.length === 1) semValor[0].auto = true;
    else if (semValor.length > 1) avisos.push("Não entendi o valor de cada forma de pagamento. Confira os valores.");
  }
  return {
    entendido: valor > 0,
    tipo: "saida",
    subtipo: null,
    valor: valor > 0 ? valor : null,
    descricao,
    categoria: categoriaIA || CATEGORIA_PADRAO,
    data,
    partes,
    de: null,
    para: null,
    parcelas: partes.find((p) => p.forma === "Cartão")?.parcelas || 1,
    avisos
  };
}
