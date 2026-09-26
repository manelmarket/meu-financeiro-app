import React from "react";

// Medidor circular de progresso da meta (trilha clara e preenchimento na cor do tema;
// verde quando a meta foi atingida).
export default function RingMeter({ percentual, tamanho = 72 }) {
  const pct = Math.max(0, Math.min(100, percentual));
  const traco = 8;
  const r = (tamanho - traco) / 2;
  const volta = 2 * Math.PI * r;
  const atingida = percentual >= 100;
  const exibido = atingida ? Math.round(percentual) : Math.floor(percentual);

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${tamanho} ${tamanho}`}
      role="img"
      aria-label={`${exibido}% da meta`}
      className="ring-meter"
    >
      <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" style={{ stroke: "var(--graf-trilha)" }} strokeWidth={traco} />
      {pct > 0 && (
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          style={{ stroke: atingida ? "var(--graf-ok)" : "var(--graf-2)" }}
          strokeWidth={traco}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * volta} ${volta}`}
          transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
        />
      )}
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text">
        {exibido}%
      </text>
    </svg>
  );
}
