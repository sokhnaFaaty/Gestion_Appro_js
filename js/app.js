// import { renderSidebar } from "./components/sidebar.js";
// import { renderNavbar } from "./components/navbar.js";
// import { navigate } from "./router.js";
// import { initRouter } from "./router.js";


// function mountLayout() {
//   document.getElementById("sidebarRoot").innerHTML = renderSidebar();
//   document.getElementById("navbarRoot").innerHTML = renderNavbar();
// }

// function initSidebar() {
//   const sidebar = document.getElementById("sidebar");
//   const overlay = document.getElementById("sidebarOverlay");
//   const toggle = document.getElementById("sidebarToggle");

//   const close = () => {
//     sidebar.classList.add("-translate-x-full");
//     overlay.classList.add("hidden");
//   };

//   toggle.addEventListener("click", () => {
//     sidebar.classList.remove("-translate-x-full");
//     overlay.classList.remove("hidden");
//   });

//   overlay.addEventListener("click", close);

//   return { close };
// }

// function initNavigation(sidebar) {
//   document.querySelectorAll("[data-page]").forEach((button) => {
//     button.addEventListener("click", async () => {
//       await navigate(button.dataset.page);
//       if (window.innerWidth < 1024) sidebar.close();
//     });
//   });
// }

// function startApp() {
//   mountLayout();
//   const sidebar = initSidebar();
//   initNavigation(sidebar);
//   // navigate("categories");
// }

// startApp();
import { renderSidebar } from "./components/sidebar.js";
import { renderNavbar } from "./components/navbar.js";
import { navigate, getCurrentPageFromUrl } from "./router.js";
import { initProductView } from "./pages/produitsPage.js";

import { isAuthenticated } from "./utils/auth.js";
import { renderLoginPage } from "./pages/loginPage.js";
import { logout } from "./services/authService.js";


function mountLayout() {
  document.getElementById("sidebarRoot").innerHTML = renderSidebar();
  document.getElementById("navbarRoot").innerHTML = renderNavbar();
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("sidebarToggle");

    if (!sidebar || !overlay || !toggle) return { close: () => {} };

  const close = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  toggle.addEventListener("click", () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  });

  overlay.addEventListener("click", close);

  return { close };
}

function initNavigation(sidebar) {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigate(button.dataset.page);
      if (window.innerWidth < 1024) sidebar.close();
    });
  });
}

function startApp() {
    // Si non connecté → afficher login directement (sans layout)
  if (!isAuthenticated()) {
    renderLoginPage();
    return;
  }
 
  // Connecté → monter le layout complet

  mountLayout();
  // Brancher le bouton déconnexion de la sidebar
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const sidebar = initSidebar();
  initNavigation(sidebar);
  navigate(getCurrentPageFromUrl(), false);
   window.addEventListener("popstate", () => {
    navigate(getCurrentPageFromUrl(), false);
  });
}

startApp();