// Formatação de dinheiro, leitura de valores digitados e datas locais.
// As datas ficam sempre como texto "AAAA-MM-DD" e os meses como "AAAA-MM",
// sem passar por UTC (evita o dia "pular" depois das 21h no Brasil).

export const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

export function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function arredondar(v) {
  return Math.round(Number(v || 0) * 100) / 100;
}

// Aceita "1.250,50", "1250,50", "1250.50", "R$ 1.250", "0,5"...
// Devolve NaN quando não dá para entender o valor.
export function parseValor(texto) {
  if (typeof texto === "number") return Number.isFinite(texto) ? arredondar(texto) : NaN;
  let s = String(texto ?? "").trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (!s) return NaN;

  const temVirgula = s.includes(",");
  const temPonto = s.includes(".");

  if (temVirgula && temPonto) {
    // o último separador que aparece é o dos centavos
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (temVirgula) {
    const partes = s.split(",");
    s = partes.length > 2 ? partes.join("") : s.replace(",", ".");
  } else if (temPonto) {
    const partes = s.split(".");
    // "1.250" e "1.250.000" são milhar; "12.5", "10.50" e "0.125" são decimais
    const milhar = partes.length === 2 && partes[1].length === 3 && /^-?[1-9]\d{0,2}$/.test(partes[0]);
    if (partes.length > 2 || milhar) s = partes.join("");
  }

  // ",50" -> 0.50 e "50," -> 50
  if (s.startsWith(".")) s = `0${s}`;
  if (s.startsWith("-.")) s = `-0${s.slice(1)}`;
  if (s.endsWith(".")) s = s.slice(0, -1);

  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return arredondar(Number(s));
}

function dois(n) {
  return String(n).padStart(2, "0");
}

export function hojeISO(agora = new Date()) {
  return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
}

export function dataDeTimestamp(ms) {
  return hojeISO(new Date(Number(ms)));
}

export function lerData(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  return { y, m, d };
}

export function dataValida(iso) {
  const { y, m, d } = lerData(iso);
  return Boolean(y && m >= 1 && m <= 12 && d >= 1 && d <= diasNoMes(y, m));
}

export function montarData(y, m, d) {
  return `${y}-${dois(m)}-${dois(d)}`;
}

export function diasNoMes(y, m) {
  return new Date(y, m, 0).getDate();
}

export function chaveMes(y, m) {
  return `${y}-${dois(m)}`;
}

export function mesDaData(iso) {
  return String(iso || "").slice(0, 7);
}

export function lerMes(chave) {
  const [y, m] = String(chave).split("-").map(Number);
  return { y, m };
}

export function somarMeses(chave, n) {
  const { y, m } = lerMes(chave);
  const total = y * 12 + (m - 1) + n;
  return chaveMes(Math.floor(total / 12), (total % 12) + 1);
}

export function nomeMes(chave) {
  const { m } = lerMes(chave);
  return MESES[m - 1] || "";
}

// "Outubro/2026"
export function rotuloMes(chave) {
  const { y } = lerMes(chave);
  const nome = nomeMes(chave);
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}/${y}`;
}

// "Outubro 2026"
export function tituloMes(chave) {
  return rotuloMes(chave).replace("/", " ");
}

// "25/09/2026"
export function dataBR(iso) {
  const { y, m, d } = lerData(iso);
  if (!y) return "";
  return `${dois(d)}/${dois(m)}/${y}`;
}

// "25/09"
export function diaMesBR(iso) {
  const { m, d } = lerData(iso);
  if (!m) return "";
  return `${dois(d)}/${dois(m)}`;
}
