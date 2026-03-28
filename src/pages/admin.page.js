import { requireAuthenticatedUser } from "../services/auth.service.js";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminDashboardData,
  updateAdminProduct,
  updateAdminUser,
} from "../services/admin.service.js";
import { initLogoutLinks, initTheme, setMessage } from "./common.js";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const setMetric = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = formatNumber(value);
};

const messageEl = document.querySelector("#admin-message");
const productForm = document.querySelector("#admin-product-form");
const clearProductFormButton = document.querySelector("#clear-product-form");
const productSubmitButton = document.querySelector("#product-submit-btn");

let adminDataCache = {
  users: [],
  products: [],
};

const showNotice = (text, type = "success") => {
  if (!messageEl) return;
  setMessage(messageEl, text, type);
};

const clearProductForm = () => {
  if (!productForm) return;
  productForm.reset();
  const idField = productForm.querySelector("#product-id");
  if (idField) idField.value = "";
  if (productSubmitButton) {
    productSubmitButton.textContent = "Create product";
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
    productSubmitButton.textContent = "Update product";
  }
};

const renderUsers = (users) => {
  const tbody = document.querySelector("#admin-users-body");
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="7">No users yet.</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.full_name || "-"}</td>
          <td>${user.email || "-"}</td>
          <td>
            <select data-user-role-id="${user.id}" class="admin-inline-select">
              <option value="user" ${user.role === "user" ? "selected" : ""}>user</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
            </select>
          </td>
          <td>
            <input
              class="admin-inline-input"
              type="number"
              min="0"
              value="${Number(user.points || 0)}"
              data-user-points-id="${user.id}"
            />
          </td>
          <td>${user.city || "-"}</td>
          <td>${formatDateTime(user.created_at)}</td>
          <td>
            <button type="button" class="secondary-btn" data-user-save-id="${user.id}">
              Save
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
};

const renderOrders = (orders) => {
  const tbody = document.querySelector("#admin-orders-body");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="4">No orders yet.</td></tr>';
    return;
  }

  tbody.innerHTML = orders
    .map(
      (order) => `
        <tr>
          <td>${order.customer_name || "-"}</td>
          <td>${order.product_name || "-"}</td>
          <td>${formatNumber(order.points_spent)} PTS</td>
          <td>${formatDateTime(order.created_at)}</td>
        </tr>
      `,
    )
    .join("");
};

const renderProducts = (products) => {
  const tbody = document.querySelector("#admin-products-body");
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="5">No products found.</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
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
      `,
    )
    .join("");
};

const showUnauthorized = () => {
  const content = document.querySelector("#admin-content");

  if (content) {
    content.hidden = true;
  }

  showNotice("Admin access required. Your role is not allowed here.", "error");
};

const refreshAdminData = async (user) => {
  const generatedAt = document.querySelector("#generated-at");
  const data = await getAdminDashboardData(user);

  if (!data.authorized) {
    showUnauthorized();
    return false;
  }

  if (messageEl) {
    messageEl.hidden = true;
  }

  adminDataCache = {
    users: data.users || [],
    products: data.products || [],
  };

  if (generatedAt) {
    generatedAt.textContent = data.formatted.generated_at;
  }

  setMetric("#metric-total-users", data.metrics.total_users);
  setMetric("#metric-admin-users", data.metrics.admin_users);
  setMetric("#metric-total-orders", data.metrics.total_orders);
  setMetric("#metric-total-points-spent", data.metrics.total_points_spent);
  setMetric("#metric-completed-tasks", data.metrics.completed_tasks);
  setMetric("#metric-active-products", data.metrics.active_products);

  renderUsers(adminDataCache.users);
  renderOrders(data.recent_orders || []);
  renderProducts(adminDataCache.products);
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

    if (!payload.name || !payload.category || !payload.description || !payload.image) {
      showNotice("Please complete all product fields.", "error");
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
        showNotice("Product updated.", "success");
      } else {
        await createAdminProduct(payload);
        showNotice("Product created.", "success");
      }
      clearProductForm();
      await refreshAdminData(user);
    } catch (error) {
      console.error("Failed to save product:", error);
      showNotice("Could not save product.", "error");
    } finally {
      if (productSubmitButton) productSubmitButton.disabled = false;
    }
  });
};

const attachTableActions = (user) => {
  const usersTable = document.querySelector("#admin-users-body");
  const productsTable = document.querySelector("#admin-products-body");

  if (clearProductFormButton) {
    clearProductFormButton.addEventListener("click", () => {
      clearProductForm();
      showNotice("Product form cleared.", "success");
    });
  }

  if (productsTable) {
    productsTable.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-product-edit-id]");
      const deleteButton = event.target.closest("[data-product-delete-id]");

      if (editButton) {
        const productId = Number(editButton.dataset.productEditId);
        const product = adminDataCache.products.find(
          (item) => Number(item.id) === productId,
        );
        if (!product) return;
        fillProductForm(product);
        return;
      }

      if (!deleteButton) return;

      const productId = Number(deleteButton.dataset.productDeleteId);
      if (!Number.isFinite(productId)) return;

      const approved = window.confirm(
        "Delete this product permanently from the catalog?",
      );
      if (!approved) return;

      deleteButton.disabled = true;
      try {
        await deleteAdminProduct(productId);
        showNotice("Product deleted.", "success");
        await refreshAdminData(user);
      } catch (error) {
        console.error("Failed to delete product:", error);
        showNotice("Could not delete product.", "error");
      } finally {
        deleteButton.disabled = false;
      }
    });
  }

  if (usersTable) {
    usersTable.addEventListener("click", async (event) => {
      const saveButton = event.target.closest("[data-user-save-id]");
      if (!saveButton) return;

      const userId = String(saveButton.dataset.userSaveId || "");
      if (!userId) return;

      const roleInput = usersTable.querySelector(`[data-user-role-id="${userId}"]`);
      const pointsInput = usersTable.querySelector(`[data-user-points-id="${userId}"]`);

      const role = String(roleInput?.value || "user");
      const points = Number(pointsInput?.value || 0);

      saveButton.disabled = true;
      try {
        await updateAdminUser(userId, { role, points });
        showNotice("User updated.", "success");
        await refreshAdminData(user);
      } catch (error) {
        console.error("Failed to update user:", error);
        showNotice("Could not update user.", "error");
      } finally {
        saveButton.disabled = false;
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const authorized = await refreshAdminData(user);
    if (!authorized) return;

    clearProductForm();
    attachProductForm(user);
    attachTableActions(user);
  } catch (error) {
    console.error("Admin dashboard initialization failed:", error);
    showNotice("Unable to load admin dashboard.", "error");
  }
});
