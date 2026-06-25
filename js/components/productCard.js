// components/productCard.js
import { escapeHtml } from "../utils/html.js";
import { isFournisseur } from "../utils/auth.js";

export function renderProductCard(produit, catMap) {
  return `
    <div class="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-lg">
      <div class="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
        ${produit.imageUrl
          ? `<img src="${produit.imageUrl}" alt="${escapeHtml(produit.libelle)}" class="h-full w-full object-cover transition group-hover:scale-105" />`
          : `<div class="flex h-full w-full items-center justify-center text-slate-400"><i class="fa-solid fa-image text-4xl"></i></div>`
        }
      </div>
      <div class="mt-3">
        <h3 class="font-bold text-slate-950 line-clamp-1">${escapeHtml(produit.libelle)}</h3>
        <p class="text-sm text-slate-500">${escapeHtml(catMap[produit.categorieId] || produit.categorieId)}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-lg font-extrabold text-indigo-600">${Number(produit.prix).toLocaleString('fr-FR')} FCFA</span>
          <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">Qté: ${escapeHtml(produit.quantite)}</span>
        </div>
        ${!isFournisseur() ? `
        <div class="mt-3 flex gap-2">
          <button class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(produit.id)}">
            <i class="fa-solid fa-pen"></i> Modifier
          </button>
          <button class="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(produit.id)}">
            <i class="fa-solid fa-trash"></i> Supprimer
          </button>
        </div>` : ""}
      </div>
    </div>
  `;
}

export function renderProductGrid(produits, catMap) {
  if (!produits || produits.length === 0) {
    return `
      <div class="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm font-semibold text-slate-500">
        Aucun produit disponible.
      </div>
    `;
  }

  const cards = produits.map(produit => renderProductCard(produit, catMap)).join("");

  return `
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      ${cards}
    </div>
  `;
}