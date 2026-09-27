// "Juntar os dois": primeira sincronização de um aparelho que já tinha dados próprios
// com uma conta que também já tem dados na nuvem (não existe uma versão em comum).
//
// Regras:
// - registro que só existe de um lado: entra;
// - mesmo id dos dois lados e igual: fica um;
// - dado de demonstração que um lado não mexeu: fica a versão do lado que mexeu;
// - mesmo cartão/meta/conta/investimento/bem (mesmo nome): vira um só (compras e
//   movimentações das metas são somadas);
// - coisas diferentes que por acaso têm o mesmo id: ficam as duas (uma ganha id novo).

import { iguais } from "./mesclar.js";
import { criarSeed } from "../storage/storage.js";

const LISTAS = ["lancamentos", "cartoes", "contasFixas", "metas", "investimentos", "bens"];

// Campos que dizem se dois registros com o mesmo id são "a mesma coisa"
const IDENTIDADE = {
  cartoes: ["nome", "bandeira"],
  metas: ["nome"],
  contasFixas: ["nome"],
  investimentos: ["nome", "tipo"],
  bens: ["nome", "tipo"]
};

function lista(v) {
  return Array.isArray(v) ? v : [];
}

// as datas dos dados de demonstração dependem do dia em que foram criados
function semDatas(v) {
  if (Array.isArray(v)) return v.map(semDatas);
  if (v && typeof v === "object") {
    const r = {};
    for (const [k, x] of Object.entries(v)) if (k !== "data" && k !== "periodos") r[k] = semDatas(x);
    return r;
  }
  return v;
}

function coletarIds(v, usados) {
  if (Array.isArray(v)) {
    for (const x of v) coletarIds(x, usados);
  } else if (v && typeof v === "object") {
    if (v.id !== undefined && v.id !== null) usados.add(String(v.id));
    for (const x of Object.values(v)) coletarIds(x, usados);
  }
}

function idLivre(usados) {
  let id = Date.now();
  while (usados.has(String(id))) id += 1;
  usados.add(String(id));
  return id;
}

// mesma meta nos dois aparelhos: soma o que o outro aparelho guardou/retirou
function juntarMeta(l, r) {
  const historicoL = lista(l.historico);
  const idsL = new Set(historicoL.map((h) => String(h?.id)));
  const soLa = lista(r.historico).filter((h) => !idsL.has(String(h?.id)));
  const soma = soLa.reduce((t, h) => t + (Number(h?.valor) || 0), 0);
  return { ...l, historico: [...historicoL, ...soLa], atual: Math.round((Number(l.atual || 0) + soma) * 100) / 100 };
}

function juntarLista(chave, L, R, S, usados) {
  const resultado = [...L];
  const posicao = new Map(L.map((x, i) => [String(x?.id), i]));
  const semente = new Map(S.map((x) => [String(x?.id), x]));

  for (const r of R) {
    const id = String(r?.id);
    if (!posicao.has(id)) {
      posicao.set(id, resultado.length);
      resultado.push(r);
      continue;
    }
    const i = posicao.get(id);
    const l = resultado[i];
    if (iguais(l, r)) continue;

    const s = semente.get(id);
    if (s && iguais(semDatas(l), semDatas(s))) {
      resultado[i] = r; // aqui era a demonstração intacta: fica a versão da nuvem
      continue;
    }
    if (s && iguais(semDatas(r), semDatas(s))) continue; // na nuvem era a demonstração intacta

    const campos = IDENTIDADE[chave];
    if (l && r && campos && campos.every((c) => l[c] === r[c])) {
      if (chave === "metas") resultado[i] = juntarMeta(l, r);
      else if (chave === "cartoes") {
        resultado[i] = { ...l, compras: juntarLista("compras", lista(l.compras), lista(r.compras), lista(s?.compras), usados) };
      }
      // outros (mesmo nome): fica a versão deste aparelho
      continue;
    }

    resultado.push({ ...r, id: idLivre(usados) });
  }
  return resultado;
}

// Perfil: fica o que foi preenchido de verdade (o nome "João" da demonstração não conta)
export function juntarPerfil(local, remoto) {
  const padrao = criarSeed().usuario.nome;
  const l = local && typeof local === "object" ? local : {};
  const r = remoto && typeof remoto === "object" ? remoto : {};
  const resultado = { ...r, ...l };
  if ((!l.nome || l.nome === padrao) && r.nome) resultado.nome = r.nome;
  for (const campo of ["apelido", "telefone", "nascimento"]) {
    if (!l[campo] && r[campo]) resultado[campo] = r[campo];
  }
  // orçamentos por categoria: ficam os dos dois lados (na mesma categoria, vale o deste aparelho)
  const limites = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
  if (limites(l.orcamentos) && limites(r.orcamentos)) resultado.orcamentos = { ...r.orcamentos, ...l.orcamentos };
  return resultado;
}

export function juntarDados(local, remoto) {
  const semente = criarSeed();
  const usados = new Set();
  coletarIds(local, usados);
  coletarIds(remoto, usados);

  const resultado = { ...remoto, ...local };
  for (const chave of LISTAS) {
    resultado[chave] = juntarLista(chave, lista(local?.[chave]), lista(remoto?.[chave]), lista(semente[chave]), usados);
  }
  resultado.usuario = juntarPerfil(local?.usuario, remoto?.usuario);
  return resultado;
}
