import React, { useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Square } from "lucide-react";
import { ErroIA, interpretarComIA, lerConfigIA } from "../lib/ia.js";
import { contextoParaIA, interpretarFrase, resultadoDaIA } from "../lib/interpretar.js";

function Reconhecimento() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// "Fale ou escreva o lançamento": a pessoa fala (microfone) ou digita uma frase como
// "gastei 50 no mercado no pix do nubank" e o app preenche o formulário.
// Sem IA configurada, o app entende frases simples sozinho (lib/interpretar.js);
// com a IA do Assistente, manda a frase para ela (e usa o entendimento simples se a IA falhar).
export default function FalarOuEscrever({ dados, hoje, onPreencher, onConfigurarIA }) {
  const [texto, setTexto] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro" | "info", texto }
  const reconhecedor = useRef(null);
  const suporte = Boolean(Reconhecimento());
  const cfg = lerConfigIA();

  useEffect(() => () => reconhecedor.current?.abort?.(), []);

  function aplicar(resultado, origem) {
    if (!resultado.entendido) {
      setAviso({ tipo: "erro", texto: "Não entendi o valor. Diga algo como: gastei 50 no mercado no pix do Nubank." });
      return;
    }
    onPreencher(resultado);
    const extras = resultado.avisos.length ? ` ${resultado.avisos.join(" ")}` : "";
    setAviso({ tipo: resultado.avisos.length ? "info" : "ok", texto: `✅ Preenchido${origem === "ia" ? " pela IA" : ""}. Confira e toque em Salvar.${extras}` });
  }

  async function preencher(frase = texto) {
    const limpa = String(frase || "").trim();
    if (!limpa) return setAviso({ tipo: "erro", texto: "Escreva ou fale o lançamento primeiro." });
    setAviso(null);
    if (cfg) {
      setLendo(true);
      try {
        const json = await interpretarComIA(cfg, limpa, contextoParaIA(dados), hoje);
        aplicar(resultadoDaIA(json, dados, hoje), "ia");
        return;
      } catch (falha) {
        // a IA falhou: tenta entender aqui mesmo
        const simples = interpretarFrase(limpa, dados, hoje);
        if (simples.entendido) {
          onPreencher(simples);
          setAviso({
            tipo: "info",
            texto: `A IA não respondeu (${falha instanceof ErroIA ? falha.message : "erro"}). Preenchi do meu jeito: confira os campos.`
          });
        } else {
          setAviso({ tipo: "erro", texto: falha instanceof ErroIA ? falha.message : "Não consegui usar a IA agora. Tente de novo." });
        }
        return;
      } finally {
        setLendo(false);
      }
    }
    aplicar(interpretarFrase(limpa, dados, hoje), "app");
  }

  function ouvir() {
    const Classe = Reconhecimento();
    if (!Classe) return;
    if (ouvindo) {
      reconhecedor.current?.stop?.();
      return;
    }
    const r = new Classe();
    r.lang = "pt-BR";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const frase = Array.from(e.results)
        .map((x) => x[0]?.transcript || "")
        .join(" ")
        .trim();
      setTexto(frase);
      setOuvindo(false);
      if (frase) preencher(frase);
    };
    r.onerror = (e) => {
      setOuvindo(false);
      const motivo = e?.error;
      setAviso({
        tipo: "erro",
        texto:
          motivo === "not-allowed" || motivo === "service-not-allowed"
            ? "O navegador não deixou usar o microfone. Permita o microfone e tente de novo."
            : motivo === "no-speech"
              ? "Não ouvi nada. Toque no microfone e fale o lançamento."
              : "Não consegui ouvir agora. Você pode escrever a frase."
      });
    };
    r.onend = () => setOuvindo(false);
    reconhecedor.current = r;
    setAviso(null);
    setOuvindo(true);
    try {
      r.start();
    } catch {
      setOuvindo(false);
    }
  }

  return (
    <section className="falar-box" aria-label="Fale ou escreva o lançamento">
      <div className="falar-titulo">
        <Sparkles size={15} strokeWidth={2.4} aria-hidden="true" />
        <span>Fale ou escreva o lançamento</span>
      </div>
      <div className="falar-linha">
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            if (aviso) setAviso(null);
          }}
          placeholder={ouvindo ? "Ouvindo… pode falar" : "Ex.: gastei 50 no mercado no pix do Nubank"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              preencher();
            }
          }}
          disabled={lendo}
          aria-label="Frase do lançamento"
        />
        {suporte && (
          <button
            type="button"
            className={`falar-mic${ouvindo ? " ouvindo" : ""}`}
            onClick={ouvir}
            disabled={lendo}
            aria-label={ouvindo ? "Parar de ouvir" : "Falar o lançamento"}
            title={ouvindo ? "Parar" : "Falar"}
          >
            {ouvindo ? <Square size={16} strokeWidth={2.6} /> : <Mic size={18} strokeWidth={2.4} />}
          </button>
        )}
      </div>
      <button type="button" className="secondary wide-btn" onClick={() => preencher()} disabled={lendo || ouvindo}>
        {lendo ? "Entendendo a frase…" : "Preencher"}
      </button>
      {aviso && (
        <p className={`falar-aviso ${aviso.tipo}`} role="status">
          {aviso.texto}
        </p>
      )}
      <p className="falar-nota">
        {cfg ? (
          <>IA ligada: entende qualquer frase. Sem internet, o app entende frases simples sozinho.</>
        ) : (
          <>
            Sem IA configurada o app entende frases simples. Configurando a IA no{" "}
            {onConfigurarIA ? (
              <button type="button" className="link" onClick={onConfigurarIA}>
                Assistente
              </button>
            ) : (
              "Assistente"
            )}
            , entende qualquer frase.
          </>
        )}
        {!suporte && " Este navegador não tem ditado por voz: escreva a frase."}
      </p>
    </section>
  );
}
