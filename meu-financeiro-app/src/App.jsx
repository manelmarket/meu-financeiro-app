import React from "react";
import { useEffect, useState } from "react";

import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import Reports from "./pages/Reports";
import NewEntry from "./pages/NewEntry";
import History from "./pages/History";
import Cards from "./pages/Cards";
import Goals from "./pages/Goals";
import CardDetails from "./pages/CardDetails";

import { loadData, saveData, resetData } from "./storage/storage";


export default function App(){

  const [page,setPage] = useState("home");

  const [data,setData] = useState(()=>loadData());

  const [selectedCard,setSelectedCard] = useState(null);



  useEffect(()=>{

    saveData(data);

  },[data]);



  useEffect(()=>{

    if(selectedCard){

      const atualizado =
      data.cartoes.find(
        c=>c.id===selectedCard.id
      );


      if(atualizado){

        setSelectedCard(atualizado);

      }

    }

  },[data]);





  function addEntry(item){

    setData(d=>({

      ...d,

      lancamentos:[
        ...d.lancamentos,
        item
      ]

    }));

    setPage("home");

  }





  function deleteEntry(id){

    setData(d=>({

      ...d,

      lancamentos:
      d.lancamentos.filter(
        x=>x.id!==id
      )

    }));

  }





  function addCard(card){

    setData(d=>({

      ...d,

      cartoes:[
        ...d.cartoes,
        card
      ]

    }));

  }





  function addPurchase(cardId,purchase){

    setData(d=>({

      ...d,

      cartoes:d.cartoes.map(c=>{

        if(c.id===cardId){

          return {

            ...c,

            compras:[
              ...(c.compras || []),
              purchase
            ]

          };

        }


        return c;


      })

    }));

  }





  function editPurchase(cardId,purchaseId,updatedPurchase){

    setData(d=>({

      ...d,

      cartoes:d.cartoes.map(c=>{

        if(c.id===cardId){

          return {

            ...c,

            compras:(c.compras || [])
            .map(compra=>{

              if(
                String(compra.id) === String(purchaseId)
              ){

                return {

                  ...compra,

                  ...updatedPurchase

                };

              }


              return compra;

            })

          };

        }


        return c;

      })

    }));

  }





  function deleteCard(id){

    setData(d=>({

      ...d,

      cartoes:
      d.cartoes.filter(
        c=>c.id!==id
      )

    }));

  }





  function deletePurchase(cardId,purchaseId){

    setData(d=>({

      ...d,

      cartoes:d.cartoes.map(c=>{

        if(c.id===cardId){

          return {

            ...c,

            compras:(c.compras || [])
            .filter(
              compra =>
              String(compra.id) !== String(purchaseId)
            )

          };

        }


        return c;

      })

    }));

  }





  function addGoal(goal){

    setData(d=>({

      ...d,

      metas:[
        ...d.metas,
        goal
      ]

    }));

  }





  let content;



  if(page==="new"){

    content=
    <NewEntry
      onSave={addEntry}
      onCancel={()=>setPage("home")}
    />;

  }



  else if(page==="history"){

    content=
    <History
      data={data}
      onDelete={deleteEntry}
    />;

  }



  else if(page==="reports"){

    content=
    <Reports
      data={data}
    />;

  }



  else if(page==="card-details"){

    content=
    <CardDetails

      card={selectedCard}

      onBack={()=>setPage("cards")}

      onPurchase={addPurchase}

      onDeletePurchase={deletePurchase}

      onEditPurchase={editPurchase}

    />;

  }



  else if(page==="cards"){

    content=
    <Cards

      data={data}

      onAdd={addCard}

      onDelete={deleteCard}

      onPurchase={addPurchase}

      onOpen={(card)=>{

        setSelectedCard(card);

        setPage("card-details");

      }}

    />;

  }



  else if(page==="goals"){

    content=
    <Goals

      data={data}

      onAdd={addGoal}

    />;

  }



  else {

    content=
    <Home

      data={data}

      onNew={()=>{

        setPage("new");

      }}

    />;

  }





  return (

    <div className="app-shell">

      {content}


      {
      page!=="new" &&
      <BottomNav

        page={page}

        onChange={setPage}

      />
      }


      <button

        className="reset"

        title="Restaurar dados de demonstração"

        onClick={()=>
          setData(resetData())
        }

      >

        ↺

      </button>


    </div>

  );

}