import React from "react";
import { arredondar, money } from "../lib/formato.js";

// Lista dos bancos cadastrados, com o saldo de cada um, para escolher de onde sai (ou para onde vai)
// o dinheiro, mais uma opção sem banco (ex.: em espécie). Usada nas janelas Pagar da conta fixa e
// Recebi do empréstimo.
//   bancos: [{ banco, atual }] (ver resumoDosBancos em lib/saldos.js)
//   bancoId: o banco escolhido ("" = a opção sem banco)
//   sinal: -1 = o dinheiro sai do banco (pagar); +1 = o dinheiro entra no banco (receber)
//   semBanco: { titulo, detalhe } da opção sem banco
//   semBancos: texto quando a pessoa ainda não tem bancos cadastrados

// Banco que já vem escolhido: o da última vez (guardado neste aparelho) ou o primeiro da lista
export function bancoInicial(chave, bancos) {
  let guardado = "";
  try {
    guardado = localStorage.getItem(chave) || "";
  } catch {
    guardado = "";
  }
  if (guardado === "nenhum") return "";
  const existe = bancos.find((b) => String(b.banco.id) === guardado);
  return existe ? String(existe.banco.id) : bancos[0] ? String(bancos[0].banco.id) : "";
}

export function lembrarBanco(chave, id) {
  try {
    localStorage.setItem(chave, id == null || id === "" ? "nenhum" : String(id));
  } catch {
    // sem espaço: só não lembra da próxima vez
  }
}

export default function EscolherBanco({ titulo, bancos, bancoId, onEscolher, semBanco, semBancos, valor = 0, sinal = -1 }) {
  if (!bancos.length) return <p className="hint">{semBancos}</p>;
  const escolhido = bancos.find((b) => String(b.banco.id) === bancoId) || null;

  return (
    <>
      <div className="pag-campo" role="radiogroup" aria-label={titulo}>
        <span>{titulo}</span>
        <div className="banco-opcoes">
          {bancos.map((b) => {
            const ativo = String(b.banco.id) === bancoId;
            return (
              <button
                type="button"
                key={b.banco.id}
                role="radio"
                aria-checked={ativo}
                className={`banco-opcao${ativo ? " ativo" : ""}`}
                onClick={() => onEscolher(String(b.banco.id))}
              >
                <b>{b.banco.nome}</b>
                <small className={b.atual < 0 ? "neg" : ""}>{money(b.atual)}</small>
              </button>
            );
          })}
          <button
            type="button"
            role="radio"
            aria-checked={bancoId === ""}
            className={`banco-opcao${bancoId === "" ? " ativo" : ""}`}
            onClick={() => onEscolher("")}
          >
            <span className="banco-opcao-texto">
              <b>{semBanco.titulo}</b>
              <small>{semBanco.detalhe}</small>
            </span>
          </button>
        </div>
      </div>

      {valor > 0 && escolhido && (
        <p className="pag-libera">
          {escolhido.banco.nome}: {money(escolhido.atual)} → {money(arredondar(escolhido.atual + sinal * valor))}
        </p>
      )}
    </>
  );
}
