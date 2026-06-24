// services/authService.js
import { ENDPOINTS } from "../config/api.js";
import { saveSession, clearSession } from "../utils/auth.js";

/**
 * Connecte un utilisateur
 * Fetch les users filtrés par email, vérifie le password côté client
 * @param {string} email
 * @param {string} password
 * @returns {Object} - L'user connecté (sans password)
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email et mot de passe obligatoires.");
  }

  // Récupère l'user par email depuis JSON Server
  const response = await fetch(`${ENDPOINTS.users}?email=${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error("Erreur lors de la connexion. Vérifie que le serveur est démarré.");
  }

  const users = await response.json();

  if (users.length === 0) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const user = users[0];

  // Vérification du mot de passe côté client
  if (user.password !== password) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  // On retire le password avant de stocker en localStorage
  const { password: _pwd, ...userSafe } = user;

  // Sauvegarde la session
  saveSession(userSafe);

  return userSafe;
}

/**
 * Déconnecte l'utilisateur et redirige vers la page de login
 */
export function logout() {
  clearSession();
  // Recharge la page pour réinitialiser toute l'application
  window.location.href = window.location.pathname;
}