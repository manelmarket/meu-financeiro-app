import React, { useState } from "react";
import { MESES, lerMes, money, rotuloMes } from "../lib/formato.js";

// Evolução mês a mês: colunas de Receitas (azul) e Despesas (laranja), um eixo só.
const COR = { receitas: "#2a78d6", despesas: "#eb6834" };

const L = 300; // largura
const A = 170; // altura
const M = { esq: 40, dir: 6, topo: 10, base: 22 };

// escala com números redondos: passo de 1, 2 ou 5 × 10^n (0 / 2 mil / 4 mil / 6 mil)
function escala(maior) {
  if (maior <= 0) return { teto: 100, passo: 50 };
  const bruto = maior / 4;
  const ordem = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 5, 10].map((m) => m * ordem).find((v) => v >= bruto);
  return { teto: Math.ceil(maior / passo) * passo, passo };
}

function rotuloEixo(v) {
  if (v >= 1000) {
    const mil = v / 1000;
    return `${Number.isInteger(mil) ? mil : mil.toFixed(1).replace(".", ",")} mil`;
  }
  return String(Math.round(v));
}

// coluna com topo arredondado (4px) e base reta
function coluna(x, y, largura, altura) {
  if (altura <= 0) return "";
  const r = Math.min(4, largura / 2, altura);
  const base = y + altura;
  return [
    `M ${x} ${base}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + largura - r} ${y}`,
    `Q ${x + largura} ${y} ${x + largura} ${y + r}`,
    `L ${x + largura} ${base}`,
    "Z"
  ].join(" ");
}

export default function ColumnsChart({ meses, mesSelecionado }) {
  const [ativo, setAtivo] = useState(null);

  const maior = Math.max(0, ...meses.flatMap((m) => [m.receitas, m.despesas]));
  const { teto, passo } = escala(maior);
  const ticks = [];
  for (let v = 0; v <= teto + passo / 1000; v += passo) ticks.push(v);

  const larguraPlot = L - M.esq - M.dir;
  const alturaPlot = A - M.topo - M.base;
  const grupo = larguraPlot / meses.length;
  const barra = Math.min(18, (grupo - 12) / 2);
  const y = (v) => M.topo + alturaPlot - (v / teto) * alturaPlot;

  const indiceAtivo = ativo ?? meses.findIndex((m) => m.mes === mesSelecionado);
  const destaque = meses[indiceAtivo] || meses[meses.length - 1];

  return (
    <div className="columns-chart">
      <div className="chart-readout" aria-live="polite">
        <b>{rotuloMes(destaque.mes)}</b>
        <span>
          <i className="line-key" style={{ background: COR.receitas }} />
          <strong>{money(destaque.receitas)}</strong>
          <small>receitas</small>
        </span>
        <span>
          <i className="line-key" style={{ background: COR.despesas }} />
          <strong>{money(destaque.despesas)}</strong>
          <small>despesas</small>
        </span>
      </div>

      <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label="Receitas e despesas dos últimos meses">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.esq}
              x2={L - M.dir}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? "axis-base" : "grid-line"}
            />
            <text x={M.esq - 6} y={y(t) + 3} textAnchor="end" className="axis-text">
              {rotuloEixo(t)}
            </text>
          </g>
        ))}

        {meses.map((m, i) => {
          const x0 = M.esq + i * grupo + (grupo - (barra * 2 + 2)) / 2;
          const { m: numeroMes } = lerMes(m.mes);
          const selecionado = i === indiceAtivo;
          return (
            <g key={m.mes} opacity={ativo === null || selecionado ? 1 : 0.45}>
              <path d={coluna(x0, y(m.receitas), barra, y(0) - y(m.receitas))} fill={COR.receitas} />
              <path d={coluna(x0 + barra + 2, y(m.despesas), barra, y(0) - y(m.despesas))} fill={COR.despesas} />
              <text
                x={M.esq + i * grupo + grupo / 2}
                y={A - 6}
                textAnchor="middle"
                className={`axis-text${m.mes === mesSelecionado ? " strong" : ""}`}
              >
                {MESES[numeroMes - 1].slice(0, 3)}
              </text>
              {/* área de toque do mês inteiro (maior que as colunas) */}
              <rect
                x={M.esq + i * grupo}
                y={M.topo}
                width={grupo}
                height={alturaPlot + M.base}
                fill="transparent"
                tabIndex={0}
                aria-label={`${rotuloMes(m.mes)}: receitas ${money(m.receitas)}, despesas ${money(m.despesas)}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && setAtivo(i)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setAtivo(null)}
                onFocus={() => setAtivo(i)}
                onClick={() => setAtivo(i)}
              />
            </g>
          );
        })}
      </svg>

      <div className="chart-legend">
        <span>
          <i className="swatch" style={{ background: COR.receitas }} /> Receitas
        </span>
        <span>
          <i className="swatch" style={{ background: COR.despesas }} /> Despesas
        </span>
      </div>
    </div>
  );
}
