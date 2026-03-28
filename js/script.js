/* =====================================================
   MedTech ERP – Liste des commandes
   JavaScript professionnel (UX + logique métier)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  enrichUI();
  bindRowSelection();
  updateStats();
  bindActions();
}

/* =====================================================
   1. Enrichissement UI (Recherche + feedback)
===================================================== */
function enrichUI() {
  const tableCard = document.querySelector(".table-card");
  if (!tableCard) return;

  const toolbar = document.createElement("div");
  toolbar.style.display = "flex";
  toolbar.style.justifyContent = "space-between";
  toolbar.style.marginBottom = "15px";

  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "🔍 Rechercher une commande…";
  search.style.padding = "10px";
  search.style.width = "260px";
  search.style.borderRadius = "6px";
  search.style.border = "1px solid #ccc";

  const filter = document.createElement("select");
  filter.innerHTML = `
    <option value="">Tous les statuts</option>
    <option value="Livrée">Livrée</option>
    <option value="En cours">En cours</option>
    <option value="En retard">En retard</option>
  `;
  filter.style.padding = "10px";
  filter.style.borderRadius = "6px";

  toolbar.appendChild(search);
  toolbar.appendChild(filter);
  tableCard.insertBefore(toolbar, tableCard.querySelector("table"));

  search.addEventListener("input", applyFilters);
  filter.addEventListener("change", applyFilters);
}

/* =====================================================
   2. Filtres dynamiques
===================================================== */
function applyFilters() {
  const query = document.querySelector("input").value.toLowerCase();
  const status = document.querySelector("select").value;

  document.querySelectorAll("tbody tr").forEach((row) => {
    const text = row.innerText.toLowerCase();
    const rowStatus = row.querySelector(".badge").innerText;

    const matchText = text.includes(query);
    const matchStatus = status === "" || rowStatus === status;
    row.style.display = matchText && matchStatus ? "" : "none";
  });
}

/* =====================================================
   3. Sélection visuelle des lignes
===================================================== */
function bindRowSelection() {
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      rows.forEach((r) => r.classList.remove("selected"));
      row.classList.add("selected");
    });
  });
}

/* =====================================================
   4. Statistiques dynamiques (ERP réel)
===================================================== */
function updateStats() {
  const rows = document.querySelectorAll("tbody tr");

  let total = rows.length;
  let encours = 0;
  let livree = 0;
  let retard = 0;

  rows.forEach((row) => {
    const statut = row.querySelector(".badge").innerText;
    if (statut === "En cours") encours++;
    if (statut === "Livrée") livree++;
    if (statut === "En retard") retard++;
  });

  setStat(0, total);
  setStat(1, encours);
  setStat(2, livree);
  setStat(3, retard);
}

function setStat(index, value) {
  const stat = document.querySelectorAll(".stat-card h3")[index];
  if (!stat) return;

  stat.innerText = value;
  stat.style.transform = "scale(1.1)";
  setTimeout(() => (stat.style.transform = "scale(1)"), 200);
}

/* =====================================================
   5. Actions métier (boutons)
===================================================== */
function bindActions() {
  document.querySelector(".btn-main").addEventListener("click", () => {
    showToast("Nouvelle commande", "Fonction à implémenter");
  });

  document.querySelectorAll(".btn-link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const cmd = btn.closest("tr").querySelector(".ref").innerText;
      showToast("Articles", `Afficher les articles de ${cmd}`);
    });
  });
}

/* =====================================================
   6. Toast notification (UI pro)
===================================================== */
function showToast(title, message) {
  const toast = document.createElement("div");
  toast.innerHTML = `<strong>${title}</strong><br>${message}`;
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.right = "30px";
  toast.style.background = "#1f2937";
  toast.style.color = "white";
  toast.style.padding = "15px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
