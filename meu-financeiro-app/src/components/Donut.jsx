import React, { useState } from "react";
import { money } from "../lib/formato.js";

// Pizza (rosca) das despesas: 1º, 2º e 3º maiores em tons de azul (do escuro ao claro)
// e "Outros" em cinza. As cores indicam a posição no ranking; o nome vem sempre na legenda.
const COR_POSICAO = { 1: "#184f95", 2: "#2a78d6", 3: "#6da7ec", 0: "#c3c2b7" };

const CX = 100;
const CY = 100;
const R_FORA = 92;
const R_DENTRO = 60;
const GAP = 2 / ((R_FORA + R_DENTRO) / 2); // 2px de espaço entre as fatias

function ponto(r, angulo) {
  return `${(CX + r * Math.cos(angulo)).toFixed(2)} ${(CY + r * Math.sin(angulo)).toFixed(2)}`;
}

function caminho(a0, a1) {
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${ponto(R_FORA, a0)}`,
    `A ${R_FORA} ${R_FORA} 0 ${grande} 1 ${ponto(R_FORA, a1)}`,
    `L ${ponto(R_DENTRO, a1)}`,
    `A ${R_DENTRO} ${R_DENTRO} 0 ${grande} 0 ${ponto(R_DENTRO, a0)}`,
    "Z"
  ].join(" ");
}

export default function Donut({ fatias, total, titulo }) {
  const [ativo, setAtivo] = useState(null);

  let angulo = -Math.PI / 2;
  const partes = fatias.map((f) => {
    const tamanho = (f.valor / total) * Math.PI * 2;
    const a0 = angulo;
    const a1 = angulo + tamanho;
    angulo = a1;
    if (fatias.length === 1) return { ...f, d: null };
    const folga = tamanho > GAP * 2 ? GAP / 2 : 0;
    return { ...f, d: caminho(a0 + folga, a1 - folga) };
  });

  const selecionada = ativo !== null ? partes[ativo] : null;

  return (
    <div className="donut">
      <svg viewBox="0 0 200 200" role="img" aria-label={titulo}>
        {partes.map((p, i) =>
          p.d ? (
            <path
              key={p.nome}
              d={p.d}
              fill={COR_POSICAO[p.posicao]}
              opacity={ativo === null || ativo === i ? 1 : 0.35}
              tabIndex={0}
              aria-label={`${p.nome}: ${money(p.valor)} (${p.percentual}%)`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setAtivo(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setAtivo(null)}
              onFocus={() => setAtivo(i)}
              onClick={() => setAtivo(i)}
            />
          ) : (
            <circle
              key={p.nome}
              cx={CX}
              cy={CY}
              r={(R_FORA + R_DENTRO) / 2}
              fill="none"
              stroke={COR_POSICAO[p.posicao]}
              strokeWidth={R_FORA - R_DENTRO}
            />
          )
        )}
        <text x={CX} y={CY - 8} textAnchor="middle" className="donut-label">
          {selecionada ? selecionada.nome : "Total"}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" className="donut-value">
          {money(selecionada ? selecionada.valor : total)}
        </text>
        {selecionada && (
          <text x={CX} y={CY + 32} textAnchor="middle" className="donut-label">
            {selecionada.percentual}%
          </text>
        )}
      </svg>

      <div className="legend-table">
        {partes.map((p, i) => (
          <button
            type="button"
            key={p.nome}
            className={`legend-row${ativo === i ? " active" : ""}`}
            onClick={() => setAtivo(ativo === i ? null : i)}
          >
            <i className="swatch" style={{ background: COR_POSICAO[p.posicao] }} />
            <span className="legend-name">
              {p.nome}
              {p.agrupadas && p.agrupadas.length > 1 && <small>{p.agrupadas.join(", ")}</small>}
            </span>
            <b>{money(p.valor)}</b>
            <span className="legend-pct">{p.percentual}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
