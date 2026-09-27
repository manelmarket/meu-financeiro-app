import React, { useEffect, useMemo } from "react";
import { mesDaData, money, rotuloMes } from "../lib/formato.js";
import { conquistas, conquistasNovas, desafiosDoMes, marcarConquistasVistas } from "../lib/conquistas.js";

const ROTULO = { andamento: "Em andamento", cumprido: "Cumprido ✓", falhou: "Não deu desta vez" };
const UNIDADES = { categorias: ["categoria", "categorias"], dias: ["dia", "dias"], faturas: ["fatura", "faturas"] };

// "R$ 300,00 de R$ 420,00" ou "3 de 15 dias"
function contaDoDesafio(d) {
  if (d.dinheiro) return `${money(d.atual)} de ${money(d.alvo)}`;
  const [um, varios] = UNIDADES[d.unidade] || ["", ""];
  return `${d.atual} de ${d.alvo} ${d.alvo === 1 ? um : varios}`.trim();
}

function rotuloDoDesafio(d) {
  if (d.status === "andamento" && d.noCaminho) return "No caminho";
  return ROTULO[d.status];
}

// Conquistas (medalhas) e desafios do mês
export default function Conquistas({ data, hoje, familia, onBack }) {
  const mes = mesDaData(hoje);
  const lista = useMemo(() => conquistas(data, hoje, { familia: Boolean(familia) }), [data, hoje, familia]);
  const novas = useMemo(() => new Set(conquistasNovas(lista).map((c) => c.id)), [lista]);
  const desafios = useMemo(() => desafiosDoMes(data, mes, hoje), [data, mes, hoje]);
  const feitas = lista.filter((c) => c.conquistada).length;

  // ao abrir a tela, as conquistas novas contam como vistas (o aviso do Início some)
  useEffect(() => {
    marcarConquistasVistas(lista.filter((c) => c.conquistada).map((c) => c.id));
  }, [lista]);

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Gamificação</div>
          <h1>🏆 Conquistas</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Conquistas</span>
        <strong>
          {feitas} de {lista.length}
        </strong>
        <small>Continue registrando e cuidando das contas para ganhar as próximas</small>
      </section>

      <section className="section-card">
        <h2>Desafios de {rotuloMes(mes).replace("/", " ")}</h2>
        {desafios.map((d) => {
          const pct = d.alvo > 0 ? Math.min(100, (d.atual / d.alvo) * 100) : 0;
          return (
            <div className={`desafio ${d.status}`} key={d.id}>
              <div className="desafio-topo">
                <span className="desafio-icone" aria-hidden="true">
                  {d.icone}
                </span>
                <span className="settings-text">
                  <b>{d.titulo}</b>
                  <small>{d.descricao}</small>
                </span>
                <span className="desafio-status">{rotuloDoDesafio(d)}</span>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.max(3, pct)}%` }} />
              </div>
              <small className="desafio-conta">
                {contaDoDesafio(d)}
                {d.id === "menos-que-mes-passado" ? " (o que você gastou no mês passado)" : ""}
              </small>
            </div>
          );
        })}
      </section>

      <section className="section-card">
        <h2>Medalhas</h2>
        <div className="medalhas">
          {lista.map((c) => (
            <div className={`medalha${c.conquistada ? " feita" : ""}`} key={c.id}>
              <span className="medalha-icone" aria-hidden="true">
                {c.icone}
              </span>
              <b>{c.titulo}</b>
              <small>{c.descricao}</small>
              {c.conquistada ? (
                <span className="tag ok">{novas.has(c.id) ? "Nova!" : "Conquistada"}</span>
              ) : c.progresso ? (
                <small className="medalha-progresso">
                  {c.progresso.atual} de {c.progresso.total}
                </small>
              ) : (
                <small className="medalha-progresso">Ainda não</small>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
