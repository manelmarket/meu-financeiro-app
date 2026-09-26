import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { aplicarAparencia } from "./lib/aparencia";
import { marcarModoApp } from "./lib/modoApp";
import { registrarServiceWorker } from "./lib/atualizacao";
import "./index.css";

// tema e modo escuro deste aparelho (o index.html já aplicou antes de pintar; aqui confirma)
aplicarAparencia();

// aberto pelo app Android (APK): o login usa o jeito que funciona dentro do app
marcarModoApp();

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
