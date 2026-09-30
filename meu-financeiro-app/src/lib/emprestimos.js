// Empréstimos: o que a pessoa pegou emprestado (banco, consignado, financiamento ou alguém)
// e o que ela emprestou para alguém.
//
// Ficam em usuario.emprestimos, junto do perfil, como os bancos e as categorias: assim um aparelho
// que ainda está numa versão anterior do app não apaga a lista ao sincronizar.
//   { id, tipo: "peguei" | "emprestei", descricao, pessoa, valor, data, forma: "parcelado" | "livre",
//     parcelas, valorParcela, primeiroVencimento,   -> em parcelas (os valores do contrato)
//     total, prazo,                                 -> sem parcelas: quanto volta e até quando (opcional)
//     observacao, pagamentos: [{ id, data, valor, parcela?, anterior? }], criadoEm }
// "valor" é quanto a pessoa recebeu (peguei) ou entregou (emprestei); os juros são a diferença entre
// o total que volta e esse valor. "anterior" marca o que já tinha sido pago antes do cadastro.
// Nesta versão os empréstimos ficam só nesta tela: não entram no Meu mês, nos bancos nem no patrimônio.

import {
  arredondar,
  dataValida,
  diasNoMes,
  hojeISO,
  lerData,
  lerMes,
  mesDaData,
  money,
  montarData,
  parseValor,
  somarMeses
} from "./formato.js";

export const TIPOS_DE_EMPRESTIMO = ["peguei", "emprestei"];
export const FORMAS_DE_PAGAR = ["parcelado", "livre"];
// 35 anos de parcelas mensais (cobre financiamento de imóvel)
export const MAXIMO_DE_PARCELAS_DO_EMPRESTIMO = 420;

function lista(v) {
  return Array.isArray(v) ? v : [];
}

function numero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function limparTexto(v, maximo) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maximo);
}

// ---------- leitura ----------

export function lerEmprestimos(dados) {
  return lista(dados?.usuario?.emprestimos).filter(
    (e) => e && typeof e === "object" && e.id != null && TIPOS_DE_EMPRESTIMO.includes(e.tipo)
  );
}

export function acharEmprestimo(dados, id) {
  return lerEmprestimos(dados).find((e) => String(e.id) === String(id)) || null;
}

export function pagamentosDoEmprestimo(emp) {
  return lista(emp?.pagamentos).filter((p) => p && typeof p === "object" && p.id != null && numero(p.valor) > 0);
}

// Vencimento da parcela n (1, 2, 3...): o mesmo dia do 1º vencimento, nos meses seguintes
// (dia 31 num mês de 30 dias vira dia 30; em fevereiro, 28 ou 29)
export function vencimentoDaParcela(emp, n) {
  const { d } = lerData(emp.primeiroVencimento);
  const { y, m } = lerMes(somarMeses(mesDaData(emp.primeiroVencimento), n - 1));
  return montarData(y, m, Math.min(d, diasNoMes(y, m)));
}

// Cada parcela com a situação: "paga" | "atrasada" (venceu e não foi paga) | "hoje" | "aberta"
export function parcelasDoEmprestimo(emp, hoje = hojeISO()) {
  if (emp?.forma !== "parcelado" || !dataValida(emp.primeiroVencimento)) return [];
  const quantidade = Math.max(0, Math.min(MAXIMO_DE_PARCELAS_DO_EMPRESTIMO, parseInt(emp.parcelas, 10) || 0));
  const pagamentos = pagamentosDoEmprestimo(emp);
  const valor = arredondar(numero(emp.valorParcela));
  return Array.from({ length: quantidade }, (_, i) => {
    const n = i + 1;
    const vence = vencimentoDaParcela(emp, n);
    const pagamento = pagamentos.find((p) => Number(p.parcela) === n) || null;
    const situacao = pagamento ? "paga" : vence < hoje ? "atrasada" : vence === hoje ? "hoje" : "aberta";
    return { numero: n, vence, valor, pagamento, situacao };
  });
}

// Números de um empréstimo:
//   { total (o que volta), pago, falta, juros, pagas, quantidade, proxima, atrasadas, desde, situacao, progresso }
// situacao: "quitado" | "atrasado" | "hoje" (vence hoje) | "em-dia"
// "proxima": a próxima parcela em aberto ({ numero, vence, valor }) ou, sem parcelas, a data combinada.
// "desde": vencimento mais antigo que está atrasado.
export function resumoDoEmprestimo(emp, hoje = hojeISO()) {
  const valor = arredondar(numero(emp?.valor));
  const pago = arredondar(pagamentosDoEmprestimo(emp).reduce((t, p) => t + numero(p.valor), 0));

  if (emp?.forma === "parcelado") {
    const parcelas = parcelasDoEmprestimo(emp, hoje);
    const abertas = parcelas.filter((p) => p.situacao !== "paga");
    const total = arredondar(parcelas.reduce((t, p) => t + p.valor, 0));
    const falta = arredondar(abertas.reduce((t, p) => t + p.valor, 0));
    const atrasadas = abertas.filter((p) => p.situacao === "atrasada");
    const proxima = abertas[0] || null;
    const situacao = !abertas.length ? "quitado" : atrasadas.length ? "atrasado" : proxima.situacao === "hoje" ? "hoje" : "em-dia";
    return {
      total,
      pago,
      falta,
      juros: arredondar(Math.max(0, total - valor)),
      pagas: parcelas.length - abertas.length,
      quantidade: parcelas.length,
      proxima: proxima ? { numero: proxima.numero, vence: proxima.vence, valor: proxima.valor } : null,
      atrasadas: atrasadas.length,
      desde: atrasadas.length ? atrasadas[0].vence : "",
      situacao,
      progresso: total > 0 ? Math.min(1, (total - falta) / total) : 0
    };
  }

  // sem parcelas: vai pagando quando puder
  const total = arredondar(numero(emp?.total) > 0 ? numero(emp.total) : valor);
  const falta = arredondar(Math.max(0, total - pago));
  const prazo = dataValida(emp?.prazo) ? emp.prazo : "";
  const quitado = falta <= 0;
  const situacao = quitado ? "quitado" : prazo && prazo < hoje ? "atrasado" : prazo && prazo === hoje ? "hoje" : "em-dia";
  return {
    total,
    pago,
    falta,
    juros: arredondar(Math.max(0, total - valor)),
    pagas: 0,
    quantidade: 0,
    proxima: !quitado && prazo ? { numero: null, vence: prazo, valor: falta } : null,
    atrasadas: situacao === "atrasado" ? 1 : 0,
    desde: situacao === "atrasado" ? prazo : "",
    situacao,
    progresso: total > 0 ? Math.min(1, pago / total) : 0
  };
}

// Primeiro os em aberto (atrasados e os que vencem antes na frente), depois os quitados (os mais novos primeiro)
function ordem(a, b) {
  const qa = a.resumo.situacao === "quitado";
  const qb = b.resumo.situacao === "quitado";
  if (qa !== qb) return qa ? 1 : -1;
  if (!qa) {
    const va = a.resumo.desde || a.resumo.proxima?.vence || "9999-12-31";
    const vb = b.resumo.desde || b.resumo.proxima?.vence || "9999-12-31";
    return va.localeCompare(vb) || Number(a.emprestimo.id) - Number(b.emprestimo.id);
  }
  return String(b.emprestimo.data).localeCompare(String(a.emprestimo.data)) || Number(b.emprestimo.id) - Number(a.emprestimo.id);
}

// Totais da tela: quanto você deve (o que falta pagar do que pegou) e quanto te devem (o que falta receber)
export function resumoDosEmprestimos(dados, hoje = hojeISO()) {
  const itens = lerEmprestimos(dados)
    .map((emprestimo) => ({ emprestimo, resumo: resumoDoEmprestimo(emprestimo, hoje) }))
    .sort(ordem);
  const doTipo = (tipo) => {
    const deste = itens.filter((i) => i.emprestimo.tipo === tipo);
    return {
      itens: deste,
      falta: arredondar(deste.reduce((t, i) => t + i.resumo.falta, 0)),
      abertos: deste.filter((i) => i.resumo.situacao !== "quitado").length,
      atrasados: deste.filter((i) => i.resumo.situacao === "atrasado")
    };
  };
  return { peguei: doTipo("peguei"), emprestei: doTipo("emprestei") };
}

// Nome para mostrar: a descrição, ou "com quem" quando não tem descrição
export function nomeDoEmprestimo(emp) {
  return limparTexto(emp?.descricao, 60) || limparTexto(emp?.pessoa, 60) || "Empréstimo";
}

// ---------- formulário ----------

// Confere o formulário. Devolve { erro } ou { emprestimo } (sem id, pagamentos e criadoEm).
// atual: o empréstimo que está sendo editado (null para um novo)
export function montarEmprestimo(form, atual = null) {
  const tipo = TIPOS_DE_EMPRESTIMO.includes(form.tipo) ? form.tipo : "peguei";
  const peguei = tipo === "peguei";
  const pessoa = limparTexto(form.pessoa, 200);
  const descricao = limparTexto(form.descricao, 200);
  const valor = parseValor(form.valor);
  const forma = FORMAS_DE_PAGAR.includes(form.forma) ? form.forma : "parcelado";
  const pagamentos = pagamentosDoEmprestimo(atual);

  if (!pessoa) return { erro: peguei ? "Informe com quem você pegou (banco, empresa ou pessoa)." : "Informe para quem você emprestou." };
  if (pessoa.length > 60) return { erro: "Use um nome mais curto em \"com quem\" (até 60 letras)." };
  if (descricao.length > 60) return { erro: "Use uma descrição mais curta (até 60 letras)." };
  if (!(valor > 0)) return { erro: peguei ? "Informe quanto você recebeu (ex.: 5.000,00)." : "Informe quanto você emprestou (ex.: 500,00)." };
  if (!dataValida(form.data)) return { erro: "Informe a data do empréstimo." };
  if (atual && pagamentos.length && FORMAS_DE_PAGAR.includes(atual.forma) && atual.forma !== forma) {
    return { erro: "Este empréstimo já tem pagamentos. Para mudar a forma de pagar, desfaça os pagamentos no histórico antes." };
  }

  const base = { tipo, descricao, pessoa, valor, data: form.data, forma, observacao: limparTexto(form.observacao, 200) };

  if (forma === "parcelado") {
    const texto = String(form.parcelas ?? "").trim();
    const parcelas = /^\d+$/.test(texto) ? parseInt(texto, 10) : NaN;
    const valorParcela = parseValor(form.valorParcela);
    if (!(parcelas >= 1 && parcelas <= MAXIMO_DE_PARCELAS_DO_EMPRESTIMO)) {
      return { erro: `Informe o número de parcelas (de 1 a ${MAXIMO_DE_PARCELAS_DO_EMPRESTIMO}).` };
    }
    if (!(valorParcela > 0)) return { erro: "Informe o valor de cada parcela, como está no contrato." };
    if (!dataValida(form.primeiroVencimento)) return { erro: "Informe a data do 1º vencimento." };
    if (form.primeiroVencimento < form.data) return { erro: "O 1º vencimento não pode ser antes da data do empréstimo." };
    const maiorPaga = pagamentos.reduce((m, p) => Math.max(m, Number(p.parcela) || 0), 0);
    if (maiorPaga > parcelas) {
      return { erro: `A parcela ${maiorPaga} já está paga: o número de parcelas não pode ser menor que ${maiorPaga}.` };
    }
    return { emprestimo: { ...base, parcelas, valorParcela, primeiroVencimento: form.primeiroVencimento } };
  }

  const textoTotal = String(form.total ?? "").trim();
  const total = textoTotal ? parseValor(textoTotal) : valor;
  if (!(total > 0)) return { erro: "Informe o total a devolver (ou deixe em branco se for o mesmo valor)." };
  const prazo = String(form.prazo || "").trim();
  if (prazo && !dataValida(prazo)) return { erro: "Data combinada inválida." };
  if (prazo && prazo < form.data) return { erro: "A data combinada não pode ser antes da data do empréstimo." };
  const jaPago = arredondar(pagamentos.reduce((t, p) => t + numero(p.valor), 0));
  if (total < jaPago) return { erro: `Já foram pagos ${money(jaPago)}: o total não pode ser menor que isso.` };
  return { emprestimo: { ...base, total, prazo } };
}

// O que já tinha sido pago antes de cadastrar (só no cadastro de um empréstimo novo):
// em parcelas, as primeiras N parcelas (pagas no vencimento de cada uma); sem parcelas, um valor.
function pagamentosAnteriores(emprestimo, form, hoje, agora) {
  if (emprestimo.forma === "parcelado") {
    const texto = String(form.jaPagas ?? "").trim();
    if (!texto) return { pagamentos: [] };
    const n = /^\d+$/.test(texto) ? parseInt(texto, 10) : NaN;
    if (!(n >= 0 && n <= emprestimo.parcelas)) {
      return { erro: `Parcelas já pagas: informe um número de 0 a ${emprestimo.parcelas}.` };
    }
    return {
      pagamentos: Array.from({ length: n }, (_, i) => ({
        id: agora + i + 1,
        data: vencimentoDaParcela(emprestimo, i + 1),
        valor: emprestimo.valorParcela,
        parcela: i + 1,
        anterior: true
      }))
    };
  }
  const texto = String(form.jaPago ?? "").trim();
  if (!texto) return { pagamentos: [] };
  const v = parseValor(texto);
  if (!(v >= 0)) return { erro: "Informe quanto já foi pago (ou deixe em branco)." };
  if (v === 0) return { pagamentos: [] };
  if (v > emprestimo.total) return { erro: `O que já foi pago não pode passar do total (${money(emprestimo.total)}).` };
  return { pagamentos: [{ id: agora + 1, data: hoje, valor: v, anterior: true }] };
}

// ---------- escrita ----------

function comLista(dados, emprestimos) {
  return { ...dados, usuario: { ...(dados.usuario || {}), emprestimos } };
}

// a lista como está guardada (inclusive itens que esta versão não entende, para não apagar nada)
function listaGuardada(dados) {
  return lista(dados?.usuario?.emprestimos);
}

// Empréstimo novo (form.id vazio) ou edição. Devolve { erro } ou { dados, emprestimo }.
export function salvarEmprestimo(dados, form, agora = Date.now(), hoje = hojeISO()) {
  const editando = form.id != null && form.id !== "";
  const atual = editando ? acharEmprestimo(dados, form.id) : null;
  if (editando && !atual) return { erro: "Este empréstimo não existe mais." };

  const r = montarEmprestimo(form, atual);
  if (r.erro) return r;

  if (atual) {
    const emprestimo = { id: atual.id, ...r.emprestimo, pagamentos: lista(atual.pagamentos), criadoEm: atual.criadoEm || Number(atual.id) || agora };
    return {
      dados: comLista(dados, listaGuardada(dados).map((e) => (e && String(e.id) === String(atual.id) ? emprestimo : e))),
      emprestimo
    };
  }

  const anteriores = pagamentosAnteriores(r.emprestimo, form, hoje, agora);
  if (anteriores.erro) return anteriores;
  const emprestimo = { id: agora, ...r.emprestimo, pagamentos: anteriores.pagamentos, criadoEm: agora };
  return { dados: comLista(dados, [...listaGuardada(dados), emprestimo]), emprestimo };
}

export function excluirEmprestimo(dados, id) {
  if (!acharEmprestimo(dados, id)) return { erro: "Este empréstimo não existe mais." };
  return { dados: comLista(dados, listaGuardada(dados).filter((e) => !(e && String(e.id) === String(id)))) };
}

// Valor que a janela de pagamento já traz preenchido
export function valorSugerido(emp, hoje = hojeISO()) {
  const r = resumoDoEmprestimo(emp, hoje);
  if (r.situacao === "quitado") return 0;
  return emp.forma === "parcelado" ? r.proxima.valor : r.falta;
}

// Pagamento novo. Em parcelas: paga a parcela em aberto mais antiga. Sem parcelas: abate do que falta.
// Devolve { erro } ou { dados, pagamento }.
export function registrarPagamento(dados, id, { valor, data }, agora = Date.now()) {
  const emp = acharEmprestimo(dados, id);
  if (!emp) return { erro: "Este empréstimo não existe mais." };
  const v = parseValor(valor);
  if (!(v > 0)) return { erro: "Informe um valor maior que zero." };
  if (!dataValida(data)) return { erro: "Informe a data." };
  const r = resumoDoEmprestimo(emp, data);
  if (r.situacao === "quitado") return { erro: "Este empréstimo já está quitado." };
  if (emp.forma !== "parcelado" && v > r.falta + 0.004) return { erro: `Falta só ${money(r.falta)}.` };

  const pagamento = { id: agora, data, valor: v, ...(emp.forma === "parcelado" ? { parcela: r.proxima.numero } : {}) };
  return {
    dados: comLista(
      dados,
      listaGuardada(dados).map((e) =>
        e && String(e.id) === String(id) ? { ...e, pagamentos: [...lista(e.pagamentos), pagamento] } : e
      )
    ),
    pagamento
  };
}

// Desfaz um pagamento (a parcela volta a ficar em aberto)
export function desfazerPagamento(dados, id, pagamentoId) {
  const emp = acharEmprestimo(dados, id);
  if (!emp) return { erro: "Este empréstimo não existe mais." };
  if (!lista(emp.pagamentos).some((p) => p && String(p.id) === String(pagamentoId))) {
    return { erro: "Este pagamento já foi desfeito." };
  }
  return {
    dados: comLista(
      dados,
      listaGuardada(dados).map((e) =>
        e && String(e.id) === String(id)
          ? { ...e, pagamentos: lista(e.pagamentos).filter((p) => !(p && String(p.id) === String(pagamentoId))) }
          : e
      )
    )
  };
}
