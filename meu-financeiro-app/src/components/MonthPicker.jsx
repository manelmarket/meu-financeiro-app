import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { somarMeses, tituloMes } from "../lib/formato.js";

// ‹ Setembro 2026 ›  (com "voltar para o mês atual" e selo de previsão)
export default function MonthPicker({ mes, mesHoje, onChange }) {
  return (
    <div className="month-picker">
      <button aria-label="Mês anterior" onClick={() => onChange(somarMeses(mes, -1))}>
        <ChevronLeft size={20} />
      </button>
      <div className="month-picker-label">
        <strong>{tituloMes(mes)}</strong>
        {mes > mesHoje && <span className="tag">Previsão</span>}
        {mes !== mesHoje && (
          <button className="link" onClick={() => onChange(mesHoje)}>
            voltar para o mês atual
          </button>
        )}
      </div>
      <button aria-label="Próximo mês" onClick={() => onChange(somarMeses(mes, 1))}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
