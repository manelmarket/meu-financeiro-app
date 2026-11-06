import React, { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Sparkles, Undo2 } from "lucide-react";
import { ErroIA, lerConfigIA } from "../lib/ia.js";
import {
  CAMPOS,
  ErroImportar,
  aplicarImportacao,
  categorizarComIA,
  converterLinhas,
  entenderAba,
  lerArquivo,
  mapearComIA,
  melhorAba
} from "../lib/importar.js";
import { listarCategorias, CATEGORIA_PADRAO } from "../lib/categorias.js";
import { dataBR, money } from "../lib/formato.js";

const MOSTRAR = 150;

const qtd = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

function letraDaColuna(i) {
  let s = "";
  let n = i + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Importar planilha: Excel (.xlsx) ou .csv -> gastos, receitas e compras no cartão (ver lib/importar.js)
export default function Importar({ data, setData, hoje, onBack, onIr }) {
  const [arquivo, setArquivo] = useState(null); // { nome, abas }
  const [abaAtual, setAbaAtual] = useState(0);
  const [mapa, setMapa] = useState(null); // { cabecalho, colunas, positivos }
  const [positivos, setPositivos] = useState("auto");
  const [sugestoes, setSugestoes] = useState({});
  const [marcas, setMarcas] = useState({}); // linha -> true/false (o que a pessoa mudou)
  const [criarCategorias, setCriarCategorias] = useState(true);
  const [usarBancos, setUsarBancos] = useState(false);
  const [lendo, setLendo] = useState("");
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(null); // { contagem, antes, depois }
  const entrada = useRef(null);
  const cfg = lerConfigIA();

  const aba = arquivo?.abas[abaAtual];
  const convertido = useMemo(
    () => (aba && mapa ? converterLinhas(aba, mapa, data, { hoje, positivos, sugestoes }) : { itens: [], positivos: "gasto" }),
    [aba, mapa, data, hoje, positivos, sugestoes]
  );
  const itens = convertido.itens.map((i) => (marcas[i.linha] === undefined ? i : { ...i, marcado: marcas[i.linha] && !i.erro }));
  const escolhidos = itens.filter((i) => i.marcado);
  const soma = (lista) => lista.reduce((t, i) => t + i.valor, 0);
  const resumo = {
    gastos: escolhidos.filter((i) => i.tipo === "saida" && !i.cartaoId),
    cartao: escolhidos.filter((i) => i.cartaoId),
    receitas: escolhidos.filter((i) => i.tipo === "entrada"),
    duplicados: itens.filter((i) => i.duplicado).length,
    erros: itens.filter((i) => i.erro).length,
    novas: [...new Set(escolhidos.filter((i) => i.categoriaNova && i.tipo === "saida").map((i) => i.categoriaNova))]
  };
  const largura = aba ? Math.max(0, ...aba.linhas.slice(0, 40).map((l) => l.length)) : 0;
  const cabecalho = aba && mapa && mapa.cabecalho >= 0 ? aba.linhas[mapa.cabecalho] || [] : [];
  const nomeDaColuna = (i) => `${letraDaColuna(i)}${cabecalho[i] ? ` · ${String(cabecalho[i]).slice(0, 24)}` : ""}`;

  async function sugerirCategorias(abaLida, mapaLido) {
    if (!cfg || mapaLido.colunas.categoria !== undefined) return;
    const prev = converterLinhas(abaLida, mapaLido, data, { hoje, positivos: "auto" });
    const sem = prev.itens.filter((i) => i.tipo === "saida" && !i.erro && i.categoria === CATEGORIA_PADRAO).map((i) => i.descricao);
    if (!sem.length) return;
    setLendo("A IA está separando as categorias…");
    try {
      const nomes = listarCategorias(data).map((c) => c.nome);
      setSugestoes(await categorizarComIA(cfg, sem, nomes));
    } catch {
      // segue sem as sugestões
    }
  }

  async function escolherArquivo(file) {
    if (!file) return;
    setErro("");
    setFeito(null);
    setMarcas({});
    setSugestoes({});
    setPositivos("auto");
    setLendo("Lendo a planilha…");
    try {
      const lido = await lerArquivo(file);
      if (!lido.abas.length) throw new ErroImportar("A planilha está vazia.");
      let i = melhorAba(lido.abas);
      let m = entenderAba(lido.abas[i]);
      if (cfg) {
        setLendo("A IA está entendendo as colunas…");
        try {
          const ia = await mapearComIA(cfg, lido.abas);
          const temValor = ["valor", "entrada", "saida"].some((c) => ia.colunas[c] !== undefined);
          if (temValor && ia.colunas.data !== undefined) {
            i = ia.aba;
            m = { cabecalho: ia.cabecalho, colunas: ia.colunas, positivos: ia.positivos };
          }
        } catch {
          // a IA falhou: fica com o que o app entendeu sozinho
        }
      }
      setArquivo({ nome: file.name, abas: lido.abas });
      setAbaAtual(i);
      setMapa(m);
      await sugerirCategorias(lido.abas[i], m);
    } catch (falha) {
      setArquivo(null);
      setMapa(null);
      setErro(falha instanceof ErroImportar || falha instanceof ErroIA ? falha.message : "Não consegui ler esse arquivo.");
    } finally {
      setLendo("");
      if (entrada.current) entrada.current.value = "";
    }
  }

  function trocarAba(i) {
    setAbaAtual(i);
    setMarcas({});
    setSugestoes({});
    setMapa(entenderAba(arquivo.abas[i]));
  }

  function mudarColuna(campo, valor) {
    setMarcas({});
    setMapa((m) => {
      const colunas = { ...m.colunas };
      if (valor === "") delete colunas[campo];
      else colunas[campo] = Number(valor);
      return { ...m, colunas };
    });
  }

  function marcarTodos(v) {
    const novo = {};
    for (const i of itens) if (!i.erro) novo[i.linha] = v;
    setMarcas(novo);
  }

  function importar() {
    const agora = Date.now();
    const antes = data;
    const r = aplicarImportacao(antes, itens, { agora, criarCategorias, usarBancos });
    setData((d) => (d === antes ? r.dados : aplicarImportacao(d, itens, { agora, criarCategorias, usarBancos }).dados));
    setFeito({ contagem: r.contagem, erros: r.erros, antes, depois: r.dados });
    setArquivo(null);
    setMapa(null);
  }

  function desfazer() {
    if (!feito) return;
    if (data !== feito.depois) {
      setErro("Os dados mudaram depois da importação, então não dá para desfazer daqui. Apague pelo Extrato.");
      return;
    }
    const { antes, depois } = feito;
    setData((d) => (d === depois ? antes : d));
    setFeito(null);
  }

  return (
    <div className="page importar">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Trazer dados</div>
          <h1>Importar planilha</h1>
        </div>
      </header>

      {feito && (
        <section className="section-card importar-feito" role="status">
          <h2>Importação feita</h2>
          <p>
            {qtd(feito.contagem.gastos, "gasto", "gastos")}, {qtd(feito.contagem.receitas, "receita", "receitas")} e{" "}
            {qtd(feito.contagem.noCartao, "compra no cartão", "compras no cartão")}
            {feito.contagem.categoriasNovas ? `, com ${qtd(feito.contagem.categoriasNovas, "categoria nova", "categorias novas")}` : ""}.
          </p>
          <p className="muted">
            Total: {money(feito.contagem.total.gastos)} em gastos e {money(feito.contagem.total.receitas)} em receitas.
          </p>
          {feito.erros.length > 0 && <p className="form-error">{qtd(feito.erros.length, "linha não entrou", "linhas não entraram")}: {feito.erros.slice(0, 3).map((e) => `linha ${e.linha} (${e.erro})`).join("; ")}.</p>}
          <div className="actions wrap">
            <button type="button" className="ghost" onClick={desfazer}>
              <Undo2 size={16} /> Desfazer importação
            </button>
            <button type="button" className="primary" onClick={() => onIr("history")}>
              Ver no Extrato
            </button>
          </div>
        </section>
      )}

      {!arquivo && (
        <section className="section-card importar-inicio">
          <span className="importar-icone" aria-hidden="true">
            <FileSpreadsheet size={30} />
          </span>
          <h2>Traga sua planilha</h2>
          <p className="muted">
            Envie uma planilha do Excel (.xlsx) ou um extrato em .csv. O app acha a aba com os lançamentos, entende as colunas (data,
            descrição, valor, categoria, cartão, parcelas…) e separa gastos, receitas e compras no cartão. Você confere tudo antes de importar.
          </p>
          <label className="primary importar-botao">
            {lendo ? lendo : "Escolher arquivo"}
            <input
              ref={entrada}
              type="file"
              accept=".xlsx,.xlsm,.csv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => escolherArquivo(e.target.files?.[0])}
              disabled={Boolean(lendo)}
            />
          </label>
          {cfg ? (
            <p className="hint">
              <Sparkles size={13} /> A IA ajuda a entender colunas e categorias. Para isso ela recebe as primeiras linhas da planilha e as descrições.
            </p>
          ) : (
            <p className="hint">Sem a IA configurada, o app entende as colunas pelos nomes do cabeçalho (você pode ajustar).</p>
          )}
        </section>
      )}

      {erro && <p className="form-error">{erro}</p>}
      {lendo && arquivo && <p className="hint">{lendo}</p>}

      {arquivo && mapa && (
        <>
          <section className="section-card">
            <div className="section-title">
              <h2 className="no-margin">{arquivo.nome}</h2>
              <button type="button" className="link" onClick={() => entrada.current?.click()}>
                trocar arquivo
              </button>
              <input
                ref={entrada}
                type="file"
                hidden
                accept=".xlsx,.xlsm,.csv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => escolherArquivo(e.target.files?.[0])}
              />
            </div>
            {arquivo.abas.length > 1 && (
              <label className="importar-campo">
                Aba da planilha
                <select value={abaAtual} onChange={(e) => trocarAba(Number(e.target.value))}>
                  {arquivo.abas.map((a, i) => (
                    <option key={a.nome + i} value={i}>
                      {a.nome} ({a.linhas.length} linhas)
                    </option>
                  ))}
                </select>
              </label>
            )}
            <details className="importar-colunas" open={Object.keys(mapa.colunas).length < 3}>
              <summary>Colunas que entendi ({Object.keys(mapa.colunas).length}) · toque para ajustar</summary>
              <div className="importar-grade">
                {CAMPOS.map(([campo, rotulo]) => (
                  <label key={campo} className="importar-campo">
                    {rotulo}
                    <select value={mapa.colunas[campo] ?? ""} onChange={(e) => mudarColuna(campo, e.target.value)}>
                      <option value="">— não tem —</option>
                      {Array.from({ length: largura }, (_, i) => (
                        <option key={i} value={i}>
                          {nomeDaColuna(i)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </details>
            {mapa.colunas.tipo === undefined && mapa.colunas.entrada === undefined && mapa.colunas.saida === undefined && (
              <label className="importar-campo">
                Os valores da planilha são
                <select value={positivos} onChange={(e) => setPositivos(e.target.value)}>
                  <option value="auto">Descobrir sozinho ({convertido.positivos === "sinal" ? "negativo = gasto" : "tudo gasto"})</option>
                  <option value="gasto">Todos gastos</option>
                  <option value="receita">Todos receitas (negativos são gastos)</option>
                  <option value="sinal">Negativos são gastos, positivos são receitas</option>
                </select>
              </label>
            )}
          </section>

          <section className="section-card importar-resumo">
            <div className="grid2 tight">
              <div>
                <small>Gastos</small>
                <b className="out">
                  {resumo.gastos.length} · {money(soma(resumo.gastos))}
                </b>
              </div>
              <div>
                <small>Receitas</small>
                <b className="in">
                  {resumo.receitas.length} · {money(soma(resumo.receitas))}
                </b>
              </div>
              <div>
                <small>Compras no cartão</small>
                <b>
                  {resumo.cartao.length} · {money(soma(resumo.cartao))}
                </b>
              </div>
              <div>
                <small>Fora da importação</small>
                <b>
                  {itens.length - escolhidos.length} ({qtd(resumo.duplicados, "repetida", "repetidas")}, {resumo.erros} com problema)
                </b>
              </div>
            </div>
            {resumo.novas.length > 0 && (
              <label className="importar-opcao">
                <input type="checkbox" checked={criarCategorias} onChange={(e) => setCriarCategorias(e.target.checked)} />
                <span>
                  Criar {resumo.novas.length} {resumo.novas.length === 1 ? "categoria nova" : "categorias novas"}: {resumo.novas.slice(0, 6).join(", ")}
                  {resumo.novas.length > 6 ? "…" : ""} (desmarcado: vão para Outros)
                </span>
              </label>
            )}
            {mapa.colunas.banco !== undefined && (
              <label className="importar-opcao">
                <input type="checkbox" checked={usarBancos} onChange={(e) => setUsarBancos(e.target.checked)} />
                <span>Mexer no saldo dos bancos da planilha (deixe desmarcado para importar histórico sem mudar o saldo de hoje)</span>
              </label>
            )}
          </section>

          <section className="section-card importar-lista">
            <div className="section-title">
              <h2 className="no-margin">Conferir ({itens.length} linhas)</h2>
              <span className="importar-todos">
                <button type="button" className="link" onClick={() => marcarTodos(true)}>
                  todas
                </button>
                ·
                <button type="button" className="link" onClick={() => marcarTodos(false)}>
                  nenhuma
                </button>
              </span>
            </div>
            {itens.length === 0 && <p className="muted">Nenhuma linha com dados. Confira a aba e as colunas acima.</p>}
            {itens.slice(0, MOSTRAR).map((i) => (
              <label key={i.linha} className={`importar-item${i.erro ? " com-erro" : ""}${i.marcado ? "" : " desmarcado"}`}>
                <input
                  type="checkbox"
                  checked={i.marcado}
                  disabled={Boolean(i.erro)}
                  onChange={(e) => setMarcas((m) => ({ ...m, [i.linha]: e.target.checked }))}
                />
                <span className="importar-texto">
                  <b>{i.descricao}</b>
                  <small>
                    {i.data ? dataBR(i.data) : "sem data"} · {i.tipo === "entrada" ? "Receita" : i.categoria}
                    {i.categoriaNova && i.tipo === "saida" ? " (nova)" : ""}
                    {i.cartaoNome ? ` · ${i.cartaoNome}${i.parcelas > 1 ? ` ${i.parcelas}x` : ""}` : i.tipo === "saida" ? ` · ${i.forma}` : ""}
                    {i.duplicado ? " · já existe" : ""}
                    {i.erro ? ` · linha ${i.linha}: ${i.erro}` : ""}
                  </small>
                </span>
                <strong className={i.tipo === "entrada" ? "in" : "out"}>
                  {i.valor > 0 ? `${i.tipo === "entrada" ? "+" : "-"}${money(i.valor)}` : "—"}
                </strong>
              </label>
            ))}
            {itens.length > MOSTRAR && <p className="muted">E mais {itens.length - MOSTRAR} linhas (entram também, se marcadas).</p>}
          </section>

          <div className="importar-acoes">
            <button type="button" className="ghost" onClick={() => { setArquivo(null); setMapa(null); }}>
              Cancelar
            </button>
            <button type="button" className="primary" disabled={!escolhidos.length || Boolean(lendo)} onClick={importar}>
              Importar {escolhidos.length} {escolhidos.length === 1 ? "lançamento" : "lançamentos"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
