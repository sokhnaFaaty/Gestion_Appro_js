// pages/fournisseursPage.js
import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { validateField } from "../utils/formValidator.js";
import { showError, hideError } from "../utils/formValidator.js";
import {
  getFournisseurs,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
} from "../services/fournisseurService.js";

function fournisseurFormBody(fournisseur = null) {
  const isEdit = fournisseur !== null;
  return `
    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fourNom">Nom *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="fourNom" value="${escapeHtml(fournisseur?.nom || "")}" placeholder="ex: Aliou Diop" autocomplete="off" />
      <p id="fourNomError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fourTelephone">Téléphone *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="fourTelephone" value="${escapeHtml(fournisseur?.telephone || "")}" placeholder="ex: 771234567" autocomplete="off" />
      <p id="fourTelephoneError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fourAdresse">Adresse *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="fourAdresse" value="${escapeHtml(fournisseur?.adresse || "")}" placeholder="ex: Dakar" autocomplete="off" />
      <p id="fourAdresseError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fourEmail">Email *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="email" id="fourEmail" value="${escapeHtml(fournisseur?.email || "")}" placeholder="ex: aliou@gmail.com" autocomplete="off" ${isEdit ? "readonly" : ""} />
      <p id="fourEmailError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>

    ${!isEdit ? `
    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fourPassword">Mot de passe *</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="password" id="fourPassword" placeholder="Mot de passe du compte" autocomplete="off" />
      <p id="fourPasswordError" class="mt-1 hidden text-xs text-rose-600"></p>
    </div>
    ` : ""}
  `;
}

function openFournisseurForm(fournisseur = null) {
  openModal({
    title: fournisseur ? "Modifier le fournisseur" : "Nouveau fournisseur",
    icon: "fa-truck",
    body: fournisseurFormBody(fournisseur),
    confirmLabel: fournisseur ? "Enregistrer" : "Créer",
    onConfirm: async (modal) => {
      const nom = modal.querySelector("#fourNom")?.value.trim();
      const telephone = modal.querySelector("#fourTelephone")?.value.trim();
      const adresse = modal.querySelector("#fourAdresse")?.value.trim();
      const email = modal.querySelector("#fourEmail")?.value.trim();
      const password = modal.querySelector("#fourPassword")?.value;

      let hasError = false;

      const nomError = validateField(nom, "Le nom");
      if (nomError) { showError("fourNom", "fourNomError", nomError); hasError = true; }
      else hideError("fourNom", "fourNomError");

      const telError = validateField(telephone, "Le téléphone");
      if (telError) { showError("fourTelephone", "fourTelephoneError", telError); hasError = true; }
      else hideError("fourTelephone", "fourTelephoneError");

      const adrError = validateField(adresse, "L'adresse");
      if (adrError) { showError("fourAdresse", "fourAdresseError", adrError); hasError = true; }
      else hideError("fourAdresse", "fourAdresseError");

      const emailError = validateField(email, "L'email");
      if (emailError) { showError("fourEmail", "fourEmailError", emailError); hasError = true; }
      else hideError("fourEmail", "fourEmailError");

      if (!fournisseur) {
        const pwdError = validateField(password, "Le mot de passe");
        if (pwdError) { showError("fourPassword", "fourPasswordError", pwdError); hasError = true; }
        else hideError("fourPassword", "fourPasswordError");
      }

      if (hasError) return false;

      try {
        if (fournisseur) {
          await updateFournisseur(fournisseur.id, { nom, telephone, adresse, email, userId: fournisseur.userId });
          showToast("Fournisseur modifié avec succès.");
        } else {
          await createFournisseur({ nom, telephone, adresse, email, password });
          showToast("Fournisseur créé avec succès.");
        }
        await renderFournisseursPage();
        return true;
      } catch (error) {
        showToast(error.message, "error");
        return false;
      }
    },
  });
}

export async function renderFournisseursPage() {
  const app = document.getElementById("app");
  const fournisseurs = await getFournisseurs();

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Référentiel",
        title: "Fournisseurs",
        subtitle: "Gérer les fournisseurs et leurs comptes d'accès.",
        actionLabel: "Nouveau fournisseur",
        actionId: "addFournisseurBtn",
        actionIcon: "fa-plus",
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des fournisseurs</h2>
            <p class="text-sm text-slate-500">${fournisseurs.length} fournisseur(s) enregistré(s).</p>
          </div>
        </div>

        ${renderTable({
          rows: fournisseurs,
          emptyMessage: "Aucun fournisseur enregistré.",
          columns: [
            { label: "Nom", render: (f) => `<strong class="font-bold text-slate-950">${escapeHtml(f.nom)}</strong>` },
            { label: "Téléphone", render: (f) => escapeHtml(f.telephone) },
            { label: "Adresse", render: (f) => escapeHtml(f.adresse) },
            { label: "Email", render: (f) => escapeHtml(f.email) },
            {
              label: "Actions",
              render: (f) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(f.id)}">
                    <i class="fa-solid fa-pen"></i> Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(f.id)}" data-user-id="${escapeHtml(f.userId)}">
                    <i class="fa-solid fa-trash"></i> Supprimer
                  </button>
                </div>
              `,
            },
          ],
        })}
      </article>
    </section>
  `;

  bindFournisseurEvents(fournisseurs);
}

function bindFournisseurEvents(fournisseurs) {
  document.getElementById("addFournisseurBtn").addEventListener("click", () => openFournisseurForm());

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const fournisseur = fournisseurs.find((f) => f.id === button.dataset.edit);
      if (fournisseur) openFournisseurForm(fournisseur);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.delete;
      const userId = button.dataset.userId;

      openConfirm({
        message: "Voulez-vous supprimer ce fournisseur et son compte utilisateur ?",
        onConfirm: async () => {
          try {
            await deleteFournisseur(id, userId);
            showToast("Fournisseur supprimé.");
            await renderFournisseursPage();
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}