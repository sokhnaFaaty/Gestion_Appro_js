// components/viewToggle.js
export function renderViewToggle({ currentView = "table" }) {
  return `
    <div class="flex rounded-2xl border border-slate-200 bg-white p-1">
      <button class="view-toggle-btn flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
        currentView === "table" 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
          : "text-slate-600 hover:bg-slate-50"
      }" data-view="table">
        <i class="fa-solid fa-table"></i>
        <span class="hidden sm:inline">Table</span>
      </button>
      <button class="view-toggle-btn flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
        currentView === "cards" 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
          : "text-slate-600 hover:bg-slate-50"
      }" data-view="cards">
        <i class="fa-solid fa-grip"></i>
        <span class="hidden sm:inline">Liste</span>
      </button>
    </div>
  `;
}