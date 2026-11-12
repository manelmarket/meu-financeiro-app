import React from "react";
import { Paperclip } from "lucide-react";
import EditarLancamento from "../components/EditarLancamento.jsx";
import { useMemo, useState } from "react";
import { acharBanco } from "../lib/saldos.js";
import { mapaDeCategorias, infoDaCategoria } from "../lib/categorias.js";
import { caminhoDaTransferencia, ehTransferencia, rotuloDoSubtipo } from "../lib/transferencias.js";
import { usarAparencia } from "../lib/aparencia.js";
import { MESES, arredondar, hojeISO, mesDaData, money, somarDias } from "../lib/formato.js";
import { PERIODOS, dentroDoPeriodo, intervaloDoPeriodo } from "../lib/periodo.js";
import MonthPicker from "../components/MonthPicker.jsx";
import { confirmar } from "../lib/dialogo.js";

// "Pix (Nubank) + Dinheiro" — e, se parte do gasto foi no cartão, "+ cartão Itaú"
function comoFoiPago(item, data) {
  let texto = String(item.pagamento || "");
  if (Array.isArray(item.formas) && item.formas.length) {
    texto = item.formas
      .map((f) => {
        const banco = acharBanco(data, f?.bancoId);
        const valor = item.formas.length > 1 ? ` ${money(Number(f?.valor) || 0)}` : "";
        return `${f?.forma || ""}${valor}${banco ? ` (${banco.nome})` : ""}`;
      })
      .join(" + ");
  }
  if (item.grupo != null) {
    const cartoes = (data.cartoes || []).filter((c) => (c.compras || []).some((x) => x.grupo === item.grupo)).map((c) => c.nome);
    if (cartoes.length) texto += ` + cartão ${cartoes.join(", ")}`;
  }
  return texto;
}

const FILTROS = [
  ["todos", "Todos"],
  ["entrada", "Receitas"],
  ["saida", "Gastos"],
  ["transferencia", "Transferências"]
];

// "Hoje · 6 de novembro", "Ontem · 5 de novembro", "3 de novembro", "28 de outubro de 2025"
function tituloDoDia(iso, hoje) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y) return "Sem data";
  const base = `${d} de ${MESES[m - 1].toLowerCase()}${String(y) !== hoje.slice(0, 4) ? ` de ${y}` : ""}`;
  if (iso === hoje) return `Hoje · ${base}`;
  if (iso === somarDias(hoje, -1)) return `Ontem · ${base}`;
  return base;
}

export default function History({ data, onDelete, onEditar, onCriarCategoria, onOpenCard }) {
  const [editando, setEditando] = useState(null);
  const { estilo } = usarAparencia();
  const moderno = estilo === "banco" || estilo === "vidro";
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  // período: começa em "Este mês" (o mês passado não aparece misturado)
  const hoje = hojeISO();
  const [periodo, setPeriodo] = useState("mes");
  const [mesEscolhido, setMesEscolhido] = useState(() => mesDaData(somarDias(`${mesDaData(hoje)}-01`, -1)));
  const intervalo = intervaloDoPeriodo(periodo, hoje, mesEscolhido);
  const mapa = useMemo(() => mapaDeCategorias(data), [data]);
  // do período e da busca (os totais não dependem do filtro de tipo)
  // compras no cartão também aparecem (pela data da compra), marcadas com o cartão; tocar abre o cartão
  const comprasNoCartao = useMemo(
    () =>
      (data.cartoes || []).flatMap((c) =>
        (c.compras || []).map((x) => ({
          id: `compra-${c.id}-${x.id}`,
          compra: true,
          cartaoId: c.id,
          cartaoNome: c.nome,
          tipo: "saida",
          descricao: x.descricao,
          categoria: x.categoria,
          valor: Number(x.valorTotal) || 0,
          parcelas: Number(x.parcelas) || 1,
          data: x.data,
          obs: x.obs,
          cupomId: x.cupomId,
          ordem: Number(x.id) || 0
        }))
      ),
    [data]
  );
  const doPeriodo = useMemo(
    () =>
      [...data.lancamentos, ...comprasNoCartao]
        .filter((x) => x && dentroDoPeriodo(x.data, intervalo))
        .filter((x) => String(x.descricao || "").toLowerCase().includes(busca.toLowerCase())),
    [data, comprasNoCartao, busca, intervalo.inicio, intervalo.fim]
  );
  const lista = useMemo(
    () =>
      doPeriodo
        .filter((x) => filtro === "todos" || x.tipo === filtro)
        .sort((a, b) => String(b.data).localeCompare(String(a.data)) || (b.ordem ?? b.id) - (a.ordem ?? a.id)),
    [doPeriodo, filtro]
  );
  const totais = {
    entradas: arredondar(doPeriodo.filter((x) => x.tipo === "entrada").reduce((t, x) => t + (Number(x.valor) || 0), 0)),
    saidas: arredondar(doPeriodo.filter((x) => x.tipo === "saida").reduce((t, x) => t + (Number(x.valor) || 0), 0))
  };
  const escolhaDoPeriodo = (
    <>
      <div className="chips periodo-filtros" role="radiogroup" aria-label="Período">
        {PERIODOS.map(([id, rotulo]) => (
          <button key={id} role="radio" aria-checked={periodo === id} className={periodo === id ? "active-chip" : ""} onClick={() => setPeriodo(id)}>
            {rotulo}
          </button>
        ))}
      </div>
      {periodo === "outro" && <MonthPicker mes={mesEscolhido} mesHoje={mesDaData(hoje)} onChange={setMesEscolhido} />}
    </>
  );

  const lancEditando = editando != null ? data.lancamentos.find((l) => l && l.id === editando) : null;
  const janela = lancEditando && onEditar && (
    <EditarLancamento
      key={lancEditando.id}
      dados={data}
      lancamento={lancEditando}
      onCriarCategoria={onCriarCategoria}
      onFechar={() => setEditando(null)}
      onSalvar={(mudancas) => {
        const r = onEditar(lancEditando.id, mudancas);
        if (!r?.erro) setEditando(null);
        return r;
      }}
      onExcluir={async () => {
        if (!await confirmar(`Excluir "${lancEditando.descricao || "lançamento"}"?`)) return;
        onDelete(lancEditando.id);
        setEditando(null);
      }}
    />
  );
  // lançamento: abre a edição; compra no cartão: abre o cartão (onde a compra é editada)
  const abrir = (item) => {
    const acao = () => (item.compra ? onOpenCard?.(item.cartaoId) : setEditando(item.id));
    return {
      role: "button",
      tabIndex: 0,
      onClick: acao,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          acao();
        }
      }
    };
  };
  const pagoCom = (item) =>
    item.compra ? `Cartão ${item.cartaoNome}${item.parcelas > 1 ? ` · ${item.parcelas}x` : ""}` : comoFoiPago(item, data);
  const extras = (item) => (
    <>
      {item.cupomId && <Paperclip size={12} className="lanc-clipe" aria-label="tem comprovante" />}
      {item.obs && <em className="lanc-obs">{item.obs}</em>}
    </>
  );

  async function excluir(item) {
    if (ehTransferencia(item)) {
      const pergunta = `Excluir ${rotuloDoSubtipo(item.subtipo).toLowerCase()} de ${money(item.valor)} (${caminhoDaTransferencia(data, item)})?\n\nO saldo dos bancos volta ao que era.`;
      if (!await confirmar(pergunta)) return;
    }
    onDelete(item.id);
  }

  if (moderno) {
    const porDia = [];
    for (const item of [...lista].sort((a, b) => String(b.data).localeCompare(String(a.data)) || b.id - a.id)) {
      const titulo = tituloDoDia(item.data, hoje);
      let grupo = porDia[porDia.length - 1];
      if (!grupo || grupo.titulo !== titulo) porDia.push((grupo = { titulo, itens: [] }));
      grupo.itens.push(item);
    }
    return (
      <div className="page extrato">
        <header className="topbar">
          <div>
            <h1>Extrato</h1>
          </div>
        </header>
        <input className="search extrato-busca" placeholder="Buscar lançamento" aria-label="Buscar no extrato" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {escolhaDoPeriodo}
        <div className="chips extrato-filtros" role="radiogroup" aria-label="Filtro">
          {FILTROS.map(([id, rotulo]) => (
            <button key={id} role="radio" aria-checked={filtro === id} className={filtro === id ? "active-chip" : ""} onClick={() => setFiltro(id)}>
              {id === "todos" ? "Tudo" : rotulo}
            </button>
          ))}
        </div>
        <div className="grid2 extrato-resumo">
          <section className="mini-card positive">
            <span>Entradas {intervalo.rotulo}</span>
            <strong>{money(totais.entradas)}</strong>
          </section>
          <section className="mini-card negative">
            <span>Gastos lançados {intervalo.rotulo}</span>
            <strong>{money(totais.saidas)}</strong>
          </section>
        </div>
        {porDia.length === 0 && <p className="muted extrato-vazio">Nada por aqui {intervalo.rotulo}.</p>}
        {porDia.map((grupo) => (
          <section className="extrato-dia" key={grupo.titulo}>
            <h2>{grupo.titulo}</h2>
            <div className="section-card extrato-lista">
              {grupo.itens.map((item) => {
                const transf = ehTransferencia(item);
                const c = transf ? null : infoDaCategoria(data, item.categoria, mapa);
                const cor = transf ? "var(--primaria)" : item.tipo === "entrada" ? "var(--ok)" : c.cor;
                return (
                  <div className="transaction extrato-item clicavel" key={item.id} {...abrir(item)}>
                    <span className="extrato-icone" style={{ color: cor, background: `color-mix(in srgb, ${cor} 14%, transparent)` }} aria-hidden="true">
                      {transf ? "⇄" : c.icone}
                    </span>
                    <div className="extrato-texto">
                      <b>{transf ? item.descricao || rotuloDoSubtipo(item.subtipo) : item.descricao}</b>
                      <span>{transf ? caminhoDaTransferencia(data, item) : `${c.nome} · ${pagoCom(item)}`}</span>
                      {extras(item)}
                    </div>
                    <div className="tx-right">
                      <strong className={transf ? "neutro" : item.tipo === "entrada" ? "in" : ""}>
                        {transf ? "" : item.tipo === "entrada" ? "+" : "−"}
                        {money(item.valor)}
                      </strong>
                      {item.compra ? (
                        <span className="tag-cartao">no cartão</span>
                      ) : (
                        <button className="delete" onClick={(e) => { e.stopPropagation(); excluir(item); }} aria-label={`Excluir ${item.descricao || "lançamento"}`}>
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {janela}
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Movimentações</div>
          <h1>Extrato</h1>
        </div>
      </header>
      <section className="section-card">
        <p className="hint extrato-dica">Toque num lançamento para editar (compras no cartão abrem o cartão).</p>
        <input className="search" placeholder="Buscar lançamento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        {escolhaDoPeriodo}
        <p className="periodo-totais">
          Entradas {intervalo.rotulo}: <b className="in">{money(totais.entradas)}</b> · Gastos: <b className="out">{money(totais.saidas)}</b>
        </p>
        <div className="chips">
          {FILTROS.map(([id, rotulo]) => (
            <button key={id} className={filtro === id ? "active-chip" : ""} onClick={() => setFiltro(id)}>
              {rotulo}
            </button>
          ))}
        </div>
        {lista.length === 0 && <p className="muted">Nenhum lançamento {intervalo.rotulo}.</p>}
        {lista.map((item) => {
          if (ehTransferencia(item)) {
            return (
              <div className="transaction clicavel" key={item.id} {...abrir(item)}>
                <div>
                  <b>{item.descricao || rotuloDoSubtipo(item.subtipo)}</b>
                  <span>
                    <span aria-hidden="true">⇄</span> {caminhoDaTransferencia(data, item)}
                  </span>
                  {extras(item)}
                </div>
                <div className="tx-right">
                  <strong className="neutro">{money(item.valor)}</strong>
                  <button className="delete" onClick={(e) => { e.stopPropagation(); excluir(item); }}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          }
          const c = infoDaCategoria(data, item.categoria, mapa);
          return (
            <div className="transaction clicavel" key={item.id} {...abrir(item)}>
              <div>
                <b>{item.descricao}</b>
                <span>
                  <span aria-hidden="true">{c.icone}</span> {c.nome} · {pagoCom(item)}
                </span>
                {extras(item)}
              </div>
              <div className="tx-right">
                <strong className={item.tipo === "entrada" ? "in" : "out"}>
                  {item.tipo === "entrada" ? "+" : "-"}
                  {money(item.valor)}
                </strong>
                {item.compra ? (
                  <span className="tag-cartao">no cartão</span>
                ) : (
                  <button className="delete" onClick={(e) => { e.stopPropagation(); excluir(item); }}>
                    Excluir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
      {janela}
    </div>
  );
}
