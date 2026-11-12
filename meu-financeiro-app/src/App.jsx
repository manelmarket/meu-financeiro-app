import React from "react";
import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";

import { MoreVertical } from "lucide-react";

import BottomNav from "./components/BottomNav";
import MenuLateral from "./components/MenuLateral";
import AvisoAtualizacao from "./components/AvisoAtualizacao";

import Home from "./pages/Home";
import NewEntry, { bancoGuardado } from "./pages/NewEntry";
import { esquecerFraseDoJarvis, lancarDaFrase, lerPedidoDoJarvis, pedidoAssinadoValido, pegarPedidoDeOuvir } from "./lib/jarvis";
import Assistant from "./pages/Assistant";
import Entrada from "./pages/Entrada";
import Temas from "./pages/Temas";
import { ignorarAssinatura } from "./lib/assinaturas";
import { excluirReceitaFixa, lancarReceitasDoDia, ligarReceitaFixa, pularMes, receber, salvarReceitaFixa } from "./lib/receitasFixas";


// Telas carregadas só quando abertas (o Início abre mais rápido); depois do Início, o resto é baixado em segundo plano
const TELAS = {
  Reports: () => import("./pages/Reports"),
  History: () => import("./pages/History"),
  Cards: () => import("./pages/Cards"),
  Goals: () => import("./pages/Goals"),
  CardDetails: () => import("./pages/CardDetails"),
  FutureEntries: () => import("./pages/FutureEntries"),
  InvoiceCalendar: () => import("./pages/InvoiceCalendar"),
  Bills: () => import("./pages/Bills"),
  Vencimentos: () => import("./pages/Vencimentos"),
  Investments: () => import("./pages/Investments"),
  Patrimony: () => import("./pages/Patrimony"),
  Jarvis: () => import("./pages/Jarvis"),
  Backup: () => import("./pages/Backup"),
  Settings: () => import("./pages/Settings"),
  Profile: () => import("./pages/Profile"),
  Orcamentos: () => import("./pages/Orcamentos"),
  Lembretes: () => import("./pages/Lembretes"),
  Bancos: () => import("./pages/Bancos"),
  Conquistas: () => import("./pages/Conquistas"),
  Familia: () => import("./pages/Familia"),
  Categorias: () => import("./pages/Categorias"),
  Emprestimos: () => import("./pages/Emprestimos"),
  MesDetalhe: () => import("./pages/MesDetalhe"),
  Importar: () => import("./pages/Importar"),
  ReceitasFixas: () => import("./pages/ReceitasFixas"),
  Assinaturas: () => import("./pages/Assinaturas"),
  RelatorioImpressao: () => import("./pages/RelatorioImpressao")
};
const Reports = lazy(TELAS.Reports);
const History = lazy(TELAS.History);
const Cards = lazy(TELAS.Cards);
const Goals = lazy(TELAS.Goals);
const CardDetails = lazy(TELAS.CardDetails);
const FutureEntries = lazy(TELAS.FutureEntries);
const InvoiceCalendar = lazy(TELAS.InvoiceCalendar);
const Bills = lazy(TELAS.Bills);
const Vencimentos = lazy(TELAS.Vencimentos);
const Investments = lazy(TELAS.Investments);
const Patrimony = lazy(TELAS.Patrimony);
const Jarvis = lazy(TELAS.Jarvis);
const Backup = lazy(TELAS.Backup);
const Settings = lazy(TELAS.Settings);
const Profile = lazy(TELAS.Profile);
const Orcamentos = lazy(TELAS.Orcamentos);
const Lembretes = lazy(TELAS.Lembretes);
const Bancos = lazy(TELAS.Bancos);
const Conquistas = lazy(TELAS.Conquistas);
const Familia = lazy(TELAS.Familia);
const Categorias = lazy(TELAS.Categorias);
const Emprestimos = lazy(TELAS.Emprestimos);
const MesDetalhe = lazy(TELAS.MesDetalhe);
const Importar = lazy(TELAS.Importar);
const ReceitasFixas = lazy(TELAS.ReceitasFixas);
const Assinaturas = lazy(TELAS.Assinaturas);
const RelatorioImpressao = lazy(TELAS.RelatorioImpressao);

function baixarTelasEmSegundoPlano(){

  const baixar = ()=>Object.values(TELAS).forEach(f=>f().catch(()=>{}));

  if(typeof window.requestIdleCallback==="function") window.requestIdleCallback(baixar, { timeout:4000 });

  else setTimeout(baixar, 1500);

}

import useNuvem from "./lib/useNuvem";
import useLembretesNoCelular from "./lib/useLembretes";
import useVoltarParaOInicio from "./lib/useVoltar";
import { guardarCopia } from "./lib/backup";
import { lerConfigIA } from "./lib/ia";
import { contextoDaConversa, conversarComIA, executarAcoes } from "./lib/conversa";
import { lerAparencia } from "./lib/aparencia";
import { primeiroNome } from "./lib/perfil";

import {
  ehVazio,
  loadData,
  saveData,
  resetData,
  pegarFotosPendentes,
  liberarFotosDoBackupAntigo,
  NOME_DA_DEMONSTRACAO
} from "./storage/storage";
import { apagarCupom, comprimirImagem, dataURLParaBlob, limparCupons, salvarCupom } from "./storage/cupons";
import { arredondar, hojeISO, mesDaData } from "./lib/formato";
import { editarLancamento } from "./lib/lancar";
import { usarValoresEscondidos } from "./lib/privacidade";
import { alternarConta } from "./lib/mes";
import { comOrcamento } from "./lib/orcamento";
import { excluirBanco, guardarPagamentosDaConta, guardarPagamentosDoCartao, guardarPagamentosDoEmprestimo, resumoDosBancos, salvarBanco } from "./lib/saldos";
import { excluirCategoria, salvarCategoria } from "./lib/categorias";
import { registrarTransferencia } from "./lib/transferencias";
import { desfazerPagamento, excluirEmprestimo, registrarPagamento, salvarEmprestimo } from "./lib/emprestimos";
import { desfazerPagamentoDaConta, pagarConta } from "./lib/contasFixas";
import { comPerfilDaPessoa, perfilDaPessoa } from "./lib/familia";
import { lerConvitePendente } from "./lib/convite";
import { avisar, confirmar } from "./lib/dialogo";
import DialogosDoApp from "./components/DialogosDoApp";
import BoasVindas, { boasVindasVistas } from "./components/BoasVindas";

// Aba do menu que fica acesa em cada tela
const ABA_DA_TELA = {
  "card-details": "cards",
  future: "cards",
  calendar: "cards",
  reports: "home",
  conquistas: "home",
  familia: "home",
  bills: "home",
  vencimentos: "home",
  emprestimos: "home",
  orcamentos: "home",
  categorias: "home",
  lembretes: "home",
  assistant: "home",
  jarvis: "jarvis",
  mes: "home",
  importar: "home",
  "receitas-fixas": "home",
  assinaturas: "home",
  "relatorio-pdf": "home",
  investments: "home",
  patrimony: "home",
  backup: "home"
};

// Item do menu lateral que fica aceso em cada tela
const ITEM_DO_MENU = {
  "card-details": "cards",
  future: "cards",
  calendar: "cards",
  vencimentos: "home",
  profile: "settings"
};

export default function App(){

  const [data,setData] = useState(()=>loadData());

  // "Esconder valores": a tela é desenhada de novo ao ligar/desligar
  const escondido = usarValoresEscondidos();

  const [tela,setTela] = useState({ page:"home" });

  const [erroSalvar,setErroSalvar] = useState(false);

  const [menuAberto,setMenuAberto] = useState(false);

  // boas-vindas: conta sem nenhum registro, uma vez neste aparelho
  const [boasVindas,setBoasVindas] = useState(()=>!boasVindasVistas());

  // resultado de um lançamento pedido ao Jarvis: { ok, texto }
  const [avisoJarvis,setAvisoJarvis] = useState(null);

  // login com Google + sincronização dos dados com a nuvem
  const nuvem = useNuvem(data, setData);

  const hoje = hojeISO();



  // os dados de agora (o pedido do Jarvis espera a IA responder)
  const dadosAtuais = useRef(data);

  const pedidoTratado = useRef(null);

  dadosAtuais.current = data;



  // aberto pelo Jarvis (?jarvis=frase&t=...&sig=...):
  // - com a IA do Assistente ligada, a IA entende a frase (ver lib/conversa.js):
  //   - assinatura válida e só lançamentos: grava sozinho e mostra "Jarvis lançou ..." (o Jarvis lê esse aviso)
  //   - pergunta: a resposta aparece no aviso
  //   - correções, exclusões, pagamentos... (ou sem assinatura): abre a tela Jarvis, que pede confirmação
  // - sem IA (ou se a IA falhar), como antes:
  //   - assinatura válida: grava o lançamento entendido pelo app e mostra o aviso
  //   - senão: abre o Novo lançamento já preenchido, e a pessoa toca em Salvar
  useEffect(()=>{

    const pedido = lerPedidoDoJarvis();

    // cada pedido é tratado uma vez só (mesmo que esta parte rode de novo)
    if(!pedido || pedidoTratado.current===pedido.sig+pedido.frase) return;

    pedidoTratado.current = pedido.sig+pedido.frase;

    (async ()=>{

      const assinado = await pedidoAssinadoValido(pedido);

      const cfg = lerConfigIA();

      if(cfg){

        try{

          setAvisoJarvis({ ok:true, texto:`Jarvis entendendo: "${pedido.frase}"…`, fixo:true });

          const base = dadosAtuais.current;

          const contexto = contextoDaConversa(base, hoje, perfilDaPessoa(base, nuvem.usuario, Boolean(nuvem.familia)), lerAparencia());

          const r = await conversarComIA(cfg, [ { autor:"pessoa", texto:pedido.frase } ], contexto);

          esquecerFraseDoJarvis();

          // pergunta: só a resposta
          if(!r.acoes.length){

            setAvisoJarvis({ ok:true, texto:`Jarvis: ${r.resposta}` });

            return;

          }

          if(assinado && r.acoes.every(a=>a.acao==="lancar")){

            const bancos = resumoDosBancos(dadosAtuais.current).bancos;

            const opcoes = { hoje, agora:Date.now(), bancos, bancoPadrao:bancoGuardado(bancos) };

            const atual = dadosAtuais.current;

            const previa = executarAcoes(atual, r.acoes, opcoes);

            if(previa.mudou && previa.itens.every(i=>!i.erro)){

              setData(d=> d===atual ? previa.dados : executarAcoes(d, r.acoes, opcoes).dados);

              setAvisoJarvis({ ok:true, texto:`Jarvis lançou ${previa.itens.map(i=>i.texto).join("; ")}` });

              return;

            }

          }

          // o resto passa pela confirmação na tela Jarvis
          setAvisoJarvis(null);

          setTela({ page:"jarvis", pedido:{ id:Date.now(), frase:pedido.frase, resposta:r.resposta, acoes:r.acoes } });

          return;

        }catch{

          // a IA falhou: segue do jeito simples
          setAvisoJarvis(null);

        }

      }

      if(assinado){

        esquecerFraseDoJarvis();

        const r = lancarDaFrase(pedido.frase, data, hoje, resumoDosBancos(data).bancos, bancoGuardado(resumoDosBancos(data).bancos));

        if(!r.erro){

          salvarMovimento(r);

          setAvisoJarvis({ ok:true, texto:`Jarvis lançou ${r.resumo}` });

          return;

        }

        setAvisoJarvis({ ok:false, texto:`Jarvis não lançou: ${r.erro}. Preencha na mão.` });

        // devolve a frase para o Novo lançamento tentar preencher
        try { sessionStorage.setItem("meu_financeiro_jarvis", JSON.stringify({ ...pedido, sig:"", t:"" })); } catch {}

      }

      setTela({ page:"new" });

    })();

  },[]);



  // o aviso do Jarvis some sozinho
  useEffect(()=>{

    if(!avisoJarvis || avisoJarvis.fixo) return;

    const id = setTimeout(()=>setAvisoJarvis(null), 9000);

    return ()=>clearTimeout(id);

  },[avisoJarvis]);



  useEffect(()=>{

    const salvou = saveData(data);

    setErroSalvar(!salvou);

    // a nuvem só marca este aparelho como sincronizado depois que os dados foram salvos aqui
    nuvem.aoSalvar(salvou);

  },[data]);



  // animação de troca de tela: para frente a tela nova vem da direita; voltando (ou indo para uma aba
  // que fica antes na barra), vem da esquerda
  const telaAnterior = useRef(tela);

  const direcao = useRef("vai");

  if(telaAnterior.current!==tela){

    const ordem = ["home","history","bancos","new","cards","goals","jarvis"];

    const de = ordem.indexOf(telaAnterior.current.page);

    const para = ordem.indexOf(tela.page);

    direcao.current = tela.page==="home" || (de>=0 && para>=0 && para<de) ? "volta" : "vai";

    telaAnterior.current = tela;

  }



  // depois que o app abre, as outras telas são baixadas sem pressa
  useEffect(()=>{ baixarTelasEmSegundoPlano(); },[]);



  // cada troca de tela começa do topo
  useLayoutEffect(()=>{

    window.scrollTo(0,0);

  },[tela]);



  // fotos de cupom da versão antiga: passam para o IndexedDB
  useEffect(()=>{

    const pendentes = pegarFotosPendentes();

    if(!pendentes.length) return;

    // só copia fotos de compras que ainda existem
    const emUso = new Set(
      data.cartoes.flatMap(c=>(c.compras || []).map(x=>x.cupomId).filter(Boolean))
    );

    (async()=>{

      let todas = true;

      for(const foto of pendentes.filter(f=>emUso.has(f.cupomId))){

        try{

          const original = await dataURLParaBlob(foto.dataURL);

          let blob = original;

          try{ blob = await comprimirImagem(original); }catch{ /* guarda a original */ }

          await salvarCupom(foto.cupomId, blob);

        }catch(erro){

          todas = false;

          console.error("Foto antiga não copiada", erro);

        }

      }

      if(todas){

        liberarFotosDoBackupAntigo();

        // salva de novo agora que a cópia antiga ficou menor
        setData(d=>({ ...d }));

      }

    })();

  },[]);



  function ir(page, extra = {}){

    setMenuAberto(false);

    setTela({ page, ...extra });

  }



  // O app só abre depois do login com a conta Google
  const precisaEntrar =
    nuvem.configurada &&
    (!nuvem.usuario || nuvem.status==="sessao" || nuvem.status==="entrando" || Boolean(nuvem.escolha));

  // receitas fixas automáticas: no dia, entram sozinhas (sem nada a lançar, os dados ficam iguais)
  useEffect(()=>{

    if(precisaEntrar) return;

    setData(d=>lancarReceitasDoDia(d, hoje));

  },[data, hoje, precisaEntrar]);

  // lembretes de vencimento no celular (app Android): a agenda acompanha os dados
  useLembretesNoCelular(data, !precisaEntrar);

  // botão voltar do celular: em outra tela (ou com o menu aberto), volta para o Início em vez de sair do app
  useVoltarParaOInicio(!precisaEntrar && (tela.page!=="home" || menuAberto), ()=>{

    setMenuAberto(false);

    setTela(t=> t.page==="home" ? t : { page:"home" });

  });

  // voltou para a tela de entrada (saiu da conta, sessão terminou): depois do login, começa pelo Início
  useEffect(()=>{

    if(!precisaEntrar) return;

    setMenuAberto(false);

    setTela(t=> t.page==="home" ? t : { page:"home" });

  },[precisaEntrar]);



  // Perfil: depois de entrar, se o perfil ainda não tem nome (ou tem o "João" da demonstração),
  // usa o nome da conta Google
  useEffect(()=>{

    const nomeGoogle = nuvem.usuario?.nome;

    if(nuvem.status!=="ok" || !nomeGoogle) return;

    const naFamilia = Boolean(nuvem.familia);

    setData(d=>{

      const u = perfilDaPessoa(d, nuvem.usuario, naFamilia);

      if(u.nome && u.nome!==NOME_DA_DEMONSTRACAO) return d;

      return comPerfilDaPessoa(d, { nome:nomeGoogle, apelido:u.apelido || primeiroNome(nomeGoogle) }, nuvem.usuario, naFamilia);

    });

  },[nuvem.status, nuvem.usuario?.uid, nuvem.familia?.id]);



  // atalho "Falar com o Jarvis": depois de entrar, abre o Jarvis já ouvindo
  useEffect(()=>{

    if(precisaEntrar || !pegarPedidoDeOuvir()) return;

    setTela({ page:"jarvis", ouvir:Date.now() });

  },[precisaEntrar]);



  // abriu o app pelo link de convite da família: depois de entrar, vai direto para a tela Família
  useEffect(()=>{

    if(precisaEntrar || nuvem.status!=="ok" || nuvem.familia || !lerConvitePendente()) return;

    setTela(t=> t.page==="familia" ? t : { page:"familia" });

  },[precisaEntrar, nuvem.status, nuvem.familia?.id]);



  // na família, cada pessoa tem o próprio perfil (nome, apelido...)
  function salvarPerfil(perfil){

    setData(d=>comPerfilDaPessoa(d, perfil, nuvem.usuario, Boolean(nuvem.familia)));

  }



  // ---------- lançamentos ----------

  // lançamento novo: o gasto/receita e, se parte foi no cartão, as compras nos cartões (tudo de uma vez)
  function salvarMovimento({ lancamento, compras }){

    setData(d=>({

      ...d,

      lancamentos: lancamento ? [ ...d.lancamentos, lancamento ] : d.lancamentos,

      cartoes: d.cartoes.map(c=>{

        const novas = (compras || []).filter(x=>x.cartaoId===c.id).map(x=>x.compra);

        return novas.length ? { ...c, compras:[ ...(c.compras || []), ...novas ] } : c;

      })

    }));

    avisar(compras?.length && !lancamento ? "Compra lançada no cartão" : "Lançamento salvo");

    ir("home");

  }



  // ---------- bancos ----------

  function salvarDadosDoBanco(banco){

    setData(d=>salvarBanco(d, banco));

  }


  function apagarBanco(id){

    setData(d=>excluirBanco(d, id));

  }


  // transferência entre bancos, saque ou depósito (não é gasto nem receita) — ver lib/transferencias.js
  // Devolve { erro } se o formulário estiver errado; senão grava e volta { ok: true }.
  function transferirEntreBancos(form, voltarParaOInicio = false){

    const previa = registrarTransferencia(data, form);

    if(previa.erro) return previa;

    setData(d=>{ const r = registrarTransferencia(d, form); return r.erro ? d : r.dados; });

    avisar("Transferência registrada");

    if(voltarParaOInicio) ir("home");

    return { ok:true };

  }



  // ---------- categorias ----------

  // form = { id?, nome, icone, cor } (ver lib/categorias.js)
  function salvarDadosDaCategoria(form){

    setData(d=>salvarCategoria(d, form));

  }


  function apagarCategoria(id){

    setData(d=>excluirCategoria(d, id));

  }


  function deleteEntry(id){

    const item = data.lancamentos.find(x=>x.id===id);

    let desfeito = false;

    if(item?.cupomId) setTimeout(()=>{ if(!desfeito) apagarCupom(item.cupomId).catch(()=>{}); }, 7000);

    if(item) avisar(`"${item.descricao || "Lançamento"}" excluído`, {

      desfazer: ()=>{

        desfeito = true;

        setData(d=> d.lancamentos.some(x=>x.id===item.id) ? d : { ...d, lancamentos:[ ...d.lancamentos, item ] });

      }

    });

    setData(d=>{

      const sem = { ...d, lancamentos: d.lancamentos.filter(x=>x.id!==id) };

      // receita fixa apagada: aquele mês fica como "não veio" (senão o app lançaria de novo)
      return item?.receitaFixa ? pularMes(sem, item.receitaFixa.id, item.receitaFixa.mes) : sem;

    });

  }


  // editar lançamento (ver lib/lancar.js → editarLancamento); a foto antiga sai quando troca
  function editarEntry(id, mudancas){

    const previa = editarLancamento(data, id, mudancas);

    if(previa.erro) return previa;

    const fotoAntiga = data.lancamentos.find(x=>x.id===id)?.cupomId;

    if(mudancas.cupomId!==undefined && fotoAntiga && fotoAntiga!==mudancas.cupomId) apagarCupom(fotoAntiga).catch(()=>{});

    setData(d=>{ const r = editarLancamento(d, id, mudancas); return r.erro ? d : r.dados; });

    avisar("Alterações salvas");

    return { ok:true };

  }



  // ---------- receitas fixas ---------- (ver lib/receitasFixas.js)

  function salvarDadosDaReceita(form){

    const agora = Date.now();

    const previa = salvarReceitaFixa(data, form, hoje, agora);

    if(previa.erro) return previa;

    setData(d=>{ const r = salvarReceitaFixa(d, form, hoje, agora); return r.erro ? d : r.dados; });

    return { ok:true };

  }


  function receberReceita(id, mes){

    setData(d=>receber(d, id, mes));

  }


  function receitaNaoVeio(id, mes){

    setData(d=>pularMes(d, id, mes));

  }



  // ---------- empréstimos ---------- (ver lib/emprestimos.js)

  // Confere com os dados de agora; se der erro devolve { erro }, senão grava e volta { ok: true }.
  // "agora" fica fixo antes, para a conferência e a gravação criarem o mesmo id.
  function mudarEmprestimos(mudar){

    const previa = mudar(data);

    if(previa.erro) return previa;

    setData(d=>{ const r = mudar(d); return r.erro ? d : r.dados; });

    return { ok:true };

  }


  function salvarDadosDoEmprestimo(form){

    const agora = Date.now();

    return mudarEmprestimos(d=>salvarEmprestimo(d, form, agora, hoje));

  }


  function apagarEmprestimo(id){

    // o que já entrou nos bancos (Recebi) continua no saldo deles (ver lib/saldos.js)
    return mudarEmprestimos(d=>excluirEmprestimo(guardarPagamentosDoEmprestimo(d, id), id));

  }


  function pagarEmprestimo(id, pagamento){

    const agora = Date.now();

    return mudarEmprestimos(d=>registrarPagamento(d, id, pagamento, agora));

  }


  function desfazerPagamentoDoEmprestimo(id, pagamentoId){

    return mudarEmprestimos(d=>desfazerPagamento(d, id, pagamentoId));

  }



  // ---------- cartões ----------

  function saveCard(card){

    setData(d=>{

      const existe = d.cartoes.some(c=>c.id===card.id);

      return {
        ...d,
        cartoes: existe
          ? d.cartoes.map(c=>{
              if(c.id!==card.id) return c;
              // ao salvar a edição, o aviso de "fechamento estimado" sai
              const { fechamentoEstimado, ...resto } = c;
              return { ...resto, ...card, compras: c.compras || [] };
            })
          : [ ...d.cartoes, { ...card, compras: [] } ]
      };

    });

  }


  function deleteCard(id){

    const cartao = data.cartoes.find(c=>c.id===id);

    for(const compra of cartao?.compras || []){

      if(compra.cupomId) apagarCupom(compra.cupomId).catch(()=>{});

    }

    // os pagamentos de fatura feitos com os bancos continuam descontados deles
    setData(d=>{ const g = guardarPagamentosDoCartao(d, id); return { ...g, cartoes: g.cartoes.filter(c=>c.id!==id) }; });

  }


  // compra = { id, descricao, categoria, data, valorTotal, parcelas, cupomId? }
  // (as parcelas são calculadas a partir do valor total — ver lib/cartao.js)
  function savePurchase(cardId, compra){

    setData(d=>({

      ...d,

      cartoes: d.cartoes.map(c=>{

        if(c.id!==cardId) return c;

        const compras = c.compras || [];

        const existe = compras.some(x=>x.id===compra.id);

        return {
          ...c,
          compras: existe
            ? compras.map(x=> x.id===compra.id ? compra : x)
            : [ ...compras, compra ]
        };

      })

    }));

  }


  // pagamento da fatura (valor cheio ou parcial) — ver lib/cartao.js
  function payInvoice(cardId, pagamento){

    setData(d=>({

      ...d,

      cartoes: d.cartoes.map(c=>
        c.id===cardId
          ? { ...c, pagamentos: [ ...(Array.isArray(c.pagamentos) ? c.pagamentos : []), pagamento ] }
          : c
      )

    }));

    avisar("Pagamento da fatura registrado");

  }


  function undoPayment(cardId, pagamentoId){

    setData(d=>({

      ...d,

      cartoes: d.cartoes.map(c=>
        c.id===cardId
          ? { ...c, pagamentos: (Array.isArray(c.pagamentos) ? c.pagamentos : []).filter(p=>p?.id!==pagamentoId) }
          : c
      )

    }));

  }


  // apaga a compra inteira (todas as parcelas)
  function deletePurchase(cardId, compra){

    if(compra.cupomId) apagarCupom(compra.cupomId).catch(()=>{});

    setData(d=>({

      ...d,

      cartoes: d.cartoes.map(c=>
        c.id===cardId
          ? { ...c, compras: (c.compras || []).filter(x=>x.id!==compra.id) }
          : c
      )

    }));

  }



  // ---------- contas fixas ----------

  function saveBill(conta){

    setData(d=>{

      const lista = d.contasFixas || [];

      if(conta.id){

        // edição: se a conta foi excluída enquanto o formulário estava aberto, não recria
        return { ...d, contasFixas: lista.map(c=> c.id===conta.id ? { ...c, ...conta } : c) };

      }

      return {
        ...d,
        contasFixas: [
          ...lista,
          { ...conta, id: Date.now(), ativa: true, periodos: [ { inicio: mesDaData(hojeISO()), fim: null } ] }
        ]
      };

    });

  }


  function deleteBill(id){

    // os pagamentos feitos com dinheiro dos bancos continuam descontados (ver lib/saldos.js)
    setData(d=>{ const g = guardarPagamentosDaConta(d, id); return { ...g, contasFixas: (g.contasFixas || []).filter(c=>c.id!==id) }; });

  }


  function toggleBill(id){

    setData(d=>({

      ...d,

      contasFixas: (d.contasFixas || []).map(c=> c.id===id ? alternarConta(c, hojeISO()) : c)

    }));

  }


  // Pagar conta fixa (ver lib/contasFixas.js): form = { mes, valor, data, bancoId }.
  // Confere com os dados de agora; se der erro devolve { erro }, senão grava e volta { ok: true }.
  function pagarContaFixa(id, form){

    const agora = Date.now();

    const previa = pagarConta(data, id, form, agora);

    if(previa.erro) return previa;

    setData(d=>{ const r = pagarConta(d, id, form, agora); return r.erro ? d : r.dados; });

    avisar("Conta marcada como paga");

    return { ok:true };

  }


  function desfazerPagamentoDeConta(id, pagamentoId){

    const previa = desfazerPagamentoDaConta(data, id, pagamentoId);

    if(previa.erro) return previa;

    setData(d=>{ const r = desfazerPagamentoDaConta(d, id, pagamentoId); return r.erro ? d : r.dados; });

    return { ok:true };

  }



  // ---------- orçamento por categoria ----------

  // limite > 0 define; vazio remove
  function salvarOrcamento(categoria, limite){

    setData(d=>comOrcamento(d, categoria, limite));

  }



  // ---------- metas ----------

  // meta = { id?, nome, objetivo, atual }
  function saveGoal(meta){

    setData(d=>{

      const lista = d.metas || [];

      if(meta.id){

        return { ...d, metas: lista.map(m=> m.id===meta.id ? { ...m, ...meta } : m) };

      }

      return { ...d, metas: [ ...lista, { ...meta, id: Date.now(), historico: [] } ] };

    });

  }


  // valor > 0 guarda; valor < 0 retira
  function moveGoal(id, valor){

    setData(d=>({

      ...d,

      metas: (d.metas || []).map(m=> m.id===id
        ? {
            ...m,
            atual: arredondar(Number(m.atual || 0) + valor),
            historico: [ ...(m.historico || []), { id: Date.now(), data: hojeISO(), valor } ]
          }
        : m
      )

    }));

  }


  function deleteGoal(id){

    setData(d=>({ ...d, metas: (d.metas || []).filter(m=>m.id!==id) }));

  }



  // ---------- investimentos e patrimônio ----------

  function salvarNaLista(chave, item){

    setData(d=>{

      const lista = d[chave] || [];

      if(item.id){

        // edição: item excluído no meio do caminho não volta
        return { ...d, [chave]: lista.map(x=> x.id===item.id ? { ...x, ...item } : x) };

      }

      return { ...d, [chave]: [ ...lista, { ...item, id: Date.now() } ] };

    });

  }


  function apagarDaLista(chave, id){

    setData(d=>({ ...d, [chave]: (d[chave] || []).filter(x=>x.id!==id) }));

  }



  // ---------- restaurar demonstração ----------

  async function resetar(){

    const naNuvem = Boolean(nuvem.usuario);

    const confirmar = await confirmar(
      "Restaurar os dados de demonstração?\n\n" +
      "Isso APAGA todos os seus lançamentos, cartões, compras, contas fixas, metas, investimentos e bens deste aparelho." +
      (naNuvem ? "\n\nEste aparelho também sai da sua conta na nuvem (os dados da nuvem continuam guardados lá)." : "")
    );

    if(!confirmar) return;

    // sai da nuvem antes, para os dados de demonstração não substituírem os da nuvem
    if(naNuvem) await nuvem.sair();

    limparCupons().catch(()=>{});

    setData(resetData());

    ir("home");

  }



  // ---------- backup em arquivo ----------

  async function restaurarBackup(backup){

    if(!guardarCopia(data, "antes de restaurar um backup", new Date(), nuvem.usuario?.uid || null)){

      const seguir = await confirmar(
        "Não consegui guardar uma cópia de segurança dos dados atuais (pouco espaço neste aparelho).\n\n" +
        "Restaurar o backup mesmo assim?"
      );

      if(!seguir) return null;

    }

    let fotosComErro = 0;

    for(const [id, url] of Object.entries(backup.fotos || {})){

      try{

        await salvarCupom(id, await dataURLParaBlob(url));

      }catch{

        fotosComErro += 1;

      }

    }

    setData(backup.dados);

    return { fotosComErro };

  }



  const cartaoAtual =
    tela.cardId != null ? data.cartoes.find(c=>c.id===tela.cardId) : null;

  const paginaCartoes =
    <Cards
      data={data}
      hoje={hoje}
      onSaveCard={saveCard}
      onDelete={deleteCard}
      onOpen={(id)=>ir("card-details", { cardId:id })}
      onNewPurchase={(id)=>ir("card-details", { cardId:id, abrirForm:true })}
      onCalendar={()=>ir("calendar")}
      onPay={payInvoice}
    />;

  let content;

  switch(tela.page){

    case "new":
      content =
      <NewEntry
        data={data}
        cartoes={data.cartoes}
        bancos={resumoDosBancos(data).bancos}
        hoje={hoje}
        onSave={salvarMovimento}
        onCancel={()=>ir("home")}
        onConfigurarIA={()=>ir("assistant")}
        onCriarCategoria={salvarDadosDaCategoria}
        onTransferir={(form)=>transferirEntreBancos(form, true)}
        onJarvis={()=>ir("jarvis")}
      />;
      break;

    case "bancos":
      content =
      <Bancos
        data={data}
        hoje={hoje}
        onSalvar={salvarDadosDoBanco}
        onExcluir={apagarBanco}
        onTransferir={(form)=>transferirEntreBancos(form)}
      />;
      break;

    case "categorias":
      content =
      <Categorias
        data={data}
        onBack={()=>ir("home")}
        onSave={salvarDadosDaCategoria}
        onDelete={apagarCategoria}
      />;
      break;

    case "conquistas":
      content =
      <Conquistas
        data={data}
        hoje={hoje}
        familia={nuvem.familia}
        onBack={()=>ir("home")}
      />;
      break;

    case "familia":
      content =
      <Familia
        nuvem={nuvem}
        onBack={()=>ir("home")}
        onIr={(p)=>ir(p)}
      />;
      break;

    case "history":
      content =
      <History
        data={data}
        onDelete={deleteEntry}
        onEditar={editarEntry}
        onCriarCategoria={salvarDadosDaCategoria}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
      />;
      break;

    case "reports":
      content =
      <Reports
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
        onImprimir={(mes)=>ir("relatorio-pdf", { mes })}
      />;
      break;

    case "cards":
      content = paginaCartoes;
      break;

    case "card-details":
      content = cartaoAtual
        ? <CardDetails
            key={cartaoAtual.id}
            cartao={cartaoAtual}
            data={data}
            hoje={hoje}
            abrirForm={tela.abrirForm}
            onBack={()=>ir("cards")}
            onSavePurchase={savePurchase}
            onDeletePurchase={deletePurchase}
            onSaveCard={saveCard}
            onFuture={()=>ir("future", { cardId:cartaoAtual.id })}
            onCalendar={()=>ir("calendar", { cardId:cartaoAtual.id })}
            onConfigurarIA={()=>ir("assistant")}
            onCriarCategoria={salvarDadosDaCategoria}
            onPay={payInvoice}
            onUndoPay={undoPayment}
          />
        : paginaCartoes;
      break;

    case "future":
      content = cartaoAtual
        ? <FutureEntries
            cartao={cartaoAtual}
            hoje={hoje}
            onBack={()=>ir("card-details", { cardId:cartaoAtual.id })}
          />
        : paginaCartoes;
      break;

    case "calendar":
      content =
      <InvoiceCalendar
        cartoes={cartaoAtual ? [cartaoAtual] : data.cartoes}
        titulo={cartaoAtual ? cartaoAtual.nome : "Todos os cartões"}
        hoje={hoje}
        onBack={()=> cartaoAtual ? ir("card-details", { cardId:cartaoAtual.id }) : ir("cards")}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
      />;
      break;

    case "vencimentos":
      content =
      <Vencimentos
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
        onOpenBills={()=>ir("bills")}
      />;
      break;

    case "bills":
      content =
      <Bills
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
        onSave={saveBill}
        onDelete={deleteBill}
        onToggle={toggleBill}
        onPagar={pagarContaFixa}
        onDesfazerPagamento={desfazerPagamentoDeConta}
        onCriarCategoria={salvarDadosDaCategoria}
        onReceitas={()=>ir("receitas-fixas", { voltar:"bills" })}
      />;
      break;

    case "emprestimos":
      content =
      <Emprestimos
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
        onSalvar={salvarDadosDoEmprestimo}
        onExcluir={apagarEmprestimo}
        onPagar={pagarEmprestimo}
        onDesfazer={desfazerPagamentoDoEmprestimo}
      />;
      break;

    case "orcamentos":
      content =
      <Orcamentos
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
        onSave={salvarOrcamento}
      />;
      break;

    case "lembretes":
      content =
      <Lembretes
        data={data}
        onBack={()=>ir("home")}
      />;
      break;

    case "goals":
      content =
      <Goals
        data={data}
        onSave={saveGoal}
        onDelete={deleteGoal}
        onMove={moveGoal}
      />;
      break;

    case "investments":
      content =
      <Investments
        data={data}
        onBack={()=>ir(tela.voltar || "home")}
        onSave={(item)=>salvarNaLista("investimentos", item)}
        onDelete={(id)=>apagarDaLista("investimentos", id)}
      />;
      break;

    case "patrimony":
      content =
      <Patrimony
        data={data}
        onBack={()=>ir("home")}
        onSave={(item)=>salvarNaLista("bens", item)}
        onDelete={(id)=>apagarDaLista("bens", id)}
        onOpenInvestments={()=>ir("investments", { voltar:"patrimony" })}
      />;
      break;

    case "relatorio-pdf":
      content =
      <RelatorioImpressao
        data={data}
        hoje={hoje}
        mes={tela.mes || mesDaData(hoje)}
        onBack={()=>ir("reports")}
      />;
      break;

    case "assinaturas":
      content =
      <Assinaturas
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
        onIgnorar={(chave)=>setData(d=>ignorarAssinatura(d, chave))}
        onVirarConta={async (a)=>{

          if(!await confirmar(`Cadastrar ${a.nome} como conta fixa de ${a.mensal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} todo dia ${Number(a.ultima.slice(8,10))}?\n\nDaqui para frente, marque como paga em Contas fixas em vez de lançar o gasto (senão ele conta duas vezes).`)) return;

          saveBill({ nome:a.nome.slice(0,40), valor:a.mensal, dia:Number(a.ultima.slice(8,10)), categoria:a.categoria });

        }}
      />;
      break;

    case "receitas-fixas":
      content =
      <ReceitasFixas
        data={data}
        hoje={hoje}
        onBack={()=>ir(tela.voltar || "home")}
        onSalvar={salvarDadosDaReceita}
        onExcluir={(id)=>setData(d=>excluirReceitaFixa(d, id))}
        onLigar={(id, ativa)=>setData(d=>ligarReceitaFixa(d, id, ativa))}
      />;
      break;

    case "importar":
      content =
      <Importar
        data={data}
        setData={setData}
        hoje={hoje}
        onBack={()=>ir("home")}
        onIr={(p)=>ir(p)}
      />;
      break;

    case "mes":
      content =
      <MesDetalhe
        data={data}
        hoje={hoje}
        mesInicial={tela.mes}
        abaInicial={tela.aba}
        onBack={()=>ir("home")}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
        onOpenBills={()=>ir("bills")}
        onOpenPage={(p, extra)=>ir(p, extra)}
      />;
      break;

    case "jarvis":
      content =
      <Jarvis
        data={data}
        setData={setData}
        hoje={hoje}
        perfil={perfilDaPessoa(data, nuvem.usuario, Boolean(nuvem.familia))}
        comPerfil={(d, perfil)=>comPerfilDaPessoa(d, perfil, nuvem.usuario, Boolean(nuvem.familia))}
        guardarPagamentosDaConta={guardarPagamentosDaConta}
        onIr={(p)=>ir(p)}
        onBack={()=>ir("home")}
        ouvirAoAbrir={tela.ouvir}
        pedidoInicial={tela.pedido}
      />;
      break;

    case "assistant":
      content =
      <Assistant
        data={data}
        hoje={hoje}
        onBack={()=>ir("home")}
      />;
      break;

    case "backup":
      content =
      <Backup
        data={data}
        hoje={hoje}
        nuvem={nuvem}
        onBack={()=>ir("home")}
        onRestaurar={restaurarBackup}
      />;
      break;

    case "settings":
      content =
      <Settings
        data={data}
        nuvem={nuvem}
        onBack={()=>ir("home")}
        onIr={(p)=>ir(p)}
        onResetar={resetar}
      />;
      break;

    case "temas":
      content =
      <Temas
        onBack={()=>ir("home")}
      />;
      break;

    case "profile":
      content =
      <Profile
        key={`${nuvem.usuario?.uid || "sem-conta"}-${nuvem.familia?.id || ""}`}
        data={data}
        perfil={perfilDaPessoa(data, nuvem.usuario, Boolean(nuvem.familia))}
        hoje={hoje}
        nuvem={nuvem}
        onBack={()=>ir("settings")}
        onSave={salvarPerfil}
      />;
      break;

    default:
      content =
      <Home
        data={data}
        hoje={hoje}
        nuvem={nuvem}
        perfil={perfilDaPessoa(data, nuvem.usuario, Boolean(nuvem.familia))}
        onNew={()=>ir("new")}
        onOpenBills={()=>ir("bills")}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
        onOpenPage={(p, extra)=>ir(p, extra)}
        onReceber={receberReceita}
        onNaoVeio={receitaNaoVeio}
      />;

  }



  if(precisaEntrar){

    return (

      <div className="app-shell entrada-shell">

        <AvisoAtualizacao />

        <DialogosDoApp />

        <Entrada nuvem={nuvem} data={data} />

      </div>

    );

  }



  return (

    <div className="app-shell">

      <AvisoAtualizacao />

        <DialogosDoApp />

      {boasVindas && ehVazio(data) && <BoasVindas onIr={(p)=>ir(p)} onFechar={()=>setBoasVindas(false)} />}

      {avisoJarvis &&
        <div
          role="status"
          className="aviso-jarvis"
          style={{
            position:"fixed", top:12, left:12, right:12, zIndex:1000, padding:"14px 16px", borderRadius:12,
            fontWeight:600, color:"#fff", background: avisoJarvis.ok ? "#15803d" : "#b45309",
            boxShadow:"0 6px 20px rgba(0,0,0,.35)"
          }}
        >
          {avisoJarvis.ok ? "✅ " : "⚠️ "}{avisoJarvis.texto}
        </div>
      }

      {erroSalvar &&
        <div className="save-error">
          ⚠️ Não consegui salvar neste aparelho (armazenamento cheio). As últimas alterações podem se perder ao fechar o app.
        </div>
      }

      <div className="conteudo">

        <button

          className="menu-btn"

          aria-label="Abrir menu"

          title="Menu"

          onClick={()=>setMenuAberto(true)}

        >

          <MoreVertical size={20} strokeWidth={2.4} />

        </button>

        <div key={`${tela.page}-${tela.cardId ?? ""}-${escondido ? "e" : "v"}`} className={`tela-anim ${direcao.current}`}>

          <Suspense fallback={

            <div className="page esqueleto" aria-busy="true" aria-label="Carregando">

              <i className="esq esq-titulo" /><i className="esq esq-card" /><i className="esq esq-linha" /><i className="esq esq-linha curta" /><i className="esq esq-card baixo" />

            </div>

          }>

            {content}

          </Suspense>

        </div>

      </div>

      {
      tela.page!=="new" &&
      <BottomNav

        page={ABA_DA_TELA[tela.page] || tela.page}

        onChange={(p)=>ir(p)}

      />
      }

      <MenuLateral

        aberto={menuAberto}

        ativo={ITEM_DO_MENU[tela.page] || tela.page}

        perfil={perfilDaPessoa(data, nuvem.usuario, Boolean(nuvem.familia))}

        conta={nuvem.usuario}

        onIr={(p)=>ir(p)}

        onFechar={()=>setMenuAberto(false)}

      />

    </div>

  );

}
