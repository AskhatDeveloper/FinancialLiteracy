let transactions = loadTransactions();

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  } catch {
    return [];
  }
}

function calculateBalance() {
  return transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
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

function addTransaction(transaction) {
  transactions.push(transaction);
  saveTransactions();
}

function removeTransaction(id) {
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions.splice(index, 1);
    saveTransactions();
  }
}

function getSortedTransactions() {
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getRecentTransactions(limit = 5) {
  return getSortedTransactions().slice(0, limit);
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

export {
  transactions,
  calculateBalance,
  calculateIncome,
  calculateExpense,
  addTransaction,
  removeTransaction,
  getSortedTransactions,
  getRecentTransactions,
  saveTransactions,
};
