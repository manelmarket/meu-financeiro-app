import React, { useEffect, useRef, useState } from "react";
import { Camera, Paperclip, Trash2, X } from "lucide-react";
import { SeletorCategoria } from "./Categoria.jsx";
import CupomModal from "./CupomModal.jsx";
import { parseValor } from "../lib/formato.js";
import { caminhoDaTransferencia, ehTransferencia, rotuloDoSubtipo } from "../lib/transferencias.js";
import { comprimirImagem, salvarCupom } from "../storage/cupons.js";

function textoDoValor(v) {
  return v > 0 ? Number(v).toFixed(2).replace(".", ",") : "";
}

// Janela para editar um lançamento: descrição, valor, categoria, data, observação e foto do comprovante.
// onSalvar(mudancas) devolve { erro } ou { ok }; onExcluir() exclui (a tela confirma antes).
export default function EditarLancamento({ dados, lancamento, onSalvar, onExcluir, onFechar, onCriarCategoria }) {
  const transf = ehTransferencia(lancamento);
  const variasFormas = Array.isArray(lancamento.formas) && lancamento.formas.length > 1;
  const [descricao, setDescricao] = useState(lancamento.descricao || "");
  const [valor, setValor] = useState(textoDoValor(Number(lancamento.valor) || 0));
  const [categoria, setCategoria] = useState(lancamento.categoria || "Outros");
  const [data, setData] = useState(lancamento.data || "");
  const [obs, setObs] = useState(lancamento.obs || "");
  const [foto, setFoto] = useState(null); // foto nova (Blob) escolhida agora
  const [tirarFoto, setTirarFoto] = useState(false);
  const [verFoto, setVerFoto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const entrada = useRef(null);
  const janela = useRef(null);

  useEffect(() => {
    janela.current?.querySelector("input")?.focus();
    const tecla = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  async function escolherFoto(arquivo) {
    if (!arquivo) return;
    try {
      setFoto(await comprimirImagem(arquivo));
    } catch {
      setFoto(arquivo);
    }
    setTirarFoto(false);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    const mudancas = { descricao, data, obs };
    if (!variasFormas) mudancas.valor = parseValor(valor);
    if (lancamento.tipo === "saida") mudancas.categoria = categoria;
    setSalvando(true);
    try {
      if (foto) {
        const id = `anexo-${lancamento.id}-${Date.now()}`;
        await salvarCupom(id, foto);
        mudancas.cupomId = id;
      } else if (tirarFoto) {
        mudancas.cupomId = null;
      }
    } catch {
      setSalvando(false);
      setErro("Não consegui guardar a foto neste aparelho. Tente de novo.");
      return;
    }
    const r = onSalvar(mudancas);
    setSalvando(false);
    if (r?.erro) setErro(r.erro);
  }

  const temFoto = (lancamento.cupomId && !tirarFoto) || foto;

  return (
    <>
    <div className="modal-backdrop" onClick={onFechar}>
      <form className="modal form editar-lanc" ref={janela} onClick={(e) => e.stopPropagation()} onSubmit={salvar} aria-label="Editar lançamento">
        <div className="editar-lanc-topo">
          <h2>{transf ? `Editar ${rotuloDoSubtipo(lancamento.subtipo).toLowerCase()}` : lancamento.tipo === "entrada" ? "Editar receita" : "Editar gasto"}</h2>
          <button type="button" className="editar-lanc-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        {transf && <p className="hint">{caminhoDaTransferencia(dados, lancamento)}</p>}

        <label>
          {transf ? "Descrição (opcional)" : "Descrição"}
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={80} />
        </label>
        <div className="grid2 tight">
          <label>
            Valor
            <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} disabled={variasFormas} />
          </label>
          <label>
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </label>
        </div>
        {variasFormas && <p className="hint">Pago de várias formas ({lancamento.pagamento}): o valor não muda por aqui.</p>}
        {lancamento.tipo === "saida" && (
          <SeletorCategoria dados={dados} valor={categoria} onChange={setCategoria} onCriar={onCriarCategoria} />
        )}
        <label>
          Observação
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} maxLength={300} rows={2} placeholder="Ex.: dividido com a Ana, nota fiscal no e-mail" />
        </label>

        <div className="editar-lanc-foto">
          <span>
            <Paperclip size={15} /> Comprovante
          </span>
          {temFoto ? (
            <div className="editar-lanc-foto-acoes">
              {foto ? (
                <small>Foto nova escolhida</small>
              ) : (
                <button type="button" className="link" onClick={() => setVerFoto(true)}>
                  Ver foto
                </button>
              )}
              <button type="button" className="link" onClick={() => entrada.current?.click()}>
                Trocar
              </button>
              <button
                type="button"
                className="link perigo"
                onClick={() => {
                  setFoto(null);
                  setTirarFoto(true);
                }}
              >
                Tirar
              </button>
            </div>
          ) : (
            <button type="button" className="secondary" onClick={() => entrada.current?.click()}>
              <Camera size={16} /> Anexar foto
            </button>
          )}
          <input ref={entrada} type="file" accept="image/*" hidden onChange={(e) => escolherFoto(e.target.files?.[0])} />
        </div>

        {erro && <p className="form-error">{erro}</p>}
        <div className="actions">
          <button type="button" className="ghost editar-lanc-excluir" onClick={onExcluir} aria-label="Excluir lançamento">
            <Trash2 size={16} />
          </button>
          <button type="button" className="ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button className="primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
    {verFoto && lancamento.cupomId && <CupomModal cupomId={lancamento.cupomId} onClose={() => setVerFoto(false)} />}
    </>
  );
}
