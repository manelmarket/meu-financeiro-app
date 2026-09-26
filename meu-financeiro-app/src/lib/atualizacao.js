// Atualizações e uso sem internet.
// O service worker (/sw.js, gerado a cada build) guarda o app neste aparelho: ele abre mesmo sem
// internet. A cada deploy o sw.js muda; o navegador baixa a versão nova em segundo plano e o app
// mostra "Nova versão disponível". O item "Verificar atualizações" do menu procura na hora.

import { useSyncExternalStore } from "react";

let registro = null;
let pediuParaAtualizar = false;
let estado = { suportado: false, disponivel: false, versaoNova: "" };
const ouvintes = new Set();

function mudar(parcial) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((f) => f());
}

export function usarAtualizacao() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => estado
  );
}

async function lerVersaoNova() {
  try {
    const r = await fetch("/version.json", { cache: "no-store" });
    if (!r.ok) return "";
    const v = await r.json();
    return typeof v?.versao === "string" ? v.versao : "";
  } catch {
    return "";
  }
}

async function marcarDisponivel() {
  if (!estado.disponivel) mudar({ disponivel: true });
  const versao = await lerVersaoNova();
  if (versao && versao !== estado.versaoNova) mudar({ versaoNova: versao });
}

// quando o service worker novo termina de instalar (e já havia um cuidando da página), avisa
function acompanhar(sw) {
  if (!sw) return;
  sw.addEventListener("statechange", () => {
    if (sw.state === "installed" && navigator.serviceWorker.controller) marcarDisponivel();
  });
}

export async function registrarServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || import.meta.env.DEV) return;
  try {
    registro = await navigator.serviceWorker.register("/sw.js");
  } catch {
    return;
  }
  mudar({ suportado: true });
  if (registro.waiting && navigator.serviceWorker.controller) marcarDisponivel();
  // o service worker já está ativo mas esta página abriu sem ele: pede para ele assumir
  if (!navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((r) => {
      if (!navigator.serviceWorker.controller) r.active?.postMessage({ tipo: "assumir" });
    });
  }
  acompanhar(registro.installing);
  registro.addEventListener("updatefound", () => acompanhar(registro.installing));

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // na primeira instalação não precisa recarregar; só quando a pessoa pediu a versão nova
    if (!pediuParaAtualizar) return;
    pediuParaAtualizar = false;
    window.location.reload();
  });

  // confere sozinho ao voltar para o app (no máximo a cada 5 min) e a cada 30 min
  let ultima = Date.now();
  const conferir = (forcar) => {
    if (!forcar && Date.now() - ultima < 5 * 60 * 1000) return;
    ultima = Date.now();
    registro.update().catch(() => {});
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") conferir(false);
  });
  setInterval(() => conferir(true), 30 * 60 * 1000);
}

function esperarInstalar(sw, ms) {
  return new Promise((resolve) => {
    if (!sw || sw.state !== "installing") {
      resolve();
      return;
    }
    const tempo = setTimeout(resolve, ms);
    sw.addEventListener("statechange", () => {
      if (sw.state === "installing") return;
      clearTimeout(tempo);
      resolve();
    });
  });
}

// Procura uma versão nova agora.
// resultado: "nova" | "em-dia" | "offline" | "sem-suporte" | "erro"
export async function verificarAtualizacao() {
  if (!registro) return { resultado: "sem-suporte" };
  if (navigator.onLine === false) return { resultado: "offline" };
  try {
    await registro.update();
  } catch {
    return { resultado: navigator.onLine === false ? "offline" : "erro" };
  }
  const instalando = registro.installing;
  if (instalando) await esperarInstalar(instalando, 30000);
  if (registro.waiting) {
    await marcarDisponivel();
    return { resultado: "nova", versao: estado.versaoNova };
  }
  if (instalando && instalando.state === "redundant") return { resultado: "erro" };
  return { resultado: "em-dia" };
}

// Troca para a versão nova (o app recarrega sozinho)
export function aplicarAtualizacao() {
  const sw = registro?.waiting;
  if (!sw) {
    window.location.reload();
    return;
  }
  pediuParaAtualizar = true;
  sw.postMessage({ tipo: "atualizar" });
  // se o navegador demorar para trocar, recarrega mesmo assim
  setTimeout(() => {
    if (pediuParaAtualizar) window.location.reload();
  }, 4000);
}
