// --- 1. Données des Produits (25 articles réels et vérifiés) ---
const productsData = [
  // VÊTEMENTS (IDs 1-9)
  {
    id: 1,
    name: "Pull Coton Recyclé",
    category: "Vêtements",
    points: 780,
    description: "Pull éco-conçu en coton recyclé, doux et respirant.",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Veste Pluie Recyclée",
    category: "Vêtements",
    points: 1800,
    description: "Imperméable en plastique océanique.",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format",
  },
  {
    id: 3,
    name: "Baskets Vegan Ananas",
    category: "Vêtements",
    points: 2200,
    description: "Fibre de cuir végétal Pinatex.",
    image:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&auto=format",
  },
  {
    id: 4,
    name: "Sweat-shirt Éco-responsable",
    category: "Vêtements",
    points: 750,
    description:
      "Matières recyclées, chaud et confortable pour un usage quotidien.",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    name: "Chaussettes Recyclées Confort",
    category: "Vêtements",
    points: 200,
    description: "Fibres recyclées, résistantes et confort thermique optimal.",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 6,
    name: "Jean Denim Circulaire",
    category: "Vêtements",
    points: 1200,
    description: "Coton recyclé, sans teinture toxique.",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format",
  },
  {
    id: 7,
    name: "Sweat à Capuche Chanvre",
    category: "Vêtements",
    points: 950,
    description: "Durable, s'adoucit avec le temps.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format",
  },
  {
    id: 8,
    name: "Sac à Dos Roll-top",
    category: "Vêtements",
    points: 1500,
    description: "Toile cirée et boucles métal.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format",
  },
  {
    id: 9,
    name: "Bonnet Urbain Recyclé",
    category: "Vêtements",
    points: 290,
    description:
      "Bonnet épais en fibres recyclées, style urbain et chaleur optimale.",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60",
  },

  // OUTILS (IDs 10-17)
  {
    id: 11,
    name: "Veste en Denim Éco-Responsable",
    category: "Vêtements",
    points: 920,
    description:
      "Veste en denim recyclé, résistante et confortable, production durable.",
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 12,
    name: "Couteau Pliant Outdoor",
    category: "Outils",
    points: 520,
    description: "Acier inoxydable, compact et polyvalent pour extérieur.",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 14,
    name: "Lanterne Solaire LED",
    category: "Outils",
    points: 450,
    description: "Autonomie 12h, charge jour.",
    image:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format",
  },
  {
    id: 15,
    name: "Boussole de Survie",
    category: "Outils",
    points: 300,
    description: "Boîtier laiton, sans pile.",
    image:
      "https://images.unsplash.com/photo-1532667449560-72a95c8d381b?w=500&auto=format",
  },
  {
    id: 16,
    name: "Hachette de Camp",
    category: "Outils",
    points: 900,
    description: "Manche frêne, forgée main.",
    image:
      "https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=500&auto=format",
  },
  {
    id: 17,
    name: "Gants Cuir Éthique",
    category: "Outils",
    points: 350,
    description: "Protection renforcée mains.",
    image:
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=500&auto=format",
  },

  // TECH & ZÉRO DÉCHET (IDs 18-25)
  {
    id: 18,
    name: "Clavier Sans Fil Bluetooth",
    category: "Tech",
    points: 1200,
    description:
      "Clavier Bluetooth rechargeable, design compact, compatible Windows, macOS, Android et iOS.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 19,
    name: "iPad Reconditionné (10.2)",
    category: "Tech",
    points: 5800,
    description:
      "iPad 64Go, écran Retina, Wi-Fi, contrôlé et testé, excellent état de fonctionnement.",
    image:
      "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 20,
    name: "Enceinte Bois BT",
    category: "Tech",
    points: 1400,
    description: "Bois de forêt gérée.",
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&auto=format",
  },
  {
    id: 21,
    name: "Support Téléphone Voiture Magnétique",
    category: "Tech",
    points: 650,
    description:
      "Support magnétique pour smartphone, fixation grille d’aération, rotation 360°.",
    image:
      "https://images.unsplash.com/photo-1583225214464-9296029427aa?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 22,
    name: "Lampe LED Intelligente",
    category: "Tech",
    points: 350,
    description:
      "Ampoule LED connectée, faible consommation, réglage de l’intensité et des couleurs.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 23,
    name: "Brosses Dents Bambou",
    category: "Zéro Déchet",
    points: 100,
    description: "Lot de 4, compostable.",
    image:
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format",
  },
  {
    id: 24,
    name: "Station Électrique Portable",
    category: "Tech",
    points: 3600,
    description:
      "Batterie portable haute capacité pour appareils électriques, idéale en extérieur ou en secours.",
    image:
      "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=500&auto=format&fit=crop&q=60",
  },

  {
    id: 25,
    name: "Composteur Appartement",
    category: "Zéro Déchet",
    points: 1300,
    description: "Système sans odeur (Bokashi).",
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&auto=format",
  },
];

function updatePointsDisplay() {
  const pointsElement = document.getElementById("user-points-balance");
  if (pointsElement) pointsElement.textContent = userPoints;
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Indisponible'">
      </div>
      <div class="product-details">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">${product.points} PTS</div>
        <button class="buy-button" onclick="handlePurchase(${product.id})">Échanger</button>
      </div>
    </article>
  `;
}

function renderMarket() {
  const container = document.getElementById("market-products-container");
  if (!container) return;
  container.innerHTML = productsData
    .map((product) => createProductCard(product))
    .join("");
}

window.handlePurchase = function (productId) {
  const product = productsData.find((p) => p.id === productId);
  if (!product) return;
  if (userPoints >= product.points) {
    userPoints -= product.points;
    updatePointsDisplay();
    alert(`Succès ! Vous avez obtenu : ${product.name}`);
  } else {
    alert(
      `Points insuffisants ! Il vous manque ${product.points - userPoints} PTS.`,
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updatePointsDisplay();
  renderMarket();
});

////////////////////////

// --- 2. État de l'utilisateur ---
// (Dans un vrai site, cela viendrait d'une base de données)
let userPoints = 2450;

// --- 3. Fonctions ---

// Fonction pour afficher les points actuels dans le header
function updatePointsDisplay() {
  const pointsElement = document.getElementById("user-points-balance");
  if (pointsElement) {
    pointsElement.textContent = userPoints;
  }
}

// Fonction pour générer le HTML d'un produit
function createProductCard(product) {
  return `
        <article class="product-card">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">${product.points} PTS</div>
                <button class="buy-button" onclick="handlePurchase(${product.id})">
                    Échanger
                </button>
            </div>
        </article>
    `;
}

// Fonction pour afficher tous les produits sur la page
function renderMarket() {
  const container = document.getElementById("market-products-container");
  if (!container) return;

  let productsHTML = "";
  productsData.forEach((product) => {
    productsHTML += createProductCard(product);
  });

  container.innerHTML = productsHTML;
}

// Fonction gérant l'achat (appelée quand on clique sur "Échanger")
// Note : J'ai attaché cette fonction à l'objet global 'window' pour qu'elle soit accessible via onclick="" dans le HTML généré.
window.handlePurchase = function (productId) {
  // Trouver le produit cliqué
  const product = productsData.find((p) => p.id === productId);

  if (!product) return;

  // Vérifier si l'utilisateur a assez de points
  if (userPoints >= product.points) {
    // Succès
    userPoints -= product.points;
    updatePointsDisplay();
    alert(
      `Félicitations ! Vous avez échangé vos points contre : ${product.name}.\nIl vous reste ${userPoints} points.`,
    );
    // Ici, dans un vrai système, on enverrait une requête au serveur pour enregistrer la commande.
  } else {
    // Échec
    alert(
      `Points insuffisants pour ${product.name}. Il vous manque ${product.points - userPoints} points. Continuez vos actions éco-responsables !`,
    );
  }
};

// --- 4. Initialisation au chargement de la page ---
document.addEventListener("DOMContentLoaded", () => {
  updatePointsDisplay();
  renderMarket();
});
