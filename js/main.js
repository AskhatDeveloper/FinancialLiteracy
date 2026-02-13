import { renderCharts } from "./analytics.js";

// ===== Elements =====
const balanceDisplay = document.getElementById("balance");
const submitBtn = document.getElementById("submitBtn");

// ===== THEME =====
const themePanel = document.getElementById("themePanel");
const toggleTheme = document.querySelector(".toggleTheme");
const lightTheme = document.getElementById("lightTheme");
const darkTheme = document.getElementById("darkTheme");

import {
  transactions,
  calculateBalance,
  calculateIncome,
  calculateExpense,
} from "./transactions.js";
import { renderCategories } from "./analytics.js";
import { renderHistory, updatePercent, updateBalanceUI } from "./ui.js";
import { initNavigation } from "./navigation.js";
import { saveTransactions } from "./transactions.js";
import { setGoal, getGoal, clearGoal } from "./goals.js";
import { generateInsights } from "./analytics.js";

initNavigation();

if (toggleTheme) {
  toggleTheme.addEventListener("click", (e) => {
    e.preventDefault();
    themePanel.classList.toggle("active");
  });
}

if (lightTheme) {
  lightTheme.addEventListener("click", () => {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    themePanel.classList.remove("active");
  });
}

if (darkTheme) {
  darkTheme.addEventListener("click", () => {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    themePanel.classList.remove("active");
  });
}

// ===== MAIN LOGIC =====
submitBtn.addEventListener("click", () => {
  const type = document.getElementById("type").value;
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!amount || amount <= 0) {
    alert("Введите сумму");
    return;
  }

  // 1. сохраняем операцию ПРАВИЛЬНО
  transactions.push({
    type,
    amount,
    category,
    date: new Date().toISOString(),
  });
  saveTransactions();
  refreshUI();
  document.getElementById("amount").value = "";
  formWrapper.classList.remove("active");
});

const addBtn = document.querySelector(".add-btn");
const formWrapper = document.querySelector(".form-wrapper");

addBtn.addEventListener("click", () => {
  formWrapper.classList.toggle("active");
});

formWrapper.addEventListener("click", (e) => {
  if (e.target === formWrapper) {
    formWrapper.classList.remove("active");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    formWrapper.classList.remove("active");
  }
});

document.querySelector(".modal-close").addEventListener("click", () => {
  formWrapper.classList.remove("active");
});

// ===== SETTINGS =====

const darkModeToggle = document.getElementById("darkModeToggle");
const currencySelect = document.getElementById("currencySelect");
const clearDataBtn = document.getElementById("clearDataBtn");

// Тема
if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });
}

window.addEventListener("load", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.checked = true;
  }

  const savedCurrency = localStorage.getItem("currency");
  if (savedCurrency && currencySelect) {
    currencySelect.value = savedCurrency;
  }

  refreshUI();
});

// Валюта
if (currencySelect) {
  currencySelect.addEventListener("change", () => {
    localStorage.setItem("currency", currencySelect.value);
  });
}

// Очистка транзакций
if (clearDataBtn) {
  clearDataBtn.addEventListener("click", () => {
    if (confirm("Удалить все транзакции?")) {
      transactions.length = 0;
      localStorage.removeItem("transactions");
      location.reload();
    }
  });
}

function renderInsights() {
  const container = document.getElementById("insightsContent");
  const tips = generateInsights();

  container.innerHTML = "";

  tips.forEach((tip) => {
    const div = document.createElement("div");
    div.className = "insight-item";
    div.textContent = tip;
    container.appendChild(div);
  });
}

function renderGoal() {
  const goal = getGoal();

  const emptyBlock = document.getElementById("goalEmpty");
  const contentBlock = document.getElementById("goalContent");

  if (!goal) {
    emptyBlock.classList.remove("hidden");
    contentBlock.classList.add("hidden");
    return;
  }

  emptyBlock.classList.add("hidden");
  contentBlock.classList.remove("hidden");

  const currentBalance = calculateBalance();
  const percent = Math.min((currentBalance / goal.amount) * 100, 100);

  const currency = localStorage.getItem("currency") || "₽";

  document.getElementById("goalTitle").textContent = goal.title;
  document.getElementById("goalCurrent").textContent =
    currentBalance + " " + currency;
  document.getElementById("goalTarget").textContent =
    goal.amount + " " + currency;

  const bar = document.getElementById("goalBar");
  bar.style.width = percent + "%";

  document.getElementById("goalPercent").textContent =
    "Прогресс: " + percent.toFixed(1) + "%";
}

document.getElementById("createGoalBtn").addEventListener("click", () => {
  const titleInput = document.getElementById("goalInputTitle");
  const amountInput = document.getElementById("goalInputAmount");

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

  if (title === "" || isNaN(amount) || amount <= 0) {
    alert("Введите корректные данные");
    return;
  }

  setGoal(title, amount);

  titleInput.value = "";
  amountInput.value = "";

  renderGoal();
});

const historyFilter = document.getElementById("historyFilter");

if (historyFilter) {
  historyFilter.addEventListener("change", () => {
    renderHistory(historyFilter.value);
  });
}

const goalModal = document.getElementById("goalModal");
const confirmDeleteGoal = document.getElementById("confirmDeleteGoal");
const cancelDeleteGoal = document.getElementById("cancelDeleteGoal");

document.getElementById("clearGoalBtn")?.addEventListener("click", () => {
  goalModal.classList.remove("hidden");
});

cancelDeleteGoal?.addEventListener("click", () => {
  goalModal.classList.add("hidden");
});

confirmDeleteGoal?.addEventListener("click", () => {
  clearGoal();
  renderGoal();
  goalModal.classList.add("hidden");
});

const mobileBtn = document.querySelector(".mobile-menu-btn");
const sideMenu = document.querySelector(".side-menu");

if (mobileBtn) {
  mobileBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("active");
  });
}

const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");

if (toggleHistoryBtn) {
  toggleHistoryBtn.addEventListener("click", () => {
    showAll = !showAll;
    toggleHistoryBtn.textContent = showAll ? "Свернуть" : "Показать всё";
    renderHistory();
  });
}

function refreshUI() {
  const balance = calculateBalance();
  const income = calculateIncome();
  const expense = calculateExpense();

  balanceDisplay.textContent = balance + " ₽";
  document.getElementById("income").textContent = income + " ₽";
  document.getElementById("expense").textContent = expense + " ₽";

  updateBalanceUI(balance);

  renderHistory();
  renderCategories();
  renderCharts();
  renderInsights();
  renderGoal();
}
