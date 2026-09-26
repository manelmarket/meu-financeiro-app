// Liga o app à nuvem: login com Google, envio/recebimento automático dos dados e das fotos.
// O Firebase (nuvem.js) só é carregado quando a pessoa usa a nuvem.

import { useEffect, useRef, useState } from "react";
import { NUVEM_CONFIGURADA } from "../config/firebase.js";
import { guardarCopia, idsDasFotos } from "./backup.js";
import { iguais, mesclarDados } from "./mesclar.js";
import { resolverPrimeiraVez, sincronizar, sincronizarFotos } from "./sincronia.js";
import { criarVazio, semDadosProprios } from "../storage/storage.js";
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
      escolha: null
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
  const pendenteRef = useRef(null); // { uid, base, versao, sincronizadoEm }
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
    if (!p || metaRef.current?.uid !== p.uid) return;
    pendenteRef.current = null;
    salvarEstadoNuvem({ ...metaRef.current, versao: p.versao, sincronizadoEm: p.sincronizadoEm });
    await salvarBase(p.uid, p.base);
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
    if (!adaptadorRef.current || adaptadorRef.current.uid !== uid) {
      const nuvem = modulo.criarAdaptador(uid);
      adaptadorRef.current = { uid, nuvem };
      buscarFoto = async (id) => {
        const blob = await nuvem.baixarFoto(id);
        if (blob) await salvarCupom(id, blob).catch(() => {});
        return blob;
      };
    }
    return adaptadorRef.current.nuvem;
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
    pendenteRef.current = { uid, base, versao, sincronizadoEm };
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
    const continuaIgual = () => logadoRef.current && metaRef.current?.uid === uid;
    const avisoDeDemora = setTimeout(() => atualizar({ status: "sincronizando" }), 500);

    try {
      const nuvem = await preparar(uid);
      if (baseRef.current === undefined) baseRef.current = await lerBase(uid);
      if (!continuaIgual()) return;

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
      await sincronizarAsFotos(nuvem, r.dados, r.versao, r.fotos);
    } catch (erro) {
      clearTimeout(avisoDeDemora);
      if (continuaIgual()) tratarErro(erro);
    } finally {
      clearTimeout(avisoDeDemora);
      rodandoRef.current = false;
      if (deNovoRef.current) {
        deNovoRef.current = false;
        agendar(1500);
      }
    }
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
            const base = baseRef.current !== undefined ? baseRef.current : await lerBase(anterior.uid).catch(() => null);
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
        sincronizadoEm: null
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
    atualizar({
      usuario,
      status: "sincronizando",
      mensagem: "",
      escolha: null,
      sincronizadoEm: metaRef.current.sincronizadoEm
    });
    await rodar();
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
    atualizar({ status: "desligada", usuario: null, mensagem: "", escolha: null, sincronizadoEm: null });
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
    aoSalvar
  };
}
