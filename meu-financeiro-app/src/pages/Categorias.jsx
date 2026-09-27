import React, { useState } from "react";
import { CategoriaBadge, CategoriaForm } from "../components/Categoria.jsx";
import { listarCategorias, usosDaCategoria } from "../lib/categorias.js";

function textoDosUsos(n) {
  if (n === 0) return "Nenhum registro ainda";
  return n === 1 ? "1 registro" : `${n} registros`;
}

// Tela "Categorias": as do app (ícone e cor editáveis) e as que a pessoa cria (nome, ícone, cor e excluir)
export default function Categorias({ data, onBack, onSave, onDelete }) {
  const [editando, setEditando] = useState(null);
  const [criando, setCriando] = useState(false);
  const categorias = listarCategorias(data);
  const proprias = categorias.filter((c) => !c.doApp).length;

  function excluir(c) {
    const usos = usosDaCategoria(data, c.nome);
    const pergunta =
      `Excluir a categoria ${c.nome}?` +
      (usos ? `\n\n${textoDosUsos(usos)} passa${usos > 1 ? "m" : ""} para "Outros". Nada é apagado.` : "");
    if (window.confirm(pergunta)) {
      onDelete(c.id);
      if (editando === c.id) setEditando(null);
    }
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Organizar</div>
          <h1>🏷️ Categorias</h1>
        </div>
      </header>

      <p className="muted small cat-dica">
        Crie as suas categorias de gasto e escolha o ícone e a cor de cada uma. Elas aparecem no Novo lançamento, nas
        compras do cartão, nas contas fixas, nos orçamentos e nos relatórios.
      </p>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Suas categorias</h2>
          <span className="muted small">{proprias ? `${proprias} sua${proprias > 1 ? "s" : ""}` : ""}</span>
        </div>
        {categorias.map((c) => (
          <div className="cat-linha" key={c.id}>
            <div className="cat-linha-topo">
              <CategoriaBadge categoria={c} tamanho={36} />
              <div className="cat-linha-texto">
                <b>{c.nome}</b>
                <small>
                  {textoDosUsos(usosDaCategoria(data, c.nome))} · {c.doApp ? "do app" : "sua"}
                </small>
              </div>
              {editando !== c.id && (
                <div className="cat-linha-acoes">
                  <button type="button" className="chip-btn" onClick={() => setEditando(c.id)}>
                    ✏️ Editar
                  </button>
                  {!c.doApp && (
                    <button type="button" className="chip-btn perigo" onClick={() => excluir(c)} aria-label={`Excluir ${c.nome}`}>
                      🗑
                    </button>
                  )}
                </div>
              )}
            </div>
            {editando === c.id && (
              <CategoriaForm
                key={c.id}
                dados={data}
                inicial={c}
                textoBotao="Salvar"
                onSalvar={(form) => {
                  onSave(form);
                  setEditando(null);
                }}
                onCancelar={() => setEditando(null)}
              />
            )}
          </div>
        ))}
      </section>

      {criando ? (
        <section className="section-card">
          <h2>Nova categoria</h2>
          <CategoriaForm
            dados={data}
            onSalvar={(form) => {
              onSave(form);
              setCriando(false);
            }}
            onCancelar={() => setCriando(false)}
          />
        </section>
      ) : (
        <button type="button" className="primary wide" onClick={() => setCriando(true)}>
          + Nova categoria
        </button>
      )}
    </div>
  );
}
