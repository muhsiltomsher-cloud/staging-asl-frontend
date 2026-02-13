/**
 * Bundle Storage Utility
 * 
 * CoCart doesn't persist custom cart_item_data without a backend WordPress filter.
 * This utility stores bundle configuration in localStorage as a workaround,
 * allowing the frontend to display bundle items in the cart.
 */

export interface StoredBundleItem {
  product_id: number;
  name?: string;
  price?: number | string;
  quantity?: number;
  is_addon?: boolean;
  is_free?: boolean;
}

export interface StoredBundleData {
  bundle_items: StoredBundleItem[];
  bundle_total?: number;
  box_price?: number;
  products_total?: number;
  required_items_total?: number;
  addon_items_total?: number;
  pricing_mode?: "sum" | "fixed";
  fixed_price?: number;
  timestamp: number;
}

const STORAGE_KEY = "asl_bundle_cart_data";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get all stored bundle data from localStorage
 */
function getAllBundleData(): Record<string, StoredBundleData> {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const data = JSON.parse(stored) as Record<string, StoredBundleData>;
    
    // Clean up expired entries
    const now = Date.now();
    const cleaned: Record<string, StoredBundleData> = {};
    let hasExpired = false;
    
    for (const [key, value] of Object.entries(data)) {
      if (now - value.timestamp < MAX_AGE_MS) {
        cleaned[key] = value;
      } else {
        hasExpired = true;
      }
    }
    
    // Save cleaned data if we removed expired entries
    if (hasExpired) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    
    return cleaned;
  } catch {
    return {};
  }
}

/**
 * Save bundle data for a specific product ID
 */
export function saveBundleData(productId: number, data: Omit<StoredBundleData, "timestamp">): void {
  if (typeof window === "undefined") return;
  
  try {
    const allData = getAllBundleData();
    allData[String(productId)] = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error("Failed to save bundle data to localStorage:", error);
  }
}

/**
 * Get bundle data for a specific product ID
 */
export function getBundleData(productId: number): StoredBundleData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const allData = getAllBundleData();
    return allData[String(productId)] || null;
  } catch {
    return null;
  }
}

/**
 * Remove bundle data for a specific product ID
 */
export function removeBundleData(productId: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const allData = getAllBundleData();
    delete allData[String(productId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error("Failed to remove bundle data from localStorage:", error);
  }
}

/**
 * Clear all bundle data from localStorage
 */
export function clearAllBundleData(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear bundle data from localStorage:", error);
  }
}
