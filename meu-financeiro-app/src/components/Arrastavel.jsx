import React, { useRef, useState } from "react";

const LARGURA_DO_BOTAO = 76;

// Linha que, arrastada para a esquerda, mostra ações (Editar, Excluir...) como nos apps de banco.
// acoes = [{ texto, Icone, onClick, perigo }]. A rolagem vertical continua normal; tocar fecha.
// Quem usa teclado ou leitor de tela segue pelo toque/Enter na linha (as mesmas ações estão lá).
export default function Arrastavel({ acoes = [], children }) {
  const [x, setX] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const inicio = useRef(null);
  const moveu = useRef(false);
  const aberto = acoes.length * LARGURA_DO_BOTAO;

  function baixar(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    inicio.current = { x: e.clientX, y: e.clientY, base: x, eixo: null };
    moveu.current = false;
  }

  function mover(e) {
    const i = inicio.current;
    if (!i) return;
    const dx = e.clientX - i.x;
    const dy = e.clientY - i.y;
    if (!i.eixo) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      i.eixo = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (i.eixo === "x") {
        setArrastando(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
    }
    if (i.eixo !== "x") return;
    moveu.current = true;
    setX(Math.max(-aberto - 24, Math.min(0, i.base + dx)));
  }

  function soltar() {
    const i = inicio.current;
    inicio.current = null;
    if (!i || i.eixo !== "x") return;
    setArrastando(false);
    setX((atual) => (atual < -aberto / 2 ? -aberto : 0));
  }

  // depois de arrastar, o "clique" de soltar não abre a linha; com a linha aberta, tocar fecha
  function clicar(e) {
    if (moveu.current) {
      // o clique que vem logo depois de arrastar: só engole
      e.preventDefault();
      e.stopPropagation();
      moveu.current = false;
      return;
    }
    if (x !== 0) {
      // linha aberta: um toque fecha
      e.preventDefault();
      e.stopPropagation();
      setX(0);
    }
  }

  return (
    <div className={`arrasta${x !== 0 ? " aberto" : ""}`}>
      {x !== 0 && (
        <div className="arrasta-acoes" style={{ width: aberto }}>
          {acoes.map((a) => (
            <button
              type="button"
              key={a.texto}
              className={a.perigo ? "perigo" : ""}
              onClick={() => {
                setX(0);
                a.onClick();
              }}
            >
              {a.Icone && <a.Icone size={18} aria-hidden="true" />}
              {a.texto}
            </button>
          ))}
        </div>
      )}
      <div
        className="arrasta-frente"
        style={{ transform: x ? `translateX(${x}px)` : undefined, transition: arrastando ? "none" : undefined }}
        onPointerDown={baixar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onClickCapture={clicar}
      >
        {children}
      </div>
    </div>
  );
}
