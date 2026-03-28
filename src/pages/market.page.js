import { requireAuthenticatedUser } from "../services/auth.service.js";
import {
  getMarketProducts,
  getUserPoints,
  redeemProduct,
} from "../services/market.service.js";
import { initLogoutLinks, initTheme } from "./common.js";

const formatPoints = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

const renderProducts = (container, products) => {
  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML =
      '<p class="market-empty">No active products in catalog. Ask an admin to add items.</p>';
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="product-details">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">${formatPoints(product.points)} PTS</div>
            <button class="buy-button" data-product-id="${product.id}">Echanger</button>
          </div>
        </article>
      `,
    )
    .join("");
};

const showPurchaseMessage = (message) => {
  window.alert(message);
};

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  const pointsElement = document.querySelector("#user-points-balance");
  const productsContainer = document.querySelector("#market-products-container");

  if (productsContainer === null || pointsElement === null) {
    return;
  }

  try {
    const user = await requireAuthenticatedUser();
    if (user === null) return;

    const [products, points] = await Promise.all([
      getMarketProducts(),
      getUserPoints(user),
    ]);

    let currentPoints = Number(points || 0);

    pointsElement.textContent = formatPoints(currentPoints);
    renderProducts(productsContainer, products);

    productsContainer.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-product-id]");
      if (button === null) return;

      const productId = Number(button.dataset.productId);
      const product = products.find((item) => Number(item.id) === productId);
      if (product === undefined) return;

      button.disabled = true;

      try {
        const result = await redeemProduct({ user, product });
        currentPoints = Number(result.remaining_points || 0);
        pointsElement.textContent = formatPoints(currentPoints);
        showPurchaseMessage(`Success! You redeemed: ${product.name}`);
      } catch (error) {
        const message = String(error?.message || "Purchase failed");
        if (message.includes("NOT_ENOUGH_POINTS")) {
          showPurchaseMessage("Not enough points for this product.");
        } else {
          showPurchaseMessage("Purchase failed. Please try again.");
        }
      } finally {
        button.disabled = false;
      }
    });
  } catch (error) {
    console.error("Market initialization failed:", error);
  }
});
