import { transactions } from "./transactions.js";

let incomeChart;
let expenseChart;
let barChart;
let pieChart;

const categories = {
  food: "Еда",
  transport: "Транспорт",
  subscriptions: "Подписки",
  shopping: "Покупки",
  fun: "Развлечения",
  health: "Здоровье",
  other: "Другое",
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
    name: categories[key],
    percent: Math.round((value / total) * 100),
  }));
}
function renderCategories() {
  const list = document.getElementById("categoryList");
  list.innerHTML = "";

  const stats = calculateCategoryStats();

  if (stats.length === 0) {
    list.innerHTML = `
    <li class="category-empty">
      Добавьте расход, чтобы увидеть анализ категорий
    </li>
  `;
    return;
  }

  stats.forEach((c) => {
    const li = document.createElement("li");
    li.className = "category-item";

    li.innerHTML = `
      <span>${c.name}</span>
      <span class="category-percent">${c.percent}%</span>
    `;

    // 🔥 ВОТ СЮДА
    if (c.percent > 40) {
      li.style.fontWeight = "600";
    }
    if (c.percent > 40) {
      li.style.color = "var(--danger)";
    }

    list.appendChild(li);
  });
}

export function generateInsights() {
  const incomes = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  const insights = [];

  if (totalIncome === 0) {
    insights.push("Добавьте доходы для анализа.");
    return insights;
  }

  const expensePercent = ((totalExpense / totalIncome) * 100).toFixed(1);
  const savingsPercent = (100 - expensePercent).toFixed(1);

  // 1️⃣ Соотношение доход / расход
  if (expensePercent > 80) {
    insights.push(`⚠️ Вы тратите ${expensePercent}% дохода — это рискованно.`);
  } else if (expensePercent > 50) {
    insights.push(`Вы тратите ${expensePercent}% дохода.`);
  } else {
    insights.push(`Отлично! Вы тратите только ${expensePercent}% дохода.`);
  }

  // 2️⃣ Накопления
  if (savingsPercent > 20) {
    insights.push(`Вы откладываете ${savingsPercent}% дохода.`);
  }

  // 3️⃣ Баланс
  const balance = totalIncome - totalExpense;

  if (balance > 0) {
    insights.push("Баланс положительный.");
  } else {
    insights.push("Баланс отрицательный. Нужно сократить расходы.");
  }

  return insights;
}
function groupByMonth(type) {
  const result = {};

  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      const month = new Date(t.date).toLocaleString("ru-RU", {
        month: "short",
        year: "numeric",
      });

      result[month] = (result[month] || 0) + t.amount;
    });

  return result;
}
function renderPieChart() {
  const expenses = transactions.filter((t) => t.type === "expense");

  const categoryTotals = {};

  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const ctx = document.getElementById("pieChart");
  if (!ctx) return;

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals).map((key) => categories[key]),
      datasets: [
        {
          data: Object.values(categoryTotals),
        },
      ],
    },
  });
}

function renderBarChart() {
  const incomeData = groupByMonth("income");
  const expenseData = groupByMonth("expense");

  const months = Array.from(
    new Set([...Object.keys(incomeData), ...Object.keys(expenseData)]),
  );

  const ctx = document.getElementById("incomeExpenseBar");
  if (!ctx) return;

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Доход",
          data: months.map((m) => incomeData[m] || 0),
        },
        {
          label: "Расход",
          data: months.map((m) => expenseData[m] || 0),
        },
      ],
    },
  });
}

export { renderCategories };
export function renderCharts() {
  renderBarChart();
  renderPieChart();
}
