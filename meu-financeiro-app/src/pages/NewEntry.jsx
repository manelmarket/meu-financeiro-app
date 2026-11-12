import React from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, Delete, Mic, Paperclip, Sparkles, X } from "lucide-react";
import { usarAparencia } from "../lib/aparencia.js";
import { esquecerFraseDoJarvis, lerFraseDoJarvis } from "../lib/jarvis.js";
import { interpretarFrase } from "../lib/interpretar.js";
import ScanButton from "../components/ScanButton.jsx";
import FalarOuEscrever from "../components/FalarOuEscrever.jsx";
import { ChipsCategoria, SeletorCategoria } from "../components/Categoria.jsx";
import { CATEGORIA_PADRAO, FORMAS_PAGAMENTO, nomesDasCategorias } from "../lib/categorias.js";
import { arredondar, dataBR, dataValida, hojeISO, money, parseValor, rotuloMes } from "../lib/formato.js";
import { datasDaFatura, mesDaFatura, valoresDasParcelas } from "../lib/cartao.js";
import { MAXIMO_DE_PARCELAS, montarLancamento, pareceFatura } from "../lib/lancar.js";
import { CRIAR_CARTEIRA, NOME_DA_CARTEIRA, acharCarteira, montarTransferencia } from "../lib/transferencias.js";
import { comprimirImagem, salvarCupom } from "../storage/cupons.js";
import { confirmar } from "../lib/dialogo.js";

const OPCOES_PARCELAS = Array.from({ length: MAXIMO_DE_PARCELAS }, (_, i) => i + 1);
const FORMAS_DE_RECEITA = FORMAS_PAGAMENTO.filter((f) => f !== "Cartão");
const CHAVE_BANCO = "meu_financeiro_ultimo_banco";
const FORA = "";

export function bancoGuardado(bancos) {
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
function novaParte(forma, bancoId, cartaoId, extra = {}) {
  proximaChave += 1;
  return { chave: proximaChave, forma, valor: "", bancoId, cartaoId, parcelas: 1, auto: true, ...extra };
}

function textoDoValor(v) {
  return v > 0 ? v.toFixed(2).replace(".", ",") : "";
}

// Registrar movimentação: gasto, receita ou transferência entre bancos.
// O gasto pode ser dividido em várias formas de pagamento (ex.: parte no Pix, parte em espécie,
// parte em cartões com as parcelas de cada um). Escolhendo o banco, o saldo dele muda sozinho.
// A transferência (entre bancos, saque ou depósito) só muda o saldo dos bancos.
// Dá para falar ou escrever a frase ("gastei 50 no mercado no pix do nubank") e o app preenche tudo.
export default function NewEntry({
  data: dados,
  cartoes = [],
  bancos = [],
  hoje = hojeISO(),
  onSave,
  onCancel,
  onConfigurarIA,
  onCriarCategoria,
  onTransferir,
  onJarvis
}) {
  const { estilo } = usarAparencia();
  const moderno = estilo === "banco" || estilo === "vidro";
  const [mostrarFrase, setMostrarFrase] = useState(false);
  const bancoPadrao = bancoGuardado(bancos);
  const carteira = acharCarteira(dados);
  const bancoDoDinheiro = carteira ? String(carteira.id) : "";
  const categoriasDisponiveis = nomesDasCategorias(dados);
  const [tipo, setTipo] = useState("saida");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(categoriasDisponiveis.includes("Alimentação") ? "Alimentação" : categoriasDisponiveis[0] || CATEGORIA_PADRAO);
  const [data, setData] = useState(hoje);
  const [formaReceita, setFormaReceita] = useState("Pix");
  const [bancoReceita, setBancoReceita] = useState(bancoPadrao);
  const [partes, setPartes] = useState(() => [novaParte("Pix", bancoPadrao, cartoes[0]?.id ?? "")]);
  // transferência entre bancos
  const [de, setDe] = useState(bancoPadrao);
  const [para, setPara] = useState(() => {
    const outro = bancos.find((b) => String(b.banco.id) !== bancoPadrao);
    return outro ? String(outro.banco.id) : carteira ? String(carteira.id) : CRIAR_CARTEIRA;
  });
  const [foto, setFoto] = useState(null);
  const [obs, setObs] = useState("");
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
          // em dinheiro, o gasto sai da Carteira (se ela existir)
          if (v === "Dinheiro") nova.bancoId = bancoDoDinheiro;
          else if (p.forma === "Dinheiro" && (!p.bancoId || p.bancoId === bancoDoDinheiro)) nova.bancoId = bancoPadrao;
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
    const congelado = partes.length === 1 ? "" : textoDoValor(valores[ultima]);
    const antigas = partes.map((p, j) => (j === ultima && p.auto ? { ...p, auto: false, valor: congelado } : p));
    const usadas = new Set(antigas.map((p) => p.forma));
    const forma = ["Dinheiro", "Pix", "Débito", "Cartão", "Transferência"].find((f) => !usadas.has(f)) || "Pix";
    setPartes([...antigas, novaParte(forma, forma === "Dinheiro" ? bancoDoDinheiro : bancoPadrao, cartoes[0]?.id ?? "")]);
  }

  function tirarParte(i) {
    setErro("");
    setPartes((lista) => {
      const resto = lista.filter((_, j) => j !== i);
      return resto.map((p, j) => (j === resto.length - 1 ? { ...p, auto: true, valor: "" } : p));
    });
  }

  function preencherPeloCupom(lido, blob) {
    if (lido.valor) setValor(textoDoValor(lido.valor));
    if (lido.descricao) setDescricao(lido.descricao);
    if (lido.data) setData(lido.data);
    if (lido.categoria) setCategoria(lido.categoria);
    setTipo("saida");
    setFoto(blob);
    setErro("");
  }

  // pedido por voz ao Jarvis (?jarvis=frase): preenche os campos; a pessoa confere e toca em Salvar
  useEffect(() => {
    const frase = lerFraseDoJarvis();
    if (!frase) return;
    esquecerFraseDoJarvis();
    const r = interpretarFrase(frase, dados, hoje);
    if (r.entendido) preencherPelaFrase(r);
    else setErro(`O Jarvis pediu "${frase}", mas não entendi o valor. Preencha os campos.`);
  }, []);

  // o que a frase falada/escrita entendeu (ver lib/interpretar.js) vai para os campos
  function preencherPelaFrase(r) {
    setErro("");
    setTipo(r.tipo);
    if (r.valor) setValor(textoDoValor(r.valor));
    if (r.descricao) setDescricao(r.descricao);
    if (dataValida(r.data)) setData(r.data);
    if (r.tipo === "transferencia") {
      const bancoExiste = (id) => bancos.some((b) => String(b.banco.id) === String(id));
      const traduzir = (id, vazio) => (id === CRIAR_CARTEIRA ? CRIAR_CARTEIRA : id !== null && bancoExiste(id) ? String(id) : vazio);
      setDe(traduzir(r.de, FORA));
      setPara(traduzir(r.para, FORA));
      return;
    }
    if (r.tipo === "entrada") {
      const p = r.partes[0];
      if (p?.forma && FORMAS_DE_RECEITA.includes(p.forma)) setFormaReceita(p.forma);
      if (p?.bancoId && bancos.some((b) => String(b.banco.id) === String(p.bancoId))) setBancoReceita(String(p.bancoId));
      return;
    }
    if (r.categoria && categoriasDisponiveis.includes(r.categoria)) setCategoria(r.categoria);
    if (!r.partes.length) return;
    const novas = r.partes.map((p, i) => {
      const cartaoId = p.cartaoId && cartoes.some((c) => String(c.id) === String(p.cartaoId)) ? p.cartaoId : (cartoes[0]?.id ?? "");
      const bancoId =
        p.forma === "Cartão"
          ? ""
          : p.bancoId && bancos.some((b) => String(b.banco.id) === String(p.bancoId))
            ? String(p.bancoId)
            : p.forma === "Dinheiro"
              ? bancoDoDinheiro
              : bancoPadrao;
      const ultima = i === r.partes.length - 1;
      return novaParte(p.forma, bancoId, cartaoId, {
        parcelas: Math.min(MAXIMO_DE_PARCELAS, Math.max(1, p.parcelas || 1)),
        valor: r.partes.length > 1 && p.valor ? textoDoValor(p.valor) : "",
        auto: r.partes.length === 1 || (ultima && !p.valor)
      });
    });
    setPartes(novas);
  }

  const temCartao = tipo === "saida" && partes.some((p) => p.forma === "Cartão") && cartoes.length > 0;

  async function submit(e) {
    e.preventDefault();

    if (tipo === "transferencia") {
      const form = { subtipo: "transferencia", valor: total, descricao, data, de, para };
      if (de === FORA && para !== FORA) form.subtipo = "deposito";
      if (para === FORA && de !== FORA) form.subtipo = "saque";
      const previa = montarTransferencia(form, dados);
      if (previa.erro) return setErro(previa.erro);
      const r = onTransferir(form);
      if (r?.erro) return setErro(r.erro);
      return;
    }

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
    if (tipo === "saida" && previa.lancamento && pareceFatura(descricao) && cartoes.length > 0) {
      const seguir = await confirmar(
        "Isso parece o pagamento de uma fatura de cartão.\n\nAs compras do cartão já contam como gasto: lançar o pagamento como gasto conta duas vezes. O certo é usar o botão Pagar no cartão (o valor sai do banco sem virar despesa).\n\nLançar como gasto mesmo assim?"
      );
      if (!seguir) return;
    }

    setSalvando(true);
    const agora = Date.now();
    // a foto (cupom ou comprovante) fica na compra do cartão; sem cartão, no próprio lançamento
    let cupomId = null;
    if (foto) {
      try {
        cupomId = `cupom-${agora + 1}`;
        await salvarCupom(cupomId, foto);
      } catch {
        cupomId = null;
      }
    }
    const r = montarLancamento({ ...form, ...(cupomId && previa.compras.length ? { cupomId } : {}) }, cartoes, agora);
    if (cupomId && !previa.compras.length && r.lancamento) r.lancamento.cupomId = cupomId;
    const nota = obs.trim().slice(0, 300);
    if (nota) {
      if (r.lancamento) r.lancamento.obs = nota;
      for (const c of r.compras || []) c.compra.obs = nota;
    }
    const usado = tipo === "entrada" ? bancoReceita : partes.find((p) => p.forma !== "Cartão" && p.forma !== "Dinheiro")?.bancoId;
    if (bancos.length && usado !== undefined) guardarBanco(usado);
    onSave(r);
  }

  // prévia do que muda em cada banco
  const mudancas = new Map();
  if (bancos.length && total > 0) {
    if (tipo === "entrada") {
      if (bancoReceita) mudancas.set(bancoReceita, total);
    } else if (tipo === "transferencia") {
      if (de !== FORA && de !== CRIAR_CARTEIRA) mudancas.set(String(de), -total);
      if (para !== FORA && para !== CRIAR_CARTEIRA) mudancas.set(String(para), arredondar((mudancas.get(String(para)) || 0) + total));
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

  // seletor da transferência: bancos + Carteira (criar) + fora do app
  const seletorDaTransferencia = (valorAtual, aoMudar, rotulo, textoFora) => (
    <label>
      {rotulo}
      <select
        value={valorAtual}
        onChange={(e) => {
          aoMudar(e.target.value);
          setErro("");
        }}
      >
        {bancos.map((b) => (
          <option key={b.banco.id} value={String(b.banco.id)}>
            {b.banco.nome}
          </option>
        ))}
        {!carteira && <option value={CRIAR_CARTEIRA}>{NOME_DA_CARTEIRA} (criar agora)</option>}
        <option value={FORA}>{textoFora}</option>
      </select>
    </label>
  );

  const ehTransferencia = tipo === "transferencia";

  // teclado numérico (estilos Banco digital e Vidro): os dígitos entram pelos centavos
  function teclar(t) {
    setErro("");
    const atual = Math.round((parseValor(valor) > 0 ? parseValor(valor) : 0) * 100);
    let novo = t === "apagar" ? Math.floor(atual / 10) : t === "00" ? atual * 100 : atual * 10 + Number(t);
    if (novo > 99999999999) novo = atual;
    setValor(novo > 0 ? textoDoValor(novo / 100) : "");
  }

  return (
    <div className={`page${moderno ? " lancar-m" : ""}`}>
      {moderno ? (
        <header className="lancar-m-topo">
          <button type="button" className="lancar-m-redondo" onClick={onCancel} aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
          <h1>Novo lançamento</h1>
          {onJarvis && (
            <button type="button" className="lancar-m-redondo jarvis" onClick={onJarvis} aria-label="Lançar falando com o Jarvis">
              <Mic size={20} />
            </button>
          )}
        </header>
      ) : (
        <header className="topbar">
          <div>
            <div className="eyebrow">Novo lançamento</div>
            <h1>Registrar movimentação</h1>
          </div>
        </header>
      )}

      {moderno ? (
        <>
          <button type="button" className="lancar-m-frase" onClick={() => setMostrarFrase((v) => !v)} aria-expanded={mostrarFrase}>
            <Sparkles size={15} /> {mostrarFrase ? "Esconder" : "Preencher falando ou escrevendo uma frase"}
          </button>
          {mostrarFrase && <FalarOuEscrever dados={dados} hoje={hoje} onPreencher={preencherPelaFrase} onConfigurarIA={onConfigurarIA} />}
        </>
      ) : (
        <FalarOuEscrever dados={dados} hoje={hoje} onPreencher={preencherPelaFrase} onConfigurarIA={onConfigurarIA} />
      )}

      <form className={`section-card form${moderno ? " form-m" : ""}`} onSubmit={submit}>
        <div className="segmented tres" role="radiogroup" aria-label="Tipo">
          <button
            type="button"
            role="radio"
            aria-checked={tipo === "saida"}
            className={tipo === "saida" ? "selected danger" : ""}
            onClick={() => {
              setTipo("saida");
              setErro("");
            }}
          >
            Gasto
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={tipo === "entrada"}
            className={tipo === "entrada" ? "selected success" : ""}
            onClick={() => {
              setTipo("entrada");
              setErro("");
            }}
          >
            Receita
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={ehTransferencia}
            className={ehTransferencia ? "selected info" : ""}
            onClick={() => {
              setTipo("transferencia");
              setErro("");
            }}
          >
            Transferência
          </button>
        </div>

        {moderno && (
          <div className="lancar-m-valor">
            <small>Valor</small>
            <strong className={tipo === "entrada" ? "in" : ehTransferencia ? "transf" : ""} aria-live="polite">
              {money(total > 0 ? total : 0)}
            </strong>
            <div className="teclado" role="group" aria-label="Teclado do valor">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "apagar"].map((t) => (
                <button type="button" key={t} onClick={() => teclar(t)} aria-label={t === "apagar" ? "Apagar" : t}>
                  {t === "apagar" ? <Delete size={22} /> : t}
                </button>
              ))}
            </div>
          </div>
        )}

        {tipo === "saida" && <ScanButton onResult={preencherPeloCupom} onConfigurar={onConfigurarIA} categorias={categoriasDisponiveis} />}
        {foto && tipo === "saida" && (
          <p className="hint">
            📷 Foto guardada como comprovante{temCartao ? " da compra" : ""}. Confira os campos antes de salvar.
          </p>
        )}

        {!moderno && (
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
        )}
        <label>
          {ehTransferencia ? "Descrição (opcional)" : "Descrição"}
          <input
            placeholder={ehTransferencia ? "Ex.: Saque, Pix entre contas" : "Ex.: Mercado"}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              setErro("");
            }}
          />
        </label>
        {tipo === "saida" &&
          (moderno ? (
            <ChipsCategoria dados={dados} valor={categoria} onChange={setCategoria} onCriar={onCriarCategoria} />
          ) : (
            <SeletorCategoria dados={dados} valor={categoria} onChange={setCategoria} onCriar={onCriarCategoria} />
          ))}

        {ehTransferencia ? (
          <>
            <div className="grid2 tight">
              {seletorDaTransferencia(de, setDe, "Sai de", "Fora do app")}
              {seletorDaTransferencia(para, setPara, "Vai para", "Fora do app")}
            </div>
            <p className="hint">
              Transferência entre bancos, saque ou depósito não conta como gasto nem receita: só muda o saldo dos bancos.
            </p>
          </>
        ) : tipo === "entrada" ? (
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
                          value={p.auto && i === partes.length - 1 ? textoDoValor(v) : p.valor}
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

        {!ehTransferencia && (
          <>
            <label>
              Observação (opcional)
              <input value={obs} maxLength={300} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: dividido com a Ana" />
            </label>
            <div className="anexar-linha">
              <label className="secondary anexar-botao">
                <Paperclip size={16} /> {foto ? "Trocar comprovante" : "Anexar comprovante"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const arq = e.target.files?.[0];
                    if (!arq) return;
                    try {
                      setFoto(await comprimirImagem(arq));
                    } catch {
                      setFoto(arq);
                    }
                  }}
                />
              </label>
              {foto && (
                <button type="button" className="link perigo" onClick={() => setFoto(null)}>
                  tirar foto
                </button>
              )}
            </div>
          </>
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
            {moderno ? "Salvar lançamento" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
