import { getUserRole, getSession } from "../utils/auth.js";

const NAV_LINKS_ADMIN = [
  { page: "categories", label: "Catégories", icon: "fa-tags" },
  { page: "produits", label: "Produits", icon: "fa-bag-shopping" },
  { page: "fournisseurs", label: "Fournisseurs", icon: "fa-truck" },
];

const NAV_LINKS_FOURNISSEUR = [
  { page: "produits", label: "Produits", icon: "fa-bag-shopping" },
  { page: "categories", label: "Catégories", icon: "fa-tags" },
];

export function renderSidebar() {
  const role = getUserRole();
  const user = getSession();

  const links = role === "admin" ? NAV_LINKS_ADMIN : NAV_LINKS_FOURNISSEUR;

  const roleBadge = role === "admin"
    ? `<span class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">Admin</span>`
    : `<span class="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-600">Fournisseur</span>`;

  const items = links.map((link) => `
    <button class="nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" data-page="${link.page}">
      <i class="fa-solid ${link.icon} w-5 text-center"></i>
      <span>${link.label}</span>
    </button>
  `).join("");

  return `
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0">
      <div class="flex items-center gap-3 px-5 py-5">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-black tracking-wide text-white shadow-lg shadow-indigo-200">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <h1 class="text-lg font-extrabold tracking-tight text-slate-950">Gestion Appro</h1>
         
        </div>
      </div>

      <nav class="grid gap-2 px-4 pb-4" aria-label="Navigation principale">
        ${items}
      </nav>
      <!-- Infos utilisateur + déconnexion -->
      <div class="absolute bottom-5 w-full px-5 grid gap-3">
 
        <!-- Carte utilisateur -->
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
              ${user ? user.nom.charAt(0).toUpperCase() : "?"}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-slate-950">${user ? user.nom : ""}</p>
              <p class="truncate text-xs text-slate-500">${user ? user.email : ""}</p>
            </div>
          </div>
          <div class="mt-2">${roleBadge}</div>
        </div>
 
        <!-- Bouton déconnexion -->
        <button
          id="logoutBtn"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Déconnexion</span>
        </button>
 
      </div>

    </aside>

    <div id="sidebarOverlay" class="fixed inset-0 z-30 hidden bg-slate-950/40 backdrop-blur-sm lg:hidden"></div>
  `;
}
