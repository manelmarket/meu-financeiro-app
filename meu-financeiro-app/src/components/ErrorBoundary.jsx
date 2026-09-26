import React from "react";

// Se alguma tela quebrar, mostra um aviso em vez de deixar a tela em branco.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("Erro na tela:", erro, info);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div className="app-shell">
        <div className="page">
          <section className="section-card">
            <h2>Algo deu errado nesta tela</h2>
            <p className="muted">Seus dados continuam salvos neste aparelho. Toque abaixo para recarregar.</p>
            <button className="primary wide" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </section>
        </div>
      </div>
    );
  }
}
