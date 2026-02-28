// ===== Elements =====
const balanceDisplay = document.getElementById("balance");

import {
  transactions,
  calculateBalance,
  calculateIncome,
  calculateExpense,
} from "./transactions.js";
import { saveTransactions } from "./transactions.js";
import { renderCategories, getMainLeak } from "./analytics.js";

const formWrapper = document.querySelector(".form-wrapper");
const addBtn = document.querySelector(".add-btn");

const initModal = document.getElementById("initBalanceModal");
const initInput = document.getElementById("initBalanceInput");
const saveInitBtn = document.getElementById("saveInitBalance");

const toast = document.getElementById("toast");
const undoBtn = document.getElementById("undoBtn");

let currentFilter = "all";

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    showAllHistory = false; // ← ВОТ ЭТА СТРОКА ДОБАВЛЯЕТСЯ

    renderHistory();
  });
});

addBtn.addEventListener("click", () => {
  formWrapper.classList.toggle("active");
});

let currency = localStorage.getItem("currency") || "₽";

const currencySelect = document.getElementById("currencySelect");
currencySelect.value = currency;

currencySelect.addEventListener("change", () => {
  currency = currencySelect.value;
  localStorage.setItem("currency", currency);
  refreshUI();
});
const expenseCategories = {
  food: "🍔 Еда",
  transport: "🚗 Транспорт",
  shopping: "🛍 Покупки",
  fun: "🎮 Развлечения",
  health: "💊 Здоровье",
  other: "📦 Другое",
};

const incomeCategories = {
  salary: "💼 Зарплата",
  freelance: "💻 Фриланс",
  gift: "🎁 Подарок",
  sale: "💰 Продажа",
  other_income: "➕ Другое",
};

function renderQuickCategories(type) {
  quickCategoriesContainer.innerHTML = "";

  const source = type === "income" ? incomeCategories : expenseCategories;

  Object.entries(source).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.dataset.category = key;
    btn.textContent = label;

    btn.addEventListener("click", () => {
      const amount = Number(amountInput.value);

      if (!amount || amount <= 0) {
        alert("Введите сумму");
        return;
      }

      const newTransaction = {
        id: Date.now(),
        type: selectedType,
        amount,
        category: key,
        date: new Date().toISOString(),
      };

      transactions.push(newTransaction);
      lastTransactionId = newTransaction.id;

      formWrapper.classList.remove("active"); // ← ОДНА СТРОКА ЗАКРЫТИЯ

      saveTransactions();
      refreshUI();
      renderHistory();
      showToast();

      amountInput.value = "";
    });

    quickCategoriesContainer.appendChild(btn);
  });
}

const quickCategoriesContainer = document.getElementById("quickCategories");

// Добавление операции
// ===== QUICK ADD (категория = сохранить) =====

const amountInput = document.getElementById("amount");
document.querySelectorAll(".quick-amounts button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = Number(btn.dataset.value);
    amountInput.value = Number(amountInput.value || 0) + value;
  });
});

let selectedType = "expense"; // по умолчанию

document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".type-btn")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 150);
    selectedType = btn.dataset.type;

    renderQuickCategories(selectedType);
  });
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

// ===== SETTINGS =====

function refreshUI() {
  const balance = calculateBalance();
  const income = calculateIncome();
  const expense = calculateExpense();

  balanceDisplay.textContent = balance + " " + currency;

  balanceDisplay.classList.remove("balance-animate");
  void balanceDisplay.offsetWidth; // перезапуск анимации
  balanceDisplay.classList.add("balance-animate");

  balanceDisplay.classList.remove("balance-positive", "balance-negative");

  if (balance > 0) {
    balanceDisplay.classList.add("balance-positive");
  } else if (balance < 0) {
    balanceDisplay.classList.add("balance-negative");
  }
  document.getElementById("income").textContent = income + " " + currency;
  document.getElementById("expense").textContent = expense + " " + currency;

  renderCategories();

  // === ГЛАВНАЯ УТЕЧКА ===
  const leak = getMainLeak();
  const leakText = document.getElementById("mainLeakText");

  if (!leak) {
    leakText.textContent = "Пока нет данных";
  } else {
    if (leak.percent >= 40) {
      leakText.textContent = `⚠️ ${leak.name} съедает ${leak.percent}% ваших денег`;
    } else {
      leakText.textContent = `Больше всего денег уходит на ${leak.name} — ${leak.percent}% ваших расходов`;
    }
  }

  // === ДНИ ДО НУЛЯ ===
  const runwayText = document.getElementById("runwayText");
  const expenses = transactions.filter((t) => t.type === "expense");

  if (expenses.length === 0) {
    runwayText.textContent = "Недостаточно данных";
  } else {
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

    const firstDate = new Date(expenses[0].date);
    const now = new Date();
    const daysPassed = Math.max(
      1,
      Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)),
    );

    const avgDaily = totalExpense / daysPassed;
    const daysLeft = avgDaily > 0 ? Math.floor(balance / avgDaily) : 0;

    if (balance <= 0) {
      runwayText.textContent = "Вы уже в минусе";
    } else if (daysLeft <= 7) {
      runwayText.textContent = `⚠️ Денег хватит всего на ${Math.max(0, daysLeft)} дней`;
    } else {
      runwayText.textContent = `При текущем темпе денег хватит на ${daysLeft} дней`;
    }
  }
}

window.addEventListener("load", () => {
  renderQuickCategories("expense"); // сначала рендер категорий
  refreshUI(); // потом UI

  if (!localStorage.getItem("initialBalance")) {
    initModal.classList.add("active");
  }
});

saveInitBtn.addEventListener("click", () => {
  const value = Number(initInput.value);

  if (!value || value < 0) {
    alert("Введите корректную сумму");
    return;
  }

  localStorage.setItem("initialBalance", value);
  initModal.classList.remove("active");
  refreshUI();
});

const resetBtn = document.getElementById("resetApp");

const resetModal = document.getElementById("resetModal");
const confirmResetBtn = document.getElementById("confirmReset");
const cancelResetBtn = document.getElementById("cancelReset");

resetBtn.addEventListener("click", () => {
  resetModal.classList.add("active");
});

cancelResetBtn.addEventListener("click", () => {
  resetModal.classList.remove("active");
});

confirmResetBtn.addEventListener("click", () => {
  localStorage.removeItem("transactions");
  localStorage.removeItem("initialBalance");

  transactions.splice(0, transactions.length);

  // Сброс состояния интерфейса
  currentFilter = "all";
  showAllHistory = false;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === "all") {
      btn.classList.add("active");
    }
  });

  resetModal.classList.remove("active");

  const list = document.getElementById("transactionList");
  list.innerHTML = `<li class="category-empty">Нет операций</li>`;
  refreshUI();
  renderHistory(); // ← добавить

  initModal.classList.add("active");
});

let lastTransactionId = null;

function showToast() {
  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
    lastTransactionId = null;
  }, 5000);
}
undoBtn.addEventListener("click", () => {
  if (lastTransactionId !== null) {
    const index = transactions.findIndex((t) => t.id === lastTransactionId);

    if (index !== -1) {
      transactions.splice(index, 1);
      saveTransactions();
      refreshUI();
      renderHistory();
    }
  }

  toast.classList.remove("active");
  lastTransactionId = null;
});

let showAllHistory = false;

const historyList = document.getElementById("transactionList");

historyList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = Number(e.target.dataset.id);

    const index = transactions.findIndex((t) => t.id === id);

    if (index !== -1) {
      transactions.splice(index, 1);
      saveTransactions();
      refreshUI();
      renderHistory();
    }
  }
});

function renderHistory() {
  const list = document.getElementById("transactionList");
  const toggleBtn = document.getElementById("toggleHistoryBtn");

  list.innerHTML = "";

  let filtered = transactions;

  if (currentFilter !== "all") {
    filtered = transactions.filter((t) => t.type === currentFilter);
  }

  if (filtered.length === 0) {
    list.innerHTML = `<li class="category-empty">Нет операций</li>`;
    toggleBtn.classList.add("hidden");
    return;
  }

  const reversed = filtered.slice().reverse();

  const LIMIT = 5;
  const visible = showAllHistory ? reversed : reversed.slice(0, LIMIT);

  visible.forEach((t) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const sign = t.type === "income" ? "+" : "-";

    li.innerHTML = `
    <div>
      <div class="${t.type === "income" ? "text-income" : "text-expense"}">
        ${sign}${t.amount} ${currency}
      </div>
      <div class="history-date">${formatDate(t.date)}</div>
    </div>
    <span class="delete-btn" data-id="${t.id}">✕</span>
  `;

    list.appendChild(li);
  });

  if (filtered.length > LIMIT) {
    toggleBtn.classList.remove("hidden");
    toggleBtn.textContent = showAllHistory ? "Скрыть" : "Показать всё";
  } else {
    toggleBtn.classList.add("hidden");
  }
}

document.getElementById("toggleHistoryBtn").addEventListener("click", () => {
  showAllHistory = !showAllHistory;
  renderHistory();
});

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
