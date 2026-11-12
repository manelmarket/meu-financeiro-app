import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CreditCard, LineChart, Mic, Wallet } from "lucide-react";

const CHAVE = "meu_financeiro_boas_vindas";

export function boasVindasVistas() {
  try {
    return localStorage.getItem(CHAVE) === "1";
  } catch {
    return true;
  }
}

function marcarVistas() {
  try {
    localStorage.setItem(CHAVE, "1");
  } catch {
    // aparece de novo na próxima abertura
  }
}

const PASSOS = [
  {
    Icone: LineChart,
    titulo: "Bem-vindo ao Meu Financeiro",
    texto: "Seus gastos, receitas, cartões e contas num lugar só. O app mostra quanto sobra no mês, avisa dos vencimentos e entende o que você fala."
  },
  {
    Icone: Wallet,
    titulo: "Comece pelos bancos e cartões",
    texto: "Com os bancos cadastrados, o saldo de cada um muda sozinho a cada lançamento. Com os cartões, o app monta as faturas e as parcelas.",
    acoes: [
      { Icone: Wallet, texto: "Cadastrar bancos", pagina: "bancos" },
      { Icone: CreditCard, texto: "Cadastrar cartão", pagina: "cards" }
    ]
  },
  {
    Icone: Mic,
    titulo: "Fale com o Jarvis",
    texto: "\"Mercado 80 no pix\", \"paguei a luz\", \"quanto gastei esse mês?\": o Jarvis lança, corrige e responde do seu jeito. Para ele entender tudo, ligue a IA (tem opção gratuita).",
    acoes: [{ Icone: Mic, texto: "Configurar o Jarvis", pagina: "jarvis" }]
  }
];

// Três telas de boas-vindas para quem começa com a conta vazia (aparecem uma vez)
export default function BoasVindas({ onIr, onFechar }) {
  const [passo, setPasso] = useState(0);
  const titulo = useRef(null);
  const p = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;

  useEffect(() => {
    titulo.current?.focus();
  }, [passo]);

  function fechar(pagina) {
    marcarVistas();
    onFechar();
    if (pagina) onIr(pagina);
  }

  return (
    <div className="boas-vindas" role="dialog" aria-modal="true" aria-labelledby="bv-titulo">
      <button type="button" className="bv-pular" onClick={() => fechar()}>
        Pular
      </button>
      <div className="bv-corpo" key={passo}>
        <span className="bv-icone" aria-hidden="true">
          <p.Icone size={40} strokeWidth={1.7} />
        </span>
        <h1 id="bv-titulo" ref={titulo} tabIndex={-1}>
          {p.titulo}
        </h1>
        <p>{p.texto}</p>
        {p.acoes && (
          <div className="bv-acoes">
            {p.acoes.map((a) => (
              <button type="button" key={a.pagina} className="secondary" onClick={() => fechar(a.pagina)}>
                <a.Icone size={18} aria-hidden="true" /> {a.texto}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="bv-rodape">
        <div className="bv-pontos" aria-label={`Passo ${passo + 1} de ${PASSOS.length}`}>
          {PASSOS.map((_, i) => (
            <i key={i} className={i === passo ? "ativo" : ""} />
          ))}
        </div>
        <button type="button" className="primary bv-seguir" onClick={() => (ultimo ? fechar() : setPasso(passo + 1))}>
          {ultimo ? "Começar" : "Continuar"} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
