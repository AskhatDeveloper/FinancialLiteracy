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
