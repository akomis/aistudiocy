const getApiBase = () => {
  if (typeof window !== "undefined") {
    return "/api/store";
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${baseUrl}/api/store`;
};

const API_BASE = getApiBase();

// Types
export interface CartItem {
  product: Product | string;
  quantity: number;
  unitPrice: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "flat" | "percentage";
  value: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  expiresAt?: string;
  status: "active" | "inactive";
}

export interface Cart {
  id: string;
  items: CartItem[];
  email?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingOption?: ShippingOption | string | number;
  coupon?: Coupon | string | number;
  discount: number;
  subtotal: number;
  shippingTotal: number;
  total: number;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  completedAt?: string;
  paymentStatus?: "pending" | "processing" | "succeeded" | "failed";
  notes?: string;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  inventory?: number;
  category: Category | string;
  thumbnail: Media;
  images?: { image: Media }[];
  status: "draft" | "published" | "archived";
  size?: string;
}

export interface Category {
  id: string;
  name: string;
  handle: string;
  description?: string;
  headerDesktop?: Media;
  headerMobile?: Media;
}

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  countries: ("CY" | "GR")[];
  isActive: boolean;
}

export interface Media {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: {
    thumbnail?: { url: string };
    card?: { url: string };
    full?: { url: string };
  };
}

export interface Order {
  id: string;
  displayId: string;
  email: string;
  items: {
    productId: string;
    productTitle: string;
    productDescription?: string;
    thumbnail?: string;
    quantity: number;
    unitPrice: number;
  }[];
  shippingAddress: Address;
  shippingMethod?: { name?: string; amount?: number };
  subtotal: number;
  shippingTotal: number;
  total: number;
  status: string;
  fulfillmentStatus: string;
}

// CMS Types
export interface LandingPage {
  abouts?: {
    title: string;
    content: any; // Lexical rich text
  }[];
  socials?: {
    key: string;
    value: string;
    url?: string;
  }[];
  footerImage?: Media;
}

export interface Catalogue {
  showcaseImages?: { image: Media }[];
}

// Store API client
export const store = {
  // Cart operations (session-based - cart ID stored in HTTP-only cookie)
  cart: {
    async create(): Promise<{ cart: Cart }> {
      const res = await fetch(`${API_BASE}/carts`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to create cart");
      return res.json();
    },

    async retrieve(): Promise<{ cart: Cart }> {
      const res = await fetch(`${API_BASE}/carts`);
      if (!res.ok) throw new Error("Failed to retrieve cart");
      return res.json();
    },

    async update(data: Partial<Cart>): Promise<{ cart: Cart }> {
      const res = await fetch(`${API_BASE}/carts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return res.json();
    },

    async addLineItem(productId: string, quantity = 1): Promise<{ cart: Cart }> {
      const res = await fetch(`${API_BASE}/carts/line-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add item");
      }
      return res.json();
    },

    async deleteLineItem(itemIndex: number): Promise<{ cart: Cart }> {
      const res = await fetch(`${API_BASE}/carts/line-items/${itemIndex}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },

    async createPaymentIntent(): Promise<{
      client_secret: string;
      payment_intent_id: string;
    }> {
      const res = await fetch(`${API_BASE}/carts/payment`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create payment");
      }
      return res.json();
    },

    async complete(): Promise<
      | { type: "order"; order: Order }
      | { type: "cart"; error: string }
      | { type: "processing"; message: string }
    > {
      const res = await fetch(`${API_BASE}/carts/complete`, {
        method: "POST",
      });
      return res.json();
    },

    async applyCoupon(code: string): Promise<{
      cart: Cart;
      coupon: { code: string; type: string; value: number };
    }> {
      const res = await fetch(`${API_BASE}/carts/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to apply coupon");
      }
      return res.json();
    },

    async removeCoupon(): Promise<{ cart: Cart }> {
      const res = await fetch(`${API_BASE}/carts/coupon`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to remove coupon");
      }
      return res.json();
    },

    async reset(): Promise<void> {
      await fetch(`${API_BASE}/carts`, { method: "DELETE" });
    },
  },

  // Product operations
  product: {
    async list(categoryId?: string): Promise<{ products: Product[] }> {
      const params = categoryId ? `?category_id=${categoryId}` : "";
      const res = await fetch(`${API_BASE}/products${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },

    async get(handle: string): Promise<{ product: Product }> {
      const res = await fetch(`${API_BASE}/products/${handle}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
  },

  // Category operations
  category: {
    async list(): Promise<{ categories: Category[] }> {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  },

  // Shipping operations
  shipping: {
    async listOptions(
      countryCode?: string
    ): Promise<{ shipping_options: ShippingOption[] }> {
      const params = countryCode ? `?country_code=${countryCode}` : "";
      const res = await fetch(`${API_BASE}/shipping${params}`);
      if (!res.ok) throw new Error("Failed to fetch shipping options");
      return res.json();
    },
  },

  // CMS operations
  cms: {
    async getLandingPage(): Promise<{ landingPage: LandingPage }> {
      const res = await fetch(`${API_BASE}/landing-page`);
      if (!res.ok) throw new Error("Failed to fetch landing page");
      return res.json();
    },

    async getCatalogue(): Promise<{ catalogue: Catalogue }> {
      const res = await fetch(`${API_BASE}/catalogue`);
      if (!res.ok) throw new Error("Failed to fetch catalogue");
      return res.json();
    },
  },
};
