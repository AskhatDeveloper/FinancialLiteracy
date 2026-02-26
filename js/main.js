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

addBtn.addEventListener("click", () => {
  formWrapper.classList.toggle("active");
});

// Добавление операции
// ===== QUICK ADD (категория = сохранить) =====

const amountInput = document.getElementById("amount");
const categoryButtons = document.querySelectorAll(".quick-categories button");

let selectedType = "expense"; // по умолчанию

document.querySelectorAll(".quick-amounts button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = Number(btn.dataset.value);
    amountInput.value = Number(amountInput.value || 0) + value;
  });
});

// Переключение типа
document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".type-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedType = btn.dataset.type;
  });
});

// Нажатие на категорию = сохранить
categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const amount = Number(amountInput.value);
    const category = btn.dataset.category;

    if (!amount || amount <= 0) {
      alert("Введите сумму");
      return;
    }

    transactions.push({
      type: selectedType,
      amount,
      category,
      date: new Date().toISOString(),
    });

    saveTransactions();
    refreshUI();

    amountInput.value = "";
    amountInput.focus();
    formWrapper.classList.remove("active");
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

  balanceDisplay.textContent = balance + " ₽";
  document.getElementById("income").textContent = income + " ₽";
  document.getElementById("expense").textContent = expense + " ₽";

  renderCategories();

  // === ГЛАВНАЯ УТЕЧКА ===
  const leak = getMainLeak();
  const leakText = document.getElementById("mainLeakText");

  if (!leak) {
    leakText.textContent = "Пока нет данных";
  } else {
    leakText.textContent = `Больше всего денег уходит на ${leak.name} — ${leak.percent}% ваших расходов`;
  }
  if (leak.percent >= 40) {
    leakText.textContent = `⚠️ ${leak.name} съедает ${leak.percent}% ваших денег`;
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
    } else {
      runwayText.textContent = `При текущем темпе денег хватит на ${daysLeft} дней`;
    }
    if (daysLeft <= 7) {
      runwayText.textContent = `⚠️ Денег хватит всего на ${daysLeft} дней`;
    }
  }
}

window.addEventListener("load", () => {
  refreshUI();
});
