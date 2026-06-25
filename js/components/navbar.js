import { getSession, getUserRole } from "../utils/auth.js";
export function renderNavbar() {
  const user = getSession();
  const role = getUserRole();
 
  const roleBadge = role === "admin"
    ? `<span class="hidden sm:inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-600">Admin</span>`
    : `<span class="hidden sm:inline-flex rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-600">Fournisseur</span>`;

  return `
    <header class="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:left-72">
      <div class="flex items-center gap-3">
        <button
          id="sidebarToggle"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="flex items-center gap-2 text-sm font-bold text-slate-500">
          <i class="fa-solid fa-house text-slate-400">gi</i>
          <span id="navbarTitle">Catégories</span>
        </div>
      </div>
 
      <!-- Infos utilisateur -->
      <div class="flex items-center gap-3">
        ${roleBadge}
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
            ${user ? user.nom.charAt(0).toUpperCase() : "?"}
          </div>
          <span class="hidden sm:block text-sm font-semibold text-slate-700">${user ? user.nom : ""}</span>
        </div>
      </div>
    </header>
  `;
}