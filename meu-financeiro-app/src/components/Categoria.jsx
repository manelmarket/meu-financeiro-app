import React, { useState } from "react";
import {
  CORES_DE_CATEGORIA,
  ICONES_DE_CATEGORIA,
  infoDaCategoria,
  listarCategorias,
  validarCategoria
} from "../lib/categorias.js";

// Bolinha com o ícone e a cor da categoria
export function CategoriaBadge({ categoria, tamanho = 34 }) {
  return (
    <i
      className="cat-badge"
      style={{ "--cat-cor": categoria.cor, width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.5) }}
      aria-hidden="true"
    >
      {categoria.icone}
    </i>
  );
}

// "🛒 Alimentação" em linha (Histórico, Início)
export function CategoriaInline({ dados, nome, mapa }) {
  const c = infoDaCategoria(dados, nome, mapa);
  return (
    <span className="cat-inline">
      <span aria-hidden="true">{c.icone}</span> {c.nome}
    </span>
  );
}

// Formulário de categoria (nova ou edição): nome, ícone, cor e prévia.
// Nas categorias do app o nome não muda (é o nome que os registros usam).
export function CategoriaForm({ dados, inicial, textoBotao, onSalvar, onCancelar }) {
  const doApp = Boolean(inicial?.doApp);
  const [nome, setNome] = useState(inicial?.nome || "");
  const [icone, setIcone] = useState(inicial?.icone || ICONES_DE_CATEGORIA[1]);
  const [cor, setCor] = useState(inicial?.cor || CORES_DE_CATEGORIA[2]);
  const [erro, setErro] = useState("");

  function salvar() {
    const form = { id: inicial?.id ?? null, nome: doApp ? inicial.nome : nome, icone, cor };
    const problema = validarCategoria(dados, form);
    if (problema) return setErro(problema);
    setErro("");
    onSalvar(form);
  }

  return (
    <div className="form cat-form" role="group" aria-label={inicial ? "Editar categoria" : "Nova categoria"}>
      <label>
        {inicial ? "Nome da categoria" : "Nome da nova categoria"}
        <input
          value={doApp ? inicial.nome : nome}
          onChange={(e) => {
            setNome(e.target.value);
            setErro("");
          }}
          placeholder="Ex.: Pet"
          maxLength={30}
          disabled={doApp}
          autoFocus={!inicial}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              salvar();
            }
          }}
        />
      </label>
      {doApp && <p className="muted small no-margin">Categoria do app: dá para trocar o ícone e a cor.</p>}

      <div className="cat-campo">
        <span>Ícone</span>
        <div className="cat-icones" role="radiogroup" aria-label="Ícone">
          {ICONES_DE_CATEGORIA.map((i) => (
            <button
              type="button"
              key={i}
              role="radio"
              aria-checked={icone === i}
              className={`cat-icone${icone === i ? " ativo" : ""}`}
              onClick={() => setIcone(i)}
              aria-label={`Ícone ${i}`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="cat-campo">
        <span>Cor</span>
        <div className="cat-cores" role="radiogroup" aria-label="Cor">
          {CORES_DE_CATEGORIA.map((c) => (
            <button
              type="button"
              key={c}
              role="radio"
              aria-checked={cor === c}
              className={`cat-cor${cor === c ? " ativo" : ""}`}
              style={{ "--cat-cor": c }}
              onClick={() => setCor(c)}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="cat-previa">
        <CategoriaBadge categoria={{ icone, cor }} tamanho={30} />
        <b>{(doApp ? inicial.nome : nome.trim()) || "Assim fica a categoria"}</b>
      </div>

      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        {onCancelar && (
          <button type="button" className="ghost" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="button" className="primary" onClick={salvar}>
          {textoBotao || (inicial ? "Salvar" : "Criar categoria")}
        </button>
      </div>
    </div>
  );
}

const NOVA = "__nova__";

// <select> de categoria com ícone, com a opção "Nova categoria…" que abre o formulário ali mesmo.
// dados: para listar as categorias; onCriar(form): grava a categoria nova (a tela escolhe ela em seguida).
export function SeletorCategoria({ dados, valor, onChange, onCriar, rotulo = "Categoria" }) {
  const [criando, setCriando] = useState(false);
  const categorias = listarCategorias(dados);
  // categoria que já não existe (foi apagada), mas está no registro em edição: continua na lista
  const lista = categorias.some((c) => c.nome === valor) || !valor ? categorias : [...categorias, infoDaCategoria(dados, valor)];

  function escolher(v) {
    if (v === NOVA) {
      setCriando(true);
      return;
    }
    onChange(v);
  }

  return (
    <>
      <label>
        {rotulo}
        <select value={criando ? NOVA : valor} onChange={(e) => escolher(e.target.value)}>
          {lista.map((c) => (
            <option key={c.id ?? c.nome} value={c.nome}>
              {c.icone} {c.nome}
            </option>
          ))}
          {onCriar && <option value={NOVA}>➕ Nova categoria…</option>}
        </select>
      </label>
      {criando && (
        <CategoriaForm
          dados={dados}
          onSalvar={(form) => {
            onCriar(form);
            onChange(form.nome.trim());
            setCriando(false);
          }}
          onCancelar={() => setCriando(false)}
        />
      )}
    </>
  );
}
