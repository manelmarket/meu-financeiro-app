import React from "react";

const money = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style:"currency",
    currency:"BRL"
  });


export default function CardDetails({
  card,
  onBack,
  onPurchase
}){


if (!card) {

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
(total,item)=>total + Number(item.valor || 0),
0
);



const disponivel =
card.limite - fatura;



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
display:"flex",
justifyContent:"space-between",
padding:"10px 0"
}}

>

<span>
{item.descricao}
</span>


<strong>
{money(item.valor)}
</strong>


</div>


))


}




<button

className="primary"

onClick={()=>onPurchase(card.id,{})}

style={{
marginTop:"20px"
}}

>

+ Nova compra

</button>


</section>



</div>

)

}