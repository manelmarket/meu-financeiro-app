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
const BUILD = "a195daf48e41";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-B5-qWD29.js",
  "/assets/Backup-8t5eZygT.js",
  "/assets/Bancos-DpEEbZn7.js",
  "/assets/Bills-cTnrwNRS.js",
  "/assets/CardDetails-DWKU3Gwk.js",
  "/assets/Cards-Bt5-Gw8g.js",
  "/assets/Categorias-yrGYfJZN.js",
  "/assets/Conquistas-YtPsUPu3.js",
  "/assets/CupomModal-BQGm64JR.js",
  "/assets/Emprestimos-DW5gS6ym.js",
  "/assets/EscolherBanco-CxBbiehB.js",
  "/assets/Familia-6EVB4NIK.js",
  "/assets/FutureEntries-Cyc4E_Iw.js",
  "/assets/Goals-DaV4oge4.js",
  "/assets/History-wSADzPkb.js",
  "/assets/Importar-ChPUSuYp.js",
  "/assets/Investments-BMghXJK_.js",
  "/assets/InvoiceCalendar-CQMf86q4.js",
  "/assets/Jarvis-yAeV-d-1.js",
  "/assets/Lembretes-CPcfZ8GZ.js",
  "/assets/MesDetalhe-CUKcEii1.js",
  "/assets/Orcamentos-DnTUxCam.js",
  "/assets/PagarFatura-9diJ-f6e.js",
  "/assets/Patrimony-DkveOF6z.js",
  "/assets/Profile-CpfQZgl3.js",
  "/assets/ReceitasFixas-CxS3-1ls.js",
  "/assets/RelatorioImpressao-CsjfK_Ct.js",
  "/assets/Reports-s9GsSTAK.js",
  "/assets/Settings-Mg_E1QDI.js",
  "/assets/Vencimentos-bHRTrSAx.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/exportar-DB3_ur_d.js",
  "/assets/index-BrIW8Qwm.js",
  "/assets/index-C8dqTClV.js",
  "/assets/index-CeNdhdTr.css",
  "/assets/index-pPjGXEo6.js",
  "/assets/log-out-Br53rioW.js",
  "/assets/nuvem-jnjt9Awo.js",
  "/assets/patrimonio-DBRFegwc.js",
  "/assets/trash-2-C6QuQhrt.js",
  "/assets/undo-2-Ch9QlQfW.js",
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
