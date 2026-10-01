import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import EscolherBanco, { bancoInicial, lembrarBanco } from "../components/EscolherBanco.jsx";
import { arredondar, dataBR, money, parseValor } from "../lib/formato.js";
import { acharBanco, resumoDosBancos } from "../lib/saldos.js";
import {
  nomeDoEmprestimo,
  pagamentosDoEmprestimo,
  resumoDosEmprestimos,
  valorSugerido
} from "../lib/emprestimos.js";

// Tela "Empréstimos": o que a pessoa pegou emprestado (Peguei) e o que ela emprestou (Emprestei).
// Cada empréstimo pode ser em parcelas (valores do contrato) ou sem parcelas (paga quando puder).
// No Recebi, o dinheiro pode entrar num banco (o saldo dele sobe) ou ser recebido em espécie.
// Fora isso, os empréstimos ficam só aqui: não entram no Meu mês nem no patrimônio.

// o banco do último recebimento fica guardado neste aparelho
const CHAVE_BANCO = "meu_financeiro_banco_do_emprestimo";

const TEXTO = {
  peguei: {
    lista: "Peguei",
    comQuem: "Com quem você pegou",
    exemplo: "Ex.: Nubank, Caixa, João",
    exemploDescricao: "Ex.: Empréstimo pessoal, consignado",
    valor: "Valor recebido",
    falta: "Falta pagar",
    tudo: "Tudo pago",
    botaoParcela: "💵 Pagar parcela",
    botaoLivre: "💵 Pagar",
    jaPagas: "Parcelas já pagas",
    jaPago: "Já pagou (opcional)",
    pagos: "pagos",
    tituloParcela: (n, total) => `Pagar parcela ${n} de ${total}`,
    tituloLivre: "Registrar pagamento",
    registrado: "Pagamento registrado",
    ficaComo: "paga",
    vazio: "Nenhum empréstimo que você pegou."
  },
  emprestei: {
    lista: "Emprestei",
    comQuem: "Para quem você emprestou",
    exemplo: "Ex.: João",
    exemploDescricao: "Ex.: Ajuda no aluguel",
    valor: "Valor emprestado",
    falta: "Falta receber",
    tudo: "Tudo recebido",
    botaoParcela: "💵 Recebi a parcela",
    botaoLivre: "💵 Recebi",
    jaPagas: "Parcelas já recebidas",
    jaPago: "Já recebeu (opcional)",
    pagos: "recebidos",
    tituloParcela: (n, total) => `Receber parcela ${n} de ${total}`,
    tituloLivre: "Registrar recebimento",
    registrado: "Recebimento registrado",
    ficaComo: "recebida",
    vazio: "Nenhum empréstimo que você fez para alguém."
  }
};

const SITUACAO = {
  quitado: { texto: "Quitado", classe: "ok" },
  atrasado: { texto: "Atrasado", classe: "atraso" },
  hoje: { texto: "Vence hoje", classe: "aviso" },
  "em-dia": { texto: "Em dia", classe: "em-dia" }
};

function textoDoValor(v) {
  return v > 0 ? v.toFixed(2).replace(".", ",") : "";
}

function porcento(fracao) {
  return `${(fracao * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function formVazio(tipo, hoje) {
  return {
    tipo,
    descricao: "",
    pessoa: "",
    valor: "",
    data: hoje,
    forma: "parcelado",
    parcelas: "",
    valorParcela: "",
    primeiroVencimento: "",
    jaPagas: "",
    total: "",
    prazo: "",
    jaPago: "",
    observacao: ""
  };
}

function formDoEmprestimo(e) {
  const parcelado = e.forma !== "livre";
  return {
    id: e.id,
    tipo: e.tipo,
    descricao: e.descricao || "",
    pessoa: e.pessoa || "",
    valor: textoDoValor(Number(e.valor) || 0),
    data: e.data || "",
    forma: parcelado ? "parcelado" : "livre",
    parcelas: parcelado ? String(e.parcelas || "") : "",
    valorParcela: parcelado ? textoDoValor(Number(e.valorParcela) || 0) : "",
    primeiroVencimento: parcelado ? e.primeiroVencimento || "" : "",
    jaPagas: "",
    total: !parcelado && Number(e.total) > 0 ? textoDoValor(Number(e.total)) : "",
    prazo: !parcelado ? e.prazo || "" : "",
    jaPago: "",
    observacao: e.observacao || ""
  };
}

// "Empréstimo pessoal (Nubank): parcela 3 atrasada desde 10/09/2026."
function textoDoAtraso({ emprestimo: e, resumo: r }) {
  const nome = e.descricao ? `${nomeDoEmprestimo(e)} (${e.pessoa})` : nomeDoEmprestimo(e);
  if (e.forma === "parcelado") {
    return r.atrasadas === 1
      ? `${nome}: parcela ${r.proxima.numero} atrasada desde ${dataBR(r.desde)}.`
      : `${nome}: ${r.atrasadas} parcelas atrasadas, a mais antiga desde ${dataBR(r.desde)}.`;
  }
  return `${nome}: passou da data combinada (${dataBR(r.desde)}). ${TEXTO[e.tipo].falta}: ${money(r.falta)}.`;
}

// Formulário de empréstimo (novo ou edição)
function EmprestimoForm({ inicial, tipoDaLista, hoje, onSalvar, onCancelar }) {
  const editando = Boolean(inicial);
  const [form, setForm] = useState(() => (inicial ? formDoEmprestimo(inicial) : formVazio(tipoDaLista, hoje)));
  const [erro, setErro] = useState("");
  // formulário novo ainda em branco: acompanha a lista escolhida (Peguei/Emprestei)
  const intocado = useRef(true);

  useEffect(() => {
    if (!editando && intocado.current) setForm((f) => ({ ...f, tipo: tipoDaLista }));
  }, [tipoDaLista, editando]);

  const t = TEXTO[form.tipo];

  function mudar(campo, valor) {
    intocado.current = false;
    setErro("");
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  // prévia: "12x de R$ 520,33 = R$ 6.243,96 · juros de R$ 1.243,96 (24,9%)"
  const valor = parseValor(form.valor);
  let previa = "";
  if (form.forma === "parcelado") {
    const n = /^\d+$/.test(form.parcelas.trim()) ? parseInt(form.parcelas, 10) : 0;
    const parcela = parseValor(form.valorParcela);
    if (n > 0 && parcela > 0) {
      const total = arredondar(n * parcela);
      const juros = valor > 0 ? arredondar(total - valor) : 0;
      previa = `${n}x de ${money(parcela)} = ${money(total)}${juros > 0 ? ` · juros de ${money(juros)} (${porcento(juros / valor)})` : ""}`;
    }
  } else if (valor > 0) {
    const total = form.total.trim() ? parseValor(form.total) : valor;
    previa = total > valor ? `Volta ${money(total)} · juros de ${money(arredondar(total - valor))}` : "";
  }

  function salvar() {
    const r = onSalvar(form);
    if (r?.erro) return setErro(r.erro);
    if (!editando) {
      intocado.current = true;
      setForm(formVazio(form.tipo, hoje));
    }
    setErro("");
  }

  return (
    <section className="section-card form emp-form">
      <h2>{editando ? "Editar empréstimo" : "Novo empréstimo"}</h2>

      <div className="segmented" role="radiogroup" aria-label="Tipo de empréstimo">
        <button
          type="button"
          role="radio"
          aria-checked={form.tipo === "peguei"}
          className={form.tipo === "peguei" ? "selected danger" : ""}
          onClick={() => mudar("tipo", "peguei")}
        >
          Peguei
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={form.tipo === "emprestei"}
          className={form.tipo === "emprestei" ? "selected success" : ""}
          onClick={() => mudar("tipo", "emprestei")}
        >
          Emprestei
        </button>
      </div>

      <label>
        {t.comQuem}
        <input value={form.pessoa} onChange={(e) => mudar("pessoa", e.target.value)} placeholder={t.exemplo} maxLength={60} />
      </label>
      <label>
        Descrição (opcional)
        <input
          value={form.descricao}
          onChange={(e) => mudar("descricao", e.target.value)}
          placeholder={t.exemploDescricao}
          maxLength={60}
        />
      </label>
      <div className="grid2 tight">
        <label>
          {t.valor}
          <input inputMode="decimal" value={form.valor} onChange={(e) => mudar("valor", e.target.value)} placeholder="0,00" />
        </label>
        <label>
          Data do empréstimo
          <input type="date" value={form.data} onChange={(e) => mudar("data", e.target.value)} />
        </label>
      </div>

      <div className="segmented" role="radiogroup" aria-label="Como vai ser pago">
        <button
          type="button"
          role="radio"
          aria-checked={form.forma === "parcelado"}
          className={form.forma === "parcelado" ? "selected info" : ""}
          onClick={() => mudar("forma", "parcelado")}
        >
          Em parcelas
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={form.forma === "livre"}
          className={form.forma === "livre" ? "selected info" : ""}
          onClick={() => mudar("forma", "livre")}
        >
          Sem parcelas
        </button>
      </div>
      <p className="muted small no-margin">
        {form.forma === "parcelado"
          ? "Use os valores do contrato: a parcela do banco já inclui juros, IOF e seguro."
          : "Para empréstimo entre pessoas: vai pagando quando puder e o app mostra quanto falta."}
      </p>

      {form.forma === "parcelado" ? (
        <>
          <div className="grid2 tight">
            <label>
              Nº de parcelas
              <input inputMode="numeric" value={form.parcelas} onChange={(e) => mudar("parcelas", e.target.value)} placeholder="Ex.: 12" />
            </label>
            <label>
              Valor da parcela
              <input inputMode="decimal" value={form.valorParcela} onChange={(e) => mudar("valorParcela", e.target.value)} placeholder="0,00" />
            </label>
          </div>
          <div className={editando ? "" : "grid2 tight"}>
            <label>
              1º vencimento
              <input type="date" value={form.primeiroVencimento} onChange={(e) => mudar("primeiroVencimento", e.target.value)} />
            </label>
            {!editando && (
              <label>
                {t.jaPagas}
                <input inputMode="numeric" value={form.jaPagas} onChange={(e) => mudar("jaPagas", e.target.value)} placeholder="0" />
              </label>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid2 tight">
            <label>
              Total a devolver
              <input
                inputMode="decimal"
                value={form.total}
                onChange={(e) => mudar("total", e.target.value)}
                placeholder={valor > 0 ? textoDoValor(valor) : "o mesmo valor"}
              />
            </label>
            <label>
              Combinado até (opcional)
              <input type="date" value={form.prazo} onChange={(e) => mudar("prazo", e.target.value)} />
            </label>
          </div>
          {!editando && (
            <label>
              {t.jaPago}
              <input inputMode="decimal" value={form.jaPago} onChange={(e) => mudar("jaPago", e.target.value)} placeholder="0,00" />
            </label>
          )}
        </>
      )}

      {previa && <p className="hint">{previa}</p>}

      <label>
        Observação (opcional)
        <input
          value={form.observacao}
          onChange={(e) => mudar("observacao", e.target.value)}
          placeholder="Ex.: taxa de 2,5% ao mês"
          maxLength={200}
        />
      </label>

      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        {onCancelar && (
          <button type="button" className="ghost" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="button" className="primary" onClick={salvar}>
          {editando ? "Salvar" : "Adicionar empréstimo"}
        </button>
      </div>
    </section>
  );
}

// Cartão de um empréstimo: quanto falta, parcelas, próximo vencimento, botões e histórico
function CartaoDoEmprestimo({ item, nomesDosBancos, historicoAberto, onHistorico, onPagar, onEditar, onExcluir, onDesfazer }) {
  const { emprestimo: e, resumo: r } = item;
  const t = TEXTO[e.tipo];
  const s = SITUACAO[r.situacao];
  const quitado = r.situacao === "quitado";
  const parcelado = e.forma === "parcelado";
  const pagamentos = [...pagamentosDoEmprestimo(e)].sort(
    (a, b) => String(b.data).localeCompare(String(a.data)) || Number(b.id) - Number(a.id)
  );

  let proxima = "";
  if (parcelado) {
    if (r.situacao === "atrasado") {
      proxima =
        r.atrasadas === 1
          ? `Parcela ${r.proxima.numero} atrasada desde ${dataBR(r.desde)}`
          : `${r.atrasadas} parcelas atrasadas · a mais antiga desde ${dataBR(r.desde)}`;
    } else if (r.proxima) {
      proxima = `Próxima: parcela ${r.proxima.numero} · ${r.situacao === "hoje" ? "vence hoje" : `vence ${dataBR(r.proxima.vence)}`}`;
    }
  } else if (r.situacao === "atrasado") {
    proxima = `Combinado até ${dataBR(r.desde)} · passou do prazo`;
  } else if (r.proxima) {
    proxima = r.situacao === "hoje" ? "Combinado para hoje" : `Combinado até ${dataBR(r.proxima.vence)}`;
  } else if (!quitado) {
    proxima = "Sem data combinada";
  }

  return (
    <section className={`section-card emp-card ${e.tipo}${quitado ? " quitado" : ""}`}>
      <div className="emp-cabeca">
        <div>
          <b>{nomeDoEmprestimo(e)}</b>
          {e.descricao && <small>{e.pessoa}</small>}
        </div>
        <span className={`emp-situacao ${s.classe}`}>{s.texto}</span>
      </div>

      <div className="emp-falta">
        <span>{quitado ? t.tudo : t.falta}</span>
        <strong>{money(quitado ? r.total : r.falta)}</strong>
      </div>
      <div className={`bar${quitado ? " emp-bar-ok" : ""}`} aria-hidden="true">
        <i style={{ width: `${Math.round(r.progresso * 100)}%` }} />
      </div>

      <p className="emp-linha">
        {parcelado
          ? `${r.pagas} de ${r.quantidade} parcelas ${t.ficaComo === "paga" ? "pagas" : "recebidas"} · ${money(Number(e.valorParcela))} cada`
          : `Sem parcelas · ${money(r.pago)} de ${money(r.total)} ${t.pagos}`}
      </p>
      {proxima && <p className={`emp-linha${r.situacao === "atrasado" ? " atraso" : ""}`}>{proxima}</p>}
      <p className="emp-linha apagada">
        {e.tipo === "peguei" ? "Recebeu" : "Emprestou"} {money(Number(e.valor))} em {dataBR(e.data)} · volta {money(r.total)}
        {r.juros > 0 ? ` · juros de ${money(r.juros)}` : " · sem juros"}
      </p>
      {e.observacao && <p className="emp-linha apagada">{e.observacao}</p>}

      <div className="row-actions">
        {!quitado && (
          <button className="chip-btn ok" onClick={onPagar}>
            {parcelado ? t.botaoParcela : t.botaoLivre}
          </button>
        )}
        <button className="chip-btn edit" onClick={onEditar}>
          ✏️ Editar
        </button>
        <button className="chip-btn danger" onClick={onExcluir}>
          🗑 Excluir
        </button>
        {pagamentos.length > 0 && (
          <button className="chip-btn neutral" onClick={onHistorico} aria-expanded={historicoAberto}>
            {historicoAberto ? "Fechar histórico" : `Histórico (${pagamentos.length})`}
          </button>
        )}
      </div>

      {historicoAberto && pagamentos.length > 0 && (
        <div className="emp-historico">
          {pagamentos.map((p) => (
            <div className="emp-pag" key={p.id}>
              <span>
                <b>{money(Number(p.valor))}</b>
                <small>
                  {p.parcela ? `Parcela ${p.parcela} · ` : ""}
                  {p.anterior ? (parcelado ? `venceu ${dataBR(p.data)} · antes do cadastro` : "antes do cadastro") : dataBR(p.data)}
                  {p.bancoId != null && p.bancoId !== ""
                    ? ` · ${nomesDosBancos.get(String(p.bancoId)) || "banco excluído"}`
                    : p.especie
                      ? " · em espécie"
                      : ""}
                </small>
              </span>
              <button className="chip-btn neutral" onClick={() => onDesfazer(p)}>
                Desfazer
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Janela para pagar uma parcela (ou registrar um pagamento, sem parcelas)
function JanelaDePagamento({ item, hoje, bancos = [], onConfirmar, onFechar }) {
  const { emprestimo: e, resumo: r } = item;
  const t = TEXTO[e.tipo];
  const parcelado = e.forma === "parcelado";
  // Recebi (emprestei): escolhe o banco onde o dinheiro entrou ou "recebido em espécie"
  const recebe = e.tipo === "emprestei";
  const [valor, setValor] = useState(() => textoDoValor(valorSugerido(e, hoje)));
  const [dataPag, setDataPag] = useState(hoje);
  const [bancoId, setBancoId] = useState(() => (recebe ? bancoInicial(CHAVE_BANCO, bancos) : ""));
  const [erro, setErro] = useState("");
  const janela = useRef(null);

  useEffect(() => {
    janela.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function tecla(ev) {
      if (ev.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

  const v = parseValor(valor);

  function confirmar() {
    const banco = recebe ? bancos.find((b) => String(b.banco.id) === bancoId) || null : null;
    // "em espécie" só quando a pessoa escolheu essa opção (sem bancos cadastrados, fica só registrado)
    const res = onConfirmar({ valor, data: dataPag, bancoId: banco ? banco.banco.id : "", especie: recebe && bancos.length > 0 && !banco });
    if (res?.erro) {
      setErro(res.erro);
      return;
    }
    if (recebe && bancos.length) lembrarBanco(CHAVE_BANCO, banco ? banco.banco.id : "");
  }

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div
        className="modal pag-modal emp-modal"
        ref={janela}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emp-pag-titulo"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="pag-topo">
          <div>
            <h2 id="emp-pag-titulo">{parcelado ? t.tituloParcela(r.proxima.numero, r.quantidade) : t.tituloLivre}</h2>
            <small className="muted">
              {nomeDoEmprestimo(e)}
              {e.descricao ? ` · ${e.pessoa}` : ""}
              {parcelado ? ` · vence ${dataBR(r.proxima.vence)}` : ` · ${t.falta.toLowerCase()} ${money(r.falta)}`}
            </small>
          </div>
          <button type="button" className="pag-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="grid2 tight">
          <label className="pag-campo">
            Valor
            <input
              inputMode="decimal"
              value={valor}
              onChange={(ev) => {
                setValor(ev.target.value);
                setErro("");
              }}
              placeholder="0,00"
              autoFocus
            />
          </label>
          <label className="pag-campo">
            Data
            <input
              type="date"
              value={dataPag}
              onChange={(ev) => {
                setDataPag(ev.target.value);
                setErro("");
              }}
            />
          </label>
        </div>

        {parcelado ? (
          <p className="hint">
            A parcela {r.proxima.numero} fica como {t.ficaComo}. Se teve juros de atraso ou desconto, ajuste o valor.
          </p>
        ) : (
          v > 0 &&
          v <= r.falta + 0.004 && (
            <p className="pag-libera">
              Depois deste {e.tipo === "peguei" ? "pagamento" : "recebimento"}: {t.falta.toLowerCase()} {money(arredondar(r.falta - v))}
            </p>
          )
        )}
        {recebe && (
          <EscolherBanco
            titulo="Em qual banco entrou o dinheiro?"
            bancos={bancos}
            bancoId={bancoId}
            onEscolher={(id) => {
              setBancoId(id);
              setErro("");
            }}
            semBanco={{ titulo: "Recebido em espécie", detalhe: "Não entra em nenhum banco" }}
            semBancos="Você ainda não tem bancos cadastrados (aba Bancos). O recebimento fica registrado sem entrar em nenhum banco."
            valor={v}
            sinal={1}
          />
        )}
        {erro && <p className="form-error">{erro}</p>}

        <div className="actions">
          <button type="button" className="ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="primary" onClick={confirmar}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Emprestimos({ data, hoje, onBack, onSalvar, onExcluir, onPagar, onDesfazer }) {
  const r = resumoDosEmprestimos(data, hoje);
  const [aba, setAba] = useState(() => (r.peguei.itens.length === 0 && r.emprestei.itens.length > 0 ? "emprestei" : "peguei"));
  const [editando, setEditando] = useState(null);
  const [pagando, setPagando] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [verQuitados, setVerQuitados] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return undefined;
    const tempo = setTimeout(() => setAviso(""), 5000);
    return () => clearTimeout(tempo);
  }, [aviso]);

  const todos = [...r.peguei.itens, ...r.emprestei.itens];
  const daLista = r[aba];
  const abertos = daLista.itens.filter((i) => i.resumo.situacao !== "quitado");
  const quitados = daLista.itens.filter((i) => i.resumo.situacao === "quitado");
  const atrasados = [...r.peguei.atrasados, ...r.emprestei.atrasados];
  const bancos = resumoDosBancos(data).bancos;
  const nomesDosBancos = new Map(bancos.map((b) => [String(b.banco.id), b.banco.nome]));

  // a janela sempre usa os dados de agora: se o empréstimo foi excluído ou quitado (ex.: em outro aparelho), ela fecha
  const itemPagando = pagando != null ? todos.find((i) => String(i.emprestimo.id) === String(pagando)) || null : null;
  useEffect(() => {
    if (pagando != null && (!itemPagando || itemPagando.resumo.situacao === "quitado")) setPagando(null);
  }, [pagando, itemPagando]);

  function excluir({ emprestimo: e }) {
    const pagamentos = pagamentosDoEmprestimo(e);
    const n = pagamentos.length;
    const comBanco = pagamentos.some((p) => p.bancoId != null && p.bancoId !== "");
    const nosBancos = !comBanco
      ? ""
      : e.tipo === "emprestei"
        ? " O que já entrou nos bancos continua lá."
        : " O que já saiu dos bancos continua descontado.";
    const pergunta = `Excluir o empréstimo "${nomeDoEmprestimo(e)}"${n ? ` e os ${n} pagamentos registrados nele` : ""}?${nosBancos}`;
    if (!window.confirm(pergunta)) return;
    const res = onExcluir(e.id);
    setAviso(res?.erro ? res.erro : `Empréstimo "${nomeDoEmprestimo(e)}" excluído.`);
    if (editando === e.id) setEditando(null);
  }

  function desfazer({ emprestimo: e }, p) {
    const banco = p.bancoId != null && p.bancoId !== "" ? acharBanco(data, p.bancoId) : null;
    const noBanco = !banco
      ? ""
      : e.tipo === "emprestei"
        ? ` O valor sai do banco (${banco.nome}).`
        : ` O valor volta para o banco (${banco.nome}).`;
    const pergunta = `Desfazer ${e.tipo === "peguei" ? "o pagamento" : "o recebimento"} de ${money(Number(p.valor))}${p.parcela ? ` (parcela ${p.parcela})` : ""}?${noBanco}`;
    if (!window.confirm(pergunta)) return;
    const res = onDesfazer(e.id, p.id);
    if (res?.erro) setAviso(res.erro);
  }

  function confirmarPagamento(item, pagamento) {
    const { emprestimo: e, resumo: rr } = item;
    const res = onPagar(e.id, pagamento);
    if (res?.erro) return res;
    const detalhe =
      e.forma === "parcelado"
        ? `parcela ${rr.proxima.numero} de ${rr.quantidade} de ${nomeDoEmprestimo(e)} (${money(parseValor(pagamento.valor))})`
        : `${money(parseValor(pagamento.valor))} de ${nomeDoEmprestimo(e)}`;
    const banco = pagamento.bancoId != null && pagamento.bancoId !== "" ? acharBanco(data, pagamento.bancoId) : null;
    const onde = banco ? ` O valor entrou no banco ${banco.nome}.` : pagamento.especie ? " Recebido em espécie." : "";
    setAviso(`${TEXTO[e.tipo].registrado}: ${detalhe}.${onde}`);
    setPagando(null);
    return { ok: true };
  }

  function cartao(item) {
    const id = item.emprestimo.id;
    if (editando === id) {
      return (
        <EmprestimoForm
          key={`editar-${id}`}
          inicial={item.emprestimo}
          hoje={hoje}
          onSalvar={(form) => {
            const res = onSalvar(form);
            if (!res?.erro) {
              setEditando(null);
              setAviso(`Empréstimo "${nomeDoEmprestimo({ descricao: form.descricao, pessoa: form.pessoa })}" salvo.`);
              if (form.tipo !== aba) setAba(form.tipo);
            }
            return res;
          }}
          onCancelar={() => setEditando(null)}
        />
      );
    }
    return (
      <CartaoDoEmprestimo
        key={id}
        item={item}
        nomesDosBancos={nomesDosBancos}
        historicoAberto={historico === id}
        onHistorico={() => setHistorico((h) => (h === id ? null : id))}
        onPagar={() => setPagando(id)}
        onEditar={() => {
          setAviso("");
          setEditando(id);
        }}
        onExcluir={() => excluir(item)}
        onDesfazer={(p) => desfazer(item, p)}
      />
    );
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Planejamento</div>
          <h1>🤝 Empréstimos</h1>
        </div>
      </header>

      <div className="grid2 emp-totais">
        <section className="mini-card negative">
          <span>Você deve</span>
          <strong>{money(r.peguei.falta)}</strong>
          <small>{r.peguei.abertos ? `${r.peguei.abertos} em aberto` : "Nada em aberto"}</small>
        </section>
        <section className="mini-card positive">
          <span>Te devem</span>
          <strong>{money(r.emprestei.falta)}</strong>
          <small>{r.emprestei.abertos ? `${r.emprestei.abertos} em aberto` : "Nada em aberto"}</small>
        </section>
      </div>

      {atrasados.length > 0 && (
        <section className="alerts emp-alertas" aria-label="Empréstimos atrasados">
          {atrasados.map((i) => (
            <button type="button" className="alert aviso" key={i.emprestimo.id} onClick={() => setAba(i.emprestimo.tipo)}>
              <span aria-hidden="true">⚠️</span>
              <p>{textoDoAtraso(i)}</p>
            </button>
          ))}
        </section>
      )}

      <div className="segmented emp-abas" role="radiogroup" aria-label="Lista">
        <button
          type="button"
          role="radio"
          aria-checked={aba === "peguei"}
          className={aba === "peguei" ? "selected danger" : ""}
          onClick={() => setAba("peguei")}
        >
          Peguei ({r.peguei.itens.length})
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={aba === "emprestei"}
          className={aba === "emprestei" ? "selected success" : ""}
          onClick={() => setAba("emprestei")}
        >
          Emprestei ({r.emprestei.itens.length})
        </button>
      </div>

      {aviso && (
        <p className="pag-feito emp-aviso" role="status">
          {aviso}
        </p>
      )}

      {daLista.itens.length === 0 && <p className="muted empty emp-vazio">{TEXTO[aba].vazio} Cadastre no formulário abaixo.</p>}

      {abertos.map(cartao)}

      {quitados.length > 0 && (
        <button type="button" className="ghost wide emp-ver-quitados" onClick={() => setVerQuitados((v) => !v)} aria-expanded={verQuitados}>
          {verQuitados ? "Esconder quitados" : `Ver quitados (${quitados.length})`}
        </button>
      )}
      {verQuitados && quitados.map(cartao)}

      <EmprestimoForm
        key="novo"
        tipoDaLista={aba}
        hoje={hoje}
        onSalvar={(form) => {
          const res = onSalvar(form);
          if (!res?.erro) {
            setAba(form.tipo);
            setAviso(`Empréstimo "${nomeDoEmprestimo({ descricao: form.descricao, pessoa: form.pessoa })}" adicionado.`);
          }
          return res;
        }}
      />

      {itemPagando && itemPagando.resumo.situacao !== "quitado" && (
        <JanelaDePagamento
          key={pagando}
          item={itemPagando}
          hoje={hoje}
          bancos={bancos}
          onConfirmar={(p) => confirmarPagamento(itemPagando, p)}
          onFechar={() => setPagando(null)}
        />
      )}
    </div>
  );
}
