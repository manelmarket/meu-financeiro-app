import React, { useEffect, useRef, useState } from "react";
import { Check, Mic, Send, Square, Undo2, Volume2, VolumeX, X, Zap } from "lucide-react";
import { ConfigIA } from "./Assistant.jsx";
import { bancoGuardado } from "./NewEntry.jsx";
import { ErroIA, lerConfigIA } from "../lib/ia.js";
import { contextoDaConversa, conversarComIA, executarAcoes, respostaCurta } from "../lib/conversa.js";
import { interpretarFrase } from "../lib/interpretar.js";
import { resumoDosBancos } from "../lib/saldos.js";
import { lerAparencia, mudarAparencia } from "../lib/aparencia.js";
import { apagarCupom } from "../storage/cupons.js";
import { primeiroNome } from "../lib/perfil.js";
import { lerAbrirNoJarvis, salvarAbrirNoJarvis } from "../lib/jarvis.js";
import { confirmar } from "../lib/dialogo.js";

const CHAVE_CONVERSA = "meu_financeiro_jarvis_conversa";
const CHAVE_VOZ = "meu_financeiro_jarvis_voz";
const MAXIMO_DE_MENSAGENS = 40;

function Reconhecimento() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function lerConversa() {
  try {
    const lista = JSON.parse(sessionStorage.getItem(CHAVE_CONVERSA) || "[]");
    return Array.isArray(lista) ? lista.filter((m) => m && typeof m.texto === "string") : [];
  } catch {
    return [];
  }
}

function guardarConversa(lista) {
  try {
    sessionStorage.setItem(CHAVE_CONVERSA, JSON.stringify(lista.slice(-MAXIMO_DE_MENSAGENS)));
  } catch {
    // sem sessionStorage: a conversa vale só enquanto a tela está aberta
  }
}

function lerAjusteDeVoz() {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_VOZ) || "null");
    return { falar: v?.falar !== false, maosLivres: v?.maosLivres === true };
  } catch {
    return { falar: true, maosLivres: false };
  }
}

function falar(texto, aoTerminar) {
  try {
    const sintese = window.speechSynthesis;
    if (!sintese || !texto) return aoTerminar?.();
    sintese.cancel();
    const fala = new SpeechSynthesisUtterance(texto.replace(/R\$\s?/g, "").replace(/→/g, "para"));
    fala.lang = "pt-BR";
    const voz = sintese.getVoices().find((v) => v.lang?.toLowerCase().startsWith("pt-br")) || sintese.getVoices().find((v) => v.lang?.toLowerCase().startsWith("pt"));
    if (voz) fala.voice = voz;
    fala.rate = 1.05;
    fala.onend = () => aoTerminar?.();
    fala.onerror = () => aoTerminar?.();
    sintese.speak(fala);
  } catch {
    aoTerminar?.();
  }
}

const EXEMPLOS = ["mercado 80 ontem nubank", "uber 25", "quanto gastei esse mês?", "paguei a internet", "o último lançamento era 45", "guarda 200 na reserva"];

// Conversa com o Jarvis: fala ou escreve do jeito que quiser; ele entende, mostra o que vai fazer
// e só grava depois do "sim" (ver lib/conversa.js)
export default function Jarvis({ data, setData, hoje, perfil, comPerfil, guardarPagamentosDaConta, onIr, onBack, ouvirAoAbrir, pedidoInicial }) {
  const [config, setConfig] = useState(() => lerConfigIA());
  const [mensagens, guardarMensagens] = useState(() => lerConversa());
  const [texto, setTexto] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const [pensando, setPensando] = useState(false);
  const [voz, setVoz] = useState(() => lerAjusteDeVoz());
  const [abrirAqui, setAbrirAqui] = useState(() => lerAbrirNoJarvis());
  const jaOuviuAoAbrir = useRef(null);
  const reconhecedor = useRef(null);
  const ocupado = useRef(false);
  const fim = useRef(null);
  const dadosAtuais = useRef(data);
  const suporteVoz = Boolean(Reconhecimento());

  const msgs = useRef(mensagens);
  const vozAtual = useRef(voz);
  vozAtual.current = voz;
  dadosAtuais.current = data;

  // a conversa sempre atual (o microfone do "mãos livres" chama enviar de uma versão antiga da tela)
  function setMensagens(f) {
    msgs.current = typeof f === "function" ? f(msgs.current) : f;
    guardarMensagens(msgs.current);
  }

  useEffect(() => {
    guardarConversa(mensagens);
  }, [mensagens]);
  useEffect(() => {
    fim.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [mensagens, pensando]);
  useEffect(
    () => () => {
      reconhecedor.current?.abort?.();
      reconhecedor.current = null;
      try {
        window.speechSynthesis?.cancel();
      } catch {
        // nada
      }
    },
    []
  );

  function mudarVoz(parcial) {
    const novo = { ...voz, ...parcial };
    setVoz(novo);
    try {
      localStorage.setItem(CHAVE_VOZ, JSON.stringify(novo));
    } catch {
      // vale até fechar o app
    }
  }

  function opcoes(agora) {
    const bancos = resumoDosBancos(dadosAtuais.current).bancos;
    return { hoje, agora, bancos, bancoPadrao: bancoGuardado(bancos), comPerfil, guardarPagamentosDaConta };
  }

  function responder(msg) {
    setMensagens((lista) => [...lista, { id: Date.now() + Math.random(), autor: "jarvis", ...msg }]);
    if (vozAtual.current.falar) falar(msg.texto, () => vozAtual.current.maosLivres && !msg.semMicDepois && ouvir());
  }

  function aplicarEfeitos(itens) {
    for (const item of itens) {
      if (item.efeito?.tipo === "tema") {
        const { tipo, ...resto } = item.efeito;
        mudarAparencia(resto);
      }
    }
    const abrir = itens.find((i) => i.efeito?.tipo === "abrir");
    if (abrir) setTimeout(() => onIr(abrir.efeito.pagina), 900);
  }

  // mostra o que vai ser feito; mudanças nos dados esperam a confirmação
  function prepararAcoes(resposta, acoes) {
    if (!acoes.length) return responder({ texto: resposta });
    const agora = Date.now();
    const previa = executarAcoes(dadosAtuais.current, acoes, opcoes(agora));
    if (!previa.mudou) {
      aplicarEfeitos(previa.itens);
      return responder({ texto: resposta, itens: previa.itens, estado: "feito", semMicDepois: previa.itens.some((i) => i.efeito?.tipo === "abrir") });
    }
    responder({ texto: resposta, itens: previa.itens, acoes, agora, estado: "pendente", semMicDepois: false });
  }

  function confirmar(id) {
    const msg = msgs.current.find((m) => m.id === id);
    if (!msg || msg.estado !== "pendente") return;
    const base = dadosAtuais.current;
    const opc = opcoes(msg.agora);
    const r = executarAcoes(base, msg.acoes, opc);
    // compras apagadas: a foto do cupom sai também
    const cupons = new Set(
      (base.cartoes || []).flatMap((c) => (c.compras || []).filter((x) => x.cupomId).map((x) => x.cupomId))
    );
    for (const c of r.dados.cartoes || []) for (const x of c.compras || []) cupons.delete(x.cupomId);
    for (const cupomId of cupons) apagarCupom(cupomId).catch(() => {});

    setData((d) => (d === base ? r.dados : executarAcoes(d, msg.acoes, opc).dados));
    aplicarEfeitos(r.itens);
    const erros = r.itens.filter((i) => i.erro).length;
    setMensagens((lista) => lista.map((m) => (m.id === id ? { ...m, estado: "feito", itens: r.itens, antes: base, depois: r.dados } : m)));
    const ok = r.itens.length - erros;
    if (vozAtual.current.falar) falar(ok ? (erros ? "Feito, menos o que não deu." : "Feito.") : "Não consegui fazer nada disso.", () => vozAtual.current.maosLivres && ouvir());
  }

  function cancelar(id) {
    setMensagens((lista) => lista.map((m) => (m.id === id ? { ...m, estado: "cancelado" } : m)));
    if (vozAtual.current.falar) falar("Tudo bem, não fiz nada.", () => vozAtual.current.maosLivres && ouvir());
  }

  function desfazer(id) {
    const msg = msgs.current.find((m) => m.id === id);
    if (!msg?.antes) return;
    if (dadosAtuais.current !== msg.depois) {
      responder({ texto: "Já mudou outra coisa depois disso, então não dá para desfazer daqui. Me diga o que corrigir." });
      return;
    }
    const { antes, depois } = msg;
    setData((d) => (d === depois ? antes : d));
    setMensagens((lista) => lista.map((m) => (m.id === id ? { ...m, estado: "desfeito", antes: undefined, depois: undefined } : m)));
    if (vozAtual.current.falar) falar("Desfeito.");
  }

  async function enviar(frase = texto) {
    const limpa = String(frase || "").trim().slice(0, 500);
    if (!limpa || ocupado.current) return;
    setTexto("");
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // nada
    }

    // "sim" / "não" com ações esperando
    const pendente = [...msgs.current].reverse().find((m) => m.estado === "pendente");
    const curta = pendente ? respostaCurta(limpa) : null;
    const minha = { id: Date.now() + Math.random(), autor: "pessoa", texto: limpa };
    // ações não confirmadas saem quando a pessoa já falou de outra coisa
    const conversa = [...msgs.current.map((m) => (m.estado === "pendente" && !curta ? { ...m, estado: "cancelado" } : m)), minha];
    setMensagens(conversa);
    if (curta === "sim") return confirmar(pendente.id);
    if (curta === "nao") return cancelar(pendente.id);

    if (!config) {
      // sem IA: só frases de lançamento simples
      const r = interpretarFrase(limpa, dadosAtuais.current, hoje);
      if (!r.entendido) {
        return responder({ texto: "Sem a IA configurada eu só entendo lançamentos simples, como \"gastei 50 no mercado\". Configure a IA aqui embaixo e eu entendo tudo." });
      }
      return prepararAcoes("Entendi assim. Confirma?", [{ acao: "lancar_local", frase: limpa }]);
    }

    setPensando(true);
    ocupado.current = true;
    try {
      const contexto = contextoDaConversa(dadosAtuais.current, hoje, perfil, lerAparencia());
      const r = await conversarComIA(config, conversa.map(({ autor, texto: t }) => ({ autor, texto: t })), contexto);
      prepararAcoes(r.resposta, r.acoes);
    } catch (falha) {
      responder({ texto: falha instanceof ErroIA ? falha.message : "Não consegui falar com a IA agora. Tente de novo.", semMicDepois: true });
    } finally {
      ocupado.current = false;
      setPensando(false);
    }
  }

  function ouvir() {
    const Classe = Reconhecimento();
    if (!Classe) return;
    if (reconhecedor.current) {
      reconhecedor.current.stop?.();
      return;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // nada
    }
    const r = new Classe();
    r.lang = "pt-BR";
    r.interimResults = true;
    r.maxAlternatives = 1;
    let final = "";
    r.onresult = (e) => {
      let parcial = "";
      final = "";
      for (const res of Array.from(e.results)) {
        if (res.isFinal) final += `${res[0]?.transcript || ""} `;
        else parcial += res[0]?.transcript || "";
      }
      setTexto((final + parcial).trim());
    };
    r.onerror = (e) => {
      setOuvindo(false);
      reconhecedor.current = null;
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        responder({ texto: "O celular não deixou usar o microfone. Permita o microfone para o app e tente de novo.", semMicDepois: true });
      }
    };
    r.onend = () => {
      setOuvindo(false);
      reconhecedor.current = null;
      if (final.trim()) enviar(final.trim());
    };
    reconhecedor.current = r;
    setOuvindo(true);
    try {
      r.start();
    } catch {
      setOuvindo(false);
      reconhecedor.current = null;
    }
  }

  // aberto pelo atalho "Falar com o Jarvis" (ou pela opção de abrir o app aqui): já começa ouvindo
  useEffect(() => {
    if (!ouvirAoAbrir || jaOuviuAoAbrir.current === ouvirAoAbrir) return;
    const id = setTimeout(() => {
      jaOuviuAoAbrir.current = ouvirAoAbrir;
      ouvir();
    }, 300);
    return () => clearTimeout(id);
  }, [ouvirAoAbrir]);

  // pedido do Jarvis do Android que precisa de confirmação: já vem entendido pela IA
  const pedidoFeito = useRef(null);
  useEffect(() => {
    if (!pedidoInicial || pedidoFeito.current === pedidoInicial.id) return;
    pedidoFeito.current = pedidoInicial.id;
    setMensagens((lista) => [
      ...lista.map((m) => (m.estado === "pendente" ? { ...m, estado: "cancelado" } : m)),
      { id: Date.now() + Math.random(), autor: "pessoa", texto: pedidoInicial.frase }
    ]);
    prepararAcoes(pedidoInicial.resposta, pedidoInicial.acoes || []);
  }, [pedidoInicial]);

  function mudarAbrirAqui() {
    const ligado = !abrirAqui;
    salvarAbrirNoJarvis(ligado);
    setAbrirAqui(ligado);
  }

  async function limpar() {
    if (!await confirmar("Apagar a conversa com o Jarvis? (seus dados não mudam)")) return;
    setMensagens([]);
  }

  const nome = primeiroNome(perfil?.apelido || perfil?.nome || "");

  return (
    <div className="page jarvis-page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Fale do seu jeito</div>
          <h1>Jarvis</h1>
        </div>
      </header>

      <div className="jarvis-ajustes">
        <button type="button" className={`jarvis-chip${voz.falar ? " ativo" : ""}`} onClick={() => mudarVoz({ falar: !voz.falar })}>
          {voz.falar ? <Volume2 size={15} /> : <VolumeX size={15} />} {voz.falar ? "Falando" : "Mudo"}
        </button>
        {suporteVoz && (
          <button type="button" className={`jarvis-chip${voz.maosLivres ? " ativo" : ""}`} onClick={() => mudarVoz({ maosLivres: !voz.maosLivres })}>
            <Mic size={15} /> Mãos livres {voz.maosLivres ? "ligado" : "desligado"}
          </button>
        )}
        {suporteVoz && (
          <button type="button" className={`jarvis-chip${abrirAqui ? " ativo" : ""}`} onClick={mudarAbrirAqui} title="Toda vez que abrir o app, ele vem direto para o Jarvis já ouvindo">
            <Zap size={15} /> Abrir o app aqui {abrirAqui ? "ligado" : "desligado"}
          </button>
        )}
        {mensagens.length > 0 && (
          <button type="button" className="jarvis-chip" onClick={limpar}>
            Limpar
          </button>
        )}
      </div>

      <section className="jarvis-conversa" aria-live="polite">
        {mensagens.length === 0 && (
          <div className="jarvis-vazio">
            <p>
              <b>Oi{nome ? `, ${nome}` : ""}!</b> Pode falar do seu jeito, até com palavras soltas. Eu lanço, corrijo, apago, pago contas e
              faturas, mexo nas metas e respondo perguntas sobre o seu dinheiro.
            </p>
            <div className="jarvis-exemplos">
              {EXEMPLOS.map((e) => (
                <button type="button" key={e} className="jarvis-chip" onClick={() => enviar(e)} disabled={pensando}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((m) => (
          <div key={m.id} className={`jarvis-msg ${m.autor}`}>
            <p>{m.texto}</p>
            {m.itens?.length > 0 && (
              <ul className="jarvis-itens">
                {m.itens.map((i, k) => (
                  <li key={k} className={i.erro ? "erro" : ""}>
                    {i.texto}
                  </li>
                ))}
              </ul>
            )}
            {m.estado === "pendente" && (
              <div className="jarvis-botoes">
                <button type="button" className="ghost" onClick={() => cancelar(m.id)}>
                  <X size={16} /> Cancelar
                </button>
                <button type="button" className="primary" onClick={() => confirmar(m.id)}>
                  <Check size={16} /> Confirmar
                </button>
              </div>
            )}
            {m.estado === "feito" && m.antes && (
              <div className="jarvis-botoes">
                <span className="jarvis-estado ok">✓ Feito</span>
                <button type="button" className="ghost" onClick={() => desfazer(m.id)}>
                  <Undo2 size={16} /> Desfazer
                </button>
              </div>
            )}
            {m.estado === "cancelado" && <span className="jarvis-estado">Cancelado</span>}
            {m.estado === "desfeito" && <span className="jarvis-estado">Desfeito</span>}
          </div>
        ))}

        {pensando && (
          <div className="jarvis-msg jarvis pensando">
            <p>Pensando…</p>
          </div>
        )}
        <div ref={fim} />
      </section>

      <div className="jarvis-entrada">
        {suporteVoz && (
          <div className="jarvis-mic-grande">
            <button
              type="button"
              className={`jarvis-mic-botao${ouvindo ? " ouvindo" : ""}`}
              onClick={ouvir}
              disabled={pensando}
              aria-label={ouvindo ? "Parar de ouvir" : "Falar com o Jarvis"}
              aria-pressed={ouvindo}
            >
              {ouvindo ? <Square size={28} strokeWidth={2.6} /> : <Mic size={34} strokeWidth={2.2} />}
            </button>
            <span className="jarvis-mic-texto" aria-live="polite">
              {pensando ? "Pensando…" : ouvindo ? "Ouvindo… toque para parar" : "Toque para falar"}
            </span>
          </div>
        )}
        <div className="jarvis-linha">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                enviar();
              }
            }}
            placeholder={ouvindo ? "Ouvindo… pode falar" : suporteVoz ? "Ou escreva aqui…" : "Escreva para o Jarvis…"}
            disabled={pensando}
            aria-label="Mensagem para o Jarvis"
          />
          <button type="button" className="falar-mic enviar" onClick={() => enviar()} disabled={pensando || !texto.trim()} aria-label="Enviar">
            <Send size={17} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {!config ? (
        <>
          <section className="section-card jarvis-passos">
            <h2>Ligue a IA para o Jarvis entender tudo</h2>
            <ol>
              <li>
                No navegador do celular, abra <b>aistudio.google.com</b> e entre com a sua conta Google.
              </li>
              <li>
                Toque em <b>Get API key</b> e depois em <b>Create API key</b>. É grátis.
              </li>
              <li>Copie a chave (começa com AIza…) e cole aqui embaixo, em Chave de API.</li>
              <li>
                Toque em <b>Salvar e testar</b>. Pronto!
              </li>
            </ol>
          </section>
          <ConfigIA config={config} onChange={setConfig} />
        </>
      ) : (
        <p className="falar-nota jarvis-nota">
          Para entender você, o Jarvis manda à IA um resumo dos seus dados (bancos, cartões, contas, metas e lançamentos dos últimos 90
          dias). Nada é gravado sem você confirmar.
        </p>
      )}
    </div>
  );
}
