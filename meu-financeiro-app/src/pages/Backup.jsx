import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  apagarCopia,
  contarDados,
  dataHoraBR,
  descreverContagem,
  diasDesde,
  lerBackup,
  lerCopia,
  lerUltimoBackup,
  marcarBackupFeito,
  montarBackup,
  nomeDoBackup,
  quandoFoi
} from "../lib/backup.js";
import { lerCupom } from "../storage/cupons.js";
import EscolhaNuvem, { sairComConfirmacao } from "../components/EscolhaNuvem.jsx";

function baixarArquivo(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = arquivo.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function arquivoDeBackup(dados, nome) {
  const backup = await montarBackup(dados, (id) => lerCupom(id));
  return new File([JSON.stringify(backup)], nome, { type: "application/json" });
}

function podeCompartilharArquivo() {
  try {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [new File(["{}"], "teste.json", { type: "application/json" })] })
    );
  } catch {
    return false;
  }
}

function SecaoNuvem({ nuvem, data }) {
  const precisaEntrar = !nuvem.usuario || nuvem.status === "desligada" || nuvem.status === "sessao";

  // deixa o login do Google carregado antes do toque (no celular a janela só abre se for imediata)
  useEffect(() => {
    if (nuvem.configurada && precisaEntrar) nuvem.prepararLogin();
  }, [nuvem.configurada, precisaEntrar]);

  if (!nuvem.configurada) {
    return (
      <section className="section-card">
        <h2>☁️ Nuvem</h2>
        <p className="muted no-margin">A nuvem ainda não foi configurada nesta versão do app.</p>
      </section>
    );
  }

  const { status, usuario, mensagem } = nuvem;
  const conectado = Boolean(usuario) && status !== "desligada";
  const sair = () => sairComConfirmacao(nuvem);

  if (!conectado) {
    const entrando = status === "entrando";
    return (
      <section className="section-card">
        <h2>☁️ Nuvem</h2>
        <p className="muted small intro-text">
          Entre com sua conta Google para guardar seus dados na nuvem e usar o mesmo app no celular e no computador. O
          que você lançar em um aparece no outro.
        </p>
        {mensagem && <p className="form-error">{mensagem}</p>}
        {entrando && (
          <p className="hint intro-text">
            Abrindo a janela de login do Google… Se ela não abrir ou você fechou sem entrar, toque no botão de novo.
          </p>
        )}
        <button type="button" className="primary wide-btn" onClick={nuvem.entrar}>
          Entrar com Google
        </button>
      </section>
    );
  }

  const quem = (
    <div className="cloud-user">
      <span className="muted small">Conectado como</span>
      <b>{usuario.email || usuario.nome || "sua conta Google"}</b>
    </div>
  );

  if (status === "escolher" && nuvem.escolha) {
    return (
      <section className="section-card">
        <h2>☁️ Nuvem</h2>
        {quem}
        <EscolhaNuvem nuvem={nuvem} data={data} />
      </section>
    );
  }

  if (status === "sessao") {
    return (
      <section className="section-card">
        <h2>☁️ Nuvem</h2>
        {quem}
        <p className="cloud-status warn">⚠️ {mensagem || "Entre de novo na sua conta para continuar sincronizando."}</p>
        <div className="btn-grid">
          <button type="button" className="primary" onClick={nuvem.entrar}>
            Entrar com Google
          </button>
          <button type="button" className="ghost" onClick={sair}>
            Sair da conta
          </button>
        </div>
      </section>
    );
  }

  let linha;
  if (status === "ok") {
    linha = (
      <p className="cloud-status ok">
        ✅ Tudo sincronizado{nuvem.sincronizadoEm ? ` · ${quandoFoi(nuvem.sincronizadoEm)}` : ""}
      </p>
    );
  } else if (status === "offline") {
    linha = (
      <p className="cloud-status warn">
        📴 Sem internet agora. Seus dados ficam guardados aqui e vão para a nuvem quando a conexão voltar.
      </p>
    );
  } else if (status === "erro") {
    linha = <p className="form-error cloud-status">⚠️ {mensagem}</p>;
  } else if (status === "entrando") {
    linha = <p className="cloud-status">Abrindo a janela de login do Google…</p>;
  } else {
    linha = <p className="cloud-status">🔄 Sincronizando…</p>;
  }

  return (
    <section className="section-card">
      <h2>☁️ Nuvem</h2>
      {quem}
      {linha}
      <p className="muted small intro-text">
        Tudo o que você lançar aqui vai sozinho para a nuvem e aparece nos outros aparelhos em que você entrar com a
        mesma conta.
      </p>
      <div className="btn-grid">
        <button type="button" className="secondary" onClick={nuvem.sincronizarAgora}>
          Sincronizar agora
        </button>
        <button type="button" className="ghost" onClick={sair}>
          Sair da conta
        </button>
      </div>
    </section>
  );
}

export default function Backup({ data, hoje, nuvem, onBack, onRestaurar }) {
  const [ultimo, setUltimo] = useState(() => lerUltimoBackup());
  const dono = nuvem.usuario?.uid || null;
  const [copia, setCopia] = useState(() => lerCopia(dono));
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro", texto }
  const [ocupado, setOcupado] = useState(false);
  const [pronto, setPronto] = useState(null); // { dados, arquivo }: arquivo já montado (compartilhar precisa ser imediato)
  const entradaRef = useRef(null);
  const compartilhar = useMemo(() => podeCompartilharArquivo(), []);

  const contagem = descreverContagem(contarDados(data));
  const dias = diasDesde(ultimo, hoje);
  // com a nuvem ligada, o backup em arquivo é um extra (sem aviso em laranja)
  const nuvemLigada = Boolean(nuvem.usuario) && nuvem.status !== "desligada";

  // a nuvem pode ter guardado uma cópia de segurança agora (ex.: "Usar só os da nuvem")
  useEffect(() => {
    setCopia(lerCopia(dono));
  }, [nuvem.status, data, dono]);

  // No celular, "Enviar backup" precisa abrir a tela de compartilhar na hora do toque:
  // o arquivo já fica montado antes.
  useEffect(() => {
    if (!compartilhar) return undefined;
    let ativo = true;
    arquivoDeBackup(data, nomeDoBackup(hoje))
      .then((arquivo) => ativo && setPronto({ dados: data, arquivo }))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [data, hoje, compartilhar]);

  async function arquivoAtual() {
    if (pronto && pronto.dados === data) return pronto.arquivo;
    return arquivoDeBackup(data, nomeDoBackup(hoje));
  }

  async function baixar() {
    setAviso(null);
    setOcupado(true);
    try {
      const arquivo = await arquivoAtual();
      baixarArquivo(arquivo);
      setUltimo(marcarBackupFeito());
      setAviso({
        tipo: "ok",
        texto: `Backup baixado (${arquivo.name}). Guarde esse arquivo no Google Drive, no e-mail ou no computador.`
      });
    } catch {
      setAviso({ tipo: "erro", texto: "Não consegui gerar o backup. Tente de novo." });
    } finally {
      setOcupado(false);
    }
  }

  async function enviarPara() {
    setAviso(null);
    try {
      const arquivo = await arquivoAtual();
      await navigator.share({ files: [arquivo], title: "Backup do Meu Financeiro" });
      setUltimo(marcarBackupFeito());
      setAviso({ tipo: "ok", texto: "Backup enviado." });
    } catch (erro) {
      if (erro?.name === "AbortError") return;
      setAviso({ tipo: "erro", texto: "Não consegui compartilhar. Use o botão Baixar backup." });
    }
  }

  async function restaurar(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    setAviso(null);

    let backup;
    try {
      backup = lerBackup(await arquivo.text());
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro.message || "Não consegui ler esse arquivo." });
      return;
    }

    const quando = backup.criadoEm ? ` de ${dataHoraBR(backup.criadoEm)}` : "";
    const ok = window.confirm(
      `Restaurar o backup${quando}?\n\n` +
        `Ele tem ${descreverContagem(contarDados(backup.dados))}.\n\n` +
        `Os dados atuais deste aparelho${nuvemLigada ? " e da nuvem" : ""} serão trocados pelos do backup. ` +
        "Uma cópia de segurança dos dados atuais fica guardada aqui."
    );
    if (!ok) return;

    setOcupado(true);
    try {
      const r = await onRestaurar(backup);
      if (!r) return;
      setCopia(lerCopia(dono));
      setAviso({
        tipo: "ok",
        texto:
          "Backup restaurado." +
          (r.fotosComErro ? ` ${r.fotosComErro} foto(s) de cupom não puderam ser guardadas neste aparelho.` : "")
      });
    } catch {
      setAviso({ tipo: "erro", texto: "Não consegui restaurar esse backup." });
    } finally {
      setOcupado(false);
    }
  }

  async function baixarCopia() {
    try {
      const nome = `meu-financeiro-copia-de-seguranca-${String(copia.em).slice(0, 10)}.json`;
      baixarArquivo(await arquivoDeBackup(copia.dados, nome));
    } catch {
      setAviso({ tipo: "erro", texto: "Não consegui baixar a cópia." });
    }
  }

  function descartarCopia() {
    if (!window.confirm("Apagar a cópia de segurança deste aparelho?")) return;
    apagarCopia(copia);
    setCopia(lerCopia(dono));
  }

  return (
    <div className="page backup-page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Seus dados</div>
          <h1>☁️ Backup e nuvem</h1>
        </div>
      </header>

      <SecaoNuvem nuvem={nuvem} data={data} />

      <section className="section-card">
        <h2>💾 Backup em arquivo</h2>
        <p className="muted small intro-text">
          Um arquivo com todos os seus dados ({contagem}) e as fotos dos cupons. Guarde no Google Drive, no e-mail ou no
          computador. Também serve para passar os dados para outro aparelho.
        </p>
        <p className={`cloud-status ${ultimo && dias <= 7 ? "ok" : nuvemLigada ? "" : "warn"}`}>
          {ultimo
            ? `Último backup: ${dataHoraBR(ultimo)}${dias > 0 ? ` (há ${dias} dia${dias > 1 ? "s" : ""})` : ""}`
            : "Você ainda não fez backup em arquivo."}
        </p>

        {aviso && <p className={aviso.tipo === "erro" ? "form-error" : "hint"}>{aviso.texto}</p>}

        <div className="stack">
          <button type="button" className="primary wide-btn" onClick={baixar} disabled={ocupado}>
            💾 Baixar backup
          </button>
          {compartilhar && (
            <button type="button" className="secondary wide-btn" onClick={enviarPara} disabled={ocupado}>
              📤 Enviar backup (Drive, WhatsApp, e-mail…)
            </button>
          )}
          <button type="button" className="ghost wide-btn" onClick={() => entradaRef.current?.click()} disabled={ocupado}>
            📂 Restaurar um backup
          </button>
          <input
            ref={entradaRef}
            type="file"
            accept=".json,application/json"
            onChange={restaurar}
            hidden
            aria-label="Arquivo de backup"
          />
        </div>
      </section>

      {copia && (
        <section className="section-card">
          <h2>🛟 Cópia de segurança</h2>
          <p className="muted small intro-text">
            Cópia dos dados {copia.motivo}, de {dataHoraBR(copia.em)}. Se precisar, baixe e use o botão Restaurar um
            backup.
          </p>
          <div className="row-actions">
            <button type="button" className="chip-btn info" onClick={baixarCopia}>
              💾 Baixar essa cópia
            </button>
            <button type="button" className="chip-btn danger" onClick={descartarCopia}>
              🗑 Apagar cópia
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
