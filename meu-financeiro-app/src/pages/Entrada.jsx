import React, { useEffect, useState } from "react";
import EscolhaNuvem from "../components/EscolhaNuvem.jsx";

// Tela de entrada: o app só abre depois do login com a conta Google.
export default function Entrada({ nuvem, data }) {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));

  // deixa o login do Google carregado antes do toque (no celular a janela só abre se for imediata)
  useEffect(() => {
    nuvem.prepararLogin();
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const { status, mensagem, usuario } = nuvem;
  const entrando = status === "entrando";

  return (
    <div className="entrada">
      <div className="entrada-card">
        <div className="entrada-logo" aria-hidden="true">
          💰
        </div>
        <h1>Meu Financeiro</h1>
        <p className="entrada-sub">Cartões, contas, metas e investimentos num lugar só, com IA.</p>

        {nuvem.escolha ? (
          <div className="entrada-escolha">
            <div className="cloud-user">
              <span className="muted small">Conectado como</span>
              <b>{usuario?.email || "sua conta Google"}</b>
            </div>
            <EscolhaNuvem nuvem={nuvem} data={data} />
          </div>
        ) : (
          <>
            {status === "sessao" && (
              <p className="hint">Sua sessão terminou. Entre de novo com a sua conta Google para continuar.</p>
            )}
            {!online && <p className="form-error">Sem internet. Conecte-se para entrar.</p>}
            {mensagem && status !== "sessao" && <p className="form-error">{mensagem}</p>}
            {entrando && (
              <p className="hint">
                Abrindo a janela de login do Google… Se ela não abrir ou você fechou sem entrar, toque no botão de
                novo.
              </p>
            )}
            <button type="button" className="primary wide-btn entrada-btn" onClick={nuvem.entrar}>
              Entrar com Google
            </button>
            <p className="muted small entrada-nota">
              Seus dados ficam guardados na sua conta e aparecem em todos os aparelhos em que você entrar.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
