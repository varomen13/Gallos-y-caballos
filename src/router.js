export function iniciarNavegacion() {
  const secciones = [...document.querySelectorAll(".page-section")];
  const enlaces = [...document.querySelectorAll(".nav-link")];
  const menu = document.querySelector(".main-nav");
  const botonMenu = document.querySelector(".menu-toggle");

  function navegar(hash) {
    const destino = document.querySelector(hash);
    if (!destino || !destino.classList.contains("page-section")) return;
    secciones.forEach((seccion) => seccion.classList.toggle("is-visible", seccion === destino));
    enlaces.forEach((enlace) => {
      const activo = enlace.getAttribute("href") === hash;
      enlace.classList.toggle("is-active", activo);
      if (activo) enlace.setAttribute("aria-current", "page");
      else enlace.removeAttribute("aria-current");
    });
    menu.classList.remove("menu-open");
    botonMenu.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", (event) => {
    const enlace = event.target.closest('a[href^="#"]');
    if (!enlace) return;
    const hash = enlace.getAttribute("href");
    if ([...document.querySelectorAll(".page-section")].some((section) => `#${section.id}` === hash)) {
      event.preventDefault();
      history.replaceState(null, "", hash);
      navegar(hash);
    }
  });

  window.addEventListener("hashchange", () => navegar(location.hash || "#inicio"));
  botonMenu.addEventListener("click", () => {
    const abierto = menu.classList.toggle("menu-open");
    botonMenu.setAttribute("aria-expanded", String(abierto));
  });
  navegar(location.hash || "#inicio");
}
