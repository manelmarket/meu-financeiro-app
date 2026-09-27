// Orçamento por categoria: um limite por mês para cada categoria de despesa.
//
// Os limites ficam em dados.usuario.orcamentos = { "Alimentação": 800, "Lazer": 300 }.
// Ficam junto com o perfil de propósito: as versões antigas do app (até a 6) guardam o perfil
// inteiro ao sincronizar, então um celular ainda não atualizado não apaga os limites da nuvem.
//
// O gasto de cada categoria é o mesmo do "Meu mês": lançamentos + faturas de cartão que vencem
// no mês + contas fixas (ver lib/mes.js).

import { CATEGORIAS } from "./categorias.js";
import { resumoDoMes } from "./mes.js";
import { arredondar, hojeISO } from "./formato.js";

// a partir de 80% do limite o app avisa; em 100% ou mais, o limite estourou
export const PERTO_DO_LIMITE = 0.8;

function ehObjeto(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// { categoria: limite } só com limites válidos (maiores que zero)
export function lerOrcamentos(dados) {
  const brutos = dados?.usuario?.orcamentos;
  if (!ehObjeto(brutos)) return {};
  const limites = {};
  for (const [categoria, valor] of Object.entries(brutos)) {
    const n = Number(valor);
    if (categoria && Number.isFinite(n) && n > 0) limites[categoria] = arredondar(n);
  }
  return limites;
}

// Define (limite > 0) ou remove (limite vazio/zero) o limite de uma categoria.
// A lista fica mesmo vazia ({}): assim, ao juntar as mudanças de dois aparelhos, um limite
// removido num aparelho sai também no outro (ver lib/mesclar.js).
export function comOrcamento(dados, categoria, limite) {
  const usuario = { ...(dados.usuario || {}) };
  const limites = ehObjeto(usuario.orcamentos) ? { ...usuario.orcamentos } : {};
  const n = Number(limite);
  if (Number.isFinite(n) && n > 0) limites[categoria] = arredondar(n);
  else delete limites[categoria];
  usuario.orcamentos = limites;
  return { ...dados, usuario };
}

// "ok" | "perto" (80% ou mais) | "estourado" (100% ou mais)
export function nivelDoOrcamento(gasto, limite) {
  if (!(limite > 0)) return null;
  const uso = gasto / limite;
  if (uso >= 1) return "estourado";
  if (uso >= PERTO_DO_LIMITE) return "perto";
  return "ok";
}

// porcentagem inteira sem arredondar para cima (79,9% aparece como 79%)
export function porcentagem(gasto, limite) {
  if (!(limite > 0)) return 0;
  return Math.floor((gasto / limite) * 100 + 1e-9);
}

// Situação de todas as categorias no mês.
// linhas: primeiro as que têm limite (as mais apertadas antes), depois as outras com gasto,
// depois as demais categorias do app.
export function orcamentoDoMes(dados, mes, hoje = hojeISO()) {
  const limites = lerOrcamentos(dados);
  const gastos = Object.fromEntries(resumoDoMes(dados, mes, hoje).categorias);

  const nomes = [...CATEGORIAS];
  for (const nome of [...Object.keys(gastos), ...Object.keys(limites)]) {
    if (!nomes.includes(nome)) nomes.push(nome);
  }

  const linhas = nomes.map((categoria) => {
    const gasto = arredondar(gastos[categoria] || 0);
    const limite = limites[categoria] || null;
    return {
      categoria,
      gasto,
      limite,
      uso: limite ? gasto / limite : 0,
      porcentagem: porcentagem(gasto, limite),
      nivel: nivelDoOrcamento(gasto, limite),
      restante: limite ? arredondar(limite - gasto) : null
    };
  });

  const ordem = (l) => (l.limite ? 0 : l.gasto > 0 ? 1 : 2);
  linhas.sort(
    (a, b) =>
      ordem(a) - ordem(b) ||
      (a.limite && b.limite ? b.uso - a.uso : 0) ||
      (!a.limite && !b.limite ? b.gasto - a.gasto : 0) ||
      nomes.indexOf(a.categoria) - nomes.indexOf(b.categoria)
  );

  const comLimite = linhas.filter((l) => l.limite);
  const totalLimite = arredondar(comLimite.reduce((t, l) => t + l.limite, 0));
  const totalGasto = arredondar(comLimite.reduce((t, l) => t + l.gasto, 0));
  return {
    mes,
    linhas,
    totalLimite,
    totalGasto,
    totalRestante: arredondar(totalLimite - totalGasto),
    estourados: comLimite.filter((l) => l.nivel === "estourado").length,
    perto: comLimite.filter((l) => l.nivel === "perto").length
  };
}
