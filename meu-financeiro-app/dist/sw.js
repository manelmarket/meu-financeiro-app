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
const BUILD = "bd193940c9dd";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-D04ueL38.js",
  "/assets/Backup-DV0dS_7G.js",
  "/assets/Bancos-0Tq4_WLg.js",
  "/assets/Bills-Bklme06m.js",
  "/assets/CardDetails-B2FQKS8S.js",
  "/assets/Cards-DI5zd52g.js",
  "/assets/Categorias-Du2zdKYI.js",
  "/assets/Conquistas-D9IRfpll.js",
  "/assets/CupomModal-yUMlbCOG.js",
  "/assets/Emprestimos-BBESDmK7.js",
  "/assets/EscolherBanco-DxmxxiG_.js",
  "/assets/Familia-BYtx4l1G.js",
  "/assets/FutureEntries--6wGa7ZE.js",
  "/assets/Goals-DX4_B8WP.js",
  "/assets/History-BDZMDCZZ.js",
  "/assets/Importar-DRPyCe4A.js",
  "/assets/Investments-jsOfn1S1.js",
  "/assets/InvoiceCalendar-BsUiR3aA.js",
  "/assets/Jarvis-BACTtjI3.js",
  "/assets/Lembretes-C89pqdRn.js",
  "/assets/MesDetalhe-DZWvkZzP.js",
  "/assets/Orcamentos-Cy34JI7i.js",
  "/assets/PagarFatura-CtVVItlP.js",
  "/assets/Patrimony-Cs2shG6a.js",
  "/assets/Profile-BIrmg2kz.js",
  "/assets/ReceitasFixas-oS9MNDTp.js",
  "/assets/RelatorioImpressao-CIUYCW0i.js",
  "/assets/Reports-DbiSgC4x.js",
  "/assets/Settings-DWzNiy1C.js",
  "/assets/Vencimentos-ClCZo93g.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/download-B1LMm5fT.js",
  "/assets/exportar-BQxfGRPV.js",
  "/assets/index-B5UpxnTr.js",
  "/assets/index-C8dqTClV.js",
  "/assets/index-DCyvjJUI.css",
  "/assets/index-pPjGXEo6.js",
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2",
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2",
  "/assets/log-out-DNXD32u8.js",
  "/assets/nuvem-CT8WbUc8.js",
  "/assets/patrimonio-DWVwRhFO.js",
  "/assets/pencil-hsCvpKma.js",
  "/assets/share-2-C6E3_xMz.js",
  "/assets/trash-2-C86PzGvx.js",
  "/assets/undo-2-b-yNCA5k.js",
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
