// utils/auth.js
// Gestion de la session utilisateur via localStorage

const SESSION_KEY = "currentUser";

// Sauvegarde l'utilisateur connecté dans localStorage
export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Récupère l'utilisateur connecté depuis localStorage
// Retourne null si personne n'est connecté
export function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Supprime la session (déconnexion)
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Vérifie si un utilisateur est connecté
export function isAuthenticated() {
  return getSession() !== null;
}

// Retourne le rôle de l'utilisateur connecté ("admin" ou "fournisseur")
export function getUserRole() {
  const user = getSession();
  return user ? user.role : null;
}

// Vérifie si l'utilisateur connecté est admin
export function isAdmin() {
  return getUserRole() === "admin";
}

// Vérifie si l'utilisateur connecté est fournisseur
export function isFournisseur() {
  return getUserRole() === "fournisseur";
}