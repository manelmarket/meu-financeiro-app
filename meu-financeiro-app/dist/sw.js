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
const BUILD = "4e8c5195ad17";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-7y_AqCdo.js",
  "/assets/Backup-pBkn1oYa.js",
  "/assets/Bancos-ftmqLodQ.js",
  "/assets/Bills-CZYVAfm4.js",
  "/assets/CardDetails-D8ogStUC.js",
  "/assets/Cards-DnQwtM32.js",
  "/assets/Categorias-iPv7u6uW.js",
  "/assets/Conquistas-Clu0T4J_.js",
  "/assets/CupomModal-cfNmYyjx.js",
  "/assets/Emprestimos--xW5hBq9.js",
  "/assets/EscolherBanco-BSKSM3cZ.js",
  "/assets/Familia-CekFM1aK.js",
  "/assets/FutureEntries-B1EVdsCH.js",
  "/assets/Goals-k_HGYDOa.js",
  "/assets/History-BlTXkXi6.js",
  "/assets/Importar-BWKr7H4r.js",
  "/assets/Investments--F283xdP.js",
  "/assets/InvoiceCalendar-_ctZWBDD.js",
  "/assets/Jarvis-Dl_Dwcin.js",
  "/assets/Lembretes-DBMLa3XU.js",
  "/assets/MesDetalhe-9F_FulLe.js",
  "/assets/Orcamentos-PiGgOOZ6.js",
  "/assets/PagarFatura-BGVKJIxv.js",
  "/assets/Patrimony-BkNCPI4B.js",
  "/assets/Profile-COGWWETy.js",
  "/assets/ReceitasFixas-CGyv0CeC.js",
  "/assets/RelatorioImpressao-DrL0OLbf.js",
  "/assets/Reports-VDLSvCTg.js",
  "/assets/Settings-BK8IFM67.js",
  "/assets/Vazio-xMLfeNa2.js",
  "/assets/Vencimentos-DoxKbJlN.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/download-CMl3tHJ5.js",
  "/assets/exportar-BFoOSTIZ.js",
  "/assets/index-BNpTuTFO.css",
  "/assets/index-C8dqTClV.js",
  "/assets/index-SnJGbjF2.js",
  "/assets/index-pPjGXEo6.js",
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2",
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2",
  "/assets/log-out-CsBNt0Kt.js",
  "/assets/nuvem-A_GC0ybJ.js",
  "/assets/patrimonio-0lGm-ijY.js",
  "/assets/pencil-Cwo5TmWb.js",
  "/assets/share-2-APDwpK5C.js",
  "/assets/trash-2-CtfEwnaX.js",
  "/assets/undo-2-DPIo8PT3.js",
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
