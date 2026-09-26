import React, { useEffect, useMemo, useRef, useState } from "react";
import CardSummary from "../components/CardSummary.jsx";
import CardForm from "../components/CardForm.jsx";
import CupomModal from "../components/CupomModal.jsx";
import { CATEGORIAS } from "../lib/categorias.js";
import { dataBR, dataValida, diaMesBR, hojeISO, money, parseValor, rotuloMes } from "../lib/formato.js";
import {
  datasDaFatura,
  mesDaFatura,
  resumoDaCompra,
  resumoDoCartao,
  valoresDasParcelas
} from "../lib/cartao.js";
import { apagarCupom, comprimirImagem, salvarCupom } from "../storage/cupons.js";

const OPCOES_PARCELAS = Array.from({ length: 12 }, (_, i) => i + 1);

function PurchaseForm({ cartao, inicial, onSave, onCancel, onVerCupom }) {
  const [descricao, setDescricao] = useState(inicial?.descricao || "");
  const [valor, setValor] = useState(inicial ? String(inicial.valorTotal).replace(".", ",") : "");
  const [categoria, setCategoria] = useState(inicial?.categoria || "Alimentação");
  const [data, setData] = useState(inicial?.data || hojeISO());
  const [parcelas, setParcelas] = useState(inicial?.parcelas || 1);
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [lendoFoto, setLendoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const categorias = CATEGORIAS.includes(categoria) ? CATEGORIAS : [...CATEGORIAS, categoria];
  const valorNumero = parseValor(valor);
  const quantidade = Number(parcelas) || 1;

  let simulacao = null;
  if (valorNumero > 0 && dataValida(data)) {
    const valores = valoresDasParcelas(valorNumero, quantidade);
    const primeira = mesDaFatura(cartao, data);
    simulacao = {
      texto: quantidade > 1 ? `${quantidade}x de ${money(valores[valores.length - 1])}` : `À vista: ${money(valorNumero)}`,
      primeira,
      vencimento: datasDaFatura(cartao, primeira).vencimento
    };
  }

  async function escolherFoto(e) {
    const arquivo = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!arquivo) return;
    setLendoFoto(true);
    setErro("");
    try {
      const blob = await comprimirImagem(arquivo);
      setFoto(blob);
      setPreview(URL.createObjectURL(blob));
      setRemoverFoto(false);
    } catch {
      setErro("Não consegui abrir essa imagem. Tente outra foto.");
    } finally {
      setLendoFoto(false);
    }
  }

  async function salvar() {
    if (!descricao.trim()) return setErro("Informe a descrição da compra.");
    if (!(valorNumero > 0)) return setErro("Informe o valor total da compra (ex.: 1.250,50).");
    if (!dataValida(data)) return setErro("Informe a data da compra.");
    setErro("");
    setSalvando(true);
    await onSave(
      { descricao: descricao.trim(), valorTotal: valorNumero, categoria, data, parcelas: quantidade },
      { foto, removerFoto }
    );
    setSalvando(false);
  }

  const temFotoSalva = Boolean(inicial?.cupomId) && !removerFoto && !foto;

  return (
    <section className="section-card form">
      <h2>{inicial ? "Editar compra" : "Nova compra"}</h2>

      <label>
        Descrição
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Notebook" />
      </label>

      <label>
        Valor total da compra
        <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
      </label>

      <div className="grid2 tight">
        <label>
          Parcelas
          <select value={quantidade} onChange={(e) => setParcelas(Number(e.target.value))}>
            {OPCOES_PARCELAS.map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1x (à vista)" : `${n}x`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data da compra
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
      </div>

      <label>
        Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      {simulacao && (
        <p className="hint">
          {simulacao.texto} · 1ª parcela na fatura de {rotuloMes(simulacao.primeira)} (vence {dataBR(simulacao.vencimento)})
        </p>
      )}

      <label>
        Foto do cupom (opcional)
        <input type="file" accept="image/*" onChange={escolherFoto} />
      </label>
      {lendoFoto && <p className="muted small">Preparando a foto…</p>}

      {preview && (
        <div className="photo-preview">
          <img src={preview} alt="Foto do cupom" />
          <button type="button" className="chip-btn danger" onClick={() => { setFoto(null); setPreview(null); }}>
            Remover foto
          </button>
        </div>
      )}

      {temFotoSalva && (
        <div className="row-actions">
          <span className="muted small">Esta compra já tem foto do cupom.</span>
          <button type="button" className="chip-btn info" onClick={() => onVerCupom(inicial.cupomId)}>
            📷 Ver
          </button>
          <button type="button" className="chip-btn danger" onClick={() => setRemoverFoto(true)}>
            Remover
          </button>
        </div>
      )}

      {erro && <p className="form-error">{erro}</p>}

      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="primary" onClick={salvar} disabled={salvando || lendoFoto}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </section>
  );
}

function InvoiceSection({ titulo, fatura, vazio }) {
  return (
    <section className="section-card">
      <div className="section-title">
        <div>
          <h2 className="no-margin">
            {titulo} · {rotuloMes(fatura.mes)}
          </h2>
          <small className="muted">
            Fecha {diaMesBR(fatura.fechamento)} · vence {diaMesBR(fatura.vencimento)}
          </small>
        </div>
        <strong className="big-value">{money(fatura.valor)}</strong>
      </div>

      {fatura.itens.length === 0 ? (
        <p className="muted">{vazio}</p>
      ) : (
        fatura.itens.map((p) => (
          <div className="transaction" key={`${p.compraId}-${p.numero}`}>
            <div>
              <b>{p.descricao}</b>
              <span>
                {p.total > 1 ? `Parcela ${p.numero}/${p.total}` : "À vista"} · {p.categoria}
              </span>
            </div>
            <strong className="out">{money(p.valor)}</strong>
          </div>
        ))
      )}
    </section>
  );
}

export default function CardDetails({
  cartao,
  hoje,
  abrirForm,
  onBack,
  onSavePurchase,
  onDeletePurchase,
  onSaveCard,
  onFuture,
  onCalendar
}) {
  const [formAberto, setFormAberto] = useState(Boolean(abrirForm));
  const [editando, setEditando] = useState(null);
  const [editandoCartao, setEditandoCartao] = useState(false);
  const [cupom, setCupom] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (formAberto && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formAberto, editando]);

  const resumo = resumoDoCartao(cartao, hoje);

  const compras = useMemo(
    () =>
      (cartao.compras || [])
        .map((compra) => ({ compra, r: resumoDaCompra(compra, cartao, hoje) }))
        .sort(
          (a, b) =>
            Number(a.r.quitada) - Number(b.r.quitada) ||
            String(b.compra.data).localeCompare(String(a.compra.data)) ||
            b.compra.id - a.compra.id
        ),
    [cartao, hoje]
  );

  function fecharForm() {
    setFormAberto(false);
    setEditando(null);
  }

  async function salvarCompra(campos, { foto, removerFoto }) {
    const id = editando ? editando.id : Date.now();
    const anterior = editando?.cupomId || null;
    let cupomId = anterior;

    try {
      if (foto) {
        const novo = `cupom-${id}-${Date.now()}`;
        await salvarCupom(novo, foto);
        cupomId = novo;
      } else if (removerFoto) {
        cupomId = null;
      }
    } catch {
      window.alert("Não foi possível guardar a foto neste aparelho. A compra será salva sem a foto nova.");
    }

    if (anterior && anterior !== cupomId) apagarCupom(anterior).catch(() => {});

    const { cupomId: _ignorado, ...base } = editando || {};
    onSavePurchase(cartao.id, { ...base, ...campos, id, ...(cupomId ? { cupomId } : {}) });
    fecharForm();
  }

  function excluir(compra) {
    const n = Number(compra.parcelas) || 1;
    const pergunta =
      n > 1
        ? `Excluir a compra "${compra.descricao}" e todas as ${n} parcelas?`
        : `Excluir a compra "${compra.descricao}"?`;
    if (window.confirm(pergunta)) onDeletePurchase(cartao.id, compra);
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Crédito</div>
          <h1>💳 {cartao.nome}</h1>
        </div>
      </header>

      <CardSummary cartao={cartao} resumo={resumo} />

      {cartao.fechamentoEstimado && !editandoCartao && (
        <div className="notice">
          O dia de fechamento ({cartao.fechamento}) foi estimado a partir do vencimento. Confira no app do banco e ajuste
          em{" "}
          <button className="link" onClick={() => setEditandoCartao(true)}>
            Editar cartão
          </button>
          .
        </div>
      )}

      <div className="btn-grid">
        <button className="primary" onClick={onFuture}>
          📅 Lançamentos futuros
        </button>
        <button className="secondary" onClick={onCalendar}>
          🗓️ Calendário de faturas
        </button>
        <button
          className="primary"
          onClick={() => {
            setEditando(null);
            setFormAberto(true);
          }}
        >
          + Nova compra
        </button>
        <button className="secondary" onClick={() => setEditandoCartao((v) => !v)}>
          ✏️ Editar cartão
        </button>
      </div>

      {editandoCartao && (
        <CardForm
          inicial={cartao}
          titulo="Editar cartão"
          textoBotao="Salvar"
          onSave={(c) => {
            onSaveCard(c);
            setEditandoCartao(false);
          }}
          onCancel={() => setEditandoCartao(false)}
        />
      )}

      {formAberto && (
        <div ref={formRef} className="scroll-anchor">
          <PurchaseForm
            key={editando ? editando.id : "nova"}
            cartao={cartao}
            inicial={editando}
            onSave={salvarCompra}
            onCancel={fecharForm}
            onVerCupom={setCupom}
          />
        </div>
      )}

      {resumo.faturasFechadas.map((fatura) => (
        <InvoiceSection key={fatura.mes} titulo="Fatura fechada" fatura={fatura} vazio="" />
      ))}

      <InvoiceSection titulo="Fatura atual" fatura={resumo.faturaAtual} vazio="Nenhuma compra nesta fatura ainda." />

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Compras</h2>
          <span className="muted small">{compras.length}</span>
        </div>

        {compras.length === 0 ? (
          <p className="muted">Nenhuma compra lançada.</p>
        ) : (
          compras.map(({ compra, r }) => (
            <div className="purchase" key={compra.id}>
              <div className="purchase-top">
                <b>{compra.descricao}</b>
                <b>{money(compra.valorTotal)}</b>
              </div>
              <small className="muted">
                {compra.categoria} · {dataBR(compra.data)} ·{" "}
                {r.total > 1 ? `${r.total}x de ${money(r.valorParcela)}` : "à vista"}
              </small>

              {r.total > 1 && (
                <div className="installments">
                  <div className="installments-info">
                    <span>
                      Pago <b>{r.pagas}/{r.total}</b>
                    </span>
                    <span>
                      Restante <b>{money(r.restante)}</b>
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${(r.pagas / r.total) * 100}%` }} />
                  </div>
                  <small className="muted">
                    Parcelas de {rotuloMes(r.primeiraFatura)} a {rotuloMes(r.ultimaFatura)}
                  </small>
                </div>
              )}

              {r.total === 1 && (
                <small className="muted block">Fatura de {rotuloMes(r.primeiraFatura)}</small>
              )}

              {r.quitada && <span className="tag ok">Quitada</span>}

              <div className="row-actions">
                {compra.cupomId && (
                  <button className="chip-btn info" onClick={() => setCupom(compra.cupomId)}>
                    📷 Ver cupom
                  </button>
                )}
                <button
                  className="chip-btn edit"
                  onClick={() => {
                    setEditando(compra);
                    setFormAberto(true);
                  }}
                >
                  ✏️ Editar
                </button>
                <button className="chip-btn danger" onClick={() => excluir(compra)}>
                  🗑 Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {cupom && <CupomModal cupomId={cupom} onClose={() => setCupom(null)} />}
    </div>
  );
}
