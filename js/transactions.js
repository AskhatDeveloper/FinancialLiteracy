let transactions = loadTransactions();

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  } catch {
    return [];
  }
}

function calculateBalance() {
  const base = Number(localStorage.getItem("initialBalance")) || 0;

  const transactionsSum = transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);

  return base + transactionsSum;
}

function calculateIncome() {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

function calculateExpense() {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

export {
  transactions,
  calculateBalance,
  calculateIncome,
  calculateExpense,
  saveTransactions,
};
