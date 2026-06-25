function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current]);
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

export function renderPagination({ currentPage, totalItems, pageSize }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return "";

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const base = "flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl border px-2 text-sm font-bold transition";
  const active   = `${base} border-indigo-600 bg-indigo-600 text-white cursor-default`;
  const inactive = `${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
  const disabled = `${base} border-slate-200 bg-white text-slate-400 cursor-not-allowed opacity-50`;

  const pageButtons = getPageNumbers(currentPage, totalPages).map((p) => {
    if (p === "...") {
      return `<span class="flex h-9 w-9 items-center justify-center text-sm text-slate-400">…</span>`;
    }
    const isActive = p === currentPage;
    return `<button data-pagination-page="${p}" class="${isActive ? active : inactive}" ${isActive ? "disabled" : ""}>${p}</button>`;
  }).join("");

  return `
    <div class="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
      <p class="text-sm text-slate-500">
        <span class="font-bold text-slate-950">${start}–${end}</span> sur
        <span class="font-bold text-slate-950">${totalItems}</span> résultats
      </p>
      <div class="flex items-center gap-1">
        <button data-pagination-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}
          class="${currentPage === 1 ? disabled : inactive}">
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
        ${pageButtons}
        <button data-pagination-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}
          class="${currentPage === totalPages ? disabled : inactive}">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  `;
}

export function bindPagination(onPageChange) {
  document.querySelectorAll("[data-pagination-page]:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.paginationPage, 10);
      if (!isNaN(page)) onPageChange(page);
    });
  });
}
