// Transferência entre bancos, saque e depósito.
//
// Não são gasto nem receita: só mudam o saldo dos bancos. Ficam na lista de lançamentos
// (aparecem no Histórico e podem ser excluídas), com tipo "transferencia":
//   { id, tipo: "transferencia", subtipo: "transferencia" | "saque" | "deposito",
//     descricao, valor, data, de: bancoId | null, para: bancoId | null, criadoEm }
// "de" ou "para" vazio (null) = dinheiro que não está em nenhum banco do app
// (ex.: saque que a pessoa não quer acompanhar; depósito de um dinheiro que não estava anotado).
//
// A "Carteira" é um banco como outro qualquer (a pessoa cadastra, ou o app cria na hora do
// primeiro saque/depósito): é onde fica o dinheiro em espécie.

import { arredondar, dataValida } from "./formato.js";
import { lerBancos } from "./saldos.js";

export const TIPO_TRANSFERENCIA = "transferencia";
export const SUBTIPOS = ["transferencia", "saque", "deposito"];

// valor especial nos formulários: "criar a Carteira agora"
export const CRIAR_CARTEIRA = "__carteira__";
export const NOME_DA_CARTEIRA = "Carteira";

export function ehTransferencia(l) {
  return Boolean(l) && l.tipo === TIPO_TRANSFERENCIA;
}

export function acharCarteira(dados) {
  const chave = (t) =>
    String(t || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  return lerBancos(dados).find((b) => chave(b.nome) === "carteira") || null;
}

export const ROTULO_DO_SUBTIPO = { transferencia: "Transferência", saque: "Saque", deposito: "Depósito" };

export function rotuloDoSubtipo(subtipo) {
  return ROTULO_DO_SUBTIPO[subtipo] || ROTULO_DO_SUBTIPO.transferencia;
}

function nomeDoBanco(dados, id, vazio) {
  if (id == null || id === "") return vazio;
  const banco = lerBancos(dados).find((b) => String(b.id) === String(id));
  return banco ? banco.nome : "banco excluído";
}

// "Nubank → Caixa", "Nubank → fora do app", "fora do app → Caixa"
export function caminhoDaTransferencia(dados, l) {
  return `${nomeDoBanco(dados, l.de, "fora do app")} → ${nomeDoBanco(dados, l.para, "fora do app")}`;
}

// Monta o lançamento a partir do formulário. Devolve { erro } ou { lancamento, criarCarteira }.
// form = { subtipo, valor, descricao?, data, de, para }  (de/para: id do banco, "" para fora do app,
// ou CRIAR_CARTEIRA)
export function montarTransferencia(form, dados, agora = Date.now()) {
  const valor = arredondar(Number(form.valor) || 0);
  if (!(valor > 0)) return { erro: "Informe um valor maior que zero (ex.: 150,00)." };
  if (!dataValida(form.data)) return { erro: "Informe a data." };
  const subtipo = SUBTIPOS.includes(form.subtipo) ? form.subtipo : "transferencia";

  const bancos = lerBancos(dados);
  const existe = (id) => bancos.some((b) => String(b.id) === String(id));
  const limpar = (v) => {
    if (v === CRIAR_CARTEIRA) return acharCarteira(dados)?.id ?? CRIAR_CARTEIRA;
    if (v == null || v === "") return null;
    return existe(v) ? v : undefined;
  };
  const de = limpar(form.de);
  const para = limpar(form.para);
  if (de === undefined || para === undefined) return { erro: "Esse banco não existe mais. Escolha outro." };
  if (de === null && para === null) return { erro: "Escolha pelo menos um banco." };
  if (de !== null && para !== null && de !== CRIAR_CARTEIRA && para !== CRIAR_CARTEIRA && String(de) === String(para)) {
    return { erro: "Escolha bancos diferentes para tirar e colocar o dinheiro." };
  }
  if (subtipo === "transferencia" && (de === null || para === null)) {
    return { erro: "Na transferência, escolha de qual banco sai e para qual vai." };
  }

  const descricao = String(form.descricao || "").trim() || rotuloDoSubtipo(subtipo);
  return {
    criarCarteira: de === CRIAR_CARTEIRA || para === CRIAR_CARTEIRA,
    lancamento: {
      id: agora,
      tipo: TIPO_TRANSFERENCIA,
      subtipo,
      descricao,
      valor,
      data: form.data,
      de,
      para,
      criadoEm: agora
    }
  };
}

// Grava a transferência nos dados (criando a Carteira se for preciso). Devolve { erro } ou { dados, lancamento }.
export function registrarTransferencia(dados, form, agora = Date.now()) {
  const r = montarTransferencia(form, dados, agora);
  if (r.erro) return r;
  let base = dados;
  let { lancamento } = r;
  if (r.criarCarteira) {
    // a Carteira nasce um instante antes da transferência, para a transferência já contar no saldo dela
    const carteira = { id: agora - 1, nome: NOME_DA_CARTEIRA, saldo: 0, ajustadoEm: agora - 1 };
    base = { ...dados, usuario: { ...(dados.usuario || {}), bancos: [...lerBancos(dados), carteira] } };
    lancamento = {
      ...lancamento,
      de: lancamento.de === CRIAR_CARTEIRA ? carteira.id : lancamento.de,
      para: lancamento.para === CRIAR_CARTEIRA ? carteira.id : lancamento.para
    };
  }
  return {
    dados: { ...base, lancamentos: [...(Array.isArray(base.lancamentos) ? base.lancamentos : []), lancamento] },
    lancamento
  };
}
