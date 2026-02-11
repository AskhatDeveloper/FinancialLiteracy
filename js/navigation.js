export function initNavigation() {
  const menuLinks = document.querySelectorAll(".side-menu a");
  const pages = document.querySelectorAll(".page");
  const formWrapper = document.querySelector(".form-wrapper");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const page = link.dataset.link;

      // активная кнопка
      menuLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // если add — открываем модалку
      if (page === "add") {
        formWrapper.classList.add("active");
        return;
      }

      // переключаем страницы
      pages.forEach((p) => {
        p.classList.remove("active");
        p.classList.add("hidden");

        if (p.dataset.page === page) {
          p.classList.remove("hidden");
          p.classList.add("active");
        }
      });

      // ✅ ВАЖНО: вот сюда вставляем событие goals
      if (page === "goals") {
        const event = new Event("goalPageOpened");
        window.dispatchEvent(event);
      }
    });
  });
}
