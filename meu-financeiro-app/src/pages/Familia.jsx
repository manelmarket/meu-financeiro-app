import React, { useEffect, useState } from "react";
import { Copy, LogOut, Share2, Trash2, UserPlus, Users } from "lucide-react";
import { limparCodigo, mostrarCodigo } from "../lib/familia.js";
import { esquecerConvite, lerConvitePendente } from "../lib/convite.js";

function textoDoConvite(codigo) {
  const link = `${window.location.origin}/?convite=${codigo}`;
  return `Entre na minha família no Meu Financeiro para usarmos os mesmos dados.\n\nCódigo: ${mostrarCodigo(codigo)}\nOu toque no link: ${link}`;
}

// Modo família: criar, convidar, entrar com código, sair, tirar alguém e encerrar
export default function Familia({ nuvem, onBack, onIr }) {
  const [detalhes, setDetalhes] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [ocupado, setOcupado] = useState("");
  const [mensagem, setMensagem] = useState(null); // { tipo, texto }
  const [codigo, setCodigo] = useState("");
  const [nomeDaFamilia, setNomeDaFamilia] = useState("");
  const [codigoDigitado, setCodigoDigitado] = useState(() => mostrarCodigo(lerConvitePendente()));
  const [levarMeus, setLevarMeus] = useState(false);

  const conectado = Boolean(nuvem.usuario) && nuvem.status !== "desligada" && nuvem.status !== "sessao";
  const naFamilia = Boolean(nuvem.familia);
  const uid = nuvem.usuario?.uid;
  const souDono = Boolean(detalhes && detalhes.dono === uid);

  async function carregar() {
    if (!naFamilia) {
      setDetalhes(null);
      return;
    }
    setCarregando(true);
    try {
      setDetalhes(await nuvem.lerFamilia());
    } catch (erro) {
      if (String(erro?.code) === "permission-denied") {
        // foi tirada(o) da família ou ela foi encerrada: a sincronização traz de volta os dados da conta
        setMensagem({ tipo: "info", texto: "Você não faz mais parte desta família. Voltando para os seus dados…" });
        nuvem.sincronizarAgora();
      } else {
        setMensagem({ tipo: "erro", texto: "Não consegui ler a família agora. Confira a internet e tente de novo." });
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [naFamilia, nuvem.familia?.id]);

  // o aviso (ex.: "você saiu da família") já foi visto aqui
  useEffect(() => () => nuvem.esquecerAviso && nuvem.esquecerAviso(), []);

  // veio pelo link de convite: o código já está no campo, então o app não precisa mais trazer a pessoa para cá
  useEffect(() => {
    const pendente = lerConvitePendente();
    if (!conectado || naFamilia || !pendente) return;
    setCodigoDigitado((atual) => atual || mostrarCodigo(pendente));
    esquecerConvite();
  }, [conectado, naFamilia]);

  async function fazer(nome, acao, textoOk) {
    setOcupado(nome);
    setMensagem(null);
    try {
      const r = await acao();
      if (textoOk) setMensagem({ tipo: "ok", texto: typeof textoOk === "function" ? textoOk(r) : textoOk });
      return r;
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: erro?.message || "Não deu certo agora. Confira a internet e tente de novo." });
      return null;
    } finally {
      setOcupado("");
    }
  }

  async function criar() {
    const fid = await fazer("criar", () => nuvem.criarFamilia(nomeDaFamilia.trim() || `Família de ${nuvem.usuario?.nome?.split(" ")[0] || "você"}`), "Família criada! Agora convide quem vai usar junto.");
    if (fid) await carregar();
  }

  async function convidar() {
    const c = await fazer("convidar", () => nuvem.criarConvite(), null);
    if (c) {
      setCodigo(c);
      await carregar();
    }
  }

  async function entrar() {
    const c = limparCodigo(codigoDigitado);
    if (!c) {
      setMensagem({ tipo: "erro", texto: "O código tem 8 letras e números (ex.: ABCD-2345)." });
      return;
    }
    const fid = await fazer("entrar", () => nuvem.entrarNaFamilia(c, levarMeus), "Pronto! Agora vocês usam os mesmos dados.");
    if (fid) {
      esquecerConvite();
      setCodigoDigitado("");
      await carregar();
    }
  }

  async function sair() {
    const ok = window.confirm(
      "Sair da família?\n\nVocê deixa de ver os dados da família e voltam os seus dados pessoais (os de antes de entrar)."
    );
    if (ok) await fazer("sair", () => nuvem.sairDaFamilia(), null);
  }

  async function tirar(m) {
    const ok = window.confirm(`Tirar ${m.nome || m.email || "esta pessoa"} da família?\n\nEla deixa de ver os dados da família.`);
    if (!ok) return;
    const r = await fazer("tirar", () => nuvem.tirarDaFamilia(m.uid), `${m.nome || m.email} saiu da família.`);
    if (r !== null) await carregar();
  }

  async function encerrar() {
    const ok = window.confirm(
      "Encerrar a família?\n\nAs outras pessoas deixam de ver os dados. Todos os dados e fotos continuam com você."
    );
    if (ok) await fazer("encerrar", () => nuvem.encerrarFamilia(), null);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoDoConvite(codigo));
      setMensagem({ tipo: "ok", texto: "Convite copiado. Cole no WhatsApp da pessoa." });
    } catch {
      setMensagem({ tipo: "info", texto: `Anote o código: ${mostrarCodigo(codigo)}` });
    }
  }

  async function compartilhar() {
    const texto = textoDoConvite(codigo);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Convite para a família", text: texto });
        return;
      } catch {
        // cancelou: segue pelo WhatsApp
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Compartilhar</div>
          <h1>👨‍👩‍👧 Família</h1>
        </div>
      </header>

      {nuvem.aviso && (
        <p className="pag-feito" role="status">
          {nuvem.aviso}
        </p>
      )}
      {mensagem && (
        <p className={`lemb-mensagem ${mensagem.tipo}`} role={mensagem.tipo === "erro" ? "alert" : "status"}>
          {mensagem.texto}
        </p>
      )}

      {!conectado && (
        <section className="section-card">
          <p className="muted no-margin">
            O modo família usa a nuvem: entre com sua conta Google em Backup e nuvem e volte aqui.
          </p>
          <button type="button" className="primary wide" onClick={() => onIr("backup")}>
            Ir para Backup e nuvem
          </button>
        </section>
      )}

      {conectado && !naFamilia && (
        <>
          <section className="section-card familia-explica">
            <Users size={28} className="familia-icone" aria-hidden="true" />
            <p className="no-margin">
              Use o app junto com outra pessoa: cada um entra com o próprio Google e os dois veem e lançam nos mesmos
              dados (gastos, cartões, bancos, contas fixas, metas…).
            </p>
          </section>

          <section className="section-card form">
            <h2>Criar uma família</h2>
            <p className="muted small no-margin">Os seus dados passam a ser da família. Depois você convida as pessoas.</p>
            <label>
              Nome da família (opcional)
              <input value={nomeDaFamilia} onChange={(e) => setNomeDaFamilia(e.target.value)} placeholder="Ex.: Família Silva" />
            </label>
            <button type="button" className="primary" onClick={criar} disabled={Boolean(ocupado)}>
              {ocupado === "criar" ? "Criando…" : "Criar família"}
            </button>
          </section>

          <section className="section-card form">
            <h2>Entrar numa família</h2>
            <label>
              Código do convite
              <input
                value={codigoDigitado}
                onChange={(e) => setCodigoDigitado(e.target.value)}
                placeholder="ABCD-2345"
                autoCapitalize="characters"
                autoComplete="off"
              />
            </label>
            <label className="familia-levar">
              <input type="checkbox" checked={levarMeus} onChange={(e) => setLevarMeus(e.target.checked)} />
              <span>Levar os meus lançamentos, cartões e bancos para a família (juntar com os de lá)</span>
            </label>
            <p className="muted small no-margin">
              {levarMeus
                ? "Os seus registros entram na família e todos passam a ver."
                : "Os seus dados de agora ficam guardados na sua conta e voltam se você sair da família."}
            </p>
            <button type="button" className="primary" onClick={entrar} disabled={Boolean(ocupado)}>
              {ocupado === "entrar" ? "Entrando…" : "Entrar na família"}
            </button>
          </section>
        </>
      )}

      {conectado && naFamilia && (
        <>
          <section className="section-card">
            <div className="section-title">
              <h2 className="no-margin">{detalhes?.nome || "Sua família"}</h2>
              {carregando && <small className="muted">carregando…</small>}
            </div>
            <p className="muted small">Tudo o que qualquer pessoa lançar aparece para todos.</p>
            {(detalhes?.membros || []).map((m) => (
              <div className="familia-membro" key={m.uid}>
                <span className="settings-text">
                  <b>
                    {m.nome || m.email || "Pessoa"}
                    {m.uid === uid ? " (você)" : ""}
                  </b>
                  <small>
                    {m.email}
                    {m.uid === detalhes.dono ? " · dona(o) da família" : ""}
                  </small>
                </span>
                {souDono && m.uid !== uid && (
                  <button type="button" className="chip-btn danger" onClick={() => tirar(m)} disabled={Boolean(ocupado)}>
                    <Trash2 size={14} /> Tirar
                  </button>
                )}
              </div>
            ))}
          </section>

          {souDono && (
            <section className="section-card">
              <h2>Convidar alguém</h2>
              <p className="muted small">
                Gere um código e mande para a pessoa. Ela abre o app, entra com o Google dela e digita o código em Menu ⋮ →
                Família. Cada código serve para uma pessoa e vale por 7 dias.
              </p>
              {codigo && (
                <div className="familia-codigo" aria-live="polite">
                  <span>Código</span>
                  <strong>{mostrarCodigo(codigo)}</strong>
                </div>
              )}
              {codigo ? (
                <>
                  <div className="btn-grid">
                    <button type="button" className="secondary" onClick={copiar}>
                      <Copy size={16} /> Copiar convite
                    </button>
                    <button type="button" className="primary" onClick={compartilhar}>
                      <Share2 size={16} /> Enviar
                    </button>
                  </div>
                  <button type="button" className="ghost wide" onClick={convidar} disabled={Boolean(ocupado)}>
                    <UserPlus size={16} /> {ocupado === "convidar" ? "Gerando…" : "Gerar outro código (para outra pessoa)"}
                  </button>
                </>
              ) : (
                <button type="button" className="primary wide" onClick={convidar} disabled={Boolean(ocupado)}>
                  <UserPlus size={18} /> {ocupado === "convidar" ? "Gerando…" : "Gerar código de convite"}
                </button>
              )}
            </section>
          )}

          {detalhes && (
            <section className="section-card">
              {souDono ? (
                <>
                  <p className="muted small">Encerrar: as outras pessoas deixam de ver os dados; tudo continua com você.</p>
                  <button type="button" className="ghost wide perigo-btn" onClick={encerrar} disabled={Boolean(ocupado)}>
                    <Trash2 size={16} /> {ocupado === "encerrar" ? "Encerrando…" : "Encerrar a família"}
                  </button>
                </>
              ) : (
                <>
                  <p className="muted small">Saindo, voltam os seus dados pessoais (os de antes de entrar na família).</p>
                  <button type="button" className="ghost wide perigo-btn" onClick={sair} disabled={Boolean(ocupado)}>
                    <LogOut size={16} /> {ocupado === "sair" ? "Saindo…" : "Sair da família"}
                  </button>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
