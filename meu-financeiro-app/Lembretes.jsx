import React, { useEffect, useMemo, useState } from "react";
import { BellOff, BellRing, CalendarClock, CreditCard, Download, LoaderCircle, Repeat, Smartphone } from "lucide-react";
import { Interruptor } from "./Temas.jsx";
import { ENDERECO_DO_APK, abrirNoApp, esquecerAvisoDeFalha, pedirAoApp, usarPonteAndroid } from "../lib/appAndroid.js";
import {
  HORAS,
  OPCOES_DE_DIAS,
  assinaturaDasRegras,
  montarAgenda,
  mudarAjustes,
  quandoAvisa,
  rotuloDeDias,
  textoDoLembrete,
  tituloDoLembrete,
  usarAjustes
} from "../lib/lembretes.js";

const SEM_CONVERSA = "Não consegui falar com o app agora. Feche e abra o app e tente de novo.";

function BaixarApp({ texto }) {
  return (
    <a className="primary wide lemb-baixar" href={ENDERECO_DO_APK} download="meu-financeiro.apk">
      <Download size={18} strokeWidth={2.4} />
      {texto}
    </a>
  );
}

function PassosDoApk() {
  return (
    <ol className="lemb-passos">
      <li>Toque no botão abaixo para baixar o app.</li>
      <li>Abra o arquivo baixado e toque em Instalar (ou Atualizar).</li>
      <li>Abra o Meu Financeiro pelo ícone e volte a esta tela.</li>
    </ol>
  );
}

export default function Lembretes({ data, onBack }) {
  const ponte = usarPonteAndroid();
  const ajustes = usarAjustes();
  const [mensagem, setMensagem] = useState(null); // { tipo: "ok" | "erro" | "info", texto }
  const [ocupado, setOcupado] = useState(false);
  const agenda = useMemo(() => montarAgenda(data, ajustes), [data, ajustes]);

  // o celular não conseguiu abrir o app Android: os lembretes não foram ligados
  useEffect(() => {
    if (ponte.naoAbriu && ajustes.ativo) mudarAjustes({ ativo: false });
  }, [ponte.naoAbriu]);

  const { situacao, app } = ponte;
  const noAppNovo = situacao === "aguardando" || situacao === "conectado" || situacao === "sem-canal";
  const conectado = situacao === "conectado";
  const bloqueadas = conectado && app && !app.notificacoes;

  function avisar(tipo, texto) {
    esquecerAvisoDeFalha();
    setMensagem({ tipo, texto });
  }

  function marcarEnvio(extra = {}) {
    mudarAjustes({ ...extra, enviadoEm: Date.now(), assinatura: assinaturaDasRegras(data, ajustes) });
  }

  // liga (ou pede a permissão das notificações de novo)
  function ativar() {
    if (conectado && app?.notificacoes) {
      mudarAjustes({ ativo: true }); // a agenda vai sozinha para o celular
      avisar("ok", "Lembretes ativados neste celular.");
      return;
    }
    marcarEnvio({ ativo: true });
    abrirNoApp("ativar", agenda);
    avisar("info", "Se o celular perguntar, toque em Permitir para receber as notificações.");
  }

  async function desligar() {
    if (conectado) {
      setOcupado(true);
      try {
        const r = await pedirAoApp("desligar");
        if (!r.ok) throw new Error("recusou");
        mudarAjustes({ ativo: false });
        avisar("ok", "Lembretes desligados neste celular.");
      } catch {
        avisar("erro", SEM_CONVERSA);
      } finally {
        setOcupado(false);
      }
      return;
    }
    mudarAjustes({ ativo: false });
    abrirNoApp("desligar");
    avisar("ok", "Lembretes desligados neste celular.");
  }

  async function testar() {
    if (conectado && app?.notificacoes) {
      setOcupado(true);
      try {
        const r = await pedirAoApp("teste");
        if (r.ok) avisar("ok", "Pronto! Confira a notificação de teste no celular.");
        else avisar("erro", "As notificações do app estão bloqueadas. Toque em Permitir notificações.");
      } catch {
        avisar("erro", SEM_CONVERSA);
      } finally {
        setOcupado(false);
      }
      return;
    }
    abrirNoApp("teste");
    avisar("info", "Se o celular perguntar, toque em Permitir. A notificação de teste aparece em seguida.");
  }

  // sem o canal de mensagens: a pessoa manda a agenda nova para o celular
  function atualizar() {
    marcarEnvio();
    abrirNoApp("ativar", agenda);
    avisar("ok", "Lembretes atualizados neste celular.");
  }

  let status;
  if (situacao === "navegador") {
    status = (
      <>
        <div className="lemb-status-topo">
          <span className="lemb-icone" aria-hidden="true">
            <Smartphone size={22} />
          </span>
          <span className="settings-text">
            <b>Lembretes chegam pelo app Android</b>
            <small>
              Receba uma notificação no celular antes do vencimento das faturas dos cartões e das contas fixas, mesmo
              com o app fechado. Instale o app Android do Meu Financeiro no celular e ative os lembretes por lá.
            </small>
          </span>
        </div>
        <PassosDoApk />
        <BaixarApp texto="Baixar o app Android" />
      </>
    );
  } else if (situacao === "app-antigo") {
    status = (
      <>
        <div className="lemb-status-topo">
          <span className="lemb-icone aviso" aria-hidden="true">
            <Download size={22} />
          </span>
          <span className="settings-text">
            <b>Atualize o app Android</b>
            <small>
              Os lembretes precisam da versão nova do app Android. Seus dados continuam como estão: é só instalar por
              cima.
            </small>
          </span>
        </div>
        <PassosDoApk />
        <BaixarApp texto="Baixar app atualizado" />
      </>
    );
  } else if (situacao === "aguardando") {
    status = (
      <div className="lemb-status-topo">
        <span className="lemb-icone" aria-hidden="true">
          <LoaderCircle size={22} className="girando" />
        </span>
        <span className="settings-text">
          <b>Conectando ao app…</b>
          <small>Só um instante.</small>
        </span>
      </div>
    );
  } else {
    const ligado = ajustes.ativo;
    let detalhe;
    if (!ligado) detalhe = "Ative para receber uma notificação antes de cada vencimento, mesmo com o app fechado.";
    else if (conectado && app) {
      detalhe =
        app.agendados > 0
          ? `${app.agendados} lembrete${app.agendados > 1 ? "s" : ""} agendado${app.agendados > 1 ? "s" : ""}${
              app.proximo ? ` · próximo: ${quandoAvisa(app.proximo)}` : ""
            }`
          : "Nenhum vencimento para avisar nos próximos meses.";
    } else {
      detalhe = ajustes.enviadoEm
        ? `Atualizados em ${quandoAvisa(ajustes.enviadoEm)}. Depois de mudar cartões, contas fixas ou os ajustes abaixo, toque em Atualizar lembretes.`
        : "Toque em Atualizar lembretes para enviar os vencimentos ao celular.";
    }
    status = (
      <>
        <div className="lemb-status-topo">
          <span className={`lemb-icone${ligado ? " ligado" : ""}`} aria-hidden="true">
            {ligado ? <BellRing size={22} /> : <BellOff size={22} />}
          </span>
          <span className="settings-text">
            <b>{ligado ? "Lembretes ligados neste celular" : "Lembretes desligados"}</b>
            <small>{detalhe}</small>
          </span>
        </div>

        {ligado && bloqueadas && (
          <p className="lemb-alerta">
            As notificações do Meu Financeiro estão bloqueadas neste celular. Toque em Permitir notificações.
          </p>
        )}

        <div className="lemb-botoes">
          {!ligado && (
            <button type="button" className="primary wide" onClick={ativar} disabled={ocupado}>
              <BellRing size={18} strokeWidth={2.4} /> Ativar lembretes
            </button>
          )}
          {ligado && bloqueadas && (
            <button type="button" className="primary wide" onClick={ativar} disabled={ocupado}>
              Permitir notificações
            </button>
          )}
          {ligado && situacao === "sem-canal" && (
            <button type="button" className="primary wide" onClick={atualizar} disabled={ocupado}>
              Atualizar lembretes
            </button>
          )}
          {ligado && (
            <div className="lemb-botoes-linha">
              <button type="button" className="ghost" onClick={testar} disabled={ocupado}>
                Enviar teste
              </button>
              <button type="button" className="ghost" onClick={desligar} disabled={ocupado}>
                Desligar
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Avisos no celular</div>
          <h1>🔔 Lembretes</h1>
        </div>
      </header>

      <section className="section-card lemb-status">
        {status}
        {mensagem && !ponte.naoAbriu && (
          <p className={`lemb-mensagem ${mensagem.tipo}`} role="status">
            {mensagem.texto}
          </p>
        )}
        {ponte.naoAbriu && (
          <div className="lemb-mensagem erro" role="alert">
            <p>Não consegui abrir o app Android. Confira se ele está atualizado:</p>
            <BaixarApp texto="Baixar app atualizado" />
          </div>
        )}
      </section>

      {noAppNovo && situacao !== "aguardando" && (
        <section className="section-card">
          <h2>Como avisar</h2>
          <div className="lemb-campo">
            <span className="lemb-rotulo">Quando</span>
            <div className="chips no-margin" role="radiogroup" aria-label="Quando avisar">
              {OPCOES_DE_DIAS.map((d) => (
                <button
                  type="button"
                  key={d}
                  role="radio"
                  aria-checked={ajustes.dias === d}
                  className={ajustes.dias === d ? "active-chip" : ""}
                  onClick={() => mudarAjustes({ dias: d })}
                >
                  {rotuloDeDias(d)}
                </button>
              ))}
            </div>
          </div>
          <label className="lemb-campo lemb-hora">
            <span className="lemb-rotulo">Horário</span>
            <select value={ajustes.hora} onChange={(e) => mudarAjustes({ hora: Number(e.target.value) })}>
              {HORAS.map((h) => (
                <option key={h} value={h}>
                  {h}h
                </option>
              ))}
            </select>
          </label>
          <div className="lemb-linha">
            <span className="lemb-icone pequeno" aria-hidden="true">
              <CreditCard size={18} />
            </span>
            <span className="settings-text">
              <b>Faturas dos cartões</b>
              <small>Aviso antes do vencimento de cada fatura</small>
            </span>
            <Interruptor ligado={ajustes.faturas} onMudar={(v) => mudarAjustes({ faturas: v })} rotulo="Faturas dos cartões" />
          </div>
          <div className="lemb-linha">
            <span className="lemb-icone pequeno" aria-hidden="true">
              <Repeat size={18} />
            </span>
            <span className="settings-text">
              <b>Contas fixas</b>
              <small>Internet, energia, aluguel e outras contas ativas</small>
            </span>
            <Interruptor ligado={ajustes.contas} onMudar={(v) => mudarAjustes({ contas: v })} rotulo="Contas fixas" />
          </div>
          <p className="muted small lemb-nota">Os ajustes ficam guardados neste celular.</p>
        </section>
      )}

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Próximos lembretes</h2>
        </div>
        {!ajustes.faturas && !ajustes.contas ? (
          <p className="muted">Escolha pelo menos um tipo de aviso: faturas ou contas fixas.</p>
        ) : agenda.length === 0 ? (
          <p className="muted">Nenhum vencimento nos próximos meses.</p>
        ) : (
          agenda.slice(0, 6).map((l) => (
            <div className="due-row" key={l.id}>
              <div className="due-day lemb-dia">
                <CalendarClock size={18} aria-hidden="true" />
              </div>
              <div className="due-info">
                <b>{tituloDoLembrete(l)}</b>
                <span>
                  {quandoAvisa(l.quando)} · {textoDoLembrete(l)}
                </span>
              </div>
            </div>
          ))
        )}
        {agenda.length > 6 && <p className="muted small lemb-nota">E mais {agenda.length - 6} nos próximos meses.</p>}
      </section>
    </div>
  );
}
