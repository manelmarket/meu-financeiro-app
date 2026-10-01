// Bancos: quanto a pessoa tem disponível em cada banco.
//
// Os bancos ficam em usuario.bancos (junto do perfil: assim um aparelho que ainda está na versão
// anterior do app não apaga a lista ao sincronizar):
//   { id, nome, saldo, ajustadoEm }
// "saldo" é o valor que a pessoa informou e "ajustadoEm" o momento em que informou (milissegundos).
//
// Saldo de agora = saldo informado + o que foi lançado DEPOIS disso com esse banco:
//   receitas (+), gastos (−), pagamentos de fatura de cartão (−) e de contas fixas (−).
// Como o saldo é calculado, ele fica igual em todos os aparelhos e, se um lançamento for excluído,
// o valor volta para o banco sozinho.

import { arredondar, nomeMes } from "./formato.js";

// Transferência entre bancos, saque e depósito (ver lib/transferencias.js): mexem no saldo,
// mas não são gasto nem receita.
const ROTULO_TRANSFERENCIA = { transferencia: "Transferência", saque: "Saque", deposito: "Depósito" };

export function lerBancos(dados) {
  const lista = dados?.usuario?.bancos;
  return Array.isArray(lista) ? lista.filter((b) => b && typeof b === "object" && b.id != null) : [];
}

export function acharBanco(dados, id) {
  if (id == null || id === "") return null;
  return lerBancos(dados).find((b) => String(b.id) === String(id)) || null;
}

function mesmoBanco(bancoId, id) {
  return bancoId != null && bancoId !== "" && String(bancoId) === id;
}

// Movimentações que mexem no saldo do banco depois do último valor informado (mais nova primeiro)
export function movimentosDoBanco(dados, banco) {
  const desde = Number(banco.ajustadoEm) || 0;
  const id = String(banco.id);
  const lista = [];

  for (const l of Array.isArray(dados?.lancamentos) ? dados.lancamentos : []) {
    if (!l) continue;
    const quando = Number(l.criadoEm) || Number(l.id) || 0;
    if (quando <= desde) continue;

    // transferência entre bancos, saque ou depósito: sai de um banco e/ou entra no outro
    if (l.tipo === "transferencia") {
      const valor = arredondar(Number(l.valor) || 0);
      if (!(valor > 0)) continue;
      const forma = ROTULO_TRANSFERENCIA[l.subtipo] || ROTULO_TRANSFERENCIA.transferencia;
      const outro = (bid, vazio) => {
        if (bid == null || bid === "") return vazio;
        const b = lerBancos(dados).find((x) => String(x.id) === String(bid));
        return b ? b.nome : "banco excluído";
      };
      if (mesmoBanco(l.de, id)) {
        lista.push({
          id: `t-${l.id}-de`,
          tipo: "saida",
          descricao: String(l.descricao || forma),
          forma: `${forma} → ${outro(l.para, "fora do app")}`,
          valor,
          data: l.data,
          quando
        });
      }
      if (mesmoBanco(l.para, id)) {
        lista.push({
          id: `t-${l.id}-para`,
          tipo: "entrada",
          descricao: String(l.descricao || forma),
          forma: `${forma} ← ${outro(l.de, "fora do app")}`,
          valor,
          data: l.data,
          quando
        });
      }
      continue;
    }

    if (!Array.isArray(l.formas)) continue;
    l.formas.forEach((f, i) => {
      if (!f || !mesmoBanco(f.bancoId, id)) return;
      const valor = arredondar(Number(f.valor) || 0);
      if (!(valor > 0)) return;
      lista.push({
        id: `l-${l.id}-${i}`,
        tipo: l.tipo === "entrada" ? "entrada" : "saida",
        descricao: String(l.descricao || ""),
        forma: String(f.forma || ""),
        valor,
        data: l.data,
        quando
      });
    });
  }

  for (const c of Array.isArray(dados?.cartoes) ? dados.cartoes : []) {
    for (const p of Array.isArray(c?.pagamentos) ? c.pagamentos : []) {
      if (!p || !mesmoBanco(p.bancoId, id)) continue;
      const quando = Number(p.criadoEm) || Number(p.id) || 0;
      if (quando <= desde) continue;
      const valor = arredondar(Number(p.valor) || 0);
      if (!(valor > 0)) continue;
      lista.push({
        id: `p-${c.id}-${p.id}`,
        tipo: "saida",
        descricao: `Fatura ${c.nome}`,
        forma: "Pagamento de fatura",
        valor,
        data: p.data,
        quando
      });
    }
  }

  // pagamentos de contas fixas (botão Pagar da aba Contas fixas, ver lib/contasFixas.js)
  for (const c of Array.isArray(dados?.contasFixas) ? dados.contasFixas : []) {
    for (const p of Array.isArray(c?.pagamentos) ? c.pagamentos : []) {
      if (!p || !mesmoBanco(p.bancoId, id)) continue;
      const quando = Number(p.criadoEm) || Number(p.id) || 0;
      if (quando <= desde) continue;
      const valor = arredondar(Number(p.valor) || 0);
      if (!(valor > 0)) continue;
      lista.push({
        id: `cf-${c.id}-${p.id}`,
        tipo: "saida",
        descricao: String(c.nome || "Conta fixa"),
        forma: nomeMes(p.mes) ? `Conta fixa de ${nomeMes(p.mes)}` : "Conta fixa",
        valor,
        data: p.data,
        quando
      });
    }
  }

  // pagamentos de cartões e de contas fixas que já foram excluídos (continuam descontados do banco)
  for (const x of Array.isArray(banco.pagamentosAvulsos) ? banco.pagamentosAvulsos : []) {
    const quando = Number(x?.quando) || 0;
    if (quando <= desde) continue;
    const valor = arredondar(Number(x.valor) || 0);
    if (!(valor > 0)) continue;
    lista.push({
      id: `a-${x.id}`,
      tipo: "saida",
      descricao: String(x.descricao || "Fatura"),
      forma: String(x.forma || "Pagamento de fatura"),
      valor,
      data: x.data,
      quando
    });
  }

  return lista.sort((a, b) => b.quando - a.quando || a.id.localeCompare(b.id));
}

// { informado, entradas, saidas, atual, movimentos }
export function saldoDoBanco(dados, banco) {
  const movimentos = movimentosDoBanco(dados, banco);
  let entradas = 0;
  let saidas = 0;
  for (const m of movimentos) {
    if (m.tipo === "entrada") entradas += m.valor;
    else saidas += m.valor;
  }
  const informado = arredondar(Number(banco.saldo) || 0);
  return {
    informado,
    entradas: arredondar(entradas),
    saidas: arredondar(saidas),
    atual: arredondar(informado + entradas - saidas),
    movimentos
  };
}

// Todos os bancos com o saldo de agora e o total
export function resumoDosBancos(dados) {
  const bancos = lerBancos(dados).map((banco) => ({ banco, ...saldoDoBanco(dados, banco) }));
  return { bancos, total: arredondar(bancos.reduce((t, b) => t + b.atual, 0)) };
}

function comLista(dados, bancos) {
  return { ...dados, usuario: { ...(dados.usuario || {}), bancos } };
}

// Banco novo (sem id) ou edição. saldo = quanto tem no banco AGORA: quando muda, vira o novo ponto de
// partida (o que foi lançado antes já está dentro desse valor).
// mostrado = o saldo que o formulário mostrou ao abrir: se a pessoa não mexeu no valor, só o nome muda
// (mesmo que um lançamento tenha chegado de outro aparelho enquanto o formulário estava aberto).
export function salvarBanco(dados, { id, nome, saldo, mostrado }, agora = Date.now()) {
  const lista = lerBancos(dados);
  const valor = arredondar(Number(saldo) || 0);
  const nomeLimpo = String(nome || "").trim();

  if (id == null) {
    return comLista(dados, [...lista, { id: agora, nome: nomeLimpo, saldo: valor, ajustadoEm: agora }]);
  }

  return comLista(
    dados,
    lista.map((b) => {
      if (String(b.id) !== String(id)) return b;
      const referencia = Number.isFinite(Number(mostrado)) && mostrado !== null && mostrado !== undefined
        ? arredondar(Number(mostrado))
        : saldoDoBanco(dados, b).atual;
      if (valor === referencia) return { ...b, nome: nomeLimpo };
      // novo ponto de partida: o que veio antes já está dentro do valor informado
      const { pagamentosAvulsos: _antigos, ...resto } = b;
      return { ...resto, nome: nomeLimpo, saldo: valor, ajustadoEm: agora };
    })
  );
}

// Exclui o banco (os lançamentos continuam; só deixam de mexer nesse saldo)
export function excluirBanco(dados, id) {
  return comLista(
    dados,
    lerBancos(dados).filter((b) => String(b.id) !== String(id))
  );
}

// Antes de excluir um cartão: os pagamentos de fatura feitos com dinheiro dos bancos continuam descontados
// (ficam guardados no banco como "pagamentos avulsos"; sem isso, o dinheiro "voltaria" para o banco).
export function guardarPagamentosDoCartao(dados, cartaoId) {
  const cartao = (Array.isArray(dados?.cartoes) ? dados.cartoes : []).find((c) => String(c?.id) === String(cartaoId));
  if (!cartao) return dados;
  const porBanco = new Map();
  for (const p of Array.isArray(cartao.pagamentos) ? cartao.pagamentos : []) {
    if (!p || p.bancoId == null || p.bancoId === "") continue;
    const valor = arredondar(Number(p.valor) || 0);
    if (!(valor > 0)) continue;
    const chave = String(p.bancoId);
    if (!porBanco.has(chave)) porBanco.set(chave, []);
    porBanco.get(chave).push({
      id: `c${cartao.id}-${p.id}`,
      descricao: `Fatura ${cartao.nome}`,
      valor,
      data: p.data,
      quando: Number(p.criadoEm) || Number(p.id) || 0
    });
  }
  if (!porBanco.size) return dados;
  let mudou = false;
  const bancos = lerBancos(dados).map((b) => {
    const desde = Number(b.ajustadoEm) || 0;
    // os pagamentos de antes do valor informado já estão dentro dele
    const novos = (porBanco.get(String(b.id)) || []).filter((x) => x.quando > desde);
    if (!novos.length) return b;
    const ja = Array.isArray(b.pagamentosAvulsos) ? b.pagamentosAvulsos : [];
    const ids = new Set(ja.map((x) => x?.id));
    mudou = true;
    return { ...b, pagamentosAvulsos: [...ja, ...novos.filter((x) => !ids.has(x.id))] };
  });
  return mudou ? comLista(dados, bancos) : dados;
}

// Antes de excluir uma conta fixa: os pagamentos feitos com dinheiro dos bancos continuam descontados
// (como nos cartões, ficam guardados no banco como "pagamentos avulsos").
export function guardarPagamentosDaConta(dados, contaId) {
  const conta = (Array.isArray(dados?.contasFixas) ? dados.contasFixas : []).find((c) => String(c?.id) === String(contaId));
  if (!conta) return dados;
  const porBanco = new Map();
  for (const p of Array.isArray(conta.pagamentos) ? conta.pagamentos : []) {
    if (!p || p.bancoId == null || p.bancoId === "") continue;
    const valor = arredondar(Number(p.valor) || 0);
    if (!(valor > 0)) continue;
    const chave = String(p.bancoId);
    if (!porBanco.has(chave)) porBanco.set(chave, []);
    porBanco.get(chave).push({
      id: `f${conta.id}-${p.id}`,
      descricao: String(conta.nome || "Conta fixa"),
      forma: nomeMes(p.mes) ? `Conta fixa de ${nomeMes(p.mes)}` : "Conta fixa",
      valor,
      data: p.data,
      quando: Number(p.criadoEm) || Number(p.id) || 0
    });
  }
  if (!porBanco.size) return dados;
  let mudou = false;
  const bancos = lerBancos(dados).map((b) => {
    const desde = Number(b.ajustadoEm) || 0;
    // os pagamentos de antes do valor informado já estão dentro dele
    const novos = (porBanco.get(String(b.id)) || []).filter((x) => x.quando > desde);
    if (!novos.length) return b;
    const ja = Array.isArray(b.pagamentosAvulsos) ? b.pagamentosAvulsos : [];
    const ids = new Set(ja.map((x) => x?.id));
    mudou = true;
    return { ...b, pagamentosAvulsos: [...ja, ...novos.filter((x) => !ids.has(x.id))] };
  });
  return mudou ? comLista(dados, bancos) : dados;
}
