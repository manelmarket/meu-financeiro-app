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

import {
  loadData,
  saveData,
  resetData,
  pegarFotosPendentes,
  liberarFotosDoBackupAntigo
} from "./storage/storage";
import { apagarCupom, comprimirImagem, dataURLParaBlob, limparCupons, salvarCupom } from "./storage/cupons";
import { hojeISO, mesDaData } from "./lib/formato";
import { alternarConta } from "./lib/mes";

// Aba do menu que fica acesa em cada tela
const ABA_DA_TELA = {
  "card-details": "cards",
  future: "cards",
  calendar: "cards",
  bills: "home"
};

export default function App(){

  const [data,setData] = useState(()=>loadData());

  const [tela,setTela] = useState({ page:"home" });

  const [erroSalvar,setErroSalvar] = useState(false);

  const hoje = hojeISO();



  useEffect(()=>{

    setErroSalvar(!saveData(data));

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

      if(conta.id && lista.some(c=>c.id===conta.id)){

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

  function addGoal(goal){

    setData(d=>({ ...d, metas:[ ...d.metas, goal ] }));

  }



  // ---------- restaurar demonstração ----------

  function resetar(){

    const confirmar = window.confirm(
      "Restaurar os dados de demonstração?\n\n" +
      "Isso APAGA todos os seus lançamentos, cartões, compras, contas fixas e metas deste aparelho."
    );

    if(!confirmar) return;

    limparCupons().catch(()=>{});

    setData(resetData());

    ir("home");

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
        onSave={addEntry}
        onCancel={()=>ir("home")}
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
        onAdd={addGoal}
      />;
      break;

    default:
      content =
      <Home
        data={data}
        hoje={hoje}
        onNew={()=>ir("new")}
        onOpenBills={()=>ir("bills")}
        onOpenCard={(id)=>ir("card-details", { cardId:id })}
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
