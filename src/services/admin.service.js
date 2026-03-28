import { ensureSupabaseReady } from "../lib/supabase.js";
import { getOrCreateProfile } from "./profile.service.js";

const toDateLabel = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const assertAdmin = async (user) => {
  const profile = await getOrCreateProfile(user);
  const isAdmin = String(profile?.role || "user").toLowerCase() === "admin";

  if (!isAdmin) {
    return {
      authorized: false,
      profile,
    };
  }

  return {
    authorized: true,
    profile,
  };
};

const getSupabaseAdminData = async () => {
  const client = ensureSupabaseReady();

  const [
    usersCountResult,
    adminsCountResult,
    ordersCountResult,
    completedTasksResult,
    activeProductsResult,
    usersResult,
    recentOrdersResult,
    productsResult,
    pointsResult,
  ] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }),
    client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
    client.from("market_orders").select("id", { count: "exact", head: true }),
    client
      .from("user_tasks")
      .select("id", { count: "exact", head: true })
      .eq("completed", true),
    client
      .from("market_products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    client
      .from("profiles")
      .select("id, email, full_name, role, points, city, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("market_orders")
      .select("id, user_id, product_id, points_spent, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    client
      .from("market_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    client.from("market_orders").select("points_spent"),
  ]);

  const allResults = [
    usersCountResult,
    adminsCountResult,
    ordersCountResult,
    completedTasksResult,
    activeProductsResult,
    usersResult,
    recentOrdersResult,
    productsResult,
    pointsResult,
  ];

  allResults.forEach((result) => {
    if (result.error) {
      throw result.error;
    }
  });

  const users = usersResult.data || [];
  const recentOrders = recentOrdersResult.data || [];
  const products = productsResult.data || [];

  const orderUserIds = [...new Set(recentOrders.map((order) => order.user_id))];
  const orderProductIds = [...new Set(recentOrders.map((order) => order.product_id))];

  const [orderUsersResult, orderProductsResult] = await Promise.all([
    orderUserIds.length > 0
      ? client.from("profiles").select("id, full_name, email").in("id", orderUserIds)
      : Promise.resolve({ data: [], error: null }),
    orderProductIds.length > 0
      ? client.from("market_products").select("id, name").in("id", orderProductIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (orderUsersResult.error) throw orderUsersResult.error;
  if (orderProductsResult.error) throw orderProductsResult.error;

  const usersById = Object.fromEntries(
    (orderUsersResult.data || []).map((item) => [item.id, item]),
  );
  const productsById = Object.fromEntries(
    (orderProductsResult.data || []).map((item) => [item.id, item]),
  );

  const mappedOrders = recentOrders.map((order) => ({
    ...order,
    customer_name:
      usersById[order.user_id]?.full_name || usersById[order.user_id]?.email || "Unknown",
    product_name: productsById[order.product_id]?.name || "Unknown product",
  }));

  const totalPointsSpent = (pointsResult.data || []).reduce(
    (sum, item) => sum + Number(item.points_spent || 0),
    0,
  );

  return {
    metrics: {
      total_users: usersCountResult.count || 0,
      admin_users: adminsCountResult.count || 0,
      total_orders: ordersCountResult.count || 0,
      total_points_spent: totalPointsSpent,
      completed_tasks: completedTasksResult.count || 0,
      active_products: activeProductsResult.count || 0,
    },
    users,
    recent_orders: mappedOrders,
    products,
    formatted: {
      generated_at: toDateLabel(new Date().toISOString()),
    },
  };
};

export const getAdminDashboardData = async (user) => {
  const authz = await assertAdmin(user);
  if (!authz.authorized) {
    return authz;
  }

  const payload = await getSupabaseAdminData();
  return {
    authorized: true,
    profile: authz.profile,
    ...payload,
  };
};

export const getAdminProducts = async (user) => {
  const authz = await assertAdmin(user);
  if (!authz.authorized) {
    return authz;
  }

  const client = ensureSupabaseReady();
  const { data, error } = await client
    .from("market_products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return {
    authorized: true,
    profile: authz.profile,
    products: data || [],
  };
};

const normalizeProductPayload = (patch) => {
  const payload = {
    name: String(patch.name || "").trim(),
    category: String(patch.category || "").trim(),
    points: Number(patch.points || 0),
    description: String(patch.description || "").trim(),
    image: String(patch.image || "").trim(),
    is_active:
      typeof patch.is_active === "boolean" ? patch.is_active : Boolean(patch.is_active),
  };

  if (typeof patch.image_blob === "string" && patch.image_blob.trim()) {
    payload.image_blob = patch.image_blob.trim();
  }

  if (typeof patch.image_mime_type === "string" && patch.image_mime_type.trim()) {
    payload.image_mime_type = patch.image_mime_type.trim();
  }

  return payload;
};

export const createAdminProduct = async (payload) => {
  const client = ensureSupabaseReady();
  const normalized = normalizeProductPayload(payload);

  const { data, error } = await client
    .from("market_products")
    .insert(normalized)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const updateAdminProduct = async (productId, patch) => {
  const client = ensureSupabaseReady();
  const normalized = normalizeProductPayload(patch);

  const { data, error } = await client
    .from("market_products")
    .update(normalized)
    .eq("id", Number(productId))
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const deleteAdminProduct = async (productId) => {
  const client = ensureSupabaseReady();
  const { error } = await client
    .from("market_products")
    .delete()
    .eq("id", Number(productId));

  if (error) throw error;
};

export const updateAdminUser = async (userId, patch) => {
  const client = ensureSupabaseReady();
  const payload = {};

  if (typeof patch.role === "string") {
    payload.role = patch.role === "admin" ? "admin" : "user";
  }

  if (typeof patch.points !== "undefined") {
    const points = Number(patch.points);
    if (!Number.isFinite(points) || points < 0) {
      throw new Error("Points must be a non-negative number.");
    }
    payload.points = Math.floor(points);
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("No valid update values provided.");
  }

  const { data, error } = await client
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id, email, full_name, role, points, city, created_at")
    .single();

  if (error) throw error;
  return data;
};
