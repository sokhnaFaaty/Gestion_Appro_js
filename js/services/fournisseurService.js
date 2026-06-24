// services/fournisseurService.js
import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizeFournisseur(data) {
  return {
    id: data.id,
    nom: String(data.nom).trim(),
    telephone: String(data.telephone).trim(),
    adresse: String(data.adresse).trim(),
    email: String(data.email).trim(),
    userId: data.userId,
  };
}

export async function getFournisseurs() {
  return apiRequest(ENDPOINTS.fournisseurs, {}, "Impossible de charger les fournisseurs.");
}

/**
 * Crée un fournisseur ET son compte utilisateur associé
 * @param {Object} data - { nom, telephone, adresse, email, password }
 */
export async function createFournisseur(data) {
  required(data.nom, "Le nom du fournisseur est obligatoire.");
  required(data.telephone, "Le téléphone est obligatoire.");
  required(data.adresse, "L'adresse est obligatoire.");
  required(data.email, "L'email est obligatoire.");
  required(data.password, "Le mot de passe est obligatoire.");

  // 1. Vérifier que l'email n'est pas déjà utilisé
  const existingUsers = await apiRequest(
    `${ENDPOINTS.users}?email=${encodeURIComponent(data.email)}`,
    {},
    "Erreur lors de la vérification de l'email."
  );

  if (existingUsers.length > 0) {
    throw new Error("Cet email est déjà utilisé.");
  }

  // 2. Créer le compte utilisateur avec rôle fournisseur
  const userId = createId("user");
  const newUser = {
    id: userId,
    nom: String(data.nom).trim(),
    email: String(data.email).trim(),
    password: data.password,
    role: "fournisseur",
  };

  await apiRequest(
    ENDPOINTS.users,
    { method: "POST", body: JSON.stringify(newUser) },
    "Impossible de créer le compte utilisateur."
  );

  // 3. Créer le fournisseur lié à cet user
  const fournisseur = normalizeFournisseur({
    id: createId("four"),
    nom: data.nom,
    telephone: data.telephone,
    adresse: data.adresse,
    email: data.email,
    userId,
  });

  return apiRequest(
    ENDPOINTS.fournisseurs,
    { method: "POST", body: JSON.stringify(fournisseur) },
    "Impossible de créer le fournisseur."
  );
}

export async function updateFournisseur(id, data) {
  required(data.nom, "Le nom du fournisseur est obligatoire.");
  required(data.telephone, "Le téléphone est obligatoire.");
  required(data.adresse, "L'adresse est obligatoire.");
  required(data.email, "L'email est obligatoire.");

  return apiRequest(
    `${ENDPOINTS.fournisseurs}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(normalizeFournisseur({ id, ...data })),
    },
    "Impossible de modifier le fournisseur."
  );
}

export async function deleteFournisseur(id, userId) {
  // 1. Supprimer le fournisseur
  await apiRequest(
    `${ENDPOINTS.fournisseurs}/${id}`,
    { method: "DELETE" },
    "Impossible de supprimer le fournisseur."
  );

  // 2. Supprimer le compte utilisateur associé
  if (userId) {
    await apiRequest(
      `${ENDPOINTS.users}/${userId}`,
      { method: "DELETE" },
      "Impossible de supprimer le compte utilisateur associé."
    );
  }
}