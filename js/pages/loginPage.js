// pages/loginPage.js
import { login } from "../services/authService.js";
import { navigate } from "../router.js";
import { getUserRole } from "../utils/auth.js";
import { showError, hideError } from "../utils/formValidator.js";

export function renderLoginPage() {
  // Injecter la page de login dans le body directement
  // (bypasse le layout sidebar/navbar)
  document.getElementById("sidebarRoot").innerHTML = "";
  document.getElementById("navbarRoot").innerHTML = "";

  document.getElementById("app").innerHTML = "";

  // On utilise le main comme conteneur plein écran
  const main = document.querySelector("main");
  main.className = "min-h-screen bg-slate-100 font-sans";

  main.innerHTML = `
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Logo / Titre -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-200">
            <i class="fa-solid fa-layer-group text-2xl text-white"></i>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-slate-950">Gestion Appro</h1>
          <p class="mt-1 text-sm text-slate-500">Connectez-vous pour accéder à l'application</p>
        </div>

        <!-- Carte formulaire -->
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 class="mb-6 text-xl font-black text-slate-950">Connexion</h2>

          <!-- Message d'erreur global -->
          <div id="loginError" class="mb-4 hidden rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 border border-rose-200">
            <i class="fa-solid fa-circle-exclamation mr-2"></i>
            <span id="loginErrorMessage"></span>
          </div>

          <div class="grid gap-5">

            <!-- Email -->
            <div>
              <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="loginEmail">
                Email
              </label>
              <input
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="email"
                id="loginEmail"
                placeholder="admin@example.com"
                autocomplete="email"
              />
              <p id="loginEmailError" class="mt-1 hidden text-xs text-rose-600"></p>
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="loginPassword">
                Mot de passe
              </label>
              <div class="relative">
                <input
                  class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  type="password"
                  id="loginPassword"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <!-- Toggle visibilité mot de passe -->
                <button
                  type="button"
                  id="togglePassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label="Afficher/masquer le mot de passe"
                >
                  <i class="fa-solid fa-eye" id="togglePasswordIcon"></i>
                </button>
              </div>
              <p id="loginPasswordError" class="mt-1 hidden text-xs text-rose-600"></p>
            </div>

            <!-- Bouton connexion -->
            <button
              id="loginBtn"
              type="button"
              class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Se connecter</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  `;

  bindLoginEvents();
}

function bindLoginEvents() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const toggleBtn = document.getElementById("togglePassword");
  const toggleIcon = document.getElementById("togglePasswordIcon");

  // Toggle affichage mot de passe
  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleIcon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
  });

  // Validation en temps réel
  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim()) {
      hideError("loginEmail", "loginEmailError");
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.trim()) {
      hideError("loginPassword", "loginPasswordError");
    }
  });

  // Connexion au clic ou Enter
  loginBtn.addEventListener("click", handleLogin);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const loginBtn = document.getElementById("loginBtn");

  // Masquer l'erreur globale
  document.getElementById("loginError").classList.add("hidden");

  // Validation
  let hasError = false;

  if (!email) {
    showError("loginEmail", "loginEmailError", "L'email est obligatoire.");
    hasError = true;
  } else {
    hideError("loginEmail", "loginEmailError");
  }

  if (!password) {
    showError("loginPassword", "loginPasswordError", "Le mot de passe est obligatoire.");
    hasError = true;
  } else {
    hideError("loginPassword", "loginPasswordError");
  }

  if (hasError) return;

  // État chargement
  loginBtn.disabled = true;
  loginBtn.innerHTML = `
    <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
    <span>Connexion...</span>
  `;

  try {
    const user = await login(email, password);

    // Redirection selon le rôle
    if (user.role === "admin") {
      await navigate("categories");
    } else if (user.role === "fournisseur") {
      await navigate("produits");
    }

  } catch (error) {
    // Afficher l'erreur globale
    document.getElementById("loginErrorMessage").textContent = error.message;
    document.getElementById("loginError").classList.remove("hidden");

    // Réactiver le bouton
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <i class="fa-solid fa-arrow-right-to-bracket"></i>
      <span>Se connecter</span>
    `;
  }
}