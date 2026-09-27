import React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import ScanButton from "../components/ScanButton.jsx";
import { CATEGORIAS, FORMAS_PAGAMENTO } from "../lib/categorias.js";
import { arredondar, dataBR, dataValida, hojeISO, money, parseValor, rotuloMes } from "../lib/formato.js";
import { datasDaFatura, mesDaFatura, valoresDasParcelas } from "../lib/cartao.js";
import { MAXIMO_DE_PARCELAS, montarLancamento } from "../lib/lancar.js";
import { salvarCupom } from "../storage/cupons.js";

const OPCOES_PARCELAS = Array.from({ length: MAXIMO_DE_PARCELAS }, (_, i) => i + 1);
const FORMAS_DE_RECEITA = FORMAS_PAGAMENTO.filter((f) => f !== "Cartão");
const CHAVE_BANCO = "meu_financeiro_ultimo_banco";

function bancoGuardado(bancos) {
  let id = "";
  try {
    id = localStorage.getItem(CHAVE_BANCO) || "";
  } catch {
    id = "";
  }
  if (id === "nenhum") return "";
  const existe = bancos.find((b) => String(b.banco.id) === id);
  return existe ? String(existe.banco.id) : bancos[0] ? String(bancos[0].banco.id) : "";
}

function guardarBanco(id) {
  try {
    localStorage.setItem(CHAVE_BANCO, id ? String(id) : "nenhum");
  } catch {
    // só não lembra da próxima vez
  }
}

let proximaChave = 1;
function novaParte(forma, bancoId, cartaoId) {
  proximaChave += 1;
  return { chave: proximaChave, forma, valor: "", bancoId, cartaoId, parcelas: 1, auto: true };
}

// Registrar movimentação: gasto ou receita.
// O gasto pode ser dividido em várias formas de pagamento (ex.: parte no Pix, parte em espécie,
// parte em cartões com as parcelas de cada um). Escolhendo o banco, o saldo dele muda sozinho.
export default function NewEntry({ cartoes = [], bancos = [], onSave, onCancel, onConfigurarIA }) {
  const bancoPadrao = bancoGuardado(bancos);
  const [tipo, setTipo] = useState("saida");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [data, setData] = useState(hojeISO());
  const [formaReceita, setFormaReceita] = useState("Pix");
  const [bancoReceita, setBancoReceita] = useState(bancoPadrao);
  const [partes, setPartes] = useState(() => [novaParte("Pix", bancoPadrao, cartoes[0]?.id ?? "")]);
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const total = parseValor(valor);
  const dividido = partes.length > 1;

  // valor de cada parte: com uma forma só, é o total; dividido, a última parte (automática) completa o total
  const somaDasOutras = (i) =>
    partes.reduce((t, p, j) => (j === i ? t : t + (Number.isFinite(parseValor(p.valor)) ? parseValor(p.valor) : 0)), 0);
  const valorDaParte = (p, i) => {
    if (!dividido) return total > 0 ? total : 0;
    if (p.auto && i === partes.length - 1) return total > 0 ? Math.max(0, arredondar(total - somaDasOutras(i))) : 0;
    return parseValor(p.valor);
  };
  const valores = partes.map(valorDaParte);
  const soma = arredondar(valores.reduce((t, v) => t + (Number.isFinite(v) ? v : 0), 0));

  function mudarParte(i, campo, v) {
    setErro("");
    setPartes((lista) =>
      lista.map((p, j) => {
        if (j !== i) return p;
        const nova = { ...p, [campo]: v };
        if (campo === "valor") nova.auto = false;
        if (campo === "forma") {
          if (v === "Dinheiro") nova.bancoId = "";
          else if (p.forma === "Dinheiro" && !p.bancoId) nova.bancoId = bancoPadrao;
          if (v === "Cartão" && !p.cartaoId) nova.cartaoId = cartoes[0]?.id ?? "";
        }
        return nova;
      })
    );
  }

  function dividir() {
    setErro("");
    // a parte que completava o total fica com o valor de agora (a primeira começa vazia, para digitar);
    // a nova parte passa a completar o total
    const ultima = partes.length - 1;
    const congelado = partes.length === 1 ? "" : valores[ultima] > 0 ? valores[ultima].toFixed(2).replace(".", ",") : "";
    const antigas = partes.map((p, j) => (j === ultima && p.auto ? { ...p, auto: false, valor: congelado } : p));
    const usadas = new Set(antigas.map((p) => p.forma));
    const forma = ["Dinheiro", "Pix", "Débito", "Cartão", "Transferência"].find((f) => !usadas.has(f)) || "Pix";
    setPartes([...antigas, novaParte(forma, forma === "Dinheiro" ? "" : bancoPadrao, cartoes[0]?.id ?? "")]);
  }

  function tirarParte(i) {
    setErro("");
    setPartes((lista) => {
      const resto = lista.filter((_, j) => j !== i);
      return resto.map((p, j) => (j === resto.length - 1 ? { ...p, auto: true, valor: "" } : p));
    });
  }

  function preencherPeloCupom(lido, blob) {
    if (lido.valor) setValor(lido.valor.toFixed(2).replace(".", ","));
    if (lido.descricao) setDescricao(lido.descricao);
    if (lido.data) setData(lido.data);
    if (lido.categoria) setCategoria(lido.categoria);
    setTipo("saida");
    setFoto(blob);
    setErro("");
  }

  const temCartao = tipo === "saida" && partes.some((p) => p.forma === "Cartão") && cartoes.length > 0;

  async function submit(e) {
    e.preventDefault();
    const form = {
      tipo,
      descricao,
      categoria,
      data,
      valor: total,
      partes:
        tipo === "entrada"
          ? [{ forma: formaReceita, valor: total, bancoId: bancoReceita || null }]
          : partes
              .map((p, i) => ({
                forma: p.forma,
                valor: valores[i],
                bancoId: p.forma === "Cartão" ? null : p.bancoId || null,
                cartaoId: p.cartaoId,
                parcelas: p.parcelas,
                // a última forma completa o total sozinha; se as outras já fecharam a conta, ela fica de fora
                sobrando: dividido && p.auto && i === partes.length - 1 && !(valores[i] > 0)
              }))
              .filter((p) => !p.sobrando)
              .map(({ sobrando: _sobrando, ...p }) => p)
    };
    const previa = montarLancamento(form, cartoes);
    if (previa.erro) return setErro(previa.erro);

    setSalvando(true);
    const agora = Date.now();
    let cupomId = null;
    if (foto && previa.compras.length) {
      try {
        cupomId = `cupom-${agora + 1}`;
        await salvarCupom(cupomId, foto);
      } catch {
        cupomId = null;
      }
    }
    const r = montarLancamento({ ...form, ...(cupomId ? { cupomId } : {}) }, cartoes, agora);
    const usado = tipo === "entrada" ? bancoReceita : partes.find((p) => p.forma !== "Cartão" && p.forma !== "Dinheiro")?.bancoId;
    if (bancos.length && usado !== undefined) guardarBanco(usado);
    onSave(r);
  }

  // prévia do que muda em cada banco
  const mudancas = new Map();
  if (bancos.length && total > 0) {
    if (tipo === "entrada") {
      if (bancoReceita) mudancas.set(bancoReceita, total);
    } else {
      partes.forEach((p, i) => {
        if (p.forma === "Cartão" || !p.bancoId || !(valores[i] > 0)) return;
        mudancas.set(String(p.bancoId), arredondar((mudancas.get(String(p.bancoId)) || 0) - valores[i]));
      });
    }
  }

  const seletorDeBanco = (valorAtual, aoMudar, rotulo = "Banco") => (
    <label>
      {rotulo}
      <select value={valorAtual || ""} onChange={(e) => aoMudar(e.target.value)}>
        {bancos.map((b) => (
          <option key={b.banco.id} value={String(b.banco.id)}>
            {b.banco.nome}
          </option>
        ))}
        <option value="">Sem banco</option>
      </select>
    </label>
  );

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Novo lançamento</div>
          <h1>Registrar movimentação</h1>
        </div>
      </header>
      <form className="section-card form" onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={tipo === "saida" ? "selected danger" : ""} onClick={() => setTipo("saida")}>
            Gasto
          </button>
          <button type="button" className={tipo === "entrada" ? "selected success" : ""} onClick={() => setTipo("entrada")}>
            Receita
          </button>
        </div>

        {tipo === "saida" && <ScanButton onResult={preencherPeloCupom} onConfigurar={onConfigurarIA} />}
        {foto && (
          <p className="hint">
            📷 Foto do cupom lida{temCartao ? " e guardada junto com a compra" : ""}. Confira os campos antes de salvar.
          </p>
        )}

        <label>
          Valor
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setErro("");
            }}
          />
        </label>
        <label>
          Descrição
          <input
            placeholder="Ex.: Mercado"
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              setErro("");
            }}
          />
        </label>
        {tipo === "saida" && (
          <label>
            Categoria
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}

        {tipo === "entrada" ? (
          <div className={bancos.length ? "grid2 tight" : ""}>
            <label>
              Recebido por
              <select value={formaReceita} onChange={(e) => setFormaReceita(e.target.value)}>
                {FORMAS_DE_RECEITA.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            {bancos.length > 0 && seletorDeBanco(bancoReceita, setBancoReceita, "Entrou no banco")}
          </div>
        ) : (
          <div className="formas">
            <div className="formas-topo">
              <span>{dividido ? "Formas de pagamento" : "Pagamento"}</span>
              {dividido && total > 0 && (
                <small className={Math.abs(soma - total) > 0.004 ? "formas-conta erro" : "formas-conta ok"}>
                  {Math.abs(soma - total) > 0.004
                    ? soma < total
                      ? `Faltam ${money(total - soma)}`
                      : `Passou ${money(soma - total)}`
                    : "✓ Soma certa"}
                </small>
              )}
            </div>

            {partes.map((p, i) => {
              const v = valores[i];
              const cartao = cartoes.find((c) => String(c.id) === String(p.cartaoId)) || cartoes[0];
              let destino = null;
              if (p.forma === "Cartão" && cartao && v > 0 && dataValida(data)) {
                const mes = mesDaFatura(cartao, data);
                const vs = valoresDasParcelas(v, p.parcelas);
                destino = `${p.parcelas > 1 ? `${p.parcelas}x de ${money(vs[vs.length - 1])} · ` : ""}1ª parcela na fatura de ${rotuloMes(mes)} do ${cartao.nome} (vence ${dataBR(datasDaFatura(cartao, mes).vencimento)})`;
              }
              return (
                <div className={`forma${dividido ? " dividida" : ""}`} key={p.chave}>
                  <div className={dividido ? "forma-linha" : ""}>
                    <label>
                      {dividido ? `Forma ${i + 1}` : "Forma de pagamento"}
                      <select value={p.forma} onChange={(e) => mudarParte(i, "forma", e.target.value)}>
                        {FORMAS_PAGAMENTO.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    {dividido && (
                      <label>
                        Valor
                        <input
                          inputMode="decimal"
                          placeholder={p.auto ? "o resto" : "0,00"}
                          value={p.auto && i === partes.length - 1 ? (v > 0 ? v.toFixed(2).replace(".", ",") : "") : p.valor}
                          onChange={(e) => mudarParte(i, "valor", e.target.value)}
                        />
                      </label>
                    )}
                    {dividido && (
                      <button type="button" className="forma-tirar" onClick={() => tirarParte(i)} aria-label={`Tirar a forma ${i + 1}`}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {p.forma === "Cartão" && cartoes.length > 0 && (
                    <div className="grid2 tight">
                      <label>
                        Cartão
                        <select value={cartao?.id ?? ""} onChange={(e) => mudarParte(i, "cartaoId", e.target.value)}>
                          {cartoes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Parcelas
                        <select value={p.parcelas} onChange={(e) => mudarParte(i, "parcelas", Number(e.target.value))}>
                          {OPCOES_PARCELAS.map((n) => (
                            <option key={n} value={n}>
                              {n === 1 ? "1x (à vista)" : `${n}x`}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                  {p.forma === "Cartão" && cartoes.length === 0 && (
                    <p className="hint">Você ainda não tem cartão cadastrado: esta parte será salva como lançamento comum.</p>
                  )}
                  {p.forma !== "Cartão" && bancos.length > 0 && seletorDeBanco(p.bancoId, (id) => mudarParte(i, "bancoId", id))}
                  {destino && <p className="hint">{destino}</p>}
                </div>
              );
            })}

            <button type="button" className="secondary formas-mais" onClick={dividir}>
              {dividido ? "+ Outra forma de pagamento" : "+ Dividir em mais formas de pagamento"}
            </button>
          </div>
        )}

        <label>
          Data
          <input
            type="date"
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              setErro("");
            }}
          />
        </label>

        {mudancas.size > 0 && (
          <div className="hint formas-bancos">
            {[...mudancas.entries()].map(([id, delta]) => {
              const b = bancos.find((x) => String(x.banco.id) === String(id));
              if (!b) return null;
              return (
                <span key={id}>
                  🏦 {b.banco.nome}: {money(b.atual)} → <b>{money(arredondar(b.atual + delta))}</b>
                </span>
              );
            })}
          </div>
        )}
        {erro && <p className="form-error">{erro}</p>}
        <div className="actions">
          <button type="button" className="ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="primary" disabled={salvando}>
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
