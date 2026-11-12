// Service worker do Meu Financeiro.
// Este arquivo é só o MODELO: o build (vite.config.js) gera o dist/sw.js a partir dele,
// preenchendo a versão, a marca do build e a lista de arquivos do app.
//
// O que ele faz:
// - guarda o app neste aparelho: abre mesmo sem internet;
// - a cada deploy o sw.js muda; o navegador baixa a versão nova em segundo plano e o app
//   mostra "Nova versão disponível" (ou a pessoa usa "Verificar atualizações" no menu);
// - nunca guarda os dados: eles ficam no aparelho (localStorage/IndexedDB) e na nuvem.

const VERSAO = "1.1.2";
const BUILD = "afbe7be3134d";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-Dv-TEu1r.js",
  "/assets/Backup--IwL-5Xd.js",
  "/assets/Bancos-BTD1nFZp.js",
  "/assets/Bills-AN73NM6U.js",
  "/assets/CardDetails-DKWP3Dfb.js",
  "/assets/Cards-Dxcpa8UQ.js",
  "/assets/Categorias-GQm4B9bn.js",
  "/assets/Conquistas-DfIkxl_k.js",
  "/assets/CupomModal-D-BhUFsP.js",
  "/assets/Emprestimos-5FvbgcOi.js",
  "/assets/EscolherBanco-dLtj9uHJ.js",
  "/assets/Familia-BowPUw2m.js",
  "/assets/FutureEntries-D9WPaofL.js",
  "/assets/Goals-DTX0aEna.js",
  "/assets/History-DycC542_.js",
  "/assets/Importar-DpAbXOU8.js",
  "/assets/Investments-D9BtNd98.js",
  "/assets/InvoiceCalendar-DnB2iVWq.js",
  "/assets/Jarvis-BQet09AH.js",
  "/assets/Lembretes-BYyzLCO8.js",
  "/assets/MesDetalhe-BMwLEdpV.js",
  "/assets/Orcamentos-BuMFt6rM.js",
  "/assets/PagarFatura-Cmr0vmus.js",
  "/assets/Patrimony-BpMe1-Og.js",
  "/assets/Profile-1mZhlOGs.js",
  "/assets/ReceitasFixas-CjRDZvki.js",
  "/assets/RelatorioImpressao-BTaf5PM1.js",
  "/assets/Reports-DQsDUI4-.js",
  "/assets/Settings-VmzXFmvw.js",
  "/assets/Vazio-DE9Rxh5a.js",
  "/assets/Vencimentos-dc86HwQa.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/download-Cft7diAe.js",
  "/assets/exportar-P2IiUhjp.js",
  "/assets/index-C00t4QQJ.css",
  "/assets/index-C8dqTClV.js",
  "/assets/index-C9JgMM3I.js",
  "/assets/index-pPjGXEo6.js",
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2",
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2",
  "/assets/log-out-CVf3ic9T.js",
  "/assets/nuvem-DQ9GRh5O.js",
  "/assets/patrimonio-Dg4a4wi8.js",
  "/assets/pencil-x57nc9Sn.js",
  "/assets/share-2-DUf5LgW3.js",
  "/assets/trash-2-brl_QieS.js",
  "/assets/undo-2-mq5im1AW.js",
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
