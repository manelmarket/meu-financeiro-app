// Liga o app à nuvem: login com Google, envio/recebimento automático dos dados e das fotos.
// O Firebase (nuvem.js) só é carregado quando a pessoa usa a nuvem.

import { useEffect, useRef, useState } from "react";
import { NUVEM_CONFIGURADA } from "../config/firebase.js";
import { guardarCopia, idsDasFotos } from "./backup.js";
import { iguais, mesclarDados } from "./mesclar.js";
import { resolverPrimeiraVez, sincronizar, sincronizarFotos } from "./sincronia.js";
import { criarVazio, semDadosProprios } from "../storage/storage.js";
import { comPerfilNaFamilia, dadosSemFamilia, juntarNaFamilia, novoCodigo, perfilPrincipal } from "./familia.js";
import { ehAppAndroid, marcarIdaAoLogin, voltouDoLogin } from "./modoApp.js";
import { lerCupom, listarCupons, salvarCupom } from "../storage/cupons.js";
import {
  apagarBase,
  apagarEstadoNuvem,
  lerBase,
  lerEstadoNuvem,
  lerUltimaConta,
  salvarBase,
  salvarEstadoNuvem,
  salvarUltimaConta
} from "../storage/nuvemLocal.js";

const carregarNuvem = () => import("./nuvem.js");

const ESPERA_PARA_ENVIAR = 2500;
const INTERVALO_DE_CONFERENCIA = 60 * 1000;
const ESPERA_SEM_CONEXAO = 30 * 1000;
const ESPERA_DEPOIS_DE_ERRO = 3 * 60 * 1000;
// de quanto em quanto tempo confere se a conta entrou/saiu de uma família (em outro aparelho)
const INTERVALO_DA_FAMILIA = 60 * 1000;

// Espaço dos dados: a família (quando a conta está numa) ou a própria conta
function espacoDe(meta) {
  return meta?.espaco?.tipo === "familia" && typeof meta.espaco.id === "string" && meta.espaco.id ? meta.espaco : null;
}

// A "base" (dados da última sincronização) é guardada separada para cada espaço
function chaveDaBase(meta) {
  const espaco = espacoDe(meta);
  return espaco ? `${meta.uid}@familia:${espaco.id}` : meta.uid;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function erroComTexto(texto, code = "familia") {
  const erro = new Error(texto);
  erro.code = code;
  erro.familia = true;
  return erro;
}

const SEM_REGRAS_DA_FAMILIA =
  "O modo família ainda não foi ligado no Firebase: publique as regras novas do Firestore (o passo a passo está no LEIA-ME da versão 9).";

// Para a janela da foto do cupom buscar na nuvem uma foto que ainda não chegou a este aparelho.
let buscarFoto = null;

export async function buscarFotoNaNuvem(id) {
  if (!buscarFoto) return null;
  try {
    return await buscarFoto(id);
  } catch {
    return null;
  }
}

function mensagemDeErro(modulo, erro) {
  if (modulo) return modulo.mensagemDaNuvem(erro);
  // o arquivo da nuvem não carregou
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { tipo: "offline", texto: "Sem conexão com a nuvem. Tento de novo sozinho." };
  }
  // com internet: normalmente o app foi atualizado e esta página ainda é a versão antiga
  return {
    tipo: "erro",
    texto: "Não consegui carregar a parte da nuvem do app. Recarregue a página (no computador: Ctrl+Shift+R)."
  };
}

export default function useNuvem(data, setData) {
  const metaRef = useRef(undefined);
  if (metaRef.current === undefined) metaRef.current = NUVEM_CONFIGURADA ? lerEstadoNuvem() : null;

  const [estado, setEstado] = useState(() => {
    const meta = metaRef.current;
    return {
      status: !NUVEM_CONFIGURADA ? "sem-config" : meta ? "iniciando" : "desligada",
      usuario: meta ? { uid: meta.uid, email: meta.email || "", nome: meta.nome || "", foto: meta.foto || "" } : null,
      sincronizadoEm: meta?.sincronizadoEm || null,
      mensagem: "",
      escolha: null,
      familia: espacoDe(meta) ? { id: espacoDe(meta).id } : null,
      aviso: ""
    };
  });

  const dadosRef = useRef(data);
  dadosRef.current = data;

  const baseRef = useRef(undefined); // undefined = ainda não lida do aparelho
  const logadoRef = useRef(false);
  const rodandoRef = useRef(false);
  const deNovoRef = useRef(false);
  const escolhaRef = useRef(null);
  const moduloRef = useRef(null);
  const adaptadorRef = useRef(null);
  const timerRef = useRef(null);
  const iniciouRef = useRef(false);
  // A versão/base só são gravadas no aparelho DEPOIS que os dados foram salvos aqui
  // (se o armazenamento estiver cheio, a próxima abertura recomeça da última base segura).
  const salvoOkRef = useRef(true);
  const pendenteRef = useRef(null); // { uid, chave, base, versao, sincronizadoEm }
  const familiaConferidaRef = useRef(0); // quando conferiu a família da conta pela última vez
  // de quem são os dados deste aparelho (uid da conta); null = de antes do login ou demonstração
  const donoRef = useRef(undefined);
  if (donoRef.current === undefined) {
    donoRef.current = metaRef.current?.uid || (NUVEM_CONFIGURADA ? lerUltimaConta()?.uid : null) || null;
  }

  function atualizar(parcial) {
    setEstado((e) => ({ ...e, ...parcial }));
  }

  function agendar(ms) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      rodar();
    }, ms);
  }

  async function gravarPendente() {
    const p = pendenteRef.current;
    if (!p || metaRef.current?.uid !== p.uid || chaveDaBase(metaRef.current) !== p.chave) return;
    pendenteRef.current = null;
    salvarEstadoNuvem({ ...metaRef.current, versao: p.versao, sincronizadoEm: p.sincronizadoEm });
    await salvarBase(p.chave, p.base);
  }

  // Chamado pelo App depois de cada gravação dos dados neste aparelho
  function aoSalvar(ok) {
    salvoOkRef.current = ok;
    if (ok && pendenteRef.current) gravarPendente();
  }

  async function preparar(uid) {
    const modulo = await carregarNuvem();
    moduloRef.current = modulo;
    const usuario = await modulo.usuarioAtual();
    if (!usuario || usuario.uid !== uid) {
      const erro = new Error("sessão encerrada");
      erro.code = "unauthenticated";
      throw erro;
    }
    const chave = chaveDaBase(metaRef.current);
    if (!adaptadorRef.current || adaptadorRef.current.chave !== chave) {
      usarAdaptador(chave, modulo.criarAdaptador(espacoDe(metaRef.current) || uid));
    }
    return adaptadorRef.current.nuvem;
  }

  function usarAdaptador(chave, nuvem) {
    adaptadorRef.current = { chave, nuvem };
    buscarFoto = async (id) => {
      const blob = await nuvem.baixarFoto(id);
      if (blob) await salvarCupom(id, blob).catch(() => {});
      return blob;
    };
  }

  // Coloca na tela os dados que vieram da nuvem. Se a pessoa mexeu em algo enquanto
  // a sincronização acontecia, a mudança dela é juntada por cima.
  function aplicar(anteriores, novos) {
    setData((atual) => (atual === anteriores ? novos : mesclarDados(anteriores, atual, novos)));
  }

  // Marca até onde este aparelho está sincronizado. Se os dados mudaram agora (aplicou),
  // espera o App salvar esses dados antes de gravar a marca no aparelho.
  async function confirmarBase(uid, base, versao, aplicou) {
    const sincronizadoEm = new Date().toISOString();
    baseRef.current = base;
    donoRef.current = uid; // os dados deste aparelho agora são desta conta
    metaRef.current = { ...metaRef.current, versao, sincronizadoEm };
    pendenteRef.current = { uid, chave: chaveDaBase(metaRef.current), base, versao, sincronizadoEm };
    if (!aplicou && salvoOkRef.current) await gravarPendente();
  }

  async function sincronizarAsFotos(nuvem, dados, versao, fotosNaNuvem) {
    try {
      const aqui = await listarCupons().catch(() => []);
      await sincronizarFotos({
        nuvem,
        dados,
        versao,
        fotosNaNuvem,
        fotosAqui: (aqui || []).map(String),
        lerFotoLocal: (id) => lerCupom(id).catch(() => null),
        salvarFotoLocal: (id, blob) => salvarCupom(id, blob)
      });
    } catch (erro) {
      // as fotos tentam de novo na próxima sincronização; os dados já estão salvos
      console.warn("Fotos dos cupons não sincronizadas agora", erro);
    }
  }

  function tratarErro(erro) {
    const m = mensagemDeErro(moduloRef.current, erro);
    if (m.tipo === "offline") {
      atualizar({ status: "offline", mensagem: m.texto });
      agendar(ESPERA_SEM_CONEXAO);
    } else if (m.tipo === "sessao") {
      logadoRef.current = false;
      atualizar({ status: "sessao", mensagem: m.texto });
    } else {
      atualizar({ status: "erro", mensagem: m.texto });
      agendar(ESPERA_DEPOIS_DE_ERRO);
    }
  }

  async function rodar() {
    const meta = metaRef.current;
    if (!meta || !logadoRef.current || escolhaRef.current) return;
    if (rodandoRef.current) {
      deNovoRef.current = true;
      return;
    }
    rodandoRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = null;

    const uid = meta.uid;
    const chave = chaveDaBase(meta);
    const continuaIgual = () =>
      logadoRef.current && metaRef.current?.uid === uid && chaveDaBase(metaRef.current) === chave;
    const avisoDeDemora = setTimeout(() => atualizar({ status: "sincronizando" }), 500);

    try {
      const nuvem = await preparar(uid);
      if (!continuaIgual()) return;
      if (baseRef.current === undefined) baseRef.current = await lerBase(chave);
      if (!continuaIgual()) return;

      // a conta entrou numa família (ou saiu dela) por outro aparelho? Se há algo deste aparelho esperando
      // para subir, sobe primeiro (no espaço de agora) e confere depois, para nada se perder na troca.
      let conferir = Date.now() - familiaConferidaRef.current > INTERVALO_DA_FAMILIA;
      if (conferir && !temPendencias()) {
        conferir = false;
        if (await conferirFamilia(uid, continuaIgual, avisoDeDemora)) return;
      }

      const antes = dadosRef.current;
      const r = await sincronizar({
        nuvem,
        local: antes,
        base: baseRef.current,
        versao: metaRef.current.versao ?? null,
        semDadosProprios,
        // conta nova sempre começa vazia (nada deste aparelho vai para ela)
        novaConta: () => criarVazio()
      });
      if (!continuaIgual()) return;

      // os dados que estavam neste aparelho não entraram na conta: ficam numa cópia de segurança
      if (r.descartouLocal) {
        guardarCopia(
          antes,
          `que estavam neste aparelho antes de entrar na conta ${metaRef.current.email || ""}`.trim(),
          new Date(),
          donoRef.current
        );
      }

      if (r.acao === "escolher") {
        clearTimeout(avisoDeDemora);
        escolhaRef.current = r;
        atualizar({ status: "escolher", mensagem: "", escolha: { remoto: r.remoto } });
        return;
      }

      const aplicou = r.dados !== antes;
      if (aplicou) aplicar(antes, r.dados);
      await confirmarBase(uid, r.base, r.versao, aplicou);
      // dados em dia: as fotos continuam em segundo plano sem mudar o aviso na tela
      clearTimeout(avisoDeDemora);
      atualizar({ status: "ok", mensagem: "", sincronizadoEm: metaRef.current.sincronizadoEm });
      if (conferir && (await conferirFamilia(uid, continuaIgual, avisoDeDemora))) return;
      await sincronizarAsFotos(nuvem, r.dados, r.versao, r.fotos);
    } catch (erro) {
      clearTimeout(avisoDeDemora);
      let falha = erro;
      // sem acesso à família: a pessoa foi tirada dela ou a família foi encerrada
      if (continuaIgual() && espacoDe(metaRef.current) && String(erro?.code) === "permission-denied") {
        try {
          if (await saiuDaFamilia(uid)) return;
        } catch (outro) {
          falha = outro;
        }
      }
      if (continuaIgual()) tratarErro(falha);
    } finally {
      clearTimeout(avisoDeDemora);
      rodandoRef.current = false;
      if (deNovoRef.current) {
        deNovoRef.current = false;
        agendar(1500);
      }
    }
  }

  // Há mudanças deste aparelho que ainda não foram para a nuvem?
  function temPendencias() {
    const base = baseRef.current;
    return base ? !iguais(dadosRef.current, base) : !semDadosProprios(dadosRef.current);
  }

  // A conta ainda está na família? (sem acesso = não está)
  async function aindaNaFamilia(fid, uid) {
    try {
      const f = await moduloRef.current.lerFamilia(fid);
      return Boolean(f && f.membros.some((m) => m.uid === uid));
    } catch (erro) {
      if (String(erro?.code) === "permission-denied") return false;
      throw erro;
    }
  }

  // Confere se a conta entrou numa família (ou saiu dela) por outro aparelho e troca os dados deste
  // aparelho. Devolve true quando a sincronização desta vez deve parar (trocou de espaço).
  async function conferirFamilia(uid, continuaIgual, avisoDeDemora) {
    const modulo = moduloRef.current;
    const fid = await modulo.lerFamiliaDaConta(uid);
    familiaConferidaRef.current = Date.now();
    if (!continuaIgual()) return true;
    const atual = espacoDe(metaRef.current)?.id || null;
    if (fid === atual) return false;

    if (!fid && atual && (await aindaNaFamilia(atual, uid))) {
      // ainda está na família (a marca da conta se perdeu): marca de novo e segue
      await modulo.marcarFamiliaDaConta(uid, atual);
      return false;
    }
    clearTimeout(avisoDeDemora);
    if (fid) {
      try {
        await trocarDeEspaco(uid, { tipo: "familia", id: fid }, { aviso: "Esta conta agora usa os dados da família." });
      } catch (erro) {
        if (String(erro?.code) !== "permission-denied" || (await aindaNaFamilia(fid, uid))) throw erro;
        // a conta apontava para uma família da qual não faz mais parte (foi tirada, ou a família acabou,
        // enquanto nenhum aparelho dela estava na família): limpa a marca e segue com os dados da conta
        await modulo.marcarFamiliaDaConta(uid, null);
        if (!atual) {
          atualizar({ aviso: "Você não faz mais parte da família (ela foi encerrada ou você foi tirado dela)." });
          return false;
        }
        await trocarDeEspaco(uid, null, {
          aviso: "Você não faz mais parte da família (ela foi encerrada ou você foi tirado dela). Voltaram os seus dados.",
          copiaDaFamilia: true
        });
      }
    } else {
      await trocarDeEspaco(uid, null, { aviso: "Esta conta saiu da família: voltaram os seus dados." });
    }
    deNovoRef.current = true;
    return true;
  }

  // Troca os dados deste aparelho para outro espaço (família <-> conta).
  // O que foi mudado aqui e ainda não tinha ido para a nuvem (no espaço de antes) vai junto para o novo espaço;
  // se não der para saber o que mudou (nunca sincronizou aqui), fica numa cópia de segurança.
  // copiaDaFamilia: guarda também uma cópia dos dados da família que estavam no aparelho (quem foi tirado dela).
  // jaEnviado = { dados, versao, fotos }: a própria ação (criar/entrar/encerrar) já gravou os dados na nuvem.
  async function trocarDeEspaco(uid, novo, { aviso = "", jaEnviado = null, copiaDaFamilia = false } = {}) {
    const modulo = moduloRef.current;
    const antes = dadosRef.current;
    const baseAntiga =
      baseRef.current !== undefined ? baseRef.current : await lerBase(chaveDaBase(metaRef.current)).catch(() => null);
    const pendentes = baseAntiga ? !iguais(antes, baseAntiga) : !semDadosProprios(antes);
    const novoMeta = { ...metaRef.current, espaco: novo || null, versao: null };
    const nuvem = modulo.criarAdaptador(novo || uid);

    let dados;
    let versao;
    let fotos = [];
    if (jaEnviado) {
      ({ dados, versao } = jaEnviado);
      fotos = jaEnviado.fotos || [];
    } else {
      const info = await nuvem.lerInfo();
      if (!info && novo) throw erroComTexto("A família ainda não tem dados. Tente de novo em instantes.");
      if (!info) {
        // conta sem dados pessoais na nuvem: começa vazia, só com o perfil
        dados = { ...criarVazio(), usuario: { nome: "", ...perfilPrincipal(dadosSemFamilia(antes, uid).usuario) } };
        versao = await nuvem.enviarDados(dados, 0);
      } else {
        fotos = info.fotos;
        const remoto = await nuvem.baixarDados(info);
        const junto = pendentes && baseAntiga ? mesclarDados(baseAntiga, antes, remoto.dados) : remoto.dados;
        if (iguais(junto, remoto.dados)) {
          dados = remoto.dados;
          versao = remoto.versao;
        } else {
          dados = junto;
          versao = await nuvem.enviarDados(junto, remoto.versao);
        }
      }
    }

    // cópias de segurança do que estava neste aparelho
    if (!semDadosProprios(antes)) {
      if (copiaDaFamilia) guardarCopia(antes, "da família (antes de sair dela)", new Date(), uid);
      else if (!jaEnviado && pendentes && !baseAntiga) {
        guardarCopia(antes, "que estavam neste aparelho antes de trocar de dados (família/conta)", new Date(), donoRef.current);
      }
    }

    metaRef.current = novoMeta;
    salvarEstadoNuvem(novoMeta);
    usarAdaptador(chaveDaBase(novoMeta), nuvem);
    baseRef.current = null;
    pendenteRef.current = null;
    const aplicou = dados !== antes;
    if (aplicou) aplicar(antes, dados);
    await confirmarBase(uid, dados, versao, aplicou);
    atualizar({
      status: "ok",
      mensagem: "",
      aviso,
      familia: novo ? { id: novo.id } : null,
      sincronizadoEm: metaRef.current.sincronizadoEm
    });
    await sincronizarAsFotos(nuvem, dados, versao, fotos);
  }

  // Sem acesso à família: confirma que a conta não faz mais parte dela e volta para os dados pessoais
  // (ou vai para a outra família, se a conta entrou em outra)
  async function saiuDaFamilia(uid) {
    const fid = espacoDe(metaRef.current)?.id;
    if (!fid) return false;
    if (await aindaNaFamilia(fid, uid)) return false;
    const ponteiro = await moduloRef.current.lerFamiliaDaConta(uid);
    if (ponteiro === fid) await moduloRef.current.marcarFamiliaDaConta(uid, null);
    familiaConferidaRef.current = Date.now();
    if (ponteiro && ponteiro !== fid) {
      await trocarDeEspaco(uid, { tipo: "familia", id: ponteiro }, { aviso: "Esta conta agora usa os dados da família.", copiaDaFamilia: true });
      return true;
    }
    await trocarDeEspaco(uid, null, {
      aviso: "Você não faz mais parte da família (ela foi encerrada ou você foi tirado dela). Voltaram os seus dados; os da família ficaram numa cópia de segurança em Backup e nuvem.",
      copiaDaFamilia: true
    });
    return true;
  }

  // Começa a sincronizar com a conta que acabou de entrar
  async function comecarCom(usuario) {
    const anterior = metaRef.current;
    const contaNova = !anterior || anterior.uid !== usuario.uid;

    if (contaNova) {
      // De quem são os dados deste aparelho? (conta conectada antes, ou a última que saiu)
      const dono = anterior || lerUltimaConta();
      if (dono && dono.uid !== usuario.uid) {
        // Dados de OUTRA conta: nunca passam para esta. Se ainda havia algo que não tinha ido
        // para a nuvem, fica numa cópia de segurança que só a conta dona vê.
        const atuais = dadosRef.current;
        if (!semDadosProprios(atuais)) {
          let tudoEnviado = Boolean(dono.tudoEnviado);
          if (anterior) {
            const base = baseRef.current !== undefined ? baseRef.current : await lerBase(chaveDaBase(anterior)).catch(() => null);
            tudoEnviado = Boolean(base && iguais(atuais, base));
          }
          if (!tudoEnviado) guardarCopia(atuais, `da conta ${dono.email || "anterior"}`, new Date(), dono.uid);
        }
        const vazio = criarVazio();
        dadosRef.current = vazio;
        setData(vazio);
        donoRef.current = null;
      } else {
        // dados desta mesma conta (entrou de novo) ou de antes do login neste aparelho
        donoRef.current = dono ? dono.uid : null;
      }
      metaRef.current = {
        uid: usuario.uid,
        email: usuario.email,
        nome: usuario.nome,
        foto: usuario.foto || "",
        versao: null,
        sincronizadoEm: null,
        // entrou de novo na mesma conta que estava usando os dados da família: continua na família
        ...(dono && dono.uid === usuario.uid && espacoDe(dono) ? { espaco: espacoDe(dono) } : {})
      };
      baseRef.current = null;
      pendenteRef.current = null;
      await apagarBase();
    } else {
      metaRef.current = { ...anterior, email: usuario.email, nome: usuario.nome, foto: usuario.foto || "" };
    }
    salvarEstadoNuvem(metaRef.current);
    escolhaRef.current = null;
    logadoRef.current = true;
    familiaConferidaRef.current = 0;
    atualizar({
      usuario,
      status: "sincronizando",
      mensagem: "",
      escolha: null,
      familia: espacoDe(metaRef.current) ? { id: espacoDe(metaRef.current).id } : null,
      sincronizadoEm: metaRef.current.sincronizadoEm
    });
    await rodar();
  }

  // ---------- família ----------

  // Faz a ação com a sincronização parada (depois de enviar o que estava pendente)
  async function comSincroniaParada(acao) {
    const meta = metaRef.current;
    if (!meta || !logadoRef.current) throw erroComTexto("Entre na sua conta Google primeiro (Backup e nuvem).");
    for (let i = 0; i < 200 && rodandoRef.current; i += 1) await esperar(100);
    await rodar(); // envia o que ainda não foi para a nuvem
    for (let i = 0; i < 200 && rodandoRef.current; i += 1) await esperar(100);
    if (!metaRef.current || !logadoRef.current) throw erroComTexto("Entre na sua conta Google primeiro (Backup e nuvem).");
    rodandoRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    try {
      const uid = metaRef.current.uid;
      await preparar(uid);
      return await acao(uid, moduloRef.current);
    } catch (erro) {
      if (String(erro?.code) === "permission-denied") throw erroComTexto(SEM_REGRAS_DA_FAMILIA, "permission-denied");
      throw erro;
    } finally {
      rodandoRef.current = false;
      if (deNovoRef.current) {
        deNovoRef.current = false;
        agendar(1500);
      }
    }
  }

  function contaAtual(uid) {
    const m = metaRef.current || {};
    return { uid, nome: m.nome || "", email: m.email || "" };
  }

  function meuPerfil(uid) {
    const p = perfilPrincipal(dadosSemFamilia(dadosRef.current, uid).usuario);
    return p.nome ? p : { ...p, nome: metaRef.current?.nome || "" };
  }

  // Cria a família com os dados deste aparelho (quem cria vira a dona/o dono)
  function criarFamilia(nome) {
    return comSincroniaParada(async (uid, modulo) => {
      if (espacoDe(metaRef.current)) throw erroComTexto("Esta conta já está numa família.");
      const fid = await modulo.criarFamilia(contaAtual(uid), nome);
      try {
        const nuvem = modulo.criarAdaptador({ tipo: "familia", id: fid });
        const dados = comPerfilNaFamilia(dadosRef.current, uid, meuPerfil(uid));
        const versao = await nuvem.enviarDados(dados, 0);
        await modulo.marcarFamiliaDaConta(uid, fid);
        familiaConferidaRef.current = Date.now();
        await trocarDeEspaco(uid, { tipo: "familia", id: fid }, { jaEnviado: { dados, versao }, aviso: "" });
        return fid;
      } catch (erro) {
        await modulo.apagarFamilia(fid).catch(() => {});
        throw erro;
      }
    });
  }

  // Código para convidar alguém (só a dona/o dono)
  function criarConvite() {
    return comSincroniaParada(async (uid, modulo) => {
      const fid = espacoDe(metaRef.current)?.id;
      if (!fid) throw erroComTexto("Esta conta não está numa família.");
      return modulo.criarConvite(fid, uid, novoCodigo());
    });
  }

  // Entra na família do código. levarMeusDados: junta os registros desta conta com os da família.
  function entrarNaFamilia(codigo, levarMeusDados) {
    return comSincroniaParada(async (uid, modulo) => {
      if (espacoDe(metaRef.current)) throw erroComTexto("Esta conta já está numa família. Saia dela antes de entrar em outra.");
      const fid = await modulo.entrarComConvite(codigo, contaAtual(uid));
      const espaco = { tipo: "familia", id: fid };
      const nuvem = modulo.criarAdaptador(espaco);
      let pronto = null;
      for (let tentativa = 0; tentativa < 3 && !pronto; tentativa += 1) {
        const info = await nuvem.lerInfo();
        if (!info) throw erroComTexto("A família ainda não tem dados. Tente de novo em instantes.");
        const remoto = await nuvem.baixarDados(info);
        const dados = levarMeusDados
          ? juntarNaFamilia(dadosRef.current, remoto.dados, uid, meuPerfil(uid))
          : comPerfilNaFamilia(remoto.dados, uid, meuPerfil(uid));
        try {
          const versao = iguais(dados, remoto.dados) ? remoto.versao : await nuvem.enviarDados(dados, remoto.versao);
          pronto = { dados, versao, fotos: info.fotos };
        } catch (erro) {
          if (!erro?.conflito) throw erro;
        }
      }
      if (!pronto) throw erroComTexto("A família mudou várias vezes seguidas. Tente de novo.");
      await modulo.marcarFamiliaDaConta(uid, fid);
      familiaConferidaRef.current = Date.now();
      await trocarDeEspaco(uid, espaco, { jaEnviado: pronto, aviso: "" });
      return fid;
    });
  }

  // Sai da família: voltam os dados pessoais desta conta
  function sairDaFamilia() {
    return comSincroniaParada(async (uid, modulo) => {
      const fid = espacoDe(metaRef.current)?.id;
      if (!fid) return;
      await modulo.tirarDaFamilia(fid, uid);
      await modulo.marcarFamiliaDaConta(uid, null);
      familiaConferidaRef.current = Date.now();
      await trocarDeEspaco(uid, null, { aviso: "Você saiu da família. Voltaram os seus dados pessoais." });
    });
  }

  // Tira uma pessoa da família (só a dona/o dono)
  function tirarDaFamilia(uidDaPessoa) {
    return comSincroniaParada(async (uid, modulo) => {
      const fid = espacoDe(metaRef.current)?.id;
      if (!fid || uidDaPessoa === uid) return;
      await modulo.tirarDaFamilia(fid, uidDaPessoa);
    });
  }

  // Encerra a família (só a dona/o dono): os dados e as fotos voltam para a conta de quem encerrou
  function encerrarFamilia() {
    return comSincroniaParada(async (uid, modulo) => {
      const fid = espacoDe(metaRef.current)?.id;
      if (!fid) return;
      const daFamilia = modulo.criarAdaptador({ tipo: "familia", id: fid });
      const info = await daFamilia.lerInfo();
      // este aparelho acabou de sincronizar: usa os dados daqui (assim dá para tentar de novo mesmo
      // se uma tentativa anterior parou no meio da limpeza da família)
      const emDia = !info || (metaRef.current?.versao === info.versao && baseRef.current && iguais(dadosRef.current, baseRef.current));
      const daFamiliaDados = emDia ? dadosRef.current : (await daFamilia.baixarDados(info)).dados;
      const semFamilia = dadosSemFamilia(daFamiliaDados, uid);

      // dados da conta: o que foi gravado nela enquanto estava na família (ex.: um aparelho ainda na
      // versão 8) continua; o resto vem da família
      const minha = modulo.criarAdaptador(uid);
      const minhaInfo = await minha.lerInfo();
      let dados = semFamilia;
      if (minhaInfo) {
        const pessoal = (await minha.baixarDados(minhaInfo)).dados;
        const basePessoal = await lerBase(uid).catch(() => null);
        if (basePessoal) {
          if (!iguais(pessoal, basePessoal)) dados = mesclarDados(basePessoal, semFamilia, pessoal);
        } else if (!semDadosProprios(pessoal) && !iguais(pessoal, semFamilia)) {
          guardarCopia(pessoal, "da sua conta (antes de encerrar a família)", new Date(), uid);
        }
      }
      const versao = await minha.enviarDados(dados, minhaInfo ? minhaInfo.versao : 0);

      // fotos: copia todas antes de apagar a família (se alguma falhar, nada é apagado e dá para tentar de novo)
      for (const id of info?.fotos || []) {
        const blob = await daFamilia.baixarFoto(id);
        if (blob) await minha.enviarFoto(id, blob);
      }
      await modulo.apagarFamilia(fid);
      await modulo.marcarFamiliaDaConta(uid, null);
      familiaConferidaRef.current = Date.now();
      await trocarDeEspaco(uid, null, {
        jaEnviado: { dados, versao, fotos: info?.fotos || [] },
        aviso: "A família foi encerrada. Os dados continuam com você."
      });
    });
  }

  // Quem está na família, quem é a dona/o dono e os convites
  async function lerFamilia() {
    const meta = metaRef.current;
    const fid = espacoDe(meta)?.id;
    if (!fid || !logadoRef.current) return null;
    const modulo = moduloRef.current || (await carregarNuvem());
    moduloRef.current = modulo;
    return modulo.lerFamilia(fid);
  }

  function esquecerAviso() {
    atualizar({ aviso: "" });
  }

  // Deixa o login pronto antes do toque (a tela de backup chama ao abrir)
  function prepararLogin() {
    if (!NUVEM_CONFIGURADA) return;
    carregarNuvem()
      .then((modulo) => {
        moduloRef.current = modulo;
        modulo.prepararLogin();
      })
      .catch(() => {});
  }

  async function entrar() {
    if (!NUVEM_CONFIGURADA) return;
    atualizar({ status: "entrando", mensagem: "" });
    try {
      // sem esperas antes de abrir a janela do Google (o navegador pode bloquear)
      const modulo = moduloRef.current || (await carregarNuvem());
      moduloRef.current = modulo;
      if (ehAppAndroid()) marcarIdaAoLogin(); // app Android: vai para a página do Google e volta
      const usuario = await modulo.entrarComGoogle();
      await comecarCom(usuario);
    } catch (erro) {
      const m = mensagemDeErro(moduloRef.current, erro);
      const voltar = metaRef.current ? "sessao" : "desligada";
      atualizar({ status: voltar, mensagem: m.tipo === "cancelado" ? "" : m.texto });
    }
  }

  async function sair() {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    logadoRef.current = false;
    escolhaRef.current = null;
    const meta = metaRef.current;
    if (meta) {
      // os dados continuam neste aparelho (são desta conta); anota se tudo já estava na nuvem
      const base = baseRef.current;
      salvarUltimaConta({ ...meta, tudoEnviado: Boolean(base && iguais(dadosRef.current, base)) });
      donoRef.current = meta.uid;
    }
    try {
      const modulo = await carregarNuvem();
      await modulo.sairDaConta();
    } catch {
      // mesmo sem internet, este aparelho deixa de sincronizar
    }
    metaRef.current = null;
    baseRef.current = null;
    pendenteRef.current = null;
    adaptadorRef.current = null;
    buscarFoto = null;
    apagarEstadoNuvem();
    await apagarBase();
    atualizar({ status: "desligada", usuario: null, mensagem: "", escolha: null, sincronizadoEm: null, familia: null, aviso: "" });
  }

  // Primeira vez, com dados dos dois lados: "juntar", "nuvem" ou "aparelho"
  async function escolher(opcao) {
    const pendente = escolhaRef.current;
    const meta = metaRef.current;
    if (!pendente || !meta || rodandoRef.current) return;

    const antes = dadosRef.current;
    const copias = {
      nuvem: [antes, "antes de usar os dados da nuvem", new Date(), donoRef.current],
      aparelho: [pendente.remoto, "que estavam na nuvem antes de usar os deste aparelho", new Date(), meta.uid]
    };
    if (copias[opcao] && !guardarCopia(...copias[opcao])) {
      const seguir = window.confirm(
        "Não consegui guardar a cópia de segurança (pouco espaço neste aparelho).\n\nContinuar mesmo assim?"
      );
      if (!seguir) return;
    }

    rodandoRef.current = true;
    atualizar({ status: "sincronizando", mensagem: "" });
    const uid = meta.uid;
    let repetir = false;
    try {
      const nuvem = await preparar(uid);
      if (opcao === "aparelho") {
        // as fotos que só estavam na nuvem vêm para cá antes (a cópia de segurança usa)
        const aqui = new Set(((await listarCupons().catch(() => [])) || []).map(String));
        const naNuvem = new Set(pendente.fotos || []);
        for (const id of idsDasFotos(pendente.remoto)) {
          if (aqui.has(id) || !naNuvem.has(id)) continue;
          const blob = await nuvem.baixarFoto(id).catch(() => null);
          if (blob) await salvarCupom(id, blob).catch(() => {});
        }
      }
      const r = await resolverPrimeiraVez({
        nuvem,
        local: antes,
        remoto: pendente.remoto,
        versao: pendente.versao,
        escolha: opcao
      });
      if (!logadoRef.current || metaRef.current?.uid !== uid) return;
      escolhaRef.current = null;
      const aplicou = r.dados !== antes;
      if (aplicou) aplicar(antes, r.dados);
      await confirmarBase(uid, r.base, r.versao, aplicou);
      atualizar({ status: "ok", mensagem: "", escolha: null, sincronizadoEm: metaRef.current.sincronizadoEm });
      await sincronizarAsFotos(nuvem, r.dados, r.versao, pendente.fotos);
      repetir = true; // confere de novo daqui a pouco (mudanças feitas enquanto a pessoa escolhia)
    } catch (erro) {
      if (erro?.conflito) {
        // a nuvem mudou enquanto a pessoa escolhia: busca de novo
        escolhaRef.current = null;
        atualizar({ escolha: null });
        repetir = true;
      } else {
        tratarErro(erro);
        atualizar({ status: "escolher" });
      }
    } finally {
      rodandoRef.current = false;
      if (repetir) agendar(1500);
    }
  }

  function sincronizarAgora() {
    if (logadoRef.current) rodar();
  }

  // Voltou da página de login do Google (app Android): termina de entrar
  useEffect(() => {
    const voltou = NUVEM_CONFIGURADA && voltouDoLogin();
    if (metaRef.current || !voltou) return; // com conta anterior, a abertura normal (abaixo) termina o login
    iniciouRef.current = true;
    (async () => {
      atualizar({ status: "entrando", mensagem: "" });
      try {
        const modulo = await carregarNuvem();
        moduloRef.current = modulo;
        const usuario = await modulo.concluirRedirect();
        if (usuario) await comecarCom(usuario);
        else atualizar({ status: "desligada", mensagem: "" });
      } catch (erro) {
        const m = mensagemDeErro(moduloRef.current, erro);
        atualizar({ status: "desligada", mensagem: m.tipo === "cancelado" ? "" : m.texto });
      }
    })();
  }, []);

  // Ao abrir o app: se este aparelho já estava conectado, confere a conta e sincroniza
  useEffect(() => {
    if (iniciouRef.current || !metaRef.current) return;
    iniciouRef.current = true;
    (async () => {
      try {
        const modulo = await carregarNuvem();
        moduloRef.current = modulo;
        const usuario = await modulo.usuarioAtual();
        if (!usuario) {
          atualizar({ status: "sessao", mensagem: "Entre de novo na sua conta para continuar sincronizando." });
          return;
        }
        await comecarCom(usuario);
      } catch (erro) {
        // continua usando os dados deste aparelho e tenta de novo depois
        logadoRef.current = true;
        tratarErro(erro);
      }
    })();
  }, []);

  // Mudou algo nos dados: envia daqui a pouco
  useEffect(() => {
    if (!logadoRef.current || escolhaRef.current) return;
    if (baseRef.current && iguais(data, baseRef.current)) return;
    agendar(ESPERA_PARA_ENVIAR);
  }, [data]);

  // Ao voltar para o app, ao reconectar e de tempos em tempos: confere a nuvem
  useEffect(() => {
    function aoMudarVisibilidade() {
      if (!logadoRef.current) return;
      if (document.visibilityState === "visible") rodar();
      else if (timerRef.current) rodar(); // saindo do app com mudança esperando: envia já
    }
    function aoReconectar() {
      if (logadoRef.current) rodar();
    }
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("online", aoReconectar);
    const intervalo = setInterval(() => {
      if (logadoRef.current && document.visibilityState === "visible") rodar();
    }, INTERVALO_DE_CONFERENCIA);
    return () => {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("online", aoReconectar);
      clearInterval(intervalo);
    };
  }, []);

  return {
    ...estado,
    configurada: NUVEM_CONFIGURADA,
    entrar,
    sair,
    escolher,
    sincronizarAgora,
    prepararLogin,
    aoSalvar,
    criarFamilia,
    criarConvite,
    entrarNaFamilia,
    sairDaFamilia,
    tirarDaFamilia,
    encerrarFamilia,
    lerFamilia,
    esquecerAviso
  };
}
