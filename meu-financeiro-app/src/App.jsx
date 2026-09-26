import React from "react";
import { useEffect, useLayoutEffect, useState } from "react";

import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import Reports from "./pages/Reports";
import NewEntry from "./pages/NewEntry";
import History from "./pages/History";
import Cards from "./pages/Cards";
import Goals from "./pages/Goals";
import CardDetails from "./pages/CardDetails";
import FutureEntries from "./pages/FutureEntries";
import InvoiceCalendar from "./pages/InvoiceCalendar";
import Bills from "./pages/Bills";
import Investments from "./pages/Investments";
import Patrimony from "./pages/Patrimony";
import Assistant from "./pages/Assistant";
import Backup from "./pages/Backup";

import useNuvem from "./lib/useNuvem";
import { guardarCopia } from "./lib/backup";

import {
  loadData,
  saveData,
  resetData,
  pegarFotosPendentes,
  liberarFotosDoBackupAntigo
} from "./storage/storage";
import { apagarCupom, comprimirImagem, dataURLParaBlob, limparCupons, salvarCupom } from "./storage/cupons";
import { arredondar, hojeISO, mesDaData } from "./lib/formato";
import { alternarConta } from "./lib/mes";

// Aba do menu que fica acesa em cada tela
const ABA_DA_TELA = {
  "card-details": "cards",
  future: "cards",
  calendar: "cards",
  bills: "home",
  assistant: "home",
  investments: "home",
  patrimony: "home",
  backup: "home"
};

export default function App(){

  const [data,setData] = useState(()=>loadData());

  const [tela,setTela] = useState({ page:"home" });

  const [erroSalvar,setErroSalvar] = useState(false);

  // login com Google + sincronização dos dados com a nuvem
  const nuvem = useNuvem(data, setData);

  const hoje = hojeISO();



  useEffect(()=>{

    const salvou = saveData(data);

    setErroSalvar(!salvou);

    // a nuvem só marca este aparelho como sincronizado depois que os dados foram salvos aqui
    nuvem.aoSalvar(salvou);

  },[data]);



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

    setTela({ page, ...extra });

  }



  // ---------- lançamentos ----------

  function addEntry(item){

    setData(d=>({ ...d, lancamentos:[ ...d.lancamentos, item ] }));

    ir("home");

  }


  function deleteEntry(id){

    setData(d=>({ ...d, lancamentos: d.lancamentos.filter(x=>x.id!==id) }));

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

    setData(d=>({ ...d, cartoes: d.cartoes.filter(c=>c.id!==id) }));

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

    setData(d=>({ ...d, contasFixas: (d.contasFixas || []).filter(c=>c.id!==id) }));

  }


  function toggleBill(id){

    setData(d=>({

      ...d,

      contasFixas: (d.contasFixas || []).map(c=> c.id===id ? alternarConta(c, hojeISO()) : c)

    }));

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

    const confirmar = window.confirm(
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

    if(!guardarCopia(data, "antes de restaurar um backup")){

      const seguir = window.confirm(
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
    />;

  let content;

  switch(tela.page){

    case "new":
      content =
      <NewEntry
        cartoes={data.cartoes}
        onSave={addEntry}
        onSavePurchase={(cardId, compra)=>{ savePurchase(cardId, compra); ir("home"); }}
        onCancel={()=>ir("home")}
        onConfigurarIA={()=>ir("assistant")}
      />;
      break;

    case "history":
      content =
      <History
        data={data}
        onDelete={deleteEntry}
      />;
      break;

    case "reports":
      content =
      <Reports
        data={data}
        hoje={hoje}
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
            hoje={hoje}
            abrirForm={tela.abrirForm}
            onBack={()=>ir("cards")}
            onSavePurchase={savePurchase}
            onDeletePurchase={deletePurchase}
            onSaveCard={saveCard}
            onFuture={()=>ir("future", { cardId:cartaoAtual.id })}
            onCalendar={()=>ir("calendar", { cardId:cartaoAtual.id })}
            onConfigurarIA={()=>ir("assistant")}
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

    case "bills":
      content =
      <Bills
        data={data}
        onBack={()=>ir("home")}
        onSave={saveBill}
        onDelete={deleteBill}
        onToggle={toggleBill}
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

    default:
      content =
      <Home
        data={data}
        hoje={hoje}
        nuvem={nuvem}
        onNew={()=>ir("new")}
        onOpenBills={()=>ir("bills")}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
        onOpenPage={(p)=>ir(p)}
      />;

  }



  return (

    <div className="app-shell">

      {erroSalvar &&
        <div className="save-error">
          ⚠️ Não consegui salvar neste aparelho (armazenamento cheio). As últimas alterações podem se perder ao fechar o app.
        </div>
      }

      {content}

      {
      tela.page!=="new" &&
      <BottomNav

        page={ABA_DA_TELA[tela.page] || tela.page}

        onChange={(p)=>ir(p)}

      />
      }

      <button

        className="reset"

        title="Restaurar dados de demonstração"

        onClick={resetar}

      >

        ↺

      </button>

    </div>

  );

}
