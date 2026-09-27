// Cores do cartão pelo nome do banco: o app reconhece o banco pelo nome do cartão
// (ex.: "Nubank" fica roxo, "Santander" vermelho com branco). Nome que o app não reconhece
// continua com o visual escuro de sempre.
//
// Cada banco: cores do fundo (degradê), cor do texto, texto secundário e destaque
// (linha da fatura fechada). "claro" = fundo claro com texto escuro.

// A ordem importa quando o nome tem mais de um banco: cartões de loja e bancos digitais vêm antes
// dos bancos que os emitem (ex.: "Magalu Itaucard" fica com as cores da Magalu, "Next Bradesco" com as do Next).
// "exceto": nomes que parecem o banco mas não são (ex.: "Porto Alegre").
export const BANCOS = [
  // "Carteira": o dinheiro em espécie (recebe saques e paga em dinheiro) — visual verde de nota
  { id: "carteira", nome: "Carteira", termos: ["carteira", "dinheiro", "especie", "em especie", "cash", "cofre"], cores: ["#15803d", "#14532d"], texto: "#ffffff", suave: "#dcfce7", destaque: "#fde68a" },
  { id: "magalu", nome: "Magalu", termos: ["magalu", "magazine luiza", "luizacard"], cores: ["#0069d9", "#0045ad"], texto: "#ffffff", suave: "#eaf3ff", destaque: "#fef3c5" },
  { id: "renner", nome: "Renner", termos: ["renner"], cores: ["#d9181e", "#9c0c10"], texto: "#ffffff", suave: "#ffecec", destaque: "#fef1bb" },
  { id: "carrefour", nome: "Carrefour", termos: ["carrefour", "atacadao"], cores: ["#1e5bc6", "#0e3a8a"], texto: "#ffffff", suave: "#dbe6ff", destaque: "#fde68a" },
  { id: "hipercard", nome: "Hipercard", termos: ["hipercard"], cores: ["#b3131b", "#7a0b10"], texto: "#ffffff", suave: "#ffdadc", destaque: "#fde68a" },
  { id: "nubank", nome: "Nubank", termos: ["nubank", "nu bank", "nu", "roxinho", "ultravioleta"], cores: ["#8a05be", "#530082"], texto: "#ffffff", suave: "#ecdcff", destaque: "#fde68a" },
  { id: "santander", nome: "Santander", termos: ["santander"], cores: ["#ec0000", "#b00000"], texto: "#ffffff", suave: "#ffffff", destaque: "#ffffff", caixa: "#ffffff", caixaTexto: "#b30000", caixaSuave: "#9f1d1d" },
  { id: "next", nome: "Next", termos: ["next"], cores: ["#1f1f1f", "#000000"], texto: "#ffffff", suave: "#d4d4d4", destaque: "#00e35b", barra: "#00e35b" },
  { id: "itau", nome: "Itaú", termos: ["itau", "itaucard", "personnalite", "itau personnalite", "uniclass"], cores: ["#ff8200", "#ec6b00"], texto: "#051b42", suave: "#0a2654", destaque: "#051b42", claro: true, caixa: "#0b2a5b", caixaTexto: "#ffffff", caixaSuave: "#ffd7a8" },
  { id: "bradesco", nome: "Bradesco", termos: ["bradesco", "bradescard"], cores: ["#cc092f", "#8e0620"], texto: "#ffffff", suave: "#ffdbe2", destaque: "#fde68a" },
  { id: "bb", nome: "Banco do Brasil", termos: ["banco do brasil", "bb", "ourocard"], cores: ["#fcf538", "#f5d800"], texto: "#1c2a8c", suave: "#24349a", destaque: "#1c2a8c", barra: "#2b3fd1", claro: true },
  { id: "caixa", nome: "Caixa", termos: ["caixa", "cef", "caixa economica", "caixa economica federal"], cores: ["#0a6ab8", "#003f80"], texto: "#ffffff", suave: "#dfedff", destaque: "#ffe3c0", barra: "#f39200" },
  { id: "inter", nome: "Inter", termos: ["inter", "banco inter"], cores: ["#ff9a1f", "#ff6d00"], texto: "#1c1917", suave: "#2e2520", destaque: "#1c1917", claro: true },
  { id: "c6", nome: "C6 Bank", termos: ["c6", "c6 bank", "c6bank", "c6 carbon"], cores: ["#2f2f2f", "#0a0a0a"], texto: "#ffffff", suave: "#d4d4d4", destaque: "#fde68a" },
  { id: "picpay", nome: "PicPay", termos: ["picpay", "pic pay"], cores: ["#2bd46e", "#11b359"], texto: "#032613", suave: "#073a1d", destaque: "#032613", claro: true },
  { id: "mercadopago", nome: "Mercado Pago", termos: ["mercado pago", "mercadopago", "mercado livre", "mercadolivre"], cores: ["#20bdf2", "#00a0e3"], texto: "#0a1f4d", suave: "#0e2a61", destaque: "#0a1f4d", claro: true },
  { id: "btg", nome: "BTG", termos: ["btg", "btg pactual"], cores: ["#0d2c5c", "#061a3a"], texto: "#ffffff", suave: "#c9d8f0", destaque: "#fde68a" },
  { id: "xp", nome: "XP", termos: ["xp", "xp investimentos"], cores: ["#1f1f1f", "#000000"], texto: "#ffffff", suave: "#d4d4d4", destaque: "#ffd400", barra: "#ffd400" },
  { id: "neon", nome: "Neon", termos: ["neon"], cores: ["#2bdcff", "#00a8e8"], texto: "#00233b", suave: "#06324f", destaque: "#00233b", claro: true },
  { id: "original", nome: "Original", termos: ["original", "banco original"], cores: ["#007a3e", "#005028"], texto: "#ffffff", suave: "#e6faef", destaque: "#fef1bb" },
  { id: "pagbank", nome: "PagBank", termos: ["pagbank", "pag bank", "pagseguro", "pag seguro"], cores: ["#00754f", "#004d36"], texto: "#ffffff", suave: "#d3f5e9", destaque: "#f0faa0" },
  { id: "sicredi", nome: "Sicredi", termos: ["sicredi"], cores: ["#2a730b", "#1a5006"], texto: "#ffffff", suave: "#e1f5d6", destaque: "#fef1bb" },
  { id: "sicoob", nome: "Sicoob", termos: ["sicoob"], cores: ["#00796f", "#003641"], texto: "#ffffff", suave: "#dcf6f2", destaque: "#eef2ac", barra: "#c9d200" },
  { id: "banrisul", nome: "Banrisul", termos: ["banrisul"], cores: ["#0056a8", "#003366"], texto: "#ffffff", suave: "#d6e6fa", destaque: "#fde68a" },
  { id: "brb", nome: "BRB", termos: ["brb"], cores: ["#0059b3", "#003a75"], texto: "#ffffff", suave: "#d6e6fa", destaque: "#fde68a" },
  { id: "porto", nome: "Porto", termos: ["porto", "porto seguro", "porto bank", "portoseguro"], exceto: ["porto alegre", "porto velho", "porto nacional"], cores: ["#0047bb", "#002a70"], texto: "#ffffff", suave: "#d6e2fa", destaque: "#fde68a" },
  { id: "will", nome: "Will Bank", termos: ["will", "will bank", "willbank"], cores: ["#ffe100", "#ffc800"], texto: "#111111", suave: "#262626", destaque: "#111111", claro: true },
  { id: "digio", nome: "Digio", termos: ["digio"], cores: ["#0b2f7a", "#051a45"], texto: "#ffffff", suave: "#d3e0fa", destaque: "#7fe3ff", barra: "#3ddcff" },
  { id: "pan", nome: "Banco Pan", termos: ["pan", "banco pan", "bancopan"], cores: ["#0068b8", "#003a7d"], texto: "#ffffff", suave: "#d6e8fa", destaque: "#fef1bb" },
  { id: "safra", nome: "Safra", termos: ["safra"], cores: ["#12304f", "#081a2d"], texto: "#ffffff", suave: "#d5dfea", destaque: "#e3c77f", barra: "#d4b062" },
  { id: "amex", nome: "American Express", termos: ["amex", "american express"], cores: ["#0167c2", "#00437f"], texto: "#ffffff", suave: "#e3efff", destaque: "#fef1bb" },
  { id: "bmg", nome: "BMG", termos: ["bmg", "banco bmg"], cores: ["#ff7a1a", "#f25c00"], texto: "#1c1917", suave: "#2d2520", destaque: "#1c1917", claro: true }
];

function limpar(texto) {
  const t = String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return ` ${t} `;
}

// Banco reconhecido pelo nome do cartão (ou null)
export function bancoDoCartao(nome) {
  const texto = limpar(nome);
  if (!texto.trim()) return null;
  const tem = (t) => texto.includes(` ${t} `);
  return BANCOS.find((b) => b.termos.some(tem) && !(b.exceto || []).some(tem)) || null;
}

function comTransparencia(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

// Variáveis de cor usadas pelo painel do cartão (ver .credit-card no index.css)
export function estiloDoBanco(banco) {
  if (!banco) return undefined;
  const [inicio, fim] = banco.cores;
  const claro = Boolean(banco.claro);
  return {
    "--cc-fundo": `linear-gradient(145deg,${inicio},${fim})`,
    "--cc-texto": banco.texto,
    "--cc-suave": banco.suave,
    "--cc-destaque": banco.destaque,
    "--cc-barra": banco.barra || banco.texto,
    "--cc-selo": claro ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.18)",
    "--cc-selo-texto": banco.texto,
    "--cc-vidro": claro ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.16)",
    "--cc-vidro-2": claro ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.1)",
    "--cc-trilha": claro ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.2)",
    // disponível negativo: o sinal de menos já avisa (vermelho não dá leitura boa em todo fundo)
    "--cc-neg": banco.texto,
    "--cc-sombra": comTransparencia(fim, 0.32),
    "--cc-botao": banco.texto,
    "--cc-botao-texto": claro ? inicio : fim,
    ...(banco.caixa
      ? { "--cc-caixa": banco.caixa, "--cc-caixa-texto": banco.caixaTexto, "--cc-caixa-suave": banco.caixaSuave }
      : {})
  };
}
