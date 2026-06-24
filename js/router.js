// import { showToast } from "./components/toast.js";
// import { renderCategoriesPage } from "./pages/categoriesPage.js";
// import { renderProduitsPage } from "./pages/produitsPage.js";

// const routes = {
//   categories: renderCategoriesPage,
//   produits: renderProduitsPage,
// };

// const titles = {
//   categories: "Catégories",
//   produits: "Produits",

// };
// const defaultPage = "categories"
// // Fonction pour obtenir la page actuelle depuis l'URL
// export function getCurrentPage() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const page = urlParams.get("page")
//  // console.log(urlParams);
//   //return urlParams.get("page") || "categories";
//   return routes[page] ? page : defaultPage
// }
// // Fonction pour mettre à jour l'URL sans recharger la page
// export function updateUrl(page) {
//   const newUrl = `${window.location.pathname}?page=${page}`;
//   window.history.pushState({ page }, "", newUrl);
// }

// // Fonction pour mettre à jour le menu actif
// function updateActiveMenu(page) {
//   const app = document.getElementById("app")
//   const activePage = routes[page] ? page : defaultPage
//   const route = routes[activePage]
//   if(updateUrl){
//     updateUrl(activePage)
//   }
//   document.querySelectorAll("[data-page]").forEach((button) => {
//     const isActive = button.dataset.page === page;
//     button.classList.toggle("bg-slate-950", isActive);
//     button.classList.toggle("text-white", isActive);
//     button.classList.toggle("shadow-lg", isActive);
//     button.classList.toggle("shadow-slate-200", isActive);
//     button.classList.toggle("text-slate-600", !isActive);
//     button.classList.toggle("hover:bg-slate-100", !isActive);
//     button.classList.toggle("hover:text-slate-950", !isActive);
//   });

//   const navbarTitle = document.getElementById("navbarTitle");
//   if (navbarTitle) {
//     navbarTitle.textContent = titles[page] || titles.categories;
//   }
// }

// export async function navigate(page = "categories") {
//   const app = document.getElementById("app");
//   const route = routes[page] || routes.categories;

//     // Mettre à jour l'URL
//   updateUrl(page);
  
//   // Mettre à jour le menu actif
//   updateActiveMenu(page);

//   // Afficher le loader


//   app.innerHTML = `
//     <div class="grid min-h-[50vh] place-items-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
//       <div>
//         <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
//         <p class="mt-4 text-sm font-bold text-slate-500">Chargement...</p>
//       </div>
//     </div>
//   `;

//   try {
//     await route();
//   } catch (error) {
//     app.innerHTML = `
//       <section class="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
//         <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
//           <i class="fa-solid fa-triangle-exclamation"></i>
//         </div>
//         <h1 class="text-2xl font-black tracking-tight text-slate-950">Erreur de chargement</h1>
//         <p class="mt-2 text-sm leading-6 text-slate-600">${error.message}</p>
//         <p class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
//           Vérifie que JSON Server est bien lancé avec :
//           <strong class="font-black text-slate-950">npx json-server db.json --port 3000</strong>
//         </p>
//       </section>
//     `;
//     showToast(error.message, "error");
//   }
// }
// // Initialiser le routeur (à appeler une fois au chargement)
// export function initRouter() {
//   const currentPage = getCurrentPage();
  
//   // Navigation initiale
//   navigate(currentPage);

//   // Gestion du bouton retour du navigateur
//   window.addEventListener("popstate", () => {
//     const page = getCurrentPage();
//     navigate(page);
//   });

//   // Gestion des clics sur les liens de navigation
//   document.querySelectorAll("[data-page]").forEach((button) => {
//     button.addEventListener("click", (event) => {
//       event.preventDefault();
//       const page = button.dataset.page;
//       navigate(page);
      
//       // Fermer la sidebar mobile
//       const sidebar = document.getElementById("sidebar");
//       const overlay = document.getElementById("sidebarOverlay");
//       if (sidebar && overlay) {
//         sidebar.classList.remove("translate-x-0");
//         sidebar.classList.add("-translate-x-full");
//         overlay.classList.add("hidden");
//       }
//     });
//   });
// }
import { showToast } from "./components/toast.js";
import { renderCategoriesPage } from "./pages/categoriesPage.js";
import { renderProduitsPage } from "./pages/produitsPage.js";
import { renderLoginPage } from "./pages/loginPage.js";
import { isAuthenticated, getUserRole } from "./utils/auth.js";


const routes = {
  categories: renderCategoriesPage,
  produits: renderProduitsPage,

};

// Routes accessibles uniquement par l'admin
const ADMIN_ONLY_ROUTES = ["fournisseurs"];

const titles = {
  categories: "Catégories",
  produits: "Produits",
};

const DEFAULT_PAGE = "categories";

export function getCurrentPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");

  return routes[page] ? page : DEFAULT_PAGE;
}

function updatePageUrl(page) {
  const url = new URL(window.location.href);
  url.searchParams.set("page", page);

  history.pushState(null, "", url);
}

export async function navigate(page = DEFAULT_PAGE, updateUrl = true) {
  // ── Guard 1 : non authentifié → login ──
  if (!isAuthenticated()) {
    renderLoginPage();
    return;
  }
 
  const role = getUserRole();
  const activePage = routes[page] ? page : DEFAULT_PAGE;
 
  // ── Guard 2 : fournisseur sur une route admin only → redirection produits ──
  if (ADMIN_ONLY_ROUTES.includes(activePage) && role !== "admin") {
    showToast("Accès refusé.", "error");
    await navigate("produits", true);
    return;
  }

  const route = routes[activePage];

  if (updateUrl) {
    updatePageUrl(activePage);
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    const isActive = button.dataset.page === activePage;

    button.classList.toggle("bg-slate-950", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-lg", isActive);
    button.classList.toggle("shadow-slate-200", isActive);

    button.classList.toggle("text-slate-600", !isActive);
    button.classList.toggle("hover:bg-slate-100", !isActive);
    button.classList.toggle("hover:text-slate-950", !isActive);
  });

  const navbarTitle = document.getElementById("navbarTitle");

  if (navbarTitle) {
    navbarTitle.textContent = titles[activePage] || titles[DEFAULT_PAGE];
  }

  app.innerHTML = `
    <div class="grid min-h-[50vh] place-items-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div>
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p class="mt-4 text-sm font-bold text-slate-500">Chargement...</p>
      </div>
    </div>
  `;

  try {
    await route();
  } catch (error) {
    app.innerHTML = `
      <section class="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h1 class="text-2xl font-black tracking-tight text-slate-950">
          Erreur de chargement
        </h1>

        <p class="mt-2 text-sm leading-6 text-slate-600">
          ${error.message}
        </p>

        <p class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Vérifie que JSON Server est bien lancé avec :
          <strong class="font-black text-slate-950">
            npx json-server db.json --port 3000
          </strong>
        </p>
      </section>
    `;

    showToast(error.message, "error");
  }
}
