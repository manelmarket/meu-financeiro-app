import React from "react";


const money = (v) =>
  v.toLocaleString("pt-BR", {
    style:"currency",
    currency:"BRL"
  });



export default function CardDetails({
  card,
  onBack,
  onPurchase
}){


const fatura =
(card.compras || [])
.filter(item=>item)
.reduce(
(total,item)=>total+item.valor,
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
fontSize:"20px"
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

(card.compras || []).length === 0 ?

<p>
Nenhuma compra lançada
</p>


:

(card.compras || [])
.filter(item=>item)
.map(item=>(


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

onClick={()=>onPurchase(card.id)}

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