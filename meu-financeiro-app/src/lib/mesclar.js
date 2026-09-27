// Junta as mudanças feitas em dois aparelhos.
//
// "base" é como os dados estavam na última sincronização; "local" é este aparelho;
// "remoto" é a nuvem. O que só um lado mudou, entra; o que os dois mudaram,
// é juntado campo a campo. Listas de registros (lançamentos, cartões, compras...)
// são juntadas pelo "id" de cada registro.
// Se os dois lados mudaram o MESMO campo, fica o valor deste aparelho.
// Se um lado apagou e o outro editou o mesmo registro, o registro fica (nada se perde).

import { ehChaveProibida } from "./json.js";

function ehObjeto(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function iguais(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) if (!iguais(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a).filter((k) => a[k] !== undefined);
  const kb = Object.keys(b).filter((k) => b[k] !== undefined);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!iguais(a[k], b[k])) return false;
  return true;
}

// Lista em que todo item é um registro com "id" (sem ids repetidos).
function ehListaDeRegistros(lista) {
  if (!Array.isArray(lista)) return false;
  const vistos = new Set();
  for (const item of lista) {
    if (!ehObjeto(item) || item.id === undefined || item.id === null) return false;
    const chave = String(item.id);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
  }
  return true;
}

function porId(lista) {
  return new Map(lista.map((item) => [String(item.id), item]));
}

function mesclarListas(base, local, remoto) {
  const B = porId(base);
  const R = porId(remoto);
  const resultado = [];
  const vistos = new Set();

  for (const item of local) {
    const id = String(item.id);
    vistos.add(id);
    if (R.has(id)) {
      resultado.push(mesclar(B.get(id), item, R.get(id)));
    } else if (!(B.has(id) && iguais(B.get(id), item))) {
      // criado aqui, ou editado aqui enquanto o outro aparelho apagava: fica
      resultado.push(item);
    }
    // senão: apagado no outro aparelho e não mexido aqui -> sai
  }

  for (const item of remoto) {
    const id = String(item.id);
    if (vistos.has(id)) continue;
    if (!(B.has(id) && iguais(B.get(id), item))) resultado.push(item);
    // senão: apagado aqui e não mexido no outro aparelho -> sai
  }

  return resultado;
}

export function mesclar(base, local, remoto) {
  if (iguais(local, remoto)) return local;
  if (base !== undefined && iguais(base, local)) return remoto;
  if (base !== undefined && iguais(base, remoto)) return local;

  // os dois lados mudaram
  if (ehListaDeRegistros(local) && ehListaDeRegistros(remoto)) {
    return mesclarListas(ehListaDeRegistros(base) ? base : [], local, remoto);
  }

  if (ehObjeto(local) && ehObjeto(remoto)) {
    const b = ehObjeto(base) ? base : {};
    const resultado = {};
    // "__proto__" e afins nunca são dados do app: ficam de fora (ver lib/json.js)
    const chaves = [...Object.keys(local), ...Object.keys(remoto).filter((k) => !(k in local))].filter((k) => !ehChaveProibida(k));
    for (const k of chaves) {
      const temL = k in local;
      const temR = k in remoto;
      if (temL && temR) {
        resultado[k] = mesclar(b[k], local[k], remoto[k]);
      } else if (temL) {
        // não existe na nuvem: foi apagado lá (se estava na base igual) ou criado aqui
        if (!(k in b && iguais(b[k], local[k]))) resultado[k] = local[k];
      } else if (!(k in b && iguais(b[k], remoto[k]))) {
        resultado[k] = remoto[k];
      }
    }
    return resultado;
  }

  // o mesmo valor mudou dos dois lados: fica o deste aparelho
  return local;
}

// Metas: se os dois aparelhos guardaram/retiraram dinheiro na mesma meta,
// o "guardado" vira a base + todas as movimentações novas dos dois lados.
function ajustarMetas(base, local, remoto, junto) {
  if (!ehObjeto(junto) || !Array.isArray(junto.metas)) return junto;
  const lista = (v) => (ehObjeto(v) && Array.isArray(v.metas) ? v.metas : []);
  const B = new Map(lista(base).map((m) => [String(m?.id), m]));
  const L = new Map(lista(local).map((m) => [String(m?.id), m]));
  const R = new Map(lista(remoto).map((m) => [String(m?.id), m]));

  let mudou = false;
  const metas = junto.metas.map((meta) => {
    const id = String(meta?.id);
    const b = B.get(id);
    const l = L.get(id);
    const r = R.get(id);
    if (!b || !l || !r || !Array.isArray(meta.historico)) return meta;
    const mexeuAqui = !iguais(l.historico, b.historico);
    const mexeuLa = !iguais(r.historico, b.historico);
    if (!mexeuAqui || !mexeuLa) return meta;
    const antigos = new Set((Array.isArray(b.historico) ? b.historico : []).map((h) => String(h?.id)));
    const novos = meta.historico.filter((h) => !antigos.has(String(h?.id)));
    const soma = novos.reduce((t, h) => t + (Number(h?.valor) || 0), 0);
    const atual = Math.round((Number(b.atual || 0) + soma) * 100) / 100;
    if (atual === meta.atual) return meta;
    mudou = true;
    return { ...meta, atual };
  });

  return mudou ? { ...junto, metas } : junto;
}

// Junta os dados do app (mesclar + ajustes que dependem do significado dos campos).
export function mesclarDados(base, local, remoto) {
  return ajustarMetas(base, local, remoto, mesclar(base, local, remoto));
}
