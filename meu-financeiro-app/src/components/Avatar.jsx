import React, { useState } from "react";

// Foto da conta Google (ou as iniciais do nome, se não tiver foto)
export default function Avatar({ foto, nome, tamanho = 44 }) {
  const [falhou, setFalhou] = useState(false);
  const iniciais =
    String(nome || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?";

  if (foto && !falhou) {
    return (
      <img
        className="avatar"
        src={foto}
        alt=""
        width={tamanho}
        height={tamanho}
        referrerPolicy="no-referrer"
        onError={() => setFalhou(true)}
      />
    );
  }
  return (
    <span
      className="avatar avatar-letras"
      style={{ width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.38) }}
      aria-hidden="true"
    >
      {iniciais}
    </span>
  );
}
