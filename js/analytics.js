import { transactions } from "./transactions.js";

let showAllCategories = false;

const categories = {
  food: "Еда",
  transport: "Транспорт",
  shopping: "Покупки",
  fun: "Развлечения",
  health: "Здоровье",
  other: "Другое",
};

const incomeCategories = {
  salary: "💼 Зарплата",
  freelance: "💻 Фриланс",
  gift: "🎁 Подарок",
  sale: "💰 Продажа",
  other_income: "➕ Другое",
};

function calculateCategoryStats() {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((s, t) => s + t.amount, 0);

  if (total === 0) return [];

  const stats = {};

  expenses.forEach((t) => {
    stats[t.category] = (stats[t.category] || 0) + t.amount;
  });

  return Object.entries(stats).map(([key, value]) => ({
    name: categories[key] || "Другое",
    percent: Math.round((value / total) * 100),
  }));
}

function renderCategories() {
  const list = document.getElementById("categoryList");
  const toggleBtn = document.getElementById("toggleCategoriesBtn");

  list.innerHTML = "";

  const stats = calculateCategoryStats();

  if (stats.length === 0) {
    list.innerHTML = `
      <li class="category-empty">
        Добавьте расход, чтобы увидеть анализ категорий
      </li>
    `;
    toggleBtn.classList.add("hidden");
    return;
  }

  const LIMIT = 4;

  const visibleStats = showAllCategories ? stats : stats.slice(0, LIMIT);

  visibleStats.forEach((c) => {
    const li = document.createElement("li");
    li.className = "category-item";

    li.innerHTML = `
      <span>${c.name}</span>
      <span class="category-percent">${c.percent}%</span>
    `;

    list.appendChild(li);
  });

  if (stats.length > LIMIT) {
    toggleBtn.classList.remove("hidden");
    toggleBtn.textContent = showAllCategories ? "Скрыть" : "Показать всё";
  } else {
    toggleBtn.classList.add("hidden");
  }
}

document
  .getElementById("toggleCategoriesBtn")
  ?.addEventListener("click", () => {
    showAllCategories = !showAllCategories;
    renderCategories();
  });

export function getMainLeak() {
  const stats = calculateCategoryStats();

  if (stats.length === 0) return null;

  return stats.sort((a, b) => b.percent - a.percent)[0];
}
export { renderCategories };
