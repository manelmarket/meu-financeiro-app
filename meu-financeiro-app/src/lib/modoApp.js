// O app Android (APK) abre o endereço do app com "?app=android" (a partir da versão 2 do APK,
// também "&apk=2": o número da versão do APK, para o app saber se o celular já tem os lembretes).
// Dentro do app Android, o login do Google vai para a página do Google e volta (redirecionamento),
// em vez de abrir uma janela por cima (pop-up), que nem sempre volta para o app.

const CHAVE = "meu_financeiro_app";
const CHAVE_VERSAO = "meu_financeiro_apk";

export function marcarModoApp() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const pelaUrl = url.searchParams.get("app") === "android";
    const peloAndroid = String(document.referrer || "").startsWith("android-app://");
    if (pelaUrl || peloAndroid) sessionStorage.setItem(CHAVE, "android");
    const versao = parseInt(url.searchParams.get("apk") || "", 10);
    if (pelaUrl && versao > 0) sessionStorage.setItem(CHAVE_VERSAO, String(versao));
    if (pelaUrl || url.searchParams.has("apk")) {
      url.searchParams.delete("app");
      url.searchParams.delete("apk");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
  } catch {
    // sem sessionStorage: segue como navegador comum
  }
}

// Versão do APK que abriu o app (0 = navegador comum ou APK da versão 1, que não informava)
export function versaoDoApk() {
  try {
    if (sessionStorage.getItem(CHAVE) !== "android") return 0;
    return parseInt(sessionStorage.getItem(CHAVE_VERSAO) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function ehAppAndroid() {
  try {
    return sessionStorage.getItem(CHAVE) === "android";
  } catch {
    return false;
  }
}

// Login por redirecionamento: anota que a pessoa foi para a página do Google,
// para o app terminar o login quando ela voltar.
const CHAVE_LOGIN = "meu_financeiro_login_google";

export function marcarIdaAoLogin() {
  try {
    sessionStorage.setItem(CHAVE_LOGIN, String(Date.now()));
  } catch {
    // nada a fazer
  }
}

// true (uma vez só) se a página abriu na volta do login do Google (até 10 min depois)
export function voltouDoLogin() {
  try {
    const quando = Number(sessionStorage.getItem(CHAVE_LOGIN) || 0);
    sessionStorage.removeItem(CHAVE_LOGIN);
    return quando > 0 && Date.now() - quando < 10 * 60 * 1000;
  } catch {
    return false;
  }
}
