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


return (

<div className="page">

<h1>
📊 Relatórios
</h1>


<div className="section-card">

<h2>
Resumo financeiro
</h2>


<p>
💰 Entradas:
R$ {entradas.toLocaleString("pt-BR")}
</p>


<p>
💸 Gastos:
R$ {gastos.toLocaleString("pt-BR")}
</p>


<p>
📈 Saldo:
R$ {saldo.toLocaleString("pt-BR")}
</p>


</div>


</div>

)

}