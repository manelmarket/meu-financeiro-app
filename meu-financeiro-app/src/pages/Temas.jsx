import React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { TEMAS, mudarAparencia, usarAparencia } from "../lib/aparencia.js";

// Interruptor liga/desliga (usado aqui e no menu lateral)
export function Interruptor({ ligado, onMudar, rotulo, tabIndex }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      className={`interruptor${ligado ? " ligado" : ""}`}
      onClick={() => onMudar(!ligado)}
      tabIndex={tabIndex}
    >
      <span className="interruptor-bolinha" />
    </button>
  );
}

// Mini celular com as cores do tema (a prévia não depende do tema atual do app)
function Previa({ tema, escuro }) {
  const { principal, destaque, grafico } = tema.cores;
  const fundo = escuro ? "#0b1220" : "#f8fafc";
  const cartao = escuro ? "#111a2b" : "#ffffff";
  const linha = escuro ? "#26334a" : "#e2e8f0";
  return (
    <div className="tema-previa" style={{ background: fundo }} aria-hidden="true">
      <div className="tema-previa-saldo" style={{ background: `linear-gradient(145deg, ${destaque[0]}, ${destaque[1]})` }}>
        <i style={{ background: "rgba(255,255,255,.45)", width: "40%" }} />
        <i style={{ background: "#fff", width: "65%", height: 7 }} />
      </div>
      <div className="tema-previa-cartao" style={{ background: cartao }}>
        <div className="tema-previa-barras">
          {[0.55, 0.9, 0.7, 0.4].map((h, i) => (
            <span key={i} style={{ height: `${h * 100}%`, background: grafico[i % 3] }} />
          ))}
        </div>
        <i style={{ background: linha }} />
      </div>
      <div className="tema-previa-botao" style={{ background: principal }} />
    </div>
  );
}

export default function Temas({ onBack }) {
  const aparencia = usarAparencia();

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Aparência</div>
          <h1>🎨 Temas</h1>
        </div>
      </header>

      <section className="section-card">
        <div className="tema-escuro">
          <span className="tema-escuro-icone" aria-hidden="true">
            {aparencia.escuro ? <Moon size={20} /> : <Sun size={20} />}
          </span>
          <span className="settings-text">
            <b>Modo escuro</b>
            <small>Fundo escuro, mais confortável à noite. Vale para todos os temas.</small>
          </span>
          <Interruptor ligado={aparencia.escuro} onMudar={(v) => mudarAparencia({ escuro: v })} rotulo="Modo escuro" />
        </div>
      </section>

      <section className="section-card">
        <h2>Cores do app</h2>
        <div className="temas-grade" role="radiogroup" aria-label="Tema de cores">
          {TEMAS.map((t) => {
            const ativo = aparencia.tema === t.id;
            return (
              <button
                type="button"
                key={t.id}
                role="radio"
                aria-checked={ativo}
                className={`tema-opcao${ativo ? " ativo" : ""}`}
                onClick={() => mudarAparencia({ tema: t.id })}
              >
                <Previa tema={t} escuro={aparencia.escuro} />
                <span className="tema-nome">
                  <b>{t.nome}</b>
                  <small>{t.descricao}</small>
                </span>
                {ativo && (
                  <span className="tema-marcado" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="muted small tema-nota">O tema fica guardado neste aparelho.</p>
      </section>
    </div>
  );
}
