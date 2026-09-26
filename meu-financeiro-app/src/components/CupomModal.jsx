import React, { useEffect, useState } from "react";
import { lerCupom } from "../storage/cupons.js";

export default function CupomModal({ cupomId, onClose }) {
  const [url, setUrl] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    let criada = null;
    lerCupom(cupomId)
      .then((blob) => {
        if (!ativo) return;
        if (!blob) {
          setErro(true);
          return;
        }
        criada = URL.createObjectURL(blob);
        setUrl(criada);
      })
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
      if (criada) URL.revokeObjectURL(criada);
    };
  }, [cupomId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {erro && <p className="muted">Foto não encontrada neste aparelho.</p>}
        {!erro && !url && <p className="muted">Carregando foto…</p>}
        {url && <img src={url} alt="Cupom da compra" className="cupom-img" />}
        <button className="primary wide" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
