import React from "react";

export default function Reports({data}){

const lancamentos = data?.lancamentos || [];


const entradas =
lancamentos
.filter(item=>item.tipo==="entrada")
.reduce((total,item)=>total+item.valor,0);


const gastos =
lancamentos
.filter(item=>item.tipo==="saida")
.reduce((total,item)=>total+item.valor,0);


const saldo = entradas - gastos;


const economia = entradas > 0
? Math.round((saldo / entradas) * 100)
: 0;


const categorias = {};

lancamentos
.filter(item=>item.tipo==="saida")
.forEach(item=>{

if(!categorias[item.categoria]){
categorias[item.categoria]=0;
}

categorias[item.categoria]+=item.valor;

});


const maiorCategoria =
Math.max(...Object.values(categorias),1);



return (

<div className="page">


<header className="topbar">

<div>

<div className="eyebrow">
Análise financeira
</div>

<h1>
📊 Relatórios
</h1>

</div>

</header>



<div className="grid2">


<section className="mini-card positive">

<span>
Entradas
</span>

<strong>
R$ {entradas.toLocaleString("pt-BR")}
</strong>

</section>



<section className="mini-card negative">

<span>
Gastos
</span>

<strong>
R$ {gastos.toLocaleString("pt-BR")}
</strong>

</section>


</div>





<section className="section-card">


<h2>
Saldo atual
</h2>


<strong style={{fontSize:"28px"}}>

R$ {saldo.toLocaleString("pt-BR")}

</strong>


</section>





<section className="section-card">


<h2>
Economia mensal
</h2>


<div className="goal-head">

<span>
Você economizou
</span>


<strong>
{economia}%
</strong>


</div>



<div className="bar">

<i
style={{
width:`${Math.max(economia,0)}%`
}}
/>

</div>


</section>







<section className="section-card">


<h2>
Gastos por categoria
</h2>



{
Object.entries(categorias).length === 0 ?

<p className="muted">
Nenhum gasto registrado
</p>


:


Object.entries(categorias)
.map(([categoria,valor])=>(


<div className="cat-row" key={categoria}>


<div className="cat-head">

<span>
{categoria}
</span>


<b>
R$ {valor.toLocaleString("pt-BR")}
</b>


</div>



<div className="bar">

<i
style={{
width:`${(valor/maiorCategoria)*100}%`
}}
/>

</div>


</div>


))


}


</section>



</div>


)

}