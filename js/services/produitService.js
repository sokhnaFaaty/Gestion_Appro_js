import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizeProduit(data) {
  return {
    id: data.id,
    libelle: String(data.libelle).trim(),
    prix: Number(data.prix),
    quantite: Number(data.quantite),
    categorieId: String(data.categorieId).trim(),
    imageUrl: data.imageUrl || "",  
  };
}

export async function getProduits() {
  return apiRequest(ENDPOINTS.produits, {}, "Impossible de charger les produits.");
}

export async function createProduit(data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.prix, "Le prix du produit est obligatoire.");
  required(data.quantite, "La quantite du produit est obligatoire.");
  required(data.categorieId, "La categorie du produit est obligatoire.");
  required(data.imageUrl, "L'image du produit est obligatoire.");

  const produit = normalizeProduit({
    id: createId("pro"),
    ...data,
  });

  return apiRequest(
    ENDPOINTS.produits,
    {
      method: "POST",
      body: JSON.stringify(produit),
    },
    "Impossible de créer le produit."
  );
}

export async function updateProduit(id, data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.prix, "Le prix du produit est obligatoire.");
  required(data.quantite, "La quantite du produit est obligatoire.");
  required(data.categorieId, "La categorie du produit est obligatoire.");
  // Si une nouvelle image est fournie, on l'utilise, sinon on garde l'ancienne
  const produitData = {
    id,
    libelle: data.libelle,
    prix: data.prix,
    quantite: data.quantite,
    categorieId: data.categorieId,
  };
  
  // Ajouter imageUrl uniquement si elle est fournie
  if (data.imageUrl !== undefined) {
    produitData.imageUrl = data.imageUrl;
  }

  return apiRequest(
    `${ENDPOINTS.produits}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(normalizeProduit(produitData)),
    },
    "Impossible de modifier le produit."
  );
}

export async function deleteProduit(id) {
  return apiRequest(
    `${ENDPOINTS.produits}/${id}`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le produit."
  );
}
export async function countProduits(categorieId = null) {
  const url = categorieId 
    ? `${ENDPOINTS.produits}?categorieId=${categorieId}`
    : ENDPOINTS.produits;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de compter les produits.");
  }

  const data = await response.json();
  return data.length;
}
