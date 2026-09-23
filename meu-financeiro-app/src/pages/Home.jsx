const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Home({ data, onNew }) {
  const entradas = data.lancamentos.filter(x => x.tipo === "entrada").reduce((a,b)=>a+b.valor,0);
  const gastos = data.lancamentos.filter(x => x.tipo === "saida").reduce((a,b)=>a+b.valor,0);
  const saldo = entradas - gastos;

  const categorias = data.lancamentos.filter(x=>x.tipo==="saida").reduce((acc, x)=>{
    acc[x.categoria]=(acc[x.categoria]||0)+x.valor; return acc;
  }, {});
  const max = Math.max(1, ...Object.values(categorias));

  return (
    <div className="page">
      <header className="topbar">
        <div><div className="eyebrow">Meu Financeiro</div><h1>Olá, {data.usuario.nome} 👋</h1></div>
        <div className="month">Setembro 2026</div>
      </header>

      <section className="balance-card">
        <span>Saldo disponível</span>
        <strong>{money(saldo)}</strong>
        <small>Atualizado com seus lançamentos</small>
      </section>

      <div className="grid2">
        <section className="mini-card positive"><span>Entradas</span><strong>{money(entradas)}</strong></section>
        <section className="mini-card negative"><span>Gastos</span><strong>{money(gastos)}</strong></section>
      </div>

      <section className="section-card">
        <div className="section-title"><h2>Gastos por categoria</h2></div>
        {Object.entries(categorias).length === 0 ? <p className="muted">Nenhum gasto ainda.</p> :
          Object.entries(categorias).map(([nome, valor]) => (
            <div className="cat-row" key={nome}>
              <div className="cat-head"><span>{nome}</span><b>{money(valor)}</b></div>
              <div className="bar"><i style={{width:`${Math.max(8, valor/max*100)}%`}} /></div>
            </div>
          ))
        }
      </section>

      <section className="section-card">
        <div className="section-title"><h2>Últimos lançamentos</h2></div>
        {[...data.lancamentos].sort((a,b)=>b.id-a.id).slice(0,5).map(item => (
          <div className="transaction" key={item.id}>
            <div><b>{item.descricao}</b><span>{item.categoria} · {item.pagamento}</span></div>
            <strong className={item.tipo==="entrada"?"in":"out"}>{item.tipo==="entrada"?"+":"-"}{money(item.valor)}</strong>
          </div>
        ))}
      </section>

      <button className="primary wide" onClick={onNew}>+ Adicionar lançamento</button>
    </div>
  );
}
