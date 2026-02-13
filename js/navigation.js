export function initNavigation() {
  const menuLinks = document.querySelectorAll(".side-menu a");
  const pages = document.querySelectorAll(".page");
  const formWrapper = document.querySelector(".form-wrapper");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const page = link.dataset.link;

      // 1️⃣ активная кнопка
      menuLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // 2️⃣ если add — открываем модалку
      if (page === "add") {
        formWrapper.classList.add("active");
        return;
      }

      // 3️⃣ скрываем ВСЕ страницы
      pages.forEach((p) => {
        p.classList.remove("active");
        p.classList.add("hidden");
      });

      // 4️⃣ показываем нужную страницу
      const targetPage = document.querySelector(`.page[data-page="${page}"]`);

      if (targetPage) {
        targetPage.classList.remove("hidden");
        targetPage.classList.add("active");
      }

      // 5️⃣ если открыли goals — обновляем цель
      if (page === "goals") {
        window.dispatchEvent(new Event("goalPageOpened"));
      }
    });
  });
}
