import React from "react";

// leva até o formulário da tela e põe o cursor no primeiro campo
export function rolarParaFormulario() {
  const form = document.querySelector(".conteudo form, .conteudo .form");
  if (!form) return;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => form.querySelector("input, select, textarea")?.focus({ preventScroll: true }), 350);
}

// Lista vazia que explica: ícone, título, frase e (opcional) um botão para começar
export default function Vazio({ Icone, titulo, texto, botao, onBotao }) {
  return (
    <section className="vazio" role="note">
      {Icone && (
        <span className="vazio-icone" aria-hidden="true">
          <Icone size={28} strokeWidth={1.8} />
        </span>
      )}
      <b>{titulo}</b>
      {texto && <p>{texto}</p>}
      {botao && (
        <button type="button" className="secondary" onClick={onBotao}>
          {botao}
        </button>
      )}
    </section>
  );
}
