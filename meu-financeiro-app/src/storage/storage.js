const KEY = "meu_financeiro_v1";

const seed = {
  usuario: { nome: "João" },
  lancamentos: [
    { id: 1, tipo: "entrada", descricao: "Salário", categoria: "Receita", valor: 5000, pagamento: "Transferência", data: "2026-09-05" },
    { id: 2, tipo: "saida", descricao: "Mercado", categoria: "Alimentação", valor: 250, pagamento: "Pix", data: "2026-09-23" }
  ],
  cartoes: [
    { id: 1, nome: "Nubank", limite: 5000, usado: 850, vencimento: 10 }
  ],
  metas: [
    { id: 1, nome: "Reserva de emergência", objetivo: 10000, atual: 2500 }
  ]
};

export function loadData() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetData() {
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}
