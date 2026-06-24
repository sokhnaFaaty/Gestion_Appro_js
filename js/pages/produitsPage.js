import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm, closeModal } from "../components/modal.js"; // ← Ajouter closeModal
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { renderProductGrid } from "../components/productCard.js";
import { renderViewToggle } from "../components/viewToggle.js";
import { countProduits } from "../services/produitService.js";
import { 
  showError, 
  hideError, 
  validateField, 
  validateNumber, 
  validateSelect 
} from "../utils/formValidator.js";
import {
  createProduit,
  deleteProduit,
  getProduits,
  updateProduit,
} from "../services/produitService.js";
import { getCategories } from "../services/categorieService.js";
import { uploadProductImage } from "../services/cloudinaryService.js";
import { navigate } from "../router.js";

let categoriesCache = [];


function produitFormBody(produit, categories) {
  const options = categories
    .map(
      (cat) =>
        `<option value="${escapeHtml(cat.id)}" ${produit?.categorieId == cat.id ? "selected" : ""}>${escapeHtml(cat.libelle)}</option>`,
    )
    .join("");

  return `
    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitLibelle">Libellé *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="produitLibelle" value="${escapeHtml(produit?.libelle || "")}" placeholder="ex: Ordinateur portable" autocomplete="off" />
      <p id="produitLibelleError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitPrix">Prix *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" step="0.01" id="produitPrix" value="${escapeHtml(produit?.prix || "")}" placeholder="ex: 600000" autocomplete="off" />
      <p id="produitPrixError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitQuantite">Quantité *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitQuantite" value="${escapeHtml(produit?.quantite || "")}" placeholder="ex: 1000" autocomplete="off" />
      <p id="produitQuantiteError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitCategorie">Catégorie *</label>
      <select class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="categorieId">
        <option value="" disabled ${!produit?.categorieId ? "selected" : ""}>Choisir une catégorie</option>
        ${options}
      </select>
      <p id="produitCategorieError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitImage">Image du produit ${!produit ? "*" : ""}</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-indigo-600 hover:file:bg-indigo-100" type="file" id="produitImage" accept="image/*" />
      ${produit?.imageUrl ? `<img src="${produit.imageUrl}" alt="Image du produit" class="mt-2 h-20 w-20 rounded-lg object-cover" />` : ""}
      <p id="produitImageError" class="mt-1 hidden text-xs text-rose-600"></p>
      <p class="mt-1 text-xs text-slate-400">Formats acceptés : JPG, PNG, WebP (max 2 Mo)</p>
    </div>
  `;
}

function attachValidationEvents(modal, produit) {
  // Validation du libellé
  const libelleInput = modal.querySelector("#produitLibelle");
  if (libelleInput) {
    libelleInput.addEventListener("input", () => {
      const error = validateField(libelleInput.value, "Le libellé");
      if (error) {
        showError("produitLibelle", "produitLibelleError", error);
      } else {
        hideError("produitLibelle", "produitLibelleError");
      }
    });
    libelleInput.addEventListener("blur", () => {
      const error = validateField(libelleInput.value, "Le libellé");
      if (error) {
        showError("produitLibelle", "produitLibelleError", error);
      } else {
        hideError("produitLibelle", "produitLibelleError");
      }
    });
  }

  // Validation du prix
  const prixInput = modal.querySelector("#produitPrix");
  if (prixInput) {
    prixInput.addEventListener("input", () => {
      const error = validateNumber(prixInput.value, "Le prix");
      if (error) {
        showError("produitPrix", "produitPrixError", error);
      } else {
        hideError("produitPrix", "produitPrixError");
      }
    });
    prixInput.addEventListener("blur", () => {
      const error = validateNumber(prixInput.value, "Le prix");
      if (error) {
        showError("produitPrix", "produitPrixError", error);
      } else {
        hideError("produitPrix", "produitPrixError");
      }
    });
  }

  // Validation de la quantité
  const quantiteInput = modal.querySelector("#produitQuantite");
  if (quantiteInput) {
    quantiteInput.addEventListener("input", () => {
      const error = validateNumber(quantiteInput.value, "La quantité");
      if (error) {
        showError("produitQuantite", "produitQuantiteError", error);
      } else {
        hideError("produitQuantite", "produitQuantiteError");
      }
    });
    quantiteInput.addEventListener("blur", () => {
      const error = validateNumber(quantiteInput.value, "La quantité");
      if (error) {
        showError("produitQuantite", "produitQuantiteError", error);
      } else {
        hideError("produitQuantite", "produitQuantiteError");
      }
    });
  }

  // Validation de la catégorie
  const categorieSelect = modal.querySelector("#categorieId");
  if (categorieSelect) {
    categorieSelect.addEventListener("change", () => {
      const error = validateSelect(categorieSelect.value, "catégorie");
      if (error) {
        showError("categorieId", "produitCategorieError", error);
      } else {
        hideError("categorieId", "produitCategorieError");
      }
    });
  }

  // Validation de l'image - SEULEMENT si c'est un nouveau produit
  const imageInput = modal.querySelector("#produitImage");
  if (imageInput && !produit) {
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) {
        showError("produitImage", "produitImageError", "L'image est obligatoire.");
      } else {
        hideError("produitImage", "produitImageError");
      }
    });
  }
}

// async function openProduitForm(produit = null) {
//   const categories = await getCategories();

//   openModal({
//     title: produit ? "Modifier le produit" : "Nouveau produit",
//     icon: "fa-bag-shopping",
//     body: produitFormBody(produit, categories),
//     confirmLabel: produit ? "Enregistrer" : "Créer",
//     onMount: (modal) => {
//       attachValidationEvents(modal, produit);
//     },
//     onConfirm: async (modal) => {
//       const libelle = modal.querySelector("#produitLibelle").value;
//       const prix = modal.querySelector("#produitPrix").value;
//       const quantite = modal.querySelector("#produitQuantite").value;
//       const categorieId = modal.querySelector("#categorieId").value;
//       const imageFile = modal.querySelector("#produitImage").files[0];

//       let hasError = false;

//       // Valider libellé
//       const libelleError = validateField(libelle, "Le libellé");
//       if (libelleError) {
//         showError("produitLibelle", "produitLibelleError", libelleError);
//         hasError = true;
//       } else {
//         hideError("produitLibelle", "produitLibelleError");
//       }

//       // Valider prix
//       const prixError = validateNumber(prix, "Le prix");
//       if (prixError) {
//         showError("produitPrix", "produitPrixError", prixError);
//         hasError = true;
//       } else {
//         hideError("produitPrix", "produitPrixError");
//       }

//       // Valider quantité
//       const quantiteError = validateNumber(quantite, "La quantité");
//       if (quantiteError) {
//         showError("produitQuantite", "produitQuantiteError", quantiteError);
//         hasError = true;
//       } else {
//         hideError("produitQuantite", "produitQuantiteError");
//       }

//       // Valider catégorie
//       const categorieError = validateSelect(categorieId, "catégorie");
//       if (categorieError) {
//         showError("categorieId", "produitCategorieError", categorieError);
//         hasError = true;
//       } else {
//         hideError("categorieId", "produitCategorieError");
//       }

//       // Valider l'image UNIQUEMENT pour un nouveau produit
//       if (!produit) {
//         if (!imageFile) {
//           showError("produitImage", "produitImageError", "L'image est obligatoire.");
//           hasError = true;
//         } else {
//           hideError("produitImage", "produitImageError");
//         }
//       }

//       if (hasError) {
//         return false;
//       }

//       try {
//         let imageUrl = produit?.imageUrl || "";

//         if (imageFile) {
//           const uploadResult = await uploadProductImage(imageFile);
//           imageUrl = uploadResult.imageUrl;
//         }

//         const produitData = { libelle, prix, quantite, categorieId, imageUrl };

//         if (produit) {
//           await updateProduit(produit.id, produitData);
//           showToast("Produit modifié avec succès.");
//         } else {
//           await createProduit(produitData);
// showToast("Produit créé avec succès.");
// setTimeout(() => navigate("produits"), 0); // après fermeture du modal
// return true;        }

                
//         await navigate("produits");
//         return true;
//       } catch (error) {
//         showToast(error.message, "error");
        
//         if (error.message.includes("image")) {
//           showError("produitImage", "produitImageError", error.message);
//         }
//         return false;
//       }
//     },
//   });
// }
async function openProduitForm(produit = null) {
  const categories = await getCategories();

  openModal({
    title: produit ? "Modifier le produit" : "Nouveau produit",
    icon: "fa-bag-shopping",
    body: produitFormBody(produit, categories),
    confirmLabel: produit ? "Enregistrer" : "Créer",
    onMount: (modal) => {
      attachValidationEvents(modal, produit);
    },
    onConfirm: async (modal) => {
      const libelle = modal.querySelector("#produitLibelle").value;
      const prix = modal.querySelector("#produitPrix").value;
      const quantite = modal.querySelector("#produitQuantite").value;
      const categorieId = modal.querySelector("#categorieId").value;
      const imageFile = modal.querySelector("#produitImage").files[0];

      let hasError = false;

      // Valider libellé
      const libelleError = validateField(libelle, "Le libellé");
      if (libelleError) {
        showError("produitLibelle", "produitLibelleError", libelleError);
        hasError = true;
      } else {
        hideError("produitLibelle", "produitLibelleError");
      }

      // Valider prix
      const prixError = validateNumber(prix, "Le prix");
      if (prixError) {
        showError("produitPrix", "produitPrixError", prixError);
        hasError = true;
      } else {
        hideError("produitPrix", "produitPrixError");
      }

      // Valider quantité
      const quantiteError = validateNumber(quantite, "La quantité");
      if (quantiteError) {
        showError("produitQuantite", "produitQuantiteError", quantiteError);
        hasError = true;
      } else {
        hideError("produitQuantite", "produitQuantiteError");
      }

      // Valider catégorie
      const categorieError = validateSelect(categorieId, "catégorie");
      if (categorieError) {
        showError("categorieId", "produitCategorieError", categorieError);
        hasError = true;
      } else {
        hideError("categorieId", "produitCategorieError");
      }

      // Valider l'image UNIQUEMENT pour un nouveau produit
      if (!produit) {
        if (!imageFile) {
          showError("produitImage", "produitImageError", "L'image est obligatoire.");
          hasError = true;
        } else {
          hideError("produitImage", "produitImageError");
        }
      }

      if (hasError) {
        return false;
      }

      try {
        let imageUrl = produit?.imageUrl || "";

        if (imageFile) {
          try {
            const uploadResult = await uploadProductImage(imageFile);
            if (uploadResult && uploadResult.imageUrl) {
              imageUrl = uploadResult.imageUrl;
            } else {
              throw new Error("L'upload de l'image a échoué.");
            }
          } catch (uploadError) {
            showError("produitImage", "produitImageError", uploadError.message);
            return false;
          }
        }

        const produitData = { libelle, prix, quantite, categorieId, imageUrl };

        if (produit) {
          await updateProduit(produit.id, produitData);
          showToast("Produit modifié avec succès.");
        } else {
          await createProduit(produitData);
          showToast("Produit créé avec succès.");
        }

        // Nettoyer le modal
        const modalRoot = document.getElementById("modalRoot");
        if (modalRoot) {
          modalRoot.innerHTML = "";
        }

        await navigate("produits");
        return true;
      } catch (error) {
        console.error("Erreur lors de la création/modification:", error);
        showToast(error.message, "error");
        
        if (error.message && error.message.includes("image")) {
          showError("produitImage", "produitImageError", error.message);
        }
        return false;
      }
    },
  });
}

// pages/produitsPage.js - AJOUTER cette fonction
function renderProductContent(produits, catMap, total) {
  if (currentView === "cards") {
    return renderProductGrid(produits, catMap);
  }
  
  // Vue table (utilisation de renderTable existant)
  return renderTable({
    rows: produits,
    emptyMessage: "Aucun produit enregistré.",
    columns: [
      {
        label: "Image",
        render: (pro) => pro.imageUrl
          ? `<img src="${pro.imageUrl}" alt="${escapeHtml(pro.libelle)}" class="h-12 w-12 rounded-lg object-cover" />`
          : `<div class="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><i class="fa-solid fa-image"></i></div>`
      },
      {
        label: "Libellé",
        render: (pro) =>
          `<strong class="font-bold text-slate-950">${escapeHtml(pro.libelle)}</strong>`,
      },
      {
        label: "Prix",
        render: (pro) =>
          `<strong class="font-bold text-slate-950">${Number(pro.prix).toLocaleString('fr-FR')} FCFA</strong>`,
      },
      {
        label: "Quantité",
        render: (pro) =>
          `<strong class="font-bold text-slate-950">${escapeHtml(pro.quantite)}</strong>`,
      },
      {
        label: "Catégorie",
        render: (pro) =>
          `<strong class="font-bold text-slate-950">${escapeHtml(catMap[pro.categorieId] || pro.categorieId)}</strong>`,
      },
      {
        label: "Actions",
        render: (pro) => `
          <div class="flex flex-wrap gap-2">
            <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(pro.id)}">
              <i class="fa-solid fa-pen"></i>
              Modifier
            </button>
            <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(pro.id)}">
              <i class="fa-solid fa-trash"></i>
              Supprimer
            </button>
          </div>
        `,
      },
    ],
  });
}

// 
// pages/produitsPage.js - REMPLACER la fonction renderProduitsPage
export async function renderProduitsPage(page = 1) {
  const app = document.getElementById("app");
  const categories = await getCategories();
  categoriesCache = categories;

  const filterCategory = currentCategoryFilter;
  
  // Récupérer le nombre total de produits pour le filtre
  const totalCount = await countProduits(filterCategory || undefined);
  const totalPagesResult = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  
  // Récupérer les produits paginés
  const paginatedResult = await getProduitsWithPagination(
    page || currentPage,
    ITEMS_PER_PAGE,
    filterCategory || undefined
  );

  const { produits } = paginatedResult;
  currentPage = page || currentPage;
  totalPages = totalPagesResult;

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.libelle]));

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Référentiel",
        title: "Produits",
        subtitle: "Créer, modifier et supprimer les produits de l'application.",
        actionLabel: "Nouvel produit",
        actionId: "addProduitBtn",
        actionIcon: "fa-plus",
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des produits</h2>
            <p class="text-sm text-slate-500">${totalCount} produit(s) enregistré(s).</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            ${categoryFilter({
              categories,
              selectedCategory: filterCategory,
            })}
            ${renderViewToggle({ currentView })}
          </div>
        </div>

        ${renderProductContent(produits, catMap, totalCount)}

        ${renderPagination({
          currentPage,
          totalPages,
          onPageChange: null,
        })}
      </article>
    </section>
  `;

  bindProduitEvents(produits);
  bindFilterAndPaginationEvents();
  bindViewToggleEvents();
}

function bindProduitEvents(produits) {
  document
    .getElementById("addproduitBtn")
    .addEventListener("click", () => openProduitForm());

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const produit = produits.find((item) => item.id === button.dataset.edit);
      if (produit) openProduitForm(produit);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.delete;

      openConfirm({
        message: "Voulez-vous supprimer ce produit ?",
        onConfirm: async () => {
          try {
            await deleteProduit(id);
            showToast("Produit supprimé.");
            await navigate("produits");
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}
