let balance = 0;

const balanceDisplay = document.getElementById("balance");
const submitBtn = document.getElementById("submitBtn");

// Тема светлая / тёмная
const themePanel = document.getElementById("themePanel");
const toggleTheme = document.querySelector(".toggleTheme");
const lightTheme = document.getElementById("lightTheme");
const darkTheme = document.getElementById("darkTheme");

// открыть / закрыть панель
if (toggleTheme) {
  toggleTheme.addEventListener("click", (e) => {
    e.preventDefault();
    themePanel.classList.toggle("active");
  });
}

// включить светлую тему
if (lightTheme) {
  lightTheme.addEventListener("click", () => {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    themePanel.classList.remove("active");
  });
}

// включить тёмную тему
if (darkTheme) {
  darkTheme.addEventListener("click", () => {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    themePanel.classList.remove("active");
  });
}

// при загрузке страницы — применить сохранённую тему
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// Баланс доходы / расходы
submitBtn.addEventListener("click", () => {
  const type = document.getElementById("type").value;
  const amount = Number(document.getElementById("amount").value);

  if (!amount || amount <= 0) {
    alert("Введите сумму");
    return;
  }

  if (type === "income") {
    balance += amount;
  } else {
    balance -= amount;
  }

  balanceDisplay.textContent = balance;
  document.getElementById("amount").value = "";
});
