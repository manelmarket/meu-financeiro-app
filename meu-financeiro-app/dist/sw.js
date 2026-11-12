// Service worker do Meu Financeiro.
// Este arquivo é só o MODELO: o build (vite.config.js) gera o dist/sw.js a partir dele,
// preenchendo a versão, a marca do build e a lista de arquivos do app.
//
// O que ele faz:
// - guarda o app neste aparelho: abre mesmo sem internet;
// - a cada deploy o sw.js muda; o navegador baixa a versão nova em segundo plano e o app
//   mostra "Nova versão disponível" (ou a pessoa usa "Verificar atualizações" no menu);
// - nunca guarda os dados: eles ficam no aparelho (localStorage/IndexedDB) e na nuvem.

const VERSAO = "1.1.1";
const BUILD = "045b7cba21fa";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-DQdfU43d.js",
  "/assets/Backup-4i0YgQEJ.js",
  "/assets/Bancos-CsktdBOq.js",
  "/assets/Bills-DlligB-4.js",
  "/assets/CardDetails-B31vTOpE.js",
  "/assets/Cards-Bj7EIenG.js",
  "/assets/Categorias-sl_dsxPq.js",
  "/assets/Conquistas-5AKUugQF.js",
  "/assets/CupomModal-DYwooKgH.js",
  "/assets/Emprestimos-X-lhGw5U.js",
  "/assets/EscolherBanco-BYx2syEk.js",
  "/assets/Familia-VzO8waOD.js",
  "/assets/FutureEntries-E7QeHWi1.js",
  "/assets/Goals-DcT2r97b.js",
  "/assets/History-DoNlGLRz.js",
  "/assets/Importar-BnJUScuD.js",
  "/assets/Investments-6YkRx7lR.js",
  "/assets/InvoiceCalendar-DSHYgQ4r.js",
  "/assets/Jarvis-CRwHhznT.js",
  "/assets/Lembretes-BQyXHU_f.js",
  "/assets/MesDetalhe-DH_uIpvn.js",
  "/assets/Orcamentos-VK4gWsVx.js",
  "/assets/PagarFatura-CHlMbQmg.js",
  "/assets/Patrimony-Dl7dEypF.js",
  "/assets/Profile-DHHDOckk.js",
  "/assets/ReceitasFixas-CvXp3UXB.js",
  "/assets/RelatorioImpressao-Di8CqC8Z.js",
  "/assets/Reports-F6aRF2hY.js",
  "/assets/Settings-DO2O0QFa.js",
  "/assets/Vencimentos-DN_HMAKE.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/exportar-BZo2sBQO.js",
  "/assets/index-C8dqTClV.js",
  "/assets/index-CL3fPGJl.css",
  "/assets/index-ku4GKXMo.js",
  "/assets/index-pPjGXEo6.js",
  "/assets/log-out-B4BlagK1.js",
  "/assets/nuvem-DHq4sfm4.js",
  "/assets/patrimonio-CwJtx0rf.js",
  "/assets/trash-2-DbKLMnQm.js",
  "/assets/undo-2-D4PTYjL4.js",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/icone.svg",
  "/",
  "/manifest.webmanifest"
];

// sempre pela internet (login do Google no app Android, verificação do APK, instalador)
const SEMPRE_ONLINE = [/^\/__\//, /^\/\.well-known\//, /^\/apk\//, /^\/sw\.js$/, /^\/version\.json$/];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) {
        if (nome.startsWith("meu-financeiro-") && nome !== CACHE) await caches.delete(nome);
      }
      await self.clients.claim();
    })()
  );
});

// o app pede para trocar para a versão nova (botão "Atualizar")
self.addEventListener("message", (evento) => {
  if (evento.data && evento.data.tipo === "atualizar") self.skipWaiting();
  // página aberta no instante em que este service worker ativou: passa a cuidar dela também
  if (evento.data && evento.data.tipo === "assumir") evento.waitUntil(self.clients.claim());
  if (evento.data && evento.data.tipo === "versao") evento.source?.postMessage({ tipo: "versao", versao: VERSAO, build: BUILD });
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return; // Firebase e Google: sempre pela internet
  if (SEMPRE_ONLINE.some((r) => r.test(url.pathname))) return;

  // os arquivos do app têm nome único por versão: basta comparar o endereço
  // (ignoreVary: o servidor pode responder com "Vary", que não muda o arquivo)
  const opcoes = { ignoreVary: true };

  if (pedido.mode === "navigate") {
    // o app é uma página só: abre do aparelho (funciona sem internet)
    evento.respondWith(
      caches
        .open(CACHE)
        .then((cache) => cache.match("/", opcoes))
        .then((guardada) => guardada || fetch(pedido))
    );
    return;
  }

  evento.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(url.href, opcoes))
      .then((guardada) => guardada || fetch(pedido))
  );
});
