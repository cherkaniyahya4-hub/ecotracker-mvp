import { ensureSupabaseReady } from "../lib/supabase.js";
import { getOrCreateProfile } from "./profile.service.js";

const MARKET_PRODUCTS_TABLE = "market_products";

export const getMarketProducts = async () => {
  const client = ensureSupabaseReady();

  const { data, error } = await client
    .from(MARKET_PRODUCTS_TABLE)
    .select("*")
    .order("points", { ascending: true });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
};

export const getUserPoints = async (user) => {
  const profile = await getOrCreateProfile(user);
  return Number(profile?.points || 0);
};

export const redeemProduct = async ({ user, product }) => {
  if (!user?.id || !product?.id) {
    throw new Error("Missing user or product for purchase.");
  }
  const client = ensureSupabaseReady();

  const { data, error } = await client.rpc("redeem_product", {
    p_product_id: Number(product.id),
  });

  if (error) {
    throw error;
  }

  const payload = Array.isArray(data) ? data[0] : data;

  return {
    remaining_points: Number(payload?.remaining_points || 0),
  };
};
