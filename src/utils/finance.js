export function totals(items){
  const entradas = items.filter(i=>i.tipo==="entrada").reduce((a,b)=>a+b.valor,0);
  const gastos = items.filter(i=>i.tipo==="saida").reduce((a,b)=>a+b.valor,0);
  return { entradas, gastos, saldo: entradas - gastos };
}

export function byCategory(items){
  const result = {};
  items.filter(i=>i.tipo==="saida").forEach(i=>{
    result[i.categoria] = (result[i.categoria] || 0) + i.valor;
  });
  return result;
}
