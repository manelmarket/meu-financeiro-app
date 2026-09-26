import React, { useEffect, useState } from "react";
import {
  CreditCard,
  LoaderCircle,
  Lock,
  LogIn,
  PiggyBank,
  ShieldCheck,
  Target,
  TrendingUp,
  WifiOff
} from "lucide-react";
import EscolhaNuvem from "../components/EscolhaNuvem.jsx";
import Logo from "../components/Logo.jsx";
import { VERSAO_DO_APP } from "../config/versao.js";

const RECURSOS = [
  [CreditCard, "Cartões, faturas e parcelas em dia"],
  [Target, "Metas, investimentos e patrimônio"],
  [ShieldCheck, "Seus dados guardados na sua conta"]
];

// linha do minigráfico da vitrine (sobe no fim: mês fechando no azul)
const LINHA = "M4 62 C 30 58, 42 40, 64 44 S 104 60, 124 38 S 164 18, 196 12";

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
      <div className="entrada-fundo" aria-hidden="true">
        <span className="entrada-bolha b1" />
        <span className="entrada-bolha b2" />
        <span className="entrada-bolha b3" />
        <span className="entrada-grade" />
      </div>

      <div className="entrada-conteudo">
        <header className="entrada-marca anima" style={{ "--atraso": "0ms" }}>
          <Logo tamanho={48} claro />
          <span>
            <b>Meu Financeiro</b>
            <small>Controle financeiro pessoal</small>
          </span>
        </header>

        {nuvem.escolha ? (
          <section className="entrada-painel anima" style={{ "--atraso": "80ms" }}>
            <div className="cloud-user">
              <span className="muted small">Conectado como</span>
              <b>{usuario?.email || "sua conta Google"}</b>
            </div>
            <EscolhaNuvem nuvem={nuvem} data={data} />
          </section>
        ) : (
          <>
            <section className="entrada-hero anima" style={{ "--atraso": "80ms" }}>
              <h1>
                Seu dinheiro <em>sob controle.</em>
              </h1>
              <p>Cartões, contas, metas e investimentos num lugar só, com IA e sincronizado na nuvem.</p>
            </section>

            <div className="entrada-vitrine anima" style={{ "--atraso": "160ms" }} aria-hidden="true">
              <div className="vitrine-cartao">
                <div className="vitrine-topo">
                  <small>Saldo do mês</small>
                  <span className="vitrine-selo">
                    <TrendingUp size={13} strokeWidth={2.6} /> +12%
                  </span>
                </div>
                <strong>R$ 4.320,00</strong>
                <svg className="vitrine-grafico" viewBox="0 0 200 72" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="vitrine-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="rgba(251,191,36,.35)" />
                      <stop offset="1" stopColor="rgba(251,191,36,0)" />
                    </linearGradient>
                  </defs>
                  <path d={`${LINHA} L196 72 L4 72 Z`} fill="url(#vitrine-area)" className="vitrine-area" />
                  <path d={LINHA} className="vitrine-linha" pathLength="1" />
                </svg>
                <div className="vitrine-linhas">
                  <span>
                    <i className="ponto receita" /> Receitas <b>R$ 6.500</b>
                  </span>
                  <span>
                    <i className="ponto despesa" /> Despesas <b>R$ 2.180</b>
                  </span>
                </div>
              </div>
              <span className="vitrine-chip c1">
                <PiggyBank size={16} /> Meta 72%
              </span>
              <span className="vitrine-chip c2">
                <CreditCard size={16} /> Fatura em dia
              </span>
            </div>

            <ul className="entrada-recursos anima" style={{ "--atraso": "240ms" }}>
              {RECURSOS.map(([Icone, texto]) => (
                <li key={texto}>
                  <span className="recurso-icone" aria-hidden="true">
                    <Icone size={17} />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>

            <section className="entrada-acoes anima" style={{ "--atraso": "320ms" }}>
              {status === "sessao" && (
                <p className="entrada-aviso">Sua sessão terminou. Entre de novo com a sua conta Google para continuar.</p>
              )}
              {!online && (
                <p className="entrada-aviso erro">
                  <WifiOff size={16} aria-hidden="true" /> Sem internet. Conecte-se para entrar.
                </p>
              )}
              {mensagem && status !== "sessao" && <p className="entrada-aviso erro">{mensagem}</p>}
              <button type="button" className="entrada-google" onClick={nuvem.entrar}>
                {entrando ? (
                  <LoaderCircle size={20} className="girando" aria-hidden="true" />
                ) : (
                  <LogIn size={20} aria-hidden="true" />
                )}
                {entrando ? "Entrando…" : "Entrar com Google"}
              </button>
              {entrando && (
                <p className="entrada-nota">
                  Se a tela do Google não abrir, ou se você fechou sem entrar, toque no botão de novo.
                </p>
              )}
              <p className="entrada-nota">
                <Lock size={13} aria-hidden="true" /> Login seguro com a sua conta Google. Seus dados aparecem em todos
                os aparelhos em que você entrar.
              </p>
            </section>
          </>
        )}

        <footer className="entrada-rodape">Versão {VERSAO_DO_APP}</footer>
      </div>
    </div>
  );
}
