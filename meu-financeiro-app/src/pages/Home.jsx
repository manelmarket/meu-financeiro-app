import React, { useMemo, useState } from "react";
import { AlertTriangle, BadgeDollarSign, Bell, Bot, CalendarClock, Cloud, CloudOff, Eye, EyeOff, HardDrive, Landmark, LineChart, RefreshCw, Repeat, Repeat2, Sparkles, TrendingUp, Users } from "lucide-react";
import { esconderValores, usarValoresEscondidos } from "../lib/privacidade.js";
import MonthPicker from "../components/MonthPicker.jsx";
import Notificacoes from "../components/Notificacoes.jsx";
import HeroBanco from "../components/HeroBanco.jsx";
import { usarAparencia } from "../lib/aparencia.js";
import { previsaoDoMes } from "../lib/previsao.js";
import { resumoDaSemana, textoDoResumo } from "../lib/semana.js";
import { acharAssinaturas } from "../lib/assinaturas.js";
import { Volume2 } from "lucide-react";
import { receitasParaConfirmar } from "../lib/receitasFixas.js";
import { diaMesBR } from "../lib/formato.js";
import { IconeFrase } from "./Assistant.jsx";
import { lerData, mesDaData, money, nomeMes, MESES } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { alertas, analiseDoMes } from "../lib/analise.js";
import { diasDesde, lerUltimoBackup, quandoFoi } from "../lib/backup.js";
import { ehSoDemonstracao } from "../storage/storage.js";
import { nomeParaMostrar } from "../lib/perfil.js";
import { usarPonteAndroid } from "../lib/appAndroid.js";
import { agendaDesatualizada, usarAjustes } from "../lib/lembretes.js";
import { textoDoPagamento } from "../lib/cartao.js";
import { conquistas, conquistasNovas } from "../lib/conquistas.js";
import { infoDaCategoria, mapaDeCategorias } from "../lib/categorias.js";

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
          Icone: nuvem.familia ? Users : Cloud,
          titulo: nuvem.familia ? "Nuvem da família" : "Nuvem ligada",
          texto: `Tudo sincronizado${nuvem.sincronizadoEm ? ` · ${quandoFoi(nuvem.sincronizadoEm)}` : ""}`
        };
      case "offline":
        return { Icone: CloudOff, titulo: "Nuvem ligada", texto: "Sem internet: envio quando a conexão voltar", cor: "warn" };
      case "erro":
        return { Icone: AlertTriangle, titulo: "Nuvem com problema", texto: "Toque para ver", cor: "warn", aviso: `Nuvem: ${nuvem.mensagem}` };
      case "sessao":
        return {
          Icone: AlertTriangle,
          titulo: "Nuvem parada",
          texto: "Entre de novo na sua conta",
          cor: "warn",
          aviso: "Entre de novo na sua conta da nuvem para continuar sincronizando."
        };
      case "escolher":
        return {
          Icone: AlertTriangle,
          titulo: "Falta um passo na nuvem",
          texto: "Escolha como juntar os dados",
          cor: "warn",
          aviso: "Falta escolher como juntar os dados deste aparelho com os da nuvem."
        };
      default:
        return { Icone: RefreshCw, titulo: "Nuvem ligada", texto: "Sincronizando…" };
    }
  }

  const dias = diasDesde(ultimoBackup, hoje);
  if (ultimoBackup && dias !== null) {
    const antigo = dias > 7 && !demonstracao;
    return {
      Icone: HardDrive,
      titulo: "Backup e nuvem",
      texto: `Último backup ${dias === 0 ? "hoje" : `há ${dias} dia${dias > 1 ? "s" : ""}`}`,
      cor: antigo ? "warn" : "",
      aviso: antigo ? `Seu último backup foi há ${dias} dias. Faça um novo ou ligue a nuvem.` : null
    };
  }
  return {
    Icone: HardDrive,
    titulo: "Backup e nuvem",
    texto: "Seus dados estão só neste aparelho",
    cor: demonstracao ? "" : "warn",
    aviso: demonstracao ? null : "Seus dados estão só neste aparelho. Faça um backup ou ligue a nuvem para não perder nada."
  };
}

export default function Home({ data, hoje, nuvem, perfil, onNew, onOpenBills, onOpenCard, onOpenPage, onReceber, onNaoVeio }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesHoje);
  const [notifAberto, setNotifAberto] = useState(false);
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
  // gamificação: conquista nova desde a última vez (neste aparelho).
  // Num aparelho que acabou de entrar na conta, espera os dados chegarem da nuvem (o que já existia não é "novo").
  const dadosProntos =
    !nuvem?.usuario || nuvem.status === "desligada" || nuvem.status === "ok" || Boolean(nuvem.sincronizadoEm);
  const novasConquistas = useMemo(
    () => (dadosProntos ? conquistasNovas(conquistas(data, hoje, { familia: Boolean(nuvem?.familia) })) : []),
    [data, hoje, nuvem?.familia?.id, dadosProntos]
  );
  // os "vence hoje/amanhã/em tal dia" viram o botão Vencimentos; o resto vai para o sino de notificações
  const vencendo = alertasDoMes.filter((a) => a.id.startsWith("vence-")).length;
  const avisos = [
    ...(nuvem?.aviso ? [{ id: "aviso-nuvem", tipo: "info", pagina: "familia", texto: nuvem.aviso }] : []),
    ...(novasConquistas.length
      ? [
          {
            id: "conquistas",
            tipo: "ok",
            pagina: "conquistas",
            texto:
              novasConquistas.length === 1
                ? `Nova conquista: ${novasConquistas[0].icone} ${novasConquistas[0].titulo}! Toque para ver.`
                : `Novas conquistas: ${novasConquistas.map((c) => `${c.icone} ${c.titulo}`).join(", ")}! Toque para ver.`
          }
        ]
      : []),
    ...alertasDoMes.filter((a) => !a.id.startsWith("vence-")),
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
  const previsao = useMemo(() => previsaoDoMes(data, hoje), [data, hoje]);
  const confirmar = useMemo(() => receitasParaConfirmar(data, hoje), [data, hoje]);
  const semana = useMemo(() => resumoDaSemana(data, hoje), [data, hoje]);
  const assinaturas = useMemo(() => acharAssinaturas(data, hoje).filter((a) => a.ativa), [data, hoje]);
  // o resumo da semana aparece uma vez por semana (some no "Ok")
  const [resumoVisto, setResumoVisto] = useState(() => {
    try {
      return localStorage.getItem("meu_financeiro_resumo_visto") || "";
    } catch {
      return "";
    }
  });
  const mostrarResumo = resumoVisto !== semana.semana && (semana.total > 0 || semana.aPagar.length > 0);
  function fecharResumo() {
    try {
      localStorage.setItem("meu_financeiro_resumo_visto", semana.semana);
    } catch {
      // aparece de novo na próxima abertura
    }
    setResumoVisto(semana.semana);
  }
  function ouvirResumo() {
    try {
      const fala = new SpeechSynthesisUtterance(textoDoResumo(semana).join(" ").replace(/R\$\s?/g, ""));
      fala.lang = "pt-BR";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(fala);
    } catch {
      // sem voz neste aparelho
    }
  }

  const maior = Math.max(1, ...r.categorias.map(([, v]) => v));
  const mapa = useMemo(() => mapaDeCategorias(data), [data]);

  function abrirAlerta(a) {
    if (a.cartaoId != null) onOpenCard(a.cartaoId);
    else if (a.pagina) onOpenPage(a.pagina);
  }

  // estilos Banco digital e Vidro: o topo vira o saldo em destaque com as ações rápidas
  const { estilo } = usarAparencia();
  const escondido = usarValoresEscondidos();
  const heroi = estilo === "banco" || estilo === "vidro";

  return (
    <>
    {heroi && (
      <HeroBanco
        data={data}
        perfil={perfil}
        conta={nuvem?.usuario}
        mes={mes}
        saldoDoMes={r.saldo}
        avisos={avisos.length}
        onNotificacoes={() => setNotifAberto(true)}
        onNew={onNew}
        onOpenPage={onOpenPage}
      />
    )}
    <div className={`page${heroi ? " page-heroi" : ""}`}>
      {!heroi && (
      <header className="topbar com-sino">
        <div>
          <div className="eyebrow">{nomeMes(mesHoje)} de {mesHoje.slice(0, 4)}</div>
          <h1>Olá, {nomeParaMostrar(perfil || data.usuario, nuvem?.usuario) || "você"}</h1>
        </div>
        <button
          type="button"
          className="notif-btn olho-btn"
          aria-label={escondido ? "Mostrar valores" : "Esconder valores"}
          title={escondido ? "Mostrar valores" : "Esconder valores"}
          onClick={() => esconderValores(!escondido)}
        >
          {escondido ? <EyeOff size={20} strokeWidth={2.4} /> : <Eye size={20} strokeWidth={2.4} />}
        </button>
        <button
          type="button"
          className="notif-btn"
          title="Notificações"
          aria-label={avisos.length > 0 ? `Notificações (${avisos.length})` : "Notificações"}
          onClick={() => setNotifAberto(true)}
        >
          <Bell size={20} strokeWidth={2.4} />
          {avisos.length > 0 && (
            <span className="notif-badge" aria-hidden="true">
              {avisos.length > 9 ? "9+" : avisos.length}
            </span>
          )}
        </button>
      </header>
      )}

      <button type="button" className="cloud-row due-btn" onClick={() => onOpenPage("jarvis")}>
        <span className="cloud-icon" aria-hidden="true">
          <Bot size={20} />
        </span>
        <span className="cloud-text">
          <b>Fale com o Jarvis</b>
          <small>Lance, corrija, pague e pergunte do seu jeito</small>
        </span>
      </button>

      {confirmar.map(({ receita, mes: mesDaReceita, data: dia }) => (
        <section className="cloud-row confirmar-receita" key={`${receita.id}-${mesDaReceita}`}>
          <span className="cloud-icon" aria-hidden="true">
            <BadgeDollarSign size={20} />
          </span>
          <span className="cloud-text">
            <b>
              {receita.nome}: {money(Number(receita.valor))}
            </b>
            <small>Era para cair em {diaMesBR(dia)}. Recebeu?</small>
          </span>
          <span className="confirmar-botoes">
            <button type="button" className="ghost" onClick={() => onNaoVeio?.(receita.id, mesDaReceita)}>
              Não veio
            </button>
            <button type="button" className="primary" onClick={() => onReceber?.(receita.id, mesDaReceita)}>
              Recebi
            </button>
          </span>
        </section>
      ))}

      {mostrarResumo && (
        <section className="section-card resumo-semana" aria-label="Resumo da semana">
          <div className="section-title">
            <h2 className="no-margin">Resumo da semana</h2>
            {"speechSynthesis" in window && (
              <button type="button" className="link resumo-ouvir" onClick={ouvirResumo}>
                <Volume2 size={15} /> ouvir
              </button>
            )}
          </div>
          <ul className="insights">
            {textoDoResumo(semana).map((t, i) => (
              <li key={i} className="insight">
                <IconeFrase tipo={i === 0 ? "ok" : t.includes("fora do padrão") ? "aviso" : t.includes("vence") ? "info" : "dica"} />
                <p>{t}</p>
              </li>
            ))}
          </ul>
          <button type="button" className="ghost wide" onClick={fecharResumo}>
            Ok, entendi
          </button>
        </section>
      )}

      <button type="button" className="cloud-row due-btn previsao-row" onClick={() => onOpenPage("mes", { aba: "previsao", mes: mesHoje })}>
        <span className="cloud-icon" aria-hidden="true">
          <LineChart size={20} />
        </span>
        <span className="cloud-text">
          <b>
            {previsao.previsto >= 0 ? "Sobram" : "Faltam"} <span className={previsao.previsto < 0 ? "neg-texto" : "pos-texto"}>{money(Math.abs(previsao.previsto))}</span> até {diaMesBR(previsao.fim)}
          </b>
          <small>
            Previsão se nada mudar
            {previsao.totalPagar > 0 ? ` · ${money(previsao.totalPagar)} a pagar` : ""}
            {previsao.totalReceber > 0 ? ` · ${money(previsao.totalReceber)} a receber` : ""}
          </small>
        </span>
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      </button>

      {assinaturas.length > 0 && (
        <button type="button" className="cloud-row due-btn" onClick={() => onOpenPage("assinaturas")}>
          <span className="cloud-icon" aria-hidden="true">
            <Repeat2 size={20} />
          </span>
          <span className="cloud-text">
            <b>
              {assinaturas.length} {assinaturas.length === 1 ? "assinatura" : "assinaturas"} · {money(assinaturas.reduce((t, a) => t + a.anual, 0))}/ano
            </b>
            <small>Você ainda usa todas?</small>
          </span>
          <span className="chevron" aria-hidden="true">
            ›
          </span>
        </button>
      )}

      <button type="button" className="cloud-row due-btn" onClick={() => onOpenPage("vencimentos")}>
        <span className="cloud-icon com-badge" aria-hidden="true">
          <CalendarClock size={20} />
          {vencendo > 0 && <i className="notif-badge">{vencendo > 9 ? "9+" : vencendo}</i>}
        </span>
        <span className="cloud-text">
          <b>Vencimentos</b>
          <small>
            {vencendo === 0
              ? "Nada vencendo nos próximos dias"
              : vencendo === 1
                ? "1 conta ou fatura vence nos próximos dias"
                : `${vencendo} contas e faturas vencem nos próximos dias`}
          </small>
        </span>
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      </button>

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <button type="button" className="balance-card card-botao" onClick={() => onOpenPage("mes", { aba: "saldo", mes })}>
        <span>Saldo do mês</span>
        <strong className={r.saldo < 0 ? "neg" : ""}>{money(r.saldo)}</strong>
        <small>Receitas menos despesas de {nomeMes(mes)} · toque para ver</small>
      </button>

      <div className="grid2">
        <button type="button" className="mini-card positive card-botao" onClick={() => onOpenPage("mes", { aba: "receitas", mes })}>
          <span>Receita</span>
          <strong>{money(r.receitas)}</strong>
        </button>
        <button type="button" className="mini-card negative card-botao" onClick={() => onOpenPage("mes", { aba: "despesas", mes })}>
          <span>Despesas</span>
          <strong>{money(r.despesas)}</strong>
        </button>
      </div>

      <p className="origin-line">
        Despesas = lançamentos {money(r.origem.lancamentos)} + faturas {money(r.origem.cartoes)} + contas fixas{" "}
        {money(r.origem.fixas)}
      </p>

      <nav className="shortcuts" aria-label="Atalhos">
        <button type="button" onClick={onOpenBills}>
          <Repeat size={20} aria-hidden="true" />Contas fixas
        </button>
        <button type="button" onClick={() => onOpenPage("investments")}>
          <TrendingUp size={20} aria-hidden="true" />Investimentos
        </button>
        <button type="button" onClick={() => onOpenPage("patrimony")}>
          <Landmark size={20} aria-hidden="true" />Patrimônio
        </button>
        <button type="button" onClick={() => onOpenPage("assistant")}>
          <Sparkles size={20} aria-hidden="true" />Assistente
        </button>
      </nav>

      <button
        type="button"
        className={`cloud-row${situacao.cor ? ` ${situacao.cor}` : ""}`}
        onClick={() => onOpenPage("backup")}
      >
        <span className="cloud-icon" aria-hidden="true">
          {(() => { const I = situacao.Icone; return <I size={20} />; })()}
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
              <IconeFrase tipo={f.tipo} />
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
          r.categorias.map(([nome, valor]) => {
            const c = infoDaCategoria(data, nome, mapa);
            return (
              <div className="cat-row" key={nome}>
                <div className="cat-head">
                  <span>
                    <span aria-hidden="true">{c.icone}</span> {c.nome}
                  </span>
                  <b>
                    {money(valor)} · {Math.round((valor / (r.despesas || 1)) * 100)}%
                  </b>
                </div>
                <div className="bar">
                  <i style={{ width: `${Math.max(4, (valor / maior) * 100)}%`, background: c.cor }} />
                </div>
              </div>
            );
          })
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
                  <span>{v.tipo === "fatura" ? textoDaFatura(v) : v.status === "paga" ? "Conta fixa · paga" : "Conta fixa"}</span>
                </div>
                <strong>{money(v.valor)}</strong>
              </div>
            );
          })
        )}
        <button className="ghost wide" onClick={onOpenBills}>
          <Repeat size={16} aria-hidden="true" /> Contas fixas
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
                  <span aria-hidden="true">{infoDaCategoria(data, item.categoria, mapa).icone}</span> {item.categoria} · {item.pagamento}
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

      {notifAberto && (
        <Notificacoes
          avisos={avisos}
          onAbrir={(a) => {
            setNotifAberto(false);
            abrirAlerta(a);
          }}
          onFechar={() => setNotifAberto(false)}
        />
      )}
    </div>
    </>
  );
}
