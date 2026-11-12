// Service worker do Meu Financeiro.
// Este arquivo é só o MODELO: o build (vite.config.js) gera o dist/sw.js a partir dele,
// preenchendo a versão, a marca do build e a lista de arquivos do app.
//
// O que ele faz:
// - guarda o app neste aparelho: abre mesmo sem internet;
// - a cada deploy o sw.js muda; o navegador baixa a versão nova em segundo plano e o app
//   mostra "Nova versão disponível" (ou a pessoa usa "Verificar atualizações" no menu);
// - nunca guarda os dados: eles ficam no aparelho (localStorage/IndexedDB) e na nuvem.

const VERSAO = "1.2.0";
const BUILD = "f3f2740f3d45";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-BIpdNft1.js",
  "/assets/Backup-D-cpJLAf.js",
  "/assets/Bancos-kgNaFXWy.js",
  "/assets/Bills-F4WOVCM2.js",
  "/assets/CardDetails-DRHq8FY3.js",
  "/assets/Cards-rCH1TbGW.js",
  "/assets/Categorias-BAtcg-8t.js",
  "/assets/Conquistas-CA_ium_s.js",
  "/assets/CupomModal-DJhUrWcT.js",
  "/assets/Emprestimos-Dh3BQudZ.js",
  "/assets/EscolherBanco-DLmv42UX.js",
  "/assets/Familia-C_o3hSBf.js",
  "/assets/FutureEntries-BdTDnDBI.js",
  "/assets/Goals-B_DezGL3.js",
  "/assets/History-BxX6wB5V.js",
  "/assets/Importar-BhkkmmUf.js",
  "/assets/Investments-CMjPzWJv.js",
  "/assets/InvoiceCalendar-i7lNi8wg.js",
  "/assets/Jarvis-CEm5NzS-.js",
  "/assets/Lembretes-DnCkmQsT.js",
  "/assets/MesDetalhe-CMy327w4.js",
  "/assets/Orcamentos-BRUIlQZk.js",
  "/assets/PagarFatura-V2MpOr9p.js",
  "/assets/Patrimony-BZ_coXqx.js",
  "/assets/Profile-DqxlbVAl.js",
  "/assets/ReceitasFixas-D2D6_Dcr.js",
  "/assets/RelatorioImpressao-CYXs-Xjv.js",
  "/assets/Reports-Bx4iq2jf.js",
  "/assets/Settings-CoM-W55m.js",
  "/assets/Vazio-C6N960aT.js",
  "/assets/Vencimentos-BcRZWul6.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/download-BZmt7yWK.js",
  "/assets/exportar-bhTP2LFS.js",
  "/assets/index-Bl8aXrTi.js",
  "/assets/index-C8dqTClV.js",
  "/assets/index-pPjGXEo6.js",
  "/assets/index-wIV0omig.css",
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2",
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2",
  "/assets/log-out-njOv7m0G.js",
  "/assets/nuvem-5U5ZQmHZ.js",
  "/assets/patrimonio-DKa0nEnS.js",
  "/assets/pencil-DQJKcVnR.js",
  "/assets/share-2-DVxfvdmz.js",
  "/assets/trash-2-D09BJe4M.js",
  "/assets/undo-2-HU_ZzL_U.js",
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
