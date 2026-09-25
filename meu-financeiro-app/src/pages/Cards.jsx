import React from "react";
import { useState } from "react";

const money = (v) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });


export default function Cards({ data, onAdd, onDelete, onPurchase, onOpen }) {

  const [nome,setNome]=useState("");
  const [limite,setLimite]=useState("");

  const [cartaoSelecionado,setCartaoSelecionado]=useState(null);

  const [descricao,setDescricao]=useState("");
  const [valorCompra,setValorCompra]=useState("");



  function excluirCartao(id){

    const confirmar =
    window.confirm(
      "Deseja realmente excluir este cartão?"
    );


    if(confirmar){
      onDelete(id);
    }

  }



  function adicionarCompra(){

    const valor =
    Number(
      String(valorCompra)
      .replace(",",".")
    );


    if(
      descricao.trim()
      &&
      valor > 0
    ){

      onPurchase(
        cartaoSelecionado,
        {
          id:Date.now(),
          descricao:descricao.trim(),
          valor
        }
      );


      setDescricao("");
      setValorCompra("");
      setCartaoSelecionado(null);

    }

  }




return (

<div className="page">


<header className="topbar">

<div>

<div className="eyebrow">
Crédito
</div>

<h1>
💳 Meus cartões
</h1>

</div>

</header>





{
data.cartoes.map(c=>{


const fatura =
(c.compras || [])
.filter(item=>item)
.reduce(
(total,item)=>total+item.valor,
0
);


const disponivel =
c.limite - fatura;



return (

<section
className="credit-card"
key={c.id}
onClick={()=>onOpen(c)}
style={{cursor:"pointer"}}
>



<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>


<span>
{c.nome}
</span>


<button

onClick={(e)=>{
e.stopPropagation();
excluirCartao(c.id);
}}

style={{
border:"0",
background:"rgba(255,255,255,.15)",
color:"#fff",
borderRadius:"10px",
padding:"6px 10px",
fontSize:"12px"
}}

>

🗑

</button>


</div>





<small>
Limite
</small>


<strong>
{money(c.limite)}
</strong>




<small>
Fatura atual:
{money(fatura)}
</small>




<small>
Disponível:
{money(disponivel)}
</small>





<div className="bar dark">

<i
style={{
width:`${Math.min(
100,
(fatura/c.limite)*100
)}%`
}}
/>

</div>




<small>
Vencimento dia {c.vencimento}
</small>




<button

className="primary"

style={{
marginTop:"12px"
}}

onClick={(e)=>{
e.stopPropagation();
setCartaoSelecionado(c.id);
}}

>

+ Compra

</button>





{
(c.compras || []).map(compra=>(

<div
key={compra.id}
style={{
marginTop:"10px",
fontSize:"13px"
}}
>

{compra.descricao}

-
{money(compra.valor)}

</div>

))

}



</section>


)


})

}





{
cartaoSelecionado &&


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

value={valorCompra}

onChange={
e=>setValorCompra(e.target.value)
}

placeholder="250"

/>

</label>



<button

className="primary"

onClick={adicionarCompra}

>

Salvar compra

</button>



</section>

}







<section className="section-card form">


<h2>
Adicionar cartão
</h2>



<label>

Nome

<input

value={nome}

onChange={
e=>setNome(e.target.value)
}

placeholder="Ex: Nubank"

/>

</label>



<label>

Limite

<input

inputMode="decimal"

value={limite}

onChange={
e=>setLimite(e.target.value)
}

placeholder="5000"

/>

</label>




<button

className="primary"

onClick={()=>{


const v =
Number(
String(limite)
.replace(",",".")
);



if(
nome.trim()
&&
v>0
){

onAdd({

id:Date.now(),

nome:nome.trim(),

limite:v,

vencimento:10,

compras:[]

});


setNome("");
setLimite("");

}


}}

>

Adicionar

</button>



</section>


</div>

)

}