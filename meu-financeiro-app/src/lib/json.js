// Leitura segura de JSON.
//
// Todo JSON que vem de fora (arquivo de backup, dados da nuvem gravados por outra pessoa da família,
// resposta da IA, o que está guardado no navegador) passa por aqui. As chaves "__proto__",
// "constructor" e "prototype" são descartadas: elas não fazem parte dos dados do app e são o caminho
// clássico para um arquivo malicioso mexer no comportamento do JavaScript (prototype pollution).

const CHAVES_PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

export function ehChaveProibida(chave) {
  return CHAVES_PROIBIDAS.has(chave);
}

// Igual a JSON.parse, mas sem as chaves perigosas (em qualquer nível)
export function lerJSON(texto) {
  return JSON.parse(texto, (chave, valor) => (ehChaveProibida(chave) ? undefined : valor));
}

// Só as chaves seguras de um objeto (para laços que copiam campo a campo)
export function chavesSeguras(objeto) {
  return Object.keys(objeto).filter((k) => !ehChaveProibida(k));
}
