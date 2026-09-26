// Regras da sincronização com a nuvem (sem tela e sem Firebase aqui dentro:
// quem fala com a nuvem é o "adaptador" recebido, ver nuvem.js).
//
// Cada envio para a nuvem ganha um número de versão. Este aparelho guarda a versão
// e os dados ("base") da última sincronização. Assim ele sabe:
// - se só ele mudou  -> envia;
// - se só a nuvem mudou -> recebe;
// - se os dois mudaram -> junta (mesclarDados) e envia o resultado.
//
// O adaptador precisa ter:
//   lerInfo() -> { versao, fotos } ou null (nuvem vazia)
//   baixarDados(info) -> { versao, dados }
//   enviarDados(dados, versaoEsperada) -> nova versão
//       (se a nuvem não estiver mais na versão esperada, lança erro com .conflito = true)
//   enviarFoto(id, blob) -> true/false
//   baixarFoto(id) -> Blob ou null
//   apagarFotos(ids, versaoEsperada) -> true/false

import { iguais, mesclarDados } from "./mesclar.js";
import { juntarDados, juntarPerfil } from "./juntar.js";
import { idsDasFotos } from "./backup.js";

const TENTATIVAS = 3;

// semDadosProprios(dados): true se não há nada da pessoa (só demonstração intacta ou nenhum registro)
// novaConta(local): dados com que uma conta nova começa (se não vier, usa os deste aparelho)
async function umaVez({ nuvem, local, base, versao, semDadosProprios, novaConta }) {
  const info = await nuvem.lerInfo();

  // nuvem vazia: a primeira cópia sai deste aparelho
  if (!info) {
    const inicio = novaConta ? novaConta(local) : local;
    const nova = await nuvem.enviarDados(inicio, 0);
    return { acao: "enviou", dados: inicio, base: inicio, versao: nova, fotos: [] };
  }

  // primeira sincronização deste aparelho, com a nuvem já tendo dados
  if (base == null || versao == null) {
    const remoto = await nuvem.baixarDados(info);
    if (iguais(local, remoto.dados) || semDadosProprios(local)) {
      return { acao: "recebeu", dados: remoto.dados, base: remoto.dados, versao: remoto.versao, fotos: info.fotos };
    }
    if (semDadosProprios(remoto.dados)) {
      // na nuvem não havia registros da pessoa: ficam os deste aparelho (o perfil da nuvem é mantido)
      const dados = { ...local, usuario: juntarPerfil(local.usuario, remoto.dados.usuario) };
      const nova = await nuvem.enviarDados(dados, remoto.versao);
      return { acao: "enviou", dados, base: dados, versao: nova, fotos: info.fotos };
    }
    // os dois lados têm dados próprios: a pessoa escolhe o que fazer
    return { acao: "escolher", remoto: remoto.dados, versao: remoto.versao, fotos: info.fotos };
  }

  if (info.versao === versao) {
    if (iguais(local, base)) return { acao: "nada", dados: local, base, versao, fotos: info.fotos };
    const nova = await nuvem.enviarDados(local, versao);
    return { acao: "enviou", dados: local, base: local, versao: nova, fotos: info.fotos };
  }

  // a nuvem mudou (outro aparelho enviou)
  const remoto = await nuvem.baixarDados(info);
  if (iguais(local, base)) {
    return { acao: "recebeu", dados: remoto.dados, base: remoto.dados, versao: remoto.versao, fotos: info.fotos };
  }
  const junto = mesclarDados(base, local, remoto.dados);
  if (iguais(junto, remoto.dados)) {
    return { acao: "recebeu", dados: remoto.dados, base: remoto.dados, versao: remoto.versao, fotos: info.fotos };
  }
  const nova = await nuvem.enviarDados(junto, remoto.versao);
  return { acao: "juntou", dados: junto, base: junto, versao: nova, fotos: info.fotos };
}

export async function sincronizar(opcoes) {
  let ultimo = null;
  for (let i = 0; i < TENTATIVAS; i += 1) {
    try {
      return await umaVez(opcoes);
    } catch (erro) {
      if (!erro?.conflito) throw erro;
      ultimo = erro; // outro aparelho enviou no meio do caminho: busca de novo e junta
    }
  }
  throw ultimo;
}

// Primeira vez com dados dos dois lados: "juntar", "nuvem" ou "aparelho".
export async function resolverPrimeiraVez({ nuvem, local, remoto, versao, escolha }) {
  if (escolha === "nuvem") return { acao: "recebeu", dados: remoto, base: remoto, versao };
  const dados = escolha === "juntar" ? juntarDados(local, remoto) : local;
  const nova = await nuvem.enviarDados(dados, versao);
  return { acao: "enviou", dados, base: dados, versao: nova };
}

// Fotos dos cupons: envia as que só estão aqui, baixa as que só estão na nuvem
// e apaga da nuvem as que nenhum registro usa mais.
export async function sincronizarFotos({
  nuvem,
  dados,
  versao,
  fotosNaNuvem,
  fotosAqui,
  lerFotoLocal,
  salvarFotoLocal,
  limiteDeDownloads = 30
}) {
  const usadas = idsDasFotos(dados);
  const naNuvem = new Set(fotosNaNuvem || []);
  const aqui = new Set(fotosAqui || []);
  const r = { enviadas: 0, baixadas: 0, apagadas: 0 };

  for (const id of usadas) {
    if (!aqui.has(id) || naNuvem.has(id)) continue;
    const blob = await lerFotoLocal(id);
    if (blob && (await nuvem.enviarFoto(id, blob))) r.enviadas += 1;
  }

  for (const id of usadas) {
    if (aqui.has(id) || !naNuvem.has(id) || r.baixadas >= limiteDeDownloads) continue;
    const blob = await nuvem.baixarFoto(id);
    if (blob) {
      await salvarFotoLocal(id, blob);
      r.baixadas += 1;
    }
  }

  const sobrando = [...naNuvem].filter((id) => !usadas.has(id));
  if (sobrando.length && (await nuvem.apagarFotos(sobrando, versao))) r.apagadas = sobrando.length;

  return r;
}
