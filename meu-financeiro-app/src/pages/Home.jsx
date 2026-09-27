import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import { ICONE_FRASE } from "./Assistant.jsx";
import { lerData, mesDaData, money, nomeMes, MESES } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { alertas, analiseDoMes } from "../lib/analise.js";
import { diasDesde, lerUltimoBackup, quandoFoi } from "../lib/backup.js";
import { ehSoDemonstracao } from "../storage/storage.js";
import { nomeParaMostrar } from "../lib/perfil.js";
import { usarPonteAndroid } from "../lib/appAndroid.js";
import { agendaDesatualizada, usarAjustes } from "../lib/lembretes.js";
import { textoDoPagamento } from "../lib/cartao.js";

const ICONE_ALERTA = { aviso: "⚠️", ok: "✅", info: "📅" };

// "Fatura do cartão", "Fatura do cartão · paga", "Fatura do cartão · falta R$ 200,00"
function textoDaFatura(v) {
  const pagamento = textoDoPagamento(v);
  return pagamento ? `Fatura do cartão · ${pagamento}` : "Fatura do cartão";
}

// Linha "Backup e nuvem" do Início (e o aviso que vai para os alertas, quando precisa)
function situacaoDosDados(nuvem, ultimoBackup, hoje, demonstracao) {
  if (nuvem?.usuario && nuvem.status !== "desligada") {
    switch (nuvem.status) {
      case "ok":
        return {
          icone: "☁️",
          titulo: "Nuvem ligada",
          texto: `Tudo sincronizado${nuvem.sincronizadoEm ? ` · ${quandoFoi(nuvem.sincronizadoEm)}` : ""}`
        };
      case "offline":
        return { icone: "📴", titulo: "Nuvem ligada", texto: "Sem internet: envio quando a conexão voltar", cor: "warn" };
      case "erro":
        return { icone: "⚠️", titulo: "Nuvem com problema", texto: "Toque para ver", cor: "warn", aviso: `Nuvem: ${nuvem.mensagem}` };
      case "sessao":
        return {
          icone: "⚠️",
          titulo: "Nuvem parada",
          texto: "Entre de novo na sua conta",
          cor: "warn",
          aviso: "Entre de novo na sua conta da nuvem para continuar sincronizando."
        };
      case "escolher":
        return {
          icone: "⚠️",
          titulo: "Falta um passo na nuvem",
          texto: "Escolha como juntar os dados",
          cor: "warn",
          aviso: "Falta escolher como juntar os dados deste aparelho com os da nuvem."
        };
      default:
        return { icone: "🔄", titulo: "Nuvem ligada", texto: "Sincronizando…" };
    }
  }

  const dias = diasDesde(ultimoBackup, hoje);
  if (ultimoBackup && dias !== null) {
    const antigo = dias > 7 && !demonstracao;
    return {
      icone: "💾",
      titulo: "Backup e nuvem",
      texto: `Último backup ${dias === 0 ? "hoje" : `há ${dias} dia${dias > 1 ? "s" : ""}`}`,
      cor: antigo ? "warn" : "",
      aviso: antigo ? `Seu último backup foi há ${dias} dias. Faça um novo ou ligue a nuvem.` : null
    };
  }
  return {
    icone: "💾",
    titulo: "Backup e nuvem",
    texto: "Seus dados estão só neste aparelho",
    cor: demonstracao ? "" : "warn",
    aviso: demonstracao ? null : "Seus dados estão só neste aparelho. Faça um backup ou ligue a nuvem para não perder nada."
  };
}

export default function Home({ data, hoje, nuvem, onNew, onOpenBills, onOpenCard, onOpenPage }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesHoje);
  const r = useMemo(() => resumoDoMes(data, mes, hoje), [data, mes, hoje]);
  const demonstracao = useMemo(() => ehSoDemonstracao(data), [data]);
  const situacao = situacaoDosDados(nuvem, lerUltimoBackup(), hoje, demonstracao);
  const alertasDoMes = useMemo(() => alertas(data, hoje), [data, hoje]);
  // lembretes no celular sem o canal automático: avisa quando precisam ser atualizados
  const ponte = usarPonteAndroid();
  const ajustesDosLembretes = usarAjustes();
  const lembretesVelhos = useMemo(
    () => ponte.situacao === "sem-canal" && agendaDesatualizada(data, ajustesDosLembretes),
    [ponte.situacao, data, ajustesDosLembretes]
  );
  const avisos = [
    ...alertasDoMes,
    ...(lembretesVelhos
      ? [
          {
            id: "lembretes",
            tipo: "info",
            pagina: "lembretes",
            texto: "Seus lembretes no celular precisam ser atualizados. Toque aqui e depois em Atualizar lembretes."
          }
        ]
      : []),
    ...(situacao.aviso ? [{ id: "dados", tipo: "aviso", texto: situacao.aviso, pagina: "backup" }] : [])
  ];
  const frases = useMemo(() => analiseDoMes(data, mes, hoje), [data, mes, hoje]);

  const maior = Math.max(1, ...r.categorias.map(([, v]) => v));

  function abrirAlerta(a) {
    if (a.cartaoId != null) onOpenCard(a.cartaoId);
    else if (a.pagina) onOpenPage(a.pagina);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Meu mês</div>
          <h1>Olá, {nomeParaMostrar(data.usuario, nuvem?.usuario) || "você"} 👋</h1>
        </div>
      </header>

      {avisos.length > 0 && (
        <section className="alerts" aria-label="Alertas">
          {avisos.map((a) => (
            <button
              type="button"
              key={a.id}
              className={`alert ${a.tipo}`}
              onClick={() => abrirAlerta(a)}
              disabled={a.cartaoId == null && !a.pagina}
            >
              <span aria-hidden="true">{ICONE_ALERTA[a.tipo]}</span>
              <p>{a.texto}</p>
            </button>
          ))}
        </section>
      )}

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <section className="balance-card">
        <span>Saldo do mês</span>
        <strong className={r.saldo < 0 ? "neg" : ""}>{money(r.saldo)}</strong>
        <small>Receitas menos despesas de {nomeMes(mes)}</small>
      </section>

      <div className="grid2">
        <section className="mini-card positive">
          <span>Receita</span>
          <strong>{money(r.receitas)}</strong>
        </section>
        <section className="mini-card negative">
          <span>Despesas</span>
          <strong>{money(r.despesas)}</strong>
        </section>
      </div>

      <p className="origin-line">
        Despesas = lançamentos {money(r.origem.lancamentos)} + faturas {money(r.origem.cartoes)} + contas fixas{" "}
        {money(r.origem.fixas)}
      </p>

      <nav className="shortcuts" aria-label="Atalhos">
        <button type="button" onClick={onOpenBills}>
          <span aria-hidden="true">🔁</span>Contas fixas
        </button>
        <button type="button" onClick={() => onOpenPage("investments")}>
          <span aria-hidden="true">📈</span>Investimentos
        </button>
        <button type="button" onClick={() => onOpenPage("patrimony")}>
          <span aria-hidden="true">🏦</span>Patrimônio
        </button>
        <button type="button" onClick={() => onOpenPage("assistant")}>
          <span aria-hidden="true">✨</span>Assistente
        </button>
      </nav>

      <button
        type="button"
        className={`cloud-row${situacao.cor ? ` ${situacao.cor}` : ""}`}
        onClick={() => onOpenPage("backup")}
      >
        <span className="cloud-icon" aria-hidden="true">
          {situacao.icone}
        </span>
        <span className="cloud-text">
          <b>{situacao.titulo}</b>
          <small>{situacao.texto}</small>
        </span>
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      </button>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Análise do mês</h2>
          <button className="link" onClick={() => onOpenPage("assistant")}>
            ver mais
          </button>
        </div>
        <ul className="insights">
          {frases.slice(0, 3).map((f, i) => (
            <li key={i} className={`insight ${f.tipo}`}>
              <span aria-hidden="true">{ICONE_FRASE[f.tipo]}</span>
              <p>{f.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Despesas por categoria</h2>
          <button className="link" onClick={() => onOpenPage("orcamentos")}>
            orçamentos
          </button>
        </div>
        {r.categorias.length === 0 ? (
          <p className="muted">Nenhuma despesa neste mês.</p>
        ) : (
          r.categorias.map(([nome, valor]) => (
            <div className="cat-row" key={nome}>
              <div className="cat-head">
                <span>{nome}</span>
                <b>
                  {money(valor)} · {Math.round((valor / (r.despesas || 1)) * 100)}%
                </b>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.max(4, (valor / maior) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Vencimentos do mês</h2>
        </div>
        {r.vencimentos.length === 0 ? (
          <p className="muted">Nada vencendo neste mês.</p>
        ) : (
          r.vencimentos.map((v) => {
            const { m, d } = lerData(v.data);
            const clicavel = v.tipo === "fatura";
            return (
              <div
                className={`due-row${clicavel ? " clickable" : ""}`}
                key={v.id}
                onClick={clicavel ? () => onOpenCard(v.cartaoId) : undefined}
              >
                <div className="due-day">
                  <b>{String(d).padStart(2, "0")}</b>
                  <span>{MESES[m - 1].slice(0, 3)}</span>
                </div>
                <div className="due-info">
                  <b>{v.descricao}</b>
                  <span>{v.tipo === "fatura" ? textoDaFatura(v) : "Conta fixa"}</span>
                </div>
                <strong>{money(v.valor)}</strong>
              </div>
            );
          })
        )}
        <button className="ghost wide" onClick={onOpenBills}>
          🔁 Contas fixas
        </button>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Lançamentos do mês</h2>
        </div>
        {r.lancamentos.length === 0 ? (
          <p className="muted">Nenhum lançamento neste mês.</p>
        ) : (
          r.lancamentos.slice(0, 5).map((item) => (
            <div className="transaction" key={item.id}>
              <div>
                <b>{item.descricao}</b>
                <span>
                  {item.categoria} · {item.pagamento}
                </span>
              </div>
              <strong className={item.tipo === "entrada" ? "in" : "out"}>
                {item.tipo === "entrada" ? "+" : "-"}
                {money(item.valor)}
              </strong>
            </div>
          ))
        )}
      </section>

      <button className="primary wide" onClick={onNew}>
        + Adicionar lançamento
      </button>
    </div>
  );
}
