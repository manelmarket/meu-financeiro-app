import React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { ESTILOS, TEMAS, TEMAS_PRONTOS, mudarAparencia, usarAparencia } from "../lib/aparencia.js";

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

// Mini celular com as cores do tema e o jeito do estilo (a prévia não depende do tema atual do app)
function Previa({ tema, escuro, estilo = "classico" }) {
  const { principal, destaque, grafico } = tema.cores;
  const vidro = estilo === "vidro";
  const banco = estilo === "banco";
  const fundo = vidro
    ? escuro
      ? `radial-gradient(circle at 20% 15%, ${grafico[1]}cc, transparent 55%), radial-gradient(circle at 85% 70%, #ec4899aa, transparent 50%), #0b1022`
      : `radial-gradient(circle at 20% 15%, ${grafico[2]}, transparent 55%), radial-gradient(circle at 85% 70%, #f9a8d4, transparent 50%), #e0e7ff`
    : escuro
      ? "#0b1220"
      : banco
        ? "#f3f4f8"
        : "#f8fafc";
  const cartao = vidro ? (escuro ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.55)") : escuro ? "#111a2b" : "#ffffff";
  const linha = escuro ? "#26334a" : "#e2e8f0";
  const topo = banco
    ? { background: escuro ? destaque[0] : principal, borderRadius: 0, margin: "-8px -8px 0", padding: "12px 10px 14px" }
    : vidro
      ? { background: escuro ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.45)" }
      : { background: `linear-gradient(145deg, ${destaque[0]}, ${destaque[1]})` };
  const tinta = vidro && !escuro ? "#0f172a" : "#fff";
  return (
    <div className={`tema-previa${banco ? " banco" : ""}`} style={{ background: fundo }} aria-hidden="true">
      <div className="tema-previa-saldo" style={topo}>
        <i style={{ background: tinta, opacity: 0.45, width: "40%" }} />
        <i style={{ background: tinta, width: "65%", height: 7 }} />
        {banco && (
          <span className="tema-previa-bolinhas">
            {[0, 1, 2, 3].map((i) => (
              <b key={i} style={{ background: i === 0 ? "#fff" : "rgba(255,255,255,.35)" }} />
            ))}
          </span>
        )}
      </div>
      <div className="tema-previa-cartao" style={{ background: cartao, border: vidro ? "1px solid rgba(255,255,255,.4)" : undefined }}>
        <div className="tema-previa-barras">
          {[0.55, 0.9, 0.7, 0.4].map((h, i) => (
            <span key={i} style={{ height: `${h * 100}%`, background: grafico[i % 3] }} />
          ))}
        </div>
        <i style={{ background: linha }} />
      </div>
      <div className={`tema-previa-botao${banco || vidro ? " redondo" : ""}`} style={{ background: principal }} />
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
        <h2>Temas prontos</h2>
        <div className="temas-grade" role="radiogroup" aria-label="Temas prontos">
          {TEMAS_PRONTOS.map((p) => {
            const t = TEMAS.find((x) => x.id === p.tema);
            const ativo = aparencia.estilo === p.estilo && aparencia.tema === p.tema && aparencia.escuro === p.escuro;
            return (
              <button
                type="button"
                key={p.id}
                role="radio"
                aria-checked={ativo}
                className={`tema-opcao${ativo ? " ativo" : ""}`}
                onClick={() => mudarAparencia({ estilo: p.estilo, tema: p.tema, escuro: p.escuro })}
              >
                <Previa tema={t} escuro={p.escuro} estilo={p.estilo} />
                <span className="tema-nome">
                  <b>{p.nome}</b>
                  <small>{ESTILOS.find((e) => e.id === p.estilo).nome}{p.escuro ? " · escuro" : ""}</small>
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
      </section>

      <section className="section-card">
        <h2>Estilo do app</h2>
        <div className="estilos-lista" role="radiogroup" aria-label="Estilo do app">
          {ESTILOS.map((e) => {
            const ativo = aparencia.estilo === e.id;
            return (
              <button
                type="button"
                key={e.id}
                role="radio"
                aria-checked={ativo}
                className={`estilo-opcao${ativo ? " ativo" : ""}`}
                onClick={() => mudarAparencia({ estilo: e.id })}
              >
                <span className="tema-nome">
                  <b>{e.nome}</b>
                  <small>{e.descricao}</small>
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
      </section>

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
                <Previa tema={t} escuro={aparencia.escuro} estilo={aparencia.estilo} />
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
        <p className="muted small tema-nota">As cores valem para qualquer estilo. O tema fica guardado neste aparelho.</p>
      </section>
    </div>
  );
}
