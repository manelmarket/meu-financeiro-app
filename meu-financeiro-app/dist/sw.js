// Service worker do Meu Financeiro.
// Este arquivo é só o MODELO: o build (vite.config.js) gera o dist/sw.js a partir dele,
// preenchendo a versão, a marca do build e a lista de arquivos do app.
//
// O que ele faz:
// - guarda o app neste aparelho: abre mesmo sem internet;
// - a cada deploy o sw.js muda; o navegador baixa a versão nova em segundo plano e o app
//   mostra "Nova versão disponível" (ou a pessoa usa "Verificar atualizações" no menu);
// - nunca guarda os dados: eles ficam no aparelho (localStorage/IndexedDB) e na nuvem.

const VERSAO = "1.2.1";
const BUILD = "e9dfdb41593d";
const CACHE = `meu-financeiro-${BUILD}`;
const ARQUIVOS = [
  "/assets/Assinaturas-xp4M-bRF.js",
  "/assets/Backup-DLMHCd3F.js",
  "/assets/Bancos-BZPPlwff.js",
  "/assets/Bills-3u3RNoYM.js",
  "/assets/CardDetails-Bsb62JkB.js",
  "/assets/Cards-Cm7p5AU3.js",
  "/assets/Categorias-C-y-jfsc.js",
  "/assets/Conquistas-DyWvG_Kl.js",
  "/assets/CupomModal-vGr7xHbM.js",
  "/assets/Emprestimos-7-a0H-Ai.js",
  "/assets/EscolherBanco-BPKKiQvv.js",
  "/assets/Familia-DeMnVHA4.js",
  "/assets/FutureEntries-CW5QzqfP.js",
  "/assets/Goals-DaCx2IYA.js",
  "/assets/History-DD_3lbdI.js",
  "/assets/Importar-BtlOmclM.js",
  "/assets/Investments-CZq0FNhE.js",
  "/assets/InvoiceCalendar-DuQTVSgF.js",
  "/assets/Jarvis-0cvJdAXF.js",
  "/assets/Lembretes-CnA8cXp5.js",
  "/assets/MesDetalhe-BqmRpw0-.js",
  "/assets/Orcamentos-YRF-brLi.js",
  "/assets/PagarFatura-RAQxq3Rm.js",
  "/assets/Patrimony-zZBJHP0f.js",
  "/assets/Profile-5Anb0JaC.js",
  "/assets/ReceitasFixas-eKePBV-D.js",
  "/assets/RelatorioImpressao-Dhrhh9B6.js",
  "/assets/Reports-czHSvpEu.js",
  "/assets/Settings-CYzjHaSt.js",
  "/assets/Vazio-D9dIdUif.js",
  "/assets/Vencimentos-DlEEj8th.js",
  "/assets/browser-mPP1zQg4.js",
  "/assets/download-DQR4OPyz.js",
  "/assets/exportar-BCWqwEZH.js",
  "/assets/index-C8dqTClV.js",
  "/assets/index-CCDjWZ-E.js",
  "/assets/index-CFJrRQyd.css",
  "/assets/index-pPjGXEo6.js",
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2",
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2",
  "/assets/log-out-1cWvlPhS.js",
  "/assets/nuvem-DuxCwDBN.js",
  "/assets/patrimonio-Rwey_GWt.js",
  "/assets/pencil-Bnxv3KT9.js",
  "/assets/share-2-DZB30hxh.js",
  "/assets/trash-2-BDkUWXNz.js",
  "/assets/undo-2-BzUTTulw.js",
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
