// Service worker do Meu Financeiro.
// Este arquivo é só o MODELO: o build (vite.config.js) gera o dist/sw.js a partir dele,
// preenchendo a versão, a marca do build e a lista de arquivos do app.
//
// O que ele faz:
// - guarda o app neste aparelho: abre mesmo sem internet;
// - a cada deploy o sw.js muda; o navegador baixa a versão nova em segundo plano e o app
//   mostra "Nova versão disponível" (ou a pessoa usa "Verificar atualizações" no menu);
// - nunca guarda os dados: eles ficam no aparelho (localStorage/IndexedDB) e na nuvem.

const VERSAO = "1.1.0";
const BUILD = "e1960727e60f";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-BM_SCsUQ.js",
  "/assets/Backup-CbB3cXrh.js",
  "/assets/Bancos-nlfzccwG.js",
  "/assets/Bills-B4YGlQB_.js",
  "/assets/CardDetails-Cl5NHoBZ.js",
  "/assets/Cards-7Ty4tdYf.js",
  "/assets/Categorias-48dplTTp.js",
  "/assets/Conquistas-BaF7oUjh.js",
  "/assets/CupomModal-BO0Dl7VC.js",
  "/assets/Emprestimos-B3nPhhN4.js",
  "/assets/EscolherBanco-DoUbCWcl.js",
  "/assets/Familia-C-jedUWH.js",
  "/assets/FutureEntries-C6Sul9a6.js",
  "/assets/Goals-BISj9fNI.js",
  "/assets/History-DZuAxTSa.js",
  "/assets/Importar-B7LUnSLW.js",
  "/assets/Investments-Ba_W1PAc.js",
  "/assets/InvoiceCalendar-CMkplsh3.js",
  "/assets/Jarvis-84vNtY43.js",
  "/assets/Lembretes-Cm2VdmgU.js",
  "/assets/MesDetalhe-BznYYjYJ.js",
  "/assets/Orcamentos-DHV_e53T.js",
  "/assets/PagarFatura-JNpheJjf.js",
  "/assets/Patrimony-CcrzKTXH.js",
  "/assets/Profile-Bo7ufxRw.js",
  "/assets/ReceitasFixas-DV-r5haN.js",
  "/assets/RelatorioImpressao-CRe_Ws1q.js",
  "/assets/Reports-BgbcMO0w.js",
  "/assets/Settings-CWYttlzH.js",
  "/assets/Vencimentos-gOtYIN6c.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/exportar-DMmjmqLy.js",
  "/assets/index-0QwY8KMf.css",
  "/assets/index-C8dqTClV.js",
  "/assets/index-CZKb0lu8.js",
  "/assets/index-pPjGXEo6.js",
  "/assets/log-out-Ce1yWrtn.js",
  "/assets/nuvem-BALmxnKG.js",
  "/assets/patrimonio-CQnD0ZNG.js",
  "/assets/trash-2-FK3rzrlO.js",
  "/assets/undo-2-BePXEaiK.js",
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
