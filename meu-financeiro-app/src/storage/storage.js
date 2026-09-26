// Dados do app no navegador (localStorage).
//
// Versão 2 (chave "meu_financeiro_v2"): cada compra do cartão é UM registro
// (valor total + número de parcelas); as parcelas são calculadas na hora.
// As fotos de cupom ficam no IndexedDB (ver cupons.js), não aqui.
//
// Na primeira abertura depois da atualização, os dados da versão antiga
// ("meu_financeiro_v1") são convertidos. A chave antiga é mantida como cópia de segurança.

import {
  arredondar,
  dataDeTimestamp,
  dataValida,
  hojeISO,
  lerMes,
  mesDaData,
  montarData,
  somarMeses
} from "../lib/formato.js";

const CHAVE_V1 = "meu_financeiro_v1";
const CHAVE = "meu_financeiro_v2";

// Marca deixada na cópia antiga quando a foto já foi copiada para o IndexedDB
const FOTO_MOVIDA = "foto-no-indexeddb";

let fotosPendentes = [];

export function criarSeed(hoje = hojeISO()) {
  const mes = mesDaData(hoje);
  const inicio = somarMeses(mes, -2);
  const { y, m } = lerMes(inicio);
  return {
    versao: 2,
    usuario: { nome: "João" },
    lancamentos: [
      { id: 1, tipo: "entrada", descricao: "Salário", categoria: "Receita", valor: 5000, pagamento: "Transferência", data: `${mes}-05` },
      { id: 2, tipo: "saida", descricao: "Mercado", categoria: "Alimentação", valor: 250, pagamento: "Pix", data: hoje }
    ],
    cartoes: [
      {
        id: 1,
        nome: "Nubank",
        bandeira: "Mastercard",
        limite: 5000,
        fechamento: 3,
        vencimento: 10,
        compras: [
          { id: 101, descricao: "Notebook", categoria: "Trabalho", data: montarData(y, m, 15), valorTotal: 3000, parcelas: 10 }
        ]
      }
    ],
    contasFixas: [
      { id: 201, nome: "Internet", valor: 126, dia: 10, categoria: "Casa", ativa: true, periodos: [{ inicio, fim: null }] }
    ],
    metas: [{ id: 1, nome: "Reserva de emergência", objetivo: 10000, atual: 2500 }]
  };
}

function ler(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function numero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function inteiro(v) {
  const n = parseInt(String(v ?? "").replace(/x/gi, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function fotoValida(f) {
  return typeof f === "string" && f.startsWith("data:image");
}

// ---------- conversão da versão antiga ----------

function fechamentoEstimado(vencimento) {
  const f = vencimento - 7;
  return f >= 1 ? f : f + 30;
}

// A versão antiga gravava a data "de hoje" em UTC: depois das 21h (horário de Brasília)
// ela já era o dia seguinte. Quando a data gravada bate com esse erro, usa a data local
// do momento em que o registro foi criado (o id é esse horário).
function corrigirDataUTC(data, id) {
  const ms = numero(id);
  if (!ms || ms < 1e12) return data;
  const utc = new Date(ms).toISOString().slice(0, 10);
  const local = dataDeTimestamp(ms);
  return data === utc && utc !== local ? local : data;
}

function valorMaisComum(valores) {
  const contagem = new Map();
  for (const v of valores) contagem.set(v, (contagem.get(v) || 0) + 1);
  let melhor = null;
  let vezes = 0;
  for (const [v, n] of contagem) {
    if (n > vezes) {
      melhor = v;
      vezes = n;
    }
  }
  return melhor;
}

function migrarCompras(linhas) {
  const compras = [];
  const fotos = [];
  const validas = (Array.isArray(linhas) ? linhas : []).filter((l) => l && typeof l === "object");

  const registrarFoto = (compraId, foto) => {
    const cupomId = `cupom-${compraId}`;
    if (foto === FOTO_MOVIDA) return { cupomId };
    if (!fotoValida(foto)) return {};
    fotos.push({ cupomId, dataURL: foto });
    return { cupomId };
  };

  // Compras antigas sem parcelamento (um registro = uma compra)
  for (const l of validas.filter((x) => !x.parcelaAtual)) {
    const valor = numero(l.valor);
    const id = numero(l.id);
    if (!valor || valor <= 0 || id === null) continue;
    compras.push({
      id,
      descricao: String(l.descricao || "Compra"),
      categoria: l.categoria || "Outros",
      data: dataValida(l.data) ? corrigirDataUTC(l.data, id) : dataDeTimestamp(id),
      valorTotal: arredondar(valor),
      parcelas: Math.max(1, inteiro(l.parcelas) || 1),
      ...registrarFoto(id, l.fotoCupom)
    });
  }

  // Compras parceladas antigas: um registro por parcela -> agrupa de volta numa compra.
  // As parcelas de uma mesma compra foram criadas juntas: id = base + (parcela - 1).
  const parceladas = validas
    .filter((x) => x.parcelaAtual)
    .map((l) => ({
      l,
      base: numero(l.idCompra) ?? (numero(l.id) ?? 0) - ((inteiro(l.parcelaAtual) || 1) - 1),
      total: inteiro(l.totalParcelas)
    }))
    .sort((a, b) => a.base - b.base);

  const grupos = [];
  for (const item of parceladas) {
    const grupo = grupos[grupos.length - 1];
    const mesmaCompra =
      grupo &&
      Math.abs(item.base - grupo.base) <= 10 &&
      grupo.total === item.total &&
      !grupo.linhas.some((x) => x.parcelaAtual === item.l.parcelaAtual);
    if (mesmaCompra) grupo.linhas.push(item.l);
    else grupos.push({ base: item.base, total: item.total, linhas: [item.l] });
  }

  for (const grupo of grupos) {
    const linhas = grupo.linhas.sort((a, b) => a.parcelaAtual - b.parcelaAtual);
    const principal = linhas[0];
    const n = Math.max(1, grupo.total || inteiro(principal.parcelas) || linhas.length);

    // Valor "normal" de uma parcela (usado só para parcelas que foram apagadas na versão antiga)
    let parcelaNormal = null;
    const original = linhas.map((l) => numero(l.valorOriginal) || numero(l.valorTotal)).find((v) => v > 0);
    if (original) parcelaNormal = original / n;
    if (!parcelaNormal) parcelaNormal = linhas.map((l) => numero(l.valorParcela)).find((v) => v > 0) || null;
    if (!parcelaNormal) {
      // registros editados na versão antiga ficaram com "parcelas: null"
      const naoEditadas = linhas.filter((l) => l.parcelas !== null);
      const valores = (naoEditadas.length ? naoEditadas : linhas).map((l) => numero(l.valor)).filter((v) => v > 0);
      parcelaNormal = valorMaisComum(valores);
    }

    // O total respeita o valor de cada parcela como estava na versão antiga
    // (inclusive valores corrigidos pelo botão Editar).
    let total = 0;
    for (let k = 1; k <= n; k += 1) {
      const linha = linhas.find((l) => inteiro(l.parcelaAtual) === k);
      const valor = linha ? numero(linha.valor) : null;
      total += valor > 0 ? valor : parcelaNormal || 0;
    }
    if (!(total > 0)) continue;

    const id = grupo.base;
    compras.push({
      id,
      descricao: String(principal.descricao || "Compra"),
      categoria: principal.categoria || "Outros",
      data: dataValida(principal.data) ? corrigirDataUTC(principal.data, id) : dataDeTimestamp(id),
      valorTotal: arredondar(total),
      parcelas: n,
      ...registrarFoto(id, linhas.map((l) => l.fotoCupom).find((x) => fotoValida(x) || x === FOTO_MOVIDA))
    });
  }

  return { compras, fotos };
}

export function migrarV1(antigo) {
  const fotos = [];
  const cartoes = (Array.isArray(antigo?.cartoes) ? antigo.cartoes : [])
    .filter((c) => c && typeof c === "object")
    .map((c, i) => {
      const vencimento = Math.min(31, Math.max(1, inteiro(c.vencimento) || 10));
      const fechamento = inteiro(c.fechamento);
      const r = migrarCompras(c.compras);
      fotos.push(...r.fotos);
      return {
        id: c.id ?? Date.now() + i,
        nome: String(c.nome || "Cartão"),
        bandeira: c.bandeira || "",
        limite: numero(c.limite) || 0,
        fechamento: fechamento >= 1 && fechamento <= 31 ? fechamento : fechamentoEstimado(vencimento),
        vencimento,
        ...(fechamento ? {} : { fechamentoEstimado: true }),
        compras: r.compras
      };
    });

  return {
    dados: {
      versao: 2,
      usuario: antigo?.usuario || { nome: "João" },
      lancamentos: (Array.isArray(antigo?.lancamentos) ? antigo.lancamentos : []).map((l) =>
        l && dataValida(l.data) ? { ...l, data: corrigirDataUTC(l.data, l.id) } : l
      ),
      cartoes,
      contasFixas: [],
      metas: Array.isArray(antigo?.metas) ? antigo.metas : []
    },
    fotos
  };
}

function normalizar(dados) {
  return {
    versao: 2,
    usuario: dados.usuario || { nome: "João" },
    lancamentos: Array.isArray(dados.lancamentos) ? dados.lancamentos : [],
    cartoes: (Array.isArray(dados.cartoes) ? dados.cartoes : []).map((c) => ({
      ...c,
      compras: Array.isArray(c.compras) ? c.compras : []
    })),
    contasFixas: Array.isArray(dados.contasFixas) ? dados.contasFixas : [],
    metas: Array.isArray(dados.metas) ? dados.metas : []
  };
}

// ---------- API usada pelo App ----------

// Fotos que ainda estão só na cópia antiga (a cópia para o IndexedDB não terminou
// ou falhou numa abertura anterior): tenta de novo a cada abertura.
function fotosAindaNoBackup() {
  try {
    const bruto = localStorage.getItem(CHAVE_V1);
    if (!bruto || !bruto.includes("data:image")) return [];
    return migrarV1(JSON.parse(bruto)).fotos;
  } catch {
    return [];
  }
}

export function loadData() {
  const atual = ler(CHAVE);
  if (atual) {
    fotosPendentes = fotosAindaNoBackup();
    return normalizar(atual);
  }

  const antigo = ler(CHAVE_V1);
  if (antigo) {
    const { dados, fotos } = migrarV1(antigo);
    fotosPendentes = fotos;
    saveData(dados);
    return dados;
  }

  return criarSeed();
}

// Devolve false se o navegador recusar (ex.: armazenamento cheio).
export function saveData(dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar os dados", erro);
    return false;
  }
}

export function resetData() {
  const seed = criarSeed();
  saveData(seed);
  return seed;
}

// Fotos da versão antiga que ainda precisam ir para o IndexedDB.
export function pegarFotosPendentes() {
  const lista = fotosPendentes;
  fotosPendentes = [];
  return lista;
}

// Depois que as fotos antigas foram copiadas para o IndexedDB,
// tira as fotos da cópia de segurança antiga para liberar espaço.
export function liberarFotosDoBackupAntigo() {
  const antigo = ler(CHAVE_V1);
  if (!antigo || !Array.isArray(antigo.cartoes)) return;
  for (const cartao of antigo.cartoes) {
    for (const compra of Array.isArray(cartao?.compras) ? cartao.compras : []) {
      if (compra && fotoValida(compra.fotoCupom)) compra.fotoCupom = FOTO_MOVIDA;
    }
  }
  try {
    localStorage.setItem(CHAVE_V1, JSON.stringify(antigo));
  } catch {
    // sem problema: a cópia antiga continua como estava
  }
}
