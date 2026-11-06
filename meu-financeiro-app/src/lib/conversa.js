// Conversa com o Jarvis: a pessoa fala ou escreve do jeito dela (até palavras soltas, como
// "mercado 80 ontem nubank" ou "o uber de ontem foi 25") e a IA do Assistente entende.
//
// Como funciona:
// 1. O app manda para a IA um retrato enxuto dos dados (bancos, cartões, contas, metas, últimos
//    lançamentos com o id de cada um, resumo do mês) e a conversa até aqui.
// 2. A IA devolve { resposta, acoes }: o texto para mostrar/falar e uma lista de ações.
// 3. Cada ação passa por executarAcao (abaixo), que só conhece uma lista fechada de ações e confere
//    tudo (id existe? valor > 0? categoria existe?). A IA nunca mexe nos dados direto.
// 4. Ações que mudam dados só são gravadas depois que a pessoa confirma (toque ou "sim").
//
// executarAcao é uma função pura (dados -> dados): a prévia e a gravação usam a mesma conta.

import { chamarIA, extrairJSON } from "./ia.js";
import { resultadoDaIA } from "./interpretar.js";
import { lancarDaFrase, lancarDoResultado } from "./jarvis.js";
import { resumoParaIA } from "./analise.js";
import { chaveDoNome, listarCategorias } from "./categorias.js";
import { acharBanco, lerBancos, resumoDosBancos, salvarBanco } from "./saldos.js";
import { faturasParaPagar, novoPagamento, resumoDoCartao, RESTANTE_EM_ABERTO } from "./cartao.js";
import { mesesParaPagar, pagarConta, situacaoNoMes } from "./contasFixas.js";
import { comOrcamento, lerOrcamentos } from "./orcamento.js";
import { registrarTransferencia, rotuloDoSubtipo } from "./transferencias.js";
import { TEMAS } from "./aparencia.js";
import { MAXIMO_DE_PARCELAS } from "./lancar.js";
import { arredondar, dataValida, mesDaData, money, nomeMes, parseValor, somarDias, somarMeses } from "./formato.js";

const MAXIMO_DE_ACOES = 8;
const MAXIMO_DE_LANCAMENTOS = 120;
const MAXIMO_DE_COMPRAS = 60;
const DIAS_DE_HISTORICO = 90;
const TURNOS_DA_CONVERSA = 12;

// telas que o Jarvis pode abrir
export const PAGINAS = {
  home: "Início",
  new: "Novo lançamento",
  history: "Histórico",
  bancos: "Bancos",
  cards: "Cartões",
  goals: "Metas",
  reports: "Relatórios",
  bills: "Contas fixas",
  vencimentos: "Vencimentos",
  emprestimos: "Empréstimos",
  orcamentos: "Orçamentos",
  categorias: "Categorias",
  lembretes: "Lembretes",
  investments: "Investimentos",
  patrimony: "Patrimônio",
  assistant: "Assistente",
  temas: "Temas",
  profile: "Perfil",
  settings: "Configurações",
  backup: "Backup e nuvem",
  importar: "Importar planilha"
};

// ---------- utilidades ----------

function lista(v) {
  return Array.isArray(v) ? v : [];
}

function mesmoId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function numero(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  const n = parseValor(v);
  return n == null ? NaN : n;
}

function texto(v, maximo = 80) {
  return typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, maximo) : "";
}

function temCampo(obj, campo) {
  return obj && obj[campo] !== undefined && obj[campo] !== null && obj[campo] !== "";
}

function acharCategoria(dados, nome) {
  if (!nome) return null;
  const chave = chaveDoNome(nome);
  return listarCategorias(dados).find((c) => chaveDoNome(c.nome) === chave)?.nome || null;
}

// banco pelo id ou pelo nome ("nubank", "Carteira")
function acharBancoDaIA(dados, valor) {
  if (valor == null || valor === "") return null;
  const porId = acharBanco(dados, valor);
  if (porId) return porId;
  const chave = chaveDoNome(valor);
  const bancos = lerBancos(dados);
  return bancos.find((b) => chaveDoNome(b.nome) === chave) || bancos.find((b) => chaveDoNome(b.nome).includes(chave)) || null;
}

function acharCartao(dados, valor) {
  const cartoes = lista(dados?.cartoes);
  const porId = cartoes.find((c) => mesmoId(c.id, valor));
  if (porId) return porId;
  const chave = chaveDoNome(valor);
  return chave ? cartoes.find((c) => chaveDoNome(c.nome) === chave) || cartoes.find((c) => chaveDoNome(c.nome).includes(chave)) || null : null;
}

function acharPeloIdOuNome(itens, id, nome) {
  const porId = itens.find((x) => mesmoId(x.id, id));
  if (porId) return porId;
  const chave = chaveDoNome(nome);
  return chave ? itens.find((x) => chaveDoNome(x.nome) === chave) || null : null;
}

function nomeDoTipo(l) {
  if (l.tipo === "entrada") return "receita";
  if (l.tipo === "transferencia") return l.subtipo || "transferencia";
  return "gasto";
}

function quando(data, hoje) {
  if (data === hoje) return "hoje";
  if (data === somarDias(hoje, -1)) return "ontem";
  const [y, m, d] = String(data).split("-");
  return `${d}/${m}${y !== hoje.slice(0, 4) ? `/${y}` : ""}`;
}

// ---------- o que a IA fica sabendo ----------

// Retrato enxuto dos dados para a IA: só nomes, números, datas e ids (sem fotos nem chaves)
export function contextoDaConversa(dados, hoje, perfil = {}, aparencia = null) {
  const mes = mesDaData(hoje);
  const desde = somarDias(hoje, -DIAS_DE_HISTORICO);
  const nomeDoBanco = (id) => lerBancos(dados).find((b) => mesmoId(b.id, id))?.nome || null;

  const lancamentos = lista(dados.lancamentos)
    .filter((l) => l && dataValida(l.data) && l.data >= desde)
    .sort((a, b) => String(b.data).localeCompare(String(a.data)) || Number(b.id) - Number(a.id))
    .slice(0, MAXIMO_DE_LANCAMENTOS)
    .map((l) => {
      const bancos = [...new Set(lista(l.formas).map((f) => nomeDoBanco(f?.bancoId)).filter(Boolean))];
      return {
        id: l.id,
        tipo: nomeDoTipo(l),
        data: l.data,
        descricao: l.descricao,
        valor: Number(l.valor) || 0,
        ...(l.tipo === "transferencia"
          ? { de: nomeDoBanco(l.de) || "fora do app", para: nomeDoBanco(l.para) || "fora do app" }
          : { categoria: l.categoria, forma: l.pagamento || null, ...(bancos.length ? { banco: bancos.join(", ") } : {}) })
      };
    });

  const compras = lista(dados.cartoes)
    .flatMap((c) =>
      lista(c.compras).map((x) => ({
        cartao_id: c.id,
        cartao: c.nome,
        id: x.id,
        data: x.data,
        descricao: x.descricao,
        categoria: x.categoria,
        valor_total: Number(x.valorTotal) || 0,
        parcelas: Number(x.parcelas) || 1
      }))
    )
    .filter((x) => dataValida(x.data) && x.data >= desde)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, MAXIMO_DE_COMPRAS);

  const cartoes = lista(dados.cartoes).map((c) => {
    const r = resumoDoCartao(c, hoje);
    const fatura = (f) => ({ mes: f.mes, valor: f.valor, falta_pagar: f.aPagar, vence: f.vencimento, fecha: f.fechamento });
    return {
      id: c.id,
      nome: c.nome,
      limite: r.limite,
      limite_disponivel: r.disponivel,
      fecha_dia: c.fechamento,
      vence_dia: c.vencimento,
      fatura_atual: fatura(r.faturaAtual),
      faturas_fechadas: r.faturasFechadas.map(fatura)
    };
  });

  const contas = lista(dados.contasFixas)
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const s = situacaoNoMes(c, mes, hoje);
      return {
        id: c.id,
        nome: c.nome,
        valor: Number(c.valor) || 0,
        dia: c.dia,
        categoria: c.categoria,
        ativa: c.ativa !== false,
        este_mes: s.situacao,
        meses_para_pagar: mesesParaPagar(c, hoje).map((x) => x.mes)
      };
    });

  return {
    hoje,
    pessoa: { nome: perfil?.nome || "", apelido: perfil?.apelido || "" },
    categorias_de_gasto: listarCategorias(dados).map((c) => c.nome),
    bancos: resumoDosBancos(dados).bancos.map((b) => ({ id: b.banco.id, nome: b.banco.nome, saldo_atual: b.atual })),
    cartoes,
    contas_fixas: contas,
    metas: lista(dados.metas).map((m) => ({ id: m.id, nome: m.nome, objetivo: Number(m.objetivo) || 0, guardado: Number(m.atual) || 0 })),
    orcamentos_por_categoria: lerOrcamentos(dados),
    resumo_do_mes: resumoParaIA(dados, mes, hoje),
    resumo_do_mes_passado: resumoParaIA(dados, somarMeses(mes, -1), hoje),
    ultimos_lancamentos: lancamentos,
    ultimas_compras_no_cartao: compras,
    investimentos: lista(dados.investimentos).map((i) => ({ nome: i.nome, tipo: i.tipo, investido: Number(i.investido) || 0, atual: Number(i.atual) || 0 })),
    aparencia: aparencia ? { tema: aparencia.tema, modo_escuro: aparencia.escuro } : null,
    temas: TEMAS.map((t) => ({ id: t.id, nome: t.nome })),
    telas: PAGINAS
  };
}

const INSTRUCOES = [
  "Você é o Jarvis, o assistente de voz de um app brasileiro de finanças pessoais chamado Meu Financeiro.",
  "A pessoa fala com você por voz ou texto, do jeito dela: frases soltas, sem verbo, com erros de ditado, gírias ou só palavras (ex.: \"mercado 80 ontem nubank\", \"uber 25\", \"salario caiu 3500\", \"aquele ifood era 42 não 45\", \"paguei a luz\", \"quanto gastei de mercado?\").",
  "Entenda a intenção como uma pessoa entenderia, usando a conversa e os dados abaixo.",
  "",
  "Responda SOMENTE com JSON neste formato:",
  '{"resposta": "texto curto para a pessoa", "acoes": [ ... ]}',
  "",
  "Regras da resposta:",
  "- Português do Brasil, curto e natural (vai ser lido em voz alta): 1 a 3 frases, sem markdown, sem listas, sem emojis.",
  "- Valores como R$ 1.234,56. Use só os números dos dados; para perguntas, faça as contas com eles e não invente nada.",
  "- Quando houver ações, diga em uma frase o que vai fazer (a pessoa vai confirmar na tela). Não diga que já fez.",
  "- Se faltar algo essencial (ex.: o valor) ou houver mais de um item que combina, pergunte e não mande ação.",
  "",
  "Ações possíveis (use exatamente estes nomes de campo; ids vêm dos dados abaixo, nunca invente id):",
  '- {"acao":"lancar","tipo":"gasto|receita|transferencia|saque|deposito","valor":50.0,"descricao":"Mercado","categoria":"uma das categorias_de_gasto (só gasto) ou null","data":"AAAA-MM-DD ou null (hoje)","formas":[{"forma":"Pix|Dinheiro|Débito|Cartão|Transferência","valor":null,"banco":"nome do banco ou null","cartao":"nome do cartão ou null","parcelas":1}],"de":"banco de onde sai (transferência/saque) ou null","para":"banco para onde vai (transferência/depósito) ou null"}',
  '- {"acao":"editar_lancamento","id":123,"valor":25.0,"descricao":"...","categoria":"...","data":"AAAA-MM-DD"} (mande só os campos que mudam)',
  '- {"acao":"apagar_lancamento","id":123}',
  '- {"acao":"editar_compra","cartao_id":1,"id":456,"valor_total":100.0,"parcelas":3,"descricao":"...","categoria":"...","data":"AAAA-MM-DD"} (compra no cartão; só os campos que mudam)',
  '- {"acao":"apagar_compra","cartao_id":1,"id":456}',
  '- {"acao":"pagar_fatura","cartao_id":1,"mes":"AAAA-MM ou null (a mais urgente)","valor":null (tudo o que falta) ou número,"banco":"banco de onde saiu ou null"}',
  '- {"acao":"pagar_conta","conta_id":201,"mes":"AAAA-MM ou null (o mais antigo em aberto)","valor":null (o valor da conta) ou número,"banco":"banco de onde saiu ou null","data":"AAAA-MM-DD ou null"}',
  '- {"acao":"nova_conta","nome":"Luz","valor":150.0,"dia":10,"categoria":"..."} (conta fixa mensal)',
  '- {"acao":"editar_conta","conta_id":201,"nome":"...","valor":0,"dia":10,"categoria":"..."} (só os campos que mudam)',
  '- {"acao":"apagar_conta","conta_id":201}',
  '- {"acao":"nova_meta","nome":"Viagem","objetivo":5000.0,"guardado":0}',
  '- {"acao":"guardar_na_meta","meta_id":1,"valor":200.0} (valor negativo = retirar da meta)',
  '- {"acao":"editar_meta","meta_id":1,"nome":"...","objetivo":0}',
  '- {"acao":"apagar_meta","meta_id":1}',
  '- {"acao":"orcamento","categoria":"Alimentação","limite":800.0} (limite 0 remove o limite da categoria)',
  '- {"acao":"novo_banco","nome":"Inter","saldo":1000.0}',
  '- {"acao":"saldo_banco","banco":"Nubank","saldo":1500.0} (quando a pessoa diz quanto tem AGORA no banco)',
  '- {"acao":"perfil","nome":"...","apelido":"..."} (nome e/ou apelido da pessoa no app)',
  '- {"acao":"tema","tema":"id de um dos temas ou null","escuro":true|false|null}',
  '- {"acao":"abrir","pagina":"uma das chaves de telas"}',
  "",
  "Dicas: valor sozinho com uma palavra (\"padaria 12\") é um gasto. \"caiu\", \"recebi\", \"entrou\", salário = receita.",
  "\"no crédito\", \"no cartão\", \"em 3x\" = forma Cartão. Sem forma de pagamento, use Pix. \"ontem\", \"sexta\", \"dia 5\" viram data a partir de hoje.",
  "Para corrigir ou apagar, ache o item em ultimos_lancamentos ou ultimas_compras_no_cartao (a compra no cartão tem cartao_id).",
  "Várias coisas na mesma frase viram várias ações (no máximo 8)."
].join("\n");

// Conversa: [{ autor: "pessoa" | "jarvis", texto }]
export async function conversarComIA(cfg, conversa, contexto) {
  const historico = conversa
    .slice(-TURNOS_DA_CONVERSA)
    .map((m) => `${m.autor === "pessoa" ? "Pessoa" : "Jarvis"}: ${String(m.texto || "").slice(0, 600)}`)
    .join("\n");
  const pedido = [INSTRUCOES, "", "Dados da pessoa (JSON):", JSON.stringify(contexto), "", "Conversa (a última fala é a que você responde):", historico].join("\n");
  const json = extrairJSON(await chamarIA(cfg, { texto: pedido }));
  return {
    resposta: texto(json.resposta, 600) || "Pronto.",
    acoes: lista(json.acoes).filter((a) => a && typeof a === "object" && typeof a.acao === "string").slice(0, MAXIMO_DE_ACOES)
  };
}

// ---------- ações ----------

// lançamento novo (como o salvarMovimento do App): o gasto/receita e as compras nos cartões
function comMovimento(dados, { lancamento, compras }) {
  return {
    ...dados,
    lancamentos: lancamento ? [...lista(dados.lancamentos), lancamento] : lista(dados.lancamentos),
    cartoes: lista(dados.cartoes).map((c) => {
      const novas = lista(compras).filter((x) => mesmoId(x.cartaoId, c.id)).map((x) => x.compra);
      return novas.length ? { ...c, compras: [...lista(c.compras), ...novas] } : c;
    })
  };
}

// opcoes = { hoje, agora, bancos (resumoDosBancos(...).bancos), bancoPadrao, comPerfil(dados, perfil) }
// Devolve { dados, texto } (texto = o que foi/será feito), { efeito, texto } (tema/abrir) ou { erro }.
export function executarAcao(dados, acao, opcoes) {
  const { hoje, agora } = opcoes;
  const tipo = String(acao?.acao || "");

  switch (tipo) {
    case "lancar": {
      const r = resultadoDaIA(acao, dados, hoje);
      if (!r.entendido) return { erro: "faltou o valor do lançamento" };
      if (r.tipo === "transferencia") {
        const form = { subtipo: r.subtipo, valor: r.valor, descricao: texto(acao.descricao), data: r.data, de: r.de ?? "", para: r.para ?? "" };
        const t = registrarTransferencia(dados, form, agora);
        if (t.erro) return { erro: t.erro };
        return { dados: t.dados, texto: `${form.descricao || rotuloDoSubtipo(r.subtipo)} de ${money(r.valor)} (${quando(r.data, hoje)})` };
      }
      const bancos = resumoDosBancos(dados).bancos;
      const m = lancarDoResultado(r, dados, hoje, bancos, opcoes.bancoPadrao || "", agora);
      if (m.erro) return { erro: m.erro };
      const novo = comMovimento(dados, m);
      const noCartao = lista(m.compras).length ? " no cartão" : "";
      const rotulo = r.tipo === "entrada" ? "Receita" : "Gasto";
      return { dados: novo, texto: `${rotulo}${noCartao}: ${m.resumo} (${quando(r.data, hoje)})` };
    }

    // sem IA: frase simples entendida pelo próprio app
    case "lancar_local": {
      const m = lancarDaFrase(String(acao.frase || ""), dados, hoje, resumoDosBancos(dados).bancos, opcoes.bancoPadrao || "", agora);
      if (m.erro) return { erro: m.erro };
      return { dados: comMovimento(dados, m), texto: `${m.lancamento?.tipo === "entrada" ? "Receita" : "Gasto"}${m.compras?.length ? " no cartão" : ""}: ${m.resumo}` };
    }

    case "editar_lancamento": {
      const l = lista(dados.lancamentos).find((x) => x && mesmoId(x.id, acao.id));
      if (!l) return { erro: "não achei esse lançamento" };
      const novo = { ...l };
      const mudancas = [];
      if (temCampo(acao, "valor")) {
        const v = arredondar(numero(acao.valor));
        if (!(v > 0)) return { erro: "valor inválido" };
        const formas = lista(l.formas);
        if (formas.length > 1) return { erro: `"${l.descricao}" foi pago de várias formas: corrija o valor no Histórico` };
        if (formas.length === 1) novo.formas = [{ ...formas[0], valor: v }];
        novo.valor = v;
        mudancas.push(`valor ${money(Number(l.valor) || 0)} → ${money(v)}`);
      }
      if (temCampo(acao, "descricao")) {
        novo.descricao = texto(acao.descricao) || l.descricao;
        mudancas.push(`descrição "${novo.descricao}"`);
      }
      if (temCampo(acao, "categoria") && l.tipo === "saida") {
        const c = acharCategoria(dados, acao.categoria);
        if (!c) return { erro: `não existe a categoria "${acao.categoria}"` };
        novo.categoria = c;
        mudancas.push(`categoria ${c}`);
      }
      if (temCampo(acao, "data")) {
        if (!dataValida(acao.data)) return { erro: "data inválida" };
        novo.data = acao.data;
        mudancas.push(`data ${quando(acao.data, hoje)}`);
      }
      if (!mudancas.length) return { erro: "não entendi o que mudar" };
      return {
        dados: { ...dados, lancamentos: lista(dados.lancamentos).map((x) => (x === l ? novo : x)) },
        texto: `Corrigir "${l.descricao}": ${mudancas.join(", ")}`
      };
    }

    case "apagar_lancamento": {
      const l = lista(dados.lancamentos).find((x) => x && mesmoId(x.id, acao.id));
      if (!l) return { erro: "não achei esse lançamento" };
      return {
        dados: { ...dados, lancamentos: lista(dados.lancamentos).filter((x) => x !== l) },
        texto: `Apagar "${l.descricao}" de ${money(Number(l.valor) || 0)} (${quando(l.data, hoje)})`
      };
    }

    case "editar_compra":
    case "apagar_compra": {
      const cartao = lista(dados.cartoes).find((c) => lista(c.compras).some((x) => mesmoId(x.id, acao.id)) && (acao.cartao_id == null || mesmoId(c.id, acao.cartao_id)));
      const compra = cartao && lista(cartao.compras).find((x) => mesmoId(x.id, acao.id));
      if (!compra) return { erro: "não achei essa compra no cartão" };
      const trocar = (novaLista) => ({ ...dados, cartoes: lista(dados.cartoes).map((c) => (c === cartao ? { ...c, compras: novaLista } : c)) });
      if (tipo === "apagar_compra") {
        return {
          dados: trocar(lista(cartao.compras).filter((x) => x !== compra)),
          texto: `Apagar a compra "${compra.descricao}" de ${money(Number(compra.valorTotal) || 0)} no ${cartao.nome}`
        };
      }
      const nova = { ...compra };
      const mudancas = [];
      const valor = temCampo(acao, "valor_total") ? acao.valor_total : acao.valor;
      if (valor != null && valor !== "") {
        const v = arredondar(numero(valor));
        if (!(v > 0)) return { erro: "valor inválido" };
        nova.valorTotal = v;
        mudancas.push(`valor ${money(Number(compra.valorTotal) || 0)} → ${money(v)}`);
      }
      if (temCampo(acao, "parcelas")) {
        const p = parseInt(acao.parcelas, 10);
        if (!(p >= 1 && p <= MAXIMO_DE_PARCELAS)) return { erro: `parcelas de 1 a ${MAXIMO_DE_PARCELAS}` };
        nova.parcelas = p;
        mudancas.push(`${p}x`);
      }
      if (temCampo(acao, "descricao")) {
        nova.descricao = texto(acao.descricao) || compra.descricao;
        mudancas.push(`descrição "${nova.descricao}"`);
      }
      if (temCampo(acao, "categoria")) {
        const c = acharCategoria(dados, acao.categoria);
        if (!c) return { erro: `não existe a categoria "${acao.categoria}"` };
        nova.categoria = c;
        mudancas.push(`categoria ${c}`);
      }
      if (temCampo(acao, "data")) {
        if (!dataValida(acao.data)) return { erro: "data inválida" };
        nova.data = acao.data;
        mudancas.push(`data ${quando(acao.data, hoje)}`);
      }
      if (!mudancas.length) return { erro: "não entendi o que mudar" };
      return {
        dados: trocar(lista(cartao.compras).map((x) => (x === compra ? nova : x))),
        texto: `Corrigir a compra "${compra.descricao}" no ${cartao.nome}: ${mudancas.join(", ")}`
      };
    }

    case "pagar_fatura": {
      const cartao = acharCartao(dados, acao.cartao_id ?? acao.cartao);
      if (!cartao) return { erro: "não achei esse cartão" };
      const faturas = faturasParaPagar(resumoDoCartao(cartao, hoje));
      const fatura = acao.mes ? faturas.find((f) => f.mes === acao.mes) : faturas[0];
      if (!fatura) return { erro: `o ${cartao.nome} não tem fatura em aberto para pagar agora` };
      const v = temCampo(acao, "valor") ? arredondar(numero(acao.valor)) : fatura.aPagar;
      if (!(v > 0)) return { erro: "valor inválido" };
      const banco = temCampo(acao, "banco") ? acharBancoDaIA(dados, acao.banco) : null;
      if (temCampo(acao, "banco") && !banco) return { erro: `não achei o banco "${acao.banco}"` };
      const pagamento = novoPagamento(fatura, v, RESTANTE_EM_ABERTO, hoje, agora, banco ? banco.id : null);
      return {
        dados: {
          ...dados,
          cartoes: lista(dados.cartoes).map((c) => (c === cartao ? { ...c, pagamentos: [...lista(c.pagamentos), pagamento] } : c))
        },
        texto: `Pagar ${money(pagamento.valor)} da fatura de ${nomeMes(fatura.mes)} do ${cartao.nome}${banco ? ` com ${banco.nome}` : ""}`
      };
    }

    case "pagar_conta": {
      const conta = acharPeloIdOuNome(lista(dados.contasFixas), acao.conta_id, acao.conta || acao.nome);
      if (!conta) return { erro: "não achei essa conta fixa" };
      const mes = acao.mes || mesesParaPagar(conta, hoje)[0]?.mes;
      if (!mes) return { erro: `${conta.nome} não tem mês em aberto` };
      const valor = temCampo(acao, "valor") ? arredondar(numero(acao.valor)) : situacaoNoMes(conta, mes, hoje).valor;
      const banco = temCampo(acao, "banco") ? acharBancoDaIA(dados, acao.banco) : null;
      if (temCampo(acao, "banco") && !banco) return { erro: `não achei o banco "${acao.banco}"` };
      const data = dataValida(acao.data) ? acao.data : hoje;
      const r = pagarConta(dados, conta.id, { mes, valor, data, bancoId: banco ? banco.id : "" }, agora);
      if (r.erro) return { erro: r.erro };
      return { dados: r.dados, texto: `Marcar ${conta.nome} de ${nomeMes(mes)} como paga (${money(valor)}${banco ? ` com ${banco.nome}` : ""})` };
    }

    case "nova_conta":
    case "editar_conta": {
      const contas = lista(dados.contasFixas);
      const conta = tipo === "editar_conta" ? acharPeloIdOuNome(contas, acao.conta_id, acao.conta) : null;
      if (tipo === "editar_conta" && !conta) return { erro: "não achei essa conta fixa" };
      const nome = temCampo(acao, "nome") ? texto(acao.nome, 60) : conta?.nome;
      const valor = temCampo(acao, "valor") ? arredondar(numero(acao.valor)) : Number(conta?.valor);
      const dia = temCampo(acao, "dia") ? parseInt(acao.dia, 10) : parseInt(conta?.dia, 10);
      const categoria = temCampo(acao, "categoria") ? acharCategoria(dados, acao.categoria) : conta?.categoria || "Outros";
      if (!nome) return { erro: "faltou o nome da conta" };
      if (!(valor > 0)) return { erro: "faltou o valor da conta" };
      if (!(dia >= 1 && dia <= 31)) return { erro: "dia de vencimento de 1 a 31" };
      if (!categoria) return { erro: `não existe a categoria "${acao.categoria}"` };
      if (conta) {
        return {
          dados: { ...dados, contasFixas: contas.map((c) => (c === conta ? { ...c, nome, valor, dia, categoria } : c)) },
          texto: `Mudar a conta ${conta.nome}: ${nome}, ${money(valor)} todo dia ${dia}, ${categoria}`
        };
      }
      const nova = { id: agora, nome, valor, dia, categoria, ativa: true, periodos: [{ inicio: mesDaData(hoje), fim: null }] };
      return { dados: { ...dados, contasFixas: [...contas, nova] }, texto: `Nova conta fixa ${nome}: ${money(valor)} todo dia ${dia} (${categoria})` };
    }

    case "apagar_conta": {
      const conta = acharPeloIdOuNome(lista(dados.contasFixas), acao.conta_id, acao.conta);
      if (!conta) return { erro: "não achei essa conta fixa" };
      // como na tela Contas fixas: pagamentos feitos com dinheiro dos bancos continuam descontados
      const base = opcoes.guardarPagamentosDaConta ? opcoes.guardarPagamentosDaConta(dados, conta.id) : dados;
      return { dados: { ...base, contasFixas: lista(base.contasFixas).filter((c) => !mesmoId(c.id, conta.id)) }, texto: `Excluir a conta fixa ${conta.nome}` };
    }

    case "nova_meta": {
      const nome = texto(acao.nome, 60);
      const objetivo = arredondar(numero(acao.objetivo));
      const guardado = temCampo(acao, "guardado") ? arredondar(numero(acao.guardado)) : 0;
      if (!nome) return { erro: "faltou o nome da meta" };
      if (!(objetivo > 0)) return { erro: "faltou o valor da meta" };
      if (!(guardado >= 0)) return { erro: "valor guardado inválido" };
      return {
        dados: { ...dados, metas: [...lista(dados.metas), { id: agora, nome, objetivo, atual: guardado, historico: [] }] },
        texto: `Nova meta ${nome}: ${money(objetivo)}${guardado ? ` (já com ${money(guardado)})` : ""}`
      };
    }

    case "guardar_na_meta":
    case "editar_meta":
    case "apagar_meta": {
      const meta = acharPeloIdOuNome(lista(dados.metas), acao.meta_id, acao.meta);
      if (!meta) return { erro: "não achei essa meta" };
      const trocar = (nova) => ({ ...dados, metas: lista(dados.metas).map((m) => (m === meta ? nova : m)) });
      if (tipo === "apagar_meta") return { dados: { ...dados, metas: lista(dados.metas).filter((m) => m !== meta) }, texto: `Excluir a meta ${meta.nome}` };
      if (tipo === "editar_meta") {
        const nome = temCampo(acao, "nome") ? texto(acao.nome, 60) : meta.nome;
        const objetivo = temCampo(acao, "objetivo") ? arredondar(numero(acao.objetivo)) : Number(meta.objetivo);
        if (!nome || !(objetivo > 0)) return { erro: "nome ou valor da meta inválido" };
        return { dados: trocar({ ...meta, nome, objetivo }), texto: `Mudar a meta ${meta.nome}: ${nome}, objetivo ${money(objetivo)}` };
      }
      const v = arredondar(numero(acao.valor));
      if (!Number.isFinite(v) || v === 0) return { erro: "valor inválido" };
      const atual = arredondar(Number(meta.atual || 0) + v);
      if (atual < 0) return { erro: `a meta ${meta.nome} só tem ${money(Number(meta.atual) || 0)}` };
      return {
        dados: trocar({ ...meta, atual, historico: [...lista(meta.historico), { id: agora, data: hoje, valor: v }] }),
        texto: `${v > 0 ? "Guardar" : "Retirar"} ${money(Math.abs(v))} ${v > 0 ? "na" : "da"} meta ${meta.nome} (fica ${money(atual)})`
      };
    }

    case "orcamento": {
      const categoria = acharCategoria(dados, acao.categoria);
      if (!categoria) return { erro: `não existe a categoria "${acao.categoria}"` };
      const limite = arredondar(numero(acao.limite));
      if (!(limite >= 0)) return { erro: "limite inválido" };
      return {
        dados: comOrcamento(dados, categoria, limite),
        texto: limite > 0 ? `Limite de ${money(limite)} por mês para ${categoria}` : `Tirar o limite de ${categoria}`
      };
    }

    case "novo_banco": {
      const nome = texto(acao.nome, 40);
      const saldo = temCampo(acao, "saldo") ? arredondar(numero(acao.saldo)) : 0;
      if (!nome) return { erro: "faltou o nome do banco" };
      if (!Number.isFinite(saldo)) return { erro: "saldo inválido" };
      if (lerBancos(dados).some((b) => chaveDoNome(b.nome) === chaveDoNome(nome))) return { erro: `o banco ${nome} já existe` };
      return { dados: salvarBanco(dados, { id: null, nome, saldo }, agora), texto: `Novo banco ${nome} com ${money(saldo)}` };
    }

    case "saldo_banco": {
      const banco = acharBancoDaIA(dados, acao.banco_id ?? acao.banco);
      if (!banco) return { erro: `não achei o banco "${acao.banco ?? ""}"` };
      const saldo = arredondar(numero(acao.saldo));
      if (!Number.isFinite(saldo)) return { erro: "saldo inválido" };
      return { dados: salvarBanco(dados, { id: banco.id, nome: banco.nome, saldo }, agora), texto: `Ajustar o saldo do ${banco.nome} para ${money(saldo)}` };
    }

    case "perfil": {
      if (!opcoes.comPerfil) return { erro: "não consigo mudar o perfil agora" };
      const perfil = {};
      if (temCampo(acao, "nome")) perfil.nome = texto(acao.nome, 80);
      if (temCampo(acao, "apelido")) perfil.apelido = texto(acao.apelido, 30);
      if (!perfil.nome && perfil.apelido === undefined) return { erro: "não entendi o nome" };
      const partes = [perfil.nome && `nome "${perfil.nome}"`, perfil.apelido !== undefined && `apelido "${perfil.apelido}"`].filter(Boolean);
      return { dados: opcoes.comPerfil(dados, perfil), texto: `Mudar o perfil: ${partes.join(", ")}` };
    }

    case "tema": {
      const efeito = {};
      if (acao.tema && TEMAS.some((t) => t.id === acao.tema)) efeito.tema = acao.tema;
      if (typeof acao.escuro === "boolean") efeito.escuro = acao.escuro;
      if (!Object.keys(efeito).length) return { erro: "não achei esse tema" };
      const nome = efeito.tema ? TEMAS.find((t) => t.id === efeito.tema).nome : "";
      const modo = efeito.escuro === undefined ? "" : efeito.escuro ? "modo escuro" : "modo claro";
      return { efeito: { tipo: "tema", ...efeito }, texto: `Tema: ${[nome, modo].filter(Boolean).join(", ")}` };
    }

    case "abrir": {
      if (!PAGINAS[acao.pagina]) return { erro: "não conheço essa tela" };
      return { efeito: { tipo: "abrir", pagina: acao.pagina }, texto: `Abrir ${PAGINAS[acao.pagina]}` };
    }

    default:
      return { erro: `não sei fazer "${tipo}"` };
  }
}

// Passa as ações em sequência sobre os dados. Devolve { dados, itens: [{ texto, erro?, efeito? }], mudou }.
// O mesmo "agora" na prévia e na gravação gera os mesmos ids.
export function executarAcoes(dados, acoes, opcoes) {
  let atual = dados;
  let mudou = false;
  const itens = [];
  acoes.forEach((acao, i) => {
    let r;
    try {
      r = executarAcao(atual, acao, { ...opcoes, agora: opcoes.agora + i * 100 });
    } catch {
      r = { erro: "deu um erro ao preparar esta ação" };
    }
    if (r.erro) {
      itens.push({ texto: `Não deu: ${r.erro}.`, erro: true });
      return;
    }
    if (r.dados) {
      atual = r.dados;
      mudou = true;
    }
    itens.push({ texto: r.texto, ...(r.efeito ? { efeito: r.efeito } : {}) });
  });
  return { dados: atual, itens, mudou };
}

// "sim", "pode", "confirma" / "não", "cancela" enquanto há ações esperando confirmação
export function respostaCurta(frase) {
  const t = chaveDoNome(frase).replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!t || t.split(" ").length > 4) return null;
  if (/^(sim|s|isso|isso mesmo|pode|pode sim|pode ser|confirma|confirmar|confirmo|ok|okay|beleza|manda|manda ver|faz|faz isso|certo|correto|claro|bora|vai|salva|salvar|grava)( sim| ai| isso| por favor| jarvis)*$/.test(t)) return "sim";
  if (/^(nao|n|cancela|cancelar|esquece|deixa|deixa pra la|para|pare|errado|nada)( nao| isso| por favor| jarvis)*$/.test(t)) return "nao";
  return null;
}
