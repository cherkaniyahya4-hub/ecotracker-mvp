import { requireAuthenticatedUser } from "../services/auth.service.js";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../services/admin.service.js";
import { buildSvgPlaceholderDataUrl, resolveDbImageSource } from "../lib/blob-media.js";
import { initLogoutLinks, initTheme, setMessage } from "./common.js";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const messageEl = document.querySelector("#admin-message");
const productForm = document.querySelector("#admin-product-form");
const clearProductFormButton = document.querySelector("#clear-product-form");
const productSubmitButton = document.querySelector("#product-submit-btn");

let productsCache = [];

const showNotice = (text, type = "success") => {
  if (!messageEl) return;
  setMessage(messageEl, text, type);
};

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = String(value ?? "");
};

const fileToPostgresBytea = async (file) => {
  if (!(file instanceof File) || file.size <= 0) return "";
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let hex = "\\x";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const fillProfileCard = (profile) => {
  setText("#admin-profile-name", profile?.full_name || "-");
  setText("#admin-profile-email", profile?.email || "-");
  setText("#admin-profile-role", profile?.role || "-");
  setText("#admin-profile-city", profile?.city || "-");
  setText("#admin-profile-points", formatNumber(profile?.points || 0));
};

const clearProductForm = () => {
  if (!productForm) return;
  productForm.reset();
  const idField = productForm.querySelector("#product-id");
  if (idField) idField.value = "";
  if (productSubmitButton) {
    productSubmitButton.textContent = "Add market item";
  }
};

const fillProductForm = (product) => {
  if (!productForm) return;

  const setValue = (selector, value) => {
    const input = productForm.querySelector(selector);
    if (input) input.value = String(value ?? "");
  };

  setValue("#product-id", product.id);
  setValue("#product-name", product.name);
  setValue("#product-category", product.category);
  setValue("#product-points", product.points);
  setValue("#product-description", product.description);
  setValue("#product-image", product.image);
  setValue("#product-active", product.is_active ? "true" : "false");

  if (productSubmitButton) {
    productSubmitButton.textContent = "Update market item";
  }
};

const renderProducts = (products) => {
  const tbody = document.querySelector("#admin-products-body");
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6">No market items yet.</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => {
        const imageSrc = resolveDbImageSource({
          blob: product.image_blob,
          mimeType: product.image_mime_type,
          url: product.image,
          fallback: buildSvgPlaceholderDataUrl(product.name || "Eco Item"),
        });

        return `
        <tr>
          <td>${escapeHtml(product.name)}</td>
          <td>
            <img
              class="admin-product-thumb"
              src="${escapeHtml(imageSrc)}"
              alt="${escapeHtml(product.name)}"
              loading="lazy"
            />
          </td>
          <td>${escapeHtml(product.category)}</td>
          <td>${formatNumber(product.points)} PTS</td>
          <td>${product.is_active ? "Active" : "Disabled"}</td>
          <td class="admin-actions">
            <button type="button" class="secondary-btn" data-product-edit-id="${product.id}">
              Edit
            </button>
            <button type="button" class="danger-btn" data-product-delete-id="${product.id}">
              Delete
            </button>
          </td>
        </tr>
      `;
      },
    )
    .join("");
};

const showUnauthorized = () => {
  const content = document.querySelector("#admin-content");
  if (content) content.hidden = true;
  showNotice("Admin access required.", "error");
  window.setTimeout(() => {
    window.location.href = "./dashboard.html";
  }, 1200);
};

const refreshData = async (user) => {
  const data = await getAdminProducts(user);

  if (!data.authorized) {
    showUnauthorized();
    return false;
  }

  fillProfileCard(data.profile);
  productsCache = data.products || [];
  renderProducts(productsCache);
  return true;
};

const attachProductForm = (user) => {
  if (!productForm) return;

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(productForm);
    const productId = String(formData.get("product-id") || "").trim();
    const payload = {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      points: Number(formData.get("points") || 0),
      description: String(formData.get("description") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      is_active: String(formData.get("is_active") || "true") === "true",
    };

    const imageFile = formData.get("image_file");
    const imageBlob = await fileToPostgresBytea(imageFile);
    if (imageBlob) {
      payload.image_blob = imageBlob;
      payload.image_mime_type = imageFile.type || "application/octet-stream";
    }

    if (!payload.name || !payload.category || !payload.description) {
      showNotice("Please complete name, category, points and description.", "error");
      return;
    }

    if (!payload.image && !payload.image_blob && !productId) {
      showNotice("Please provide an image URL or upload an image file.", "error");
      return;
    }

    if (!Number.isFinite(payload.points) || payload.points <= 0) {
      showNotice("Points must be a positive number.", "error");
      return;
    }

    if (productSubmitButton) productSubmitButton.disabled = true;

    try {
      if (productId) {
        await updateAdminProduct(productId, payload);
        showNotice("Market item updated.", "success");
      } else {
        await createAdminProduct(payload);
        showNotice("Market item created.", "success");
      }
      clearProductForm();
      await refreshData(user);
    } catch (error) {
      console.error("Failed to save market item:", error);
      showNotice("Could not save market item.", "error");
    } finally {
      if (productSubmitButton) productSubmitButton.disabled = false;
    }
  });
};

const attachTableActions = (user) => {
  const productsTable = document.querySelector("#admin-products-body");

  if (clearProductFormButton) {
    clearProductFormButton.addEventListener("click", () => {
      clearProductForm();
      showNotice("Form reset.", "success");
    });
  }

  if (!productsTable) return;

  productsTable.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-product-edit-id]");
    const deleteButton = event.target.closest("[data-product-delete-id]");

    if (editButton) {
      const productId = Number(editButton.dataset.productEditId);
      const product = productsCache.find((item) => Number(item.id) === productId);
      if (!product) return;
      fillProductForm(product);
      return;
    }

    if (!deleteButton) return;

    const productId = Number(deleteButton.dataset.productDeleteId);
    if (!Number.isFinite(productId)) return;

    const approved = window.confirm("Delete this market item?");
    if (!approved) return;

    deleteButton.disabled = true;
    try {
      await deleteAdminProduct(productId);
      showNotice("Market item deleted.", "success");
      await refreshData(user);
    } catch (error) {
      console.error("Failed to delete market item:", error);
      showNotice("Could not delete market item.", "error");
    } finally {
      deleteButton.disabled = false;
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  await (window.__runtimeConfigReady || Promise.resolve());
  initTheme();
  initLogoutLinks();

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const authorized = await refreshData(user);
    if (!authorized) return;

    clearProductForm();
    attachProductForm(user);
    attachTableActions(user);
  } catch (error) {
    console.error("Admin page failed to load:", error);
    showNotice("Unable to load admin manager.", "error");
  }
});
