import { transactions } from "./transactions.js";

let lastBalance = 0;

// ===== HELPERS =====
function updatePercent(el, current, last) {
  if (last === 0) {
    el.textContent = "0%";
    el.className = "kpi-change";
    return;
  }

  const percent = ((current - last) / Math.abs(last)) * 100;
  const p = percent.toFixed(1);

  if (percent > 0) {
    el.textContent = `↑ ${p}%`;
    el.className = "kpi-change up";
  } else if (percent < 0) {
    el.textContent = `↓ ${Math.abs(p)}%`;
    el.className = "kpi-change down";
  } else {
    el.textContent = "0%";
    el.className = "kpi-change";
  }
}

function updateBalanceUI(newBalance) {
  const el = document.getElementById("balanceChange");

  if (lastBalance === 0) {
    el.textContent = "0%";
    el.className = "kpi-change";
  } else {
    const percent = ((newBalance - lastBalance) / Math.abs(lastBalance)) * 100;
    const p = percent.toFixed(1);

    if (percent > 0) {
      el.textContent = `↑ ${p}%`;
      el.className = "kpi-change up";
    } else if (percent < 0) {
      el.textContent = `↓ ${Math.abs(p)}%`;
      el.className = "kpi-change down";
    }
  }

  lastBalance = newBalance;
}

let showAll = false;

function renderHistory(filter = "all") {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  let filtered = [...transactions]; // копия массива

  if (filter !== "all") {
    filtered = filtered.filter((t) => t.type === filter);
  }

  // сортировка по дате (новые сверху)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const visible = showAll ? filtered : filtered.slice(0, 5);

  visible.forEach((t) => {
    const li = document.createElement("li");
    li.className = `history-item ${t.type}`;

    const date = new Date(t.date).toLocaleDateString("ru-RU");

    li.innerHTML = `
      <div>
        <strong>${t.type === "income" ? "Доход" : "Расход"}</strong>
        <div class="history-meta">${t.category} • ${date}</div>
      </div>
      <div class="history-amount ${t.type}">
        ${t.type === "income" ? "+" : "-"}${t.amount} ₽
      </div>
    `;

    list.appendChild(li);
  });

  // кнопка показать всё
  const toggleBtn = document.getElementById("toggleHistoryBtn");
  if (toggleBtn) {
    toggleBtn.style.display = filtered.length > 5 ? "block" : "none";
  }

  // статистика
  document.getElementById("totalOps").textContent = filtered.length;
  document.getElementById("totalIncomeOps").textContent = filtered.filter(
    (t) => t.type === "income",
  ).length;
  document.getElementById("totalExpenseOps").textContent = filtered.filter(
    (t) => t.type === "expense",
  ).length;
}

export { renderHistory, updatePercent, updateBalanceUI };
