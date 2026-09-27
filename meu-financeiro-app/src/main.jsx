import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { aplicarAparencia } from "./lib/aparencia";
import { marcarModoApp } from "./lib/modoApp";
import { guardarConviteDaUrl } from "./lib/convite";
import { iniciarPonteAndroid } from "./lib/appAndroid";
import { registrarServiceWorker } from "./lib/atualizacao";
import "./index.css";

// tema e modo escuro deste aparelho (o index.html já aplicou antes de pintar; aqui confirma)
aplicarAparencia();

// aberto pelo app Android (APK): o login usa o jeito que funciona dentro do app
marcarModoApp();

// aberto pelo link de convite da família (?convite=...): guarda o código para a tela Família
guardarConviteDaUrl();

// app Android novo: canal de mensagens para os lembretes de vencimento
iniciarPonteAndroid();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// guarda o app para abrir sem internet e procura versões novas (depois de carregar)
if (document.readyState === "complete") registrarServiceWorker();
else window.addEventListener("load", () => registrarServiceWorker());
