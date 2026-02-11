import { renderCharts } from "./analytics.js";

// ===== KPI totals =====
let incomeTotal = 0;
let expenseTotal = 0;

let lastIncome = 0;
let lastExpense = 0;

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

window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  renderGoal();
});

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

  // 2. считаем новые значения
  const newBalance = calculateBalance();
  const newIncome = calculateIncome();
  const newExpense = calculateExpense();

  // 3. проценты
  updateBalanceUI(newBalance);
  updatePercent(
    document.getElementById("incomeChange"),
    newIncome,
    incomeTotal,
  );
  updatePercent(
    document.getElementById("expenseChange"),
    newExpense,
    expenseTotal,
  );

  // 4. обновляем totals
  incomeTotal = newIncome;
  expenseTotal = newExpense;

  // 5. UI
  balanceDisplay.textContent = newBalance + " ₽";
  document.getElementById("income").textContent = newIncome + " ₽";
  document.getElementById("expense").textContent = newExpense + " ₽";

  renderHistory();
  renderCategories();
  renderCharts();
  renderInsights();
  renderGoal();

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

const saveProfileBtn = document.getElementById("saveProfileBtn");

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
    const name = document.getElementById("profileName").value;
    const mode = document.getElementById("profileMode").value;
    const income = document.getElementById("profileIncome").value;

    const profile = {
      name,
      mode,
      income,
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));

    alert("Профиль сохранен");
  });
}

window.addEventListener("load", () => {
  const saved = localStorage.getItem("userProfile");

  if (saved) {
    const profile = JSON.parse(saved);

    document.getElementById("profileName").value = profile.name || "";
    document.getElementById("profileMode").value = profile.mode || "fixed";
    document.getElementById("profileIncome").value = profile.income || "";
  }
});

// ===== SETTINGS =====

const darkModeToggle = document.getElementById("darkModeToggle");
const currencySelect = document.getElementById("currencySelect");
const clearDataBtn = document.getElementById("clearDataBtn");
const resetProfileBtn = document.getElementById("resetProfileBtn");

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

// Подгрузка темы
window.addEventListener("load", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.checked = true;
  }
});

// Валюта
if (currencySelect) {
  currencySelect.addEventListener("change", () => {
    localStorage.setItem("currency", currencySelect.value);
  });
}

window.addEventListener("load", () => {
  const savedCurrency = localStorage.getItem("currency");
  if (savedCurrency && currencySelect) {
    currencySelect.value = savedCurrency;
  }
});

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

// Сброс профиля
if (resetProfileBtn) {
  resetProfileBtn.addEventListener("click", () => {
    if (confirm("Удалить профиль?")) {
      localStorage.removeItem("userProfile");
      location.reload();
    }
  });
}

window.addEventListener("load", () => {
  const balance = calculateBalance();
  const income = calculateIncome();
  const expense = calculateExpense();

  balanceDisplay.textContent = balance + " ₽";
  document.getElementById("income").textContent = income + " ₽";
  document.getElementById("expense").textContent = expense + " ₽";

  renderHistory();
  renderCategories();
  renderCharts();
});
window.addEventListener("goalPageOpened", () => {
  renderGoal();
});

function renderInsights() {
  const list = document.querySelector(".insights");
  const tips = generateInsights();

  list.innerHTML = "<h3>Финансовые подсказки</h3>";

  tips.forEach((tip) => {
    const p = document.createElement("p");
    p.textContent = tip;
    list.appendChild(p);
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

const editProfileBtn = document.getElementById("editProfileBtn");

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    alert("Редактирование профиля будет добавлено в следующем обновлении");
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
