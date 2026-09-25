import React, { useState } from "react";

const money = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });


export default function CardDetails({
  card,
  onBack,
  onPurchase
}) {


  const [showForm,setShowForm] = useState(false);

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
  .filter(item=>item);



  const fatura =
  compras.reduce(
    (total,item)=>
      total + Number(item.valor || 0),
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


    leitor.onload = ()=>{

      setFotoCupom(
        leitor.result
      );

    };


    leitor.readAsDataURL(arquivo);

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

      id:Date.now(),

      descricao:
      descricao.trim(),

      valor:
      valorNumerico,

      categoria,

      data,

      parcelas:Number(parcelas),

      fotoCupom

    };



    onPurchase(
      card.id,
      compra
    );



    setDescricao("");

    setValor("");

    setFotoCupom("");

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
        compras.length === 0 ?

        <p>
          Nenhuma compra lançada
        </p>


        :


        compras.map(item=>(

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

            </small>



            {
            item.fotoCupom &&

            <div>

              <img

                src={item.fotoCupom}

                alt="Cupom"

                style={{
                  width:"100%",
                  maxWidth:"220px",
                  borderRadius:"12px",
                  marginTop:"10px"
                }}

              />

            </div>

            }



          </div>


        ))

        }



        <button

          className="primary"

          onClick={()=>setShowForm(!showForm)}

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
          Nova compra
        </h2>



        <label>

          Descrição

          <input

            value={descricao}

            onChange={
              e=>setDescricao(e.target.value)
            }

            placeholder="Ex: Mercado"

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

            placeholder="250"

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

          Salvar compra

        </button>



      </section>


      }



    </div>

  );

}