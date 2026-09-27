// Configuração do build (npm run build).
// Além do app, gera dois arquivos em dist/:
//   sw.js         -> service worker: guarda o app no aparelho para abrir sem internet
//                    e faz o app perceber quando sai uma versão nova (a cada deploy ele muda)
//   version.json  -> número da versão (src/config/versao.js) e a marca deste build
import { defineConfig } from "vite";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const VERSAO = /VERSAO_DO_APP\s*=\s*"([^"]+)"/.exec(
  readFileSync(new URL("./src/config/versao.js", import.meta.url), "utf8")
)[1];

// o que NÃO fica guardado para uso sem internet
const FORA_DO_CACHE = [
  /^sw\.js$/,
  /^version\.json$/,
  /^_headers$/,
  /^_redirects$/,
  /^\.well-known\//, // verificação do app Android
  /^__\//, // login do Google dentro do app Android (sempre pela internet)
  /^apk\// // o instalador do app Android
];

function listarArquivos(pasta, base = pasta) {
  const lista = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = path.join(pasta, nome);
    if (statSync(caminho).isDirectory()) lista.push(...listarArquivos(caminho, base));
    else lista.push(path.relative(base, caminho).split(path.sep).join("/"));
  }
  return lista;
}

function serviceWorker() {
  let pasta = "";
  return {
    name: "meu-financeiro-service-worker",
    apply: "build",
    configResolved(config) {
      pasta = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      if (!existsSync(path.join(pasta, "index.html"))) return;
      const arquivos = listarArquivos(pasta)
        .filter((a) => !FORA_DO_CACHE.some((r) => r.test(a)))
        .sort();
      const marca = createHash("sha256");
      for (const a of arquivos) {
        marca.update(a);
        marca.update(createHash("sha256").update(readFileSync(path.join(pasta, a))).digest());
      }
      const build = marca.digest("hex").slice(0, 12);
      const urls = arquivos.map((a) => (a === "index.html" ? "/" : `/${a}`));
      const sw = readFileSync(new URL("./src/sw-modelo.js", import.meta.url), "utf8")
        .replace("__VERSAO__", VERSAO)
        .replace("__BUILD__", build)
        .replace("__ARQUIVOS__", JSON.stringify(urls, null, 2));
      writeFileSync(path.join(pasta, "sw.js"), sw);
      writeFileSync(path.join(pasta, "version.json"), JSON.stringify({ versao: VERSAO, build }, null, 2) + "\n");

      // Cabeçalhos de segurança (public/_headers): a política de conteúdo (CSP) só deixa rodar os
      // scripts do próprio site + o script de tema do index.html, identificado pelo hash dele.
      const cabecalhos = path.join(pasta, "_headers");
      if (existsSync(cabecalhos)) {
        const html = readFileSync(path.join(pasta, "index.html"), "utf8");
        const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
          (m) => `sha256-${createHash("sha256").update(m[1]).digest("base64")}`
        );
        writeFileSync(cabecalhos, readFileSync(cabecalhos, "utf8").replace("'__HASH_DO_SCRIPT__'", hashes.map((h) => `'${h}'`).join(" ")));
      }
    }
  };
}

export default defineConfig({
  plugins: [serviceWorker()]
});
