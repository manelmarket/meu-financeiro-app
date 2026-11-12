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
const BUILD = "230a7209f7bf";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-CCKKKNg7.js",
  "/assets/Backup-BSVqHHFP.js",
  "/assets/Bancos-Dm-J81q3.js",
  "/assets/Bills-CtfY-SQb.js",
  "/assets/CardDetails-Ck4DH-wM.js",
  "/assets/Cards-JuxOTZZT.js",
  "/assets/Categorias-C2QPuyB6.js",
  "/assets/Conquistas-Djja5ezA.js",
  "/assets/CupomModal-DTV6L25h.js",
  "/assets/Emprestimos-ZsXOYmYB.js",
  "/assets/EscolherBanco-BTIz8VuF.js",
  "/assets/Familia-D8XMN2lq.js",
  "/assets/FutureEntries-D7cVBveg.js",
  "/assets/Goals-Brd109l7.js",
  "/assets/History-BIo-z6L-.js",
  "/assets/Importar-BzOR0zfB.js",
  "/assets/Investments-C1RJa8sy.js",
  "/assets/InvoiceCalendar-MILQ0Fzu.js",
  "/assets/Jarvis-ZoIwab0Q.js",
  "/assets/Lembretes-DpWUqN-3.js",
  "/assets/MesDetalhe-g_OYTroX.js",
  "/assets/Orcamentos-DOXQwENy.js",
  "/assets/PagarFatura-D2iQijPk.js",
  "/assets/Patrimony-DpDAEWSV.js",
  "/assets/Profile-B7DzsNQy.js",
  "/assets/ReceitasFixas-BBUdg6-e.js",
  "/assets/RelatorioImpressao-BWHtORcn.js",
  "/assets/Reports-GTIvJ2b8.js",
  "/assets/Settings-aKoXGLta.js",
  "/assets/Vencimentos-BvGNaMyx.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/exportar-CshNiBsV.js",
  "/assets/index-B-YSOHaX.js",
  "/assets/index-C8dqTClV.js",
  "/assets/index-CeNdhdTr.css",
  "/assets/index-pPjGXEo6.js",
  "/assets/log-out-17BGEL3E.js",
  "/assets/nuvem-D9vqILse.js",
  "/assets/patrimonio-CgRjSMIN.js",
  "/assets/trash-2-frrMtpeu.js",
  "/assets/undo-2-B7S6x57p.js",
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
