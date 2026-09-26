import React, { useId } from "react";

// Marca do app: colunas subindo com a seta de crescimento (o mesmo desenho do ícone do app).
// claro = versão para fundo escuro (colunas brancas sobre vidro), usada na tela de entrada.
export default function Logo({ tamanho = 56, claro = false }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Meu Financeiro"
      className="logo-app"
    >
      <defs>
        <linearGradient id={`fundo-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={claro ? "rgba(255,255,255,.22)" : "#2563eb"} />
          <stop offset="1" stopColor={claro ? "rgba(255,255,255,.06)" : "#0f172a"} />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="63" height="63" rx="17" fill={`url(#fundo-${id})`} />
      {claro && <rect x="0.5" y="0.5" width="63" height="63" rx="17" fill="none" stroke="rgba(255,255,255,.35)" />}
      <rect x="13" y="39" width="9" height="12" rx="3" fill="#fff" opacity=".55" />
      <rect x="27.5" y="32" width="9" height="19" rx="3" fill="#fff" opacity=".78" />
      <rect x="42" y="25" width="9" height="26" rx="3" fill="#fff" />
      <path
        d="M12 29.5 25 20l8.5 5.5L48.5 12.5"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M41.5 11.5h8v8" fill="none" stroke="#fbbf24" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
