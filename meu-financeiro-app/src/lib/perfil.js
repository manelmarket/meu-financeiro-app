// Perfil de cada conta (fica dentro dos dados da conta, então vai junto para a nuvem
// e aparece igual em todos os aparelhos em que a pessoa entrar).
//   usuario = { nome, apelido, telefone, nascimento }

import { dataValida } from "./formato.js";

export function primeiroNome(nome) {
  return String(nome || "").trim().split(/\s+/)[0] || "";
}

// Como chamar a pessoa: apelido > primeiro nome do perfil > primeiro nome da conta Google
export function nomeParaMostrar(perfil, contaGoogle) {
  return (perfil?.apelido || "").trim() || primeiroNome(perfil?.nome) || primeiroNome(contaGoogle?.nome) || "";
}

// (11) 91234-5678 / (11) 1234-5678 / +55 (11) 91234-5678
export function formatarTelefone(texto) {
  let d = String(texto || "").replace(/\D/g, "");
  let pais = "";
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) {
    pais = "+55 ";
    d = d.slice(2);
  }
  if (d.length === 11) return `${pais}(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${pais}(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return null;
}

// Confere e arruma os campos. Devolve { erro } ou { perfil }.
export function validarPerfil({ nome, apelido, telefone, nascimento }, hoje) {
  const n = String(nome || "").trim().replace(/\s+/g, " ");
  const a = String(apelido || "").trim().replace(/\s+/g, " ");
  if (!n) return { erro: "Informe o seu nome." };
  if (n.length > 80) return { erro: "O nome pode ter até 80 letras." };
  if (a.length > 30) return { erro: "O apelido pode ter até 30 letras." };

  let tel = "";
  if (String(telefone || "").trim()) {
    tel = formatarTelefone(telefone);
    if (!tel) return { erro: "Telefone inválido. Use DDD + número, ex.: (11) 91234-5678." };
  }

  const nasc = String(nascimento || "").trim();
  if (nasc && (!dataValida(nasc) || nasc < "1900-01-01" || nasc > hoje)) {
    return { erro: "Data de nascimento inválida." };
  }

  return { perfil: { nome: n, apelido: a, telefone: tel, nascimento: nasc } };
}
