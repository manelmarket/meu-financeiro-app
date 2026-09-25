import React, { useState } from "react";

const money = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });


export default function CardDetails({
  card,
  onBack,
  onPurchase,
  onDeletePurchase,
  onEditPurchase
}) {


  const [showForm,setShowForm] = useState(false);

  const [editingId,setEditingId] = useState(null);

  const [showCupom,setShowCupom] = useState(null);


  const [descricao,setDescricao] = useState("");

  const [valor,setValor] = useState("");

  const [categoria,setCategoria] = useState("Alimentação");

  const [data,setData] = useState(
    new Date().toISOString().slice(0,10)
  );

  const [parcelas,setParcelas] = useState(1);

  const [fotoCupom,setFotoCupom] = useState("");



  if(!card){

    return (

      <div className="page">

        <h1>
          Cartão não encontrado
        </h1>

        <button
          className="primary"
          onClick={onBack}
        >
          Voltar
        </button>

      </div>

    );

  }



  const compras =
  (card.compras || [])
  .filter(
    item=>item && item.valor > 0
  );


  const comprasExibicao =
  compras.reduce((lista,item)=>{

    const chave =
    item.parcelaAtual
    ?
    `${item.descricao}-${item.data}-${item.valor}`
    :
    item.id;


    const existente =
    lista.find(
      x=>x.chave===chave
    );


    if(existente){

      existente.totalParcelas =
      item.totalParcelas || existente.totalParcelas;

      existente.parcelas.push(item);

    }else{

      lista.push({

        chave,

        ...item,

        parcelas:[item]

      });

    }


    return lista;

  },[]);



  const fatura =
  compras.reduce(
    (total,item)=>{

      if(
        item.parcelaAtual &&
        item.parcelaAtual !== 1
      ){

        return total;

      }


      return total + Number(item.valor || 0);

    },
    0
  );



  const disponivel =
  card.limite - fatura;



  function escolherImagem(e){

    const arquivo =
    e.target.files[0];


    if(!arquivo) return;


    const leitor =
    new FileReader();


    leitor.onload=()=>{

      setFotoCupom(
        leitor.result
      );

    };


    leitor.readAsDataURL(arquivo);

  }



  function limparFormulario(){

    setDescricao("");

    setValor("");

    setCategoria("Alimentação");

    setData(
      new Date().toISOString().slice(0,10)
    );

    setParcelas(1);

    setFotoCupom("");

    setEditingId(null);

  }




  function abrirEdicao(item){

    setEditingId(item.id);

    setDescricao(item.descricao);

    setValor(item.valor);

    setCategoria(item.categoria);

    setData(item.data);

    setParcelas(item.parcelas || 1);

    setFotoCupom(item.fotoCupom || "");

    setShowForm(true);

  }




  function salvarCompra(){


    const valorNumerico =
    Number(
      String(valor)
      .replace(",",".")
    );



    if(
      !descricao.trim()
      ||
      !valorNumerico
    ){

      return;

    }



    const compra = {

      descricao:
      descricao.trim(),

      valor:
      valorNumerico,

      categoria,

      data,

      parcelas:Number(parcelas),

      fotoCupom

    };



    if(editingId){


      onEditPurchase(
        card.id,
        editingId,
        compra
      );


    }else{


      onPurchase(
        card.id,
        {
          ...compra,
          id:Date.now()
        }
      );


    }



    limparFormulario();

    setShowForm(false);

  }





  return (

    <div className="page">


      <header className="topbar">

        <button

          onClick={onBack}

          style={{
            border:0,
            background:"transparent",
            fontSize:"24px"
          }}

        >

          ←

        </button>


        <div>

          <div className="eyebrow">
            Crédito
          </div>


          <h1>
            💳 {card.nome}
          </h1>

        </div>


      </header>





      <section className="credit-card">

        <small>
          Limite
        </small>


        <strong>
          {money(card.limite)}
        </strong>


        <small>
          Fatura atual:
          {money(fatura)}
        </small>


        <small>
          Disponível:
          {money(disponivel)}
        </small>


      </section>





      <section className="section-card">


        <h2>
          Compras
        </h2>



        {
        compras.length===0 ?


        <p>
          Nenhuma compra lançada
        </p>


        :


        comprasExibicao.map(item=>(


          <div

            key={item.id}

            style={{
              padding:"14px 0",
              borderBottom:"1px solid #eee"
            }}

          >


            <div style={{
              display:"flex",
              justifyContent:"space-between"
            }}>


              <strong>
                {item.descricao}
              </strong>


              <strong>
                {money(item.valor)}
              </strong>


            </div>



            <small>

              {item.categoria}
              {" • "}
              {item.data}
              {" • "}
              Parcelas: {item.parcelas || 1}x

            </small>



            {
            item.fotoCupom &&

            <button

              onClick={()=>
                setShowCupom(item.fotoCupom)
              }

              style={{
                marginTop:"10px",
                border:0,
                background:"#e0f2fe",
                color:"#0369a1",
                borderRadius:"8px",
                padding:"8px 12px"
              }}

            >

              📷 Ver cupom

            </button>

            }



            <div style={{
              display:"flex",
              gap:"8px",
              marginTop:"10px"
            }}>


              <button

                onClick={()=>
                  abrirEdicao(item)
                }

                style={{
                  border:0,
                  background:"#dbeafe",
                  color:"#2563eb",
                  borderRadius:"8px",
                  padding:"6px 10px"
                }}

              >

                ✏️ Editar

              </button>



              <button

                onClick={()=>{

                  if(
                    window.confirm(
                      "Deseja excluir esta compra?"
                    )
                  ){

                    onDeletePurchase(
                      card.id,
                      item.id
                    );

                  }

                }}

                style={{
                  border:0,
                  background:"#fee2e2",
                  color:"#dc2626",
                  borderRadius:"8px",
                  padding:"6px 10px"
                }}

              >

                🗑 Excluir

              </button>


            </div>


          </div>


        ))

        }





        <button

          className="primary"

          onClick={()=>{

            limparFormulario();

            setShowForm(!showForm);

          }}

          style={{
            marginTop:"20px"
          }}

        >

          + Nova compra

        </button>



      </section>





      {
      showForm &&


      <section className="section-card form">


        <h2>

          {
          editingId
          ?
          "Editar compra"
          :
          "Nova compra"
          }

        </h2>



        <label>

          Descrição

          <input

            value={descricao}

            onChange={
              e=>setDescricao(e.target.value)
            }

          />

        </label>




        <label>

          Valor

          <input

            inputMode="decimal"

            value={valor}

            onChange={
              e=>setValor(e.target.value)
            }

          />

        </label>




        <label>

          Categoria

          <select

            value={categoria}

            onChange={
              e=>setCategoria(e.target.value)
            }

          >

            <option>
              Alimentação
            </option>

            <option>
              Transporte
            </option>

            <option>
              Casa
            </option>

            <option>
              Lazer
            </option>

            <option>
              Outros
            </option>

          </select>

        </label>




        <label>

          Data

          <input

            type="date"

            value={data}

            onChange={
              e=>setData(e.target.value)
            }

          />

        </label>




        <label>

          Parcelas

          <select

            value={parcelas}

            onChange={
              e=>setParcelas(e.target.value)
            }

          >

            {
            Array.from(
              {length:12},
              (_,i)=>i+1
            )
            .map(num=>(

              <option key={num}>
                {num}x
              </option>

            ))
            }

          </select>


        </label>




        <label>

          Foto do cupom

          <input

            type="file"

            accept="image/*"

            onChange={escolherImagem}

          />

        </label>




        {
        fotoCupom &&

        <img

          src={fotoCupom}

          alt="Preview"

          style={{
            width:"100%",
            borderRadius:"14px"
          }}

        />

        }




        <button

          className="primary"

          onClick={salvarCompra}

        >

          Salvar

        </button>



      </section>

      }


      {
      showCupom &&

      <div
        style={{
          position:"fixed",
          inset:0,
          background:"rgba(0,0,0,.7)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          zIndex:999
        }}
      >

        <div
          style={{
            background:"#fff",
            padding:"20px",
            borderRadius:"15px"
          }}
        >

          <img
            src={showCupom}
            alt="Cupom"
            style={{
              maxWidth:"90vw",
              maxHeight:"80vh"
            }}
          />

          <button
            onClick={()=>
              setShowCupom(null)
            }
          >
            Fechar
          </button>

        </div>

      </div>

      }

    </div>

  );

}