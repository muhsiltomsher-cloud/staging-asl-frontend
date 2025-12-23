export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "ON_BACKORDER";
  stockQuantity: number | null;
  image: ProductImage | null;
  galleryImages: {
    nodes: ProductImage[];
  };
  productCategories: {
    nodes: ProductCategory[];
  };
  attributes: {
    nodes: ProductAttribute[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
}

export interface ProductImage {
  id: string;
  sourceUrl: string;
  altText: string;
  title: string;
}

export interface ProductCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  image: ProductImage | null;
  parent?: {
    node: {
      id: string;
      slug: string;
      name: string;
    };
  } | null;
  children?: {
    nodes: ProductCategory[];
  };
}

export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
  variation: boolean;
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "ON_BACKORDER";
  stockQuantity: number | null;
  attributes: {
    nodes: {
      name: string;
      value: string;
    }[];
  };
}

export interface CartItem {
  key: string;
  product: {
    node: Product;
  };
  variation?: {
    node: ProductVariation;
  };
  quantity: number;
  total: string;
  subtotal: string;
}

export interface Cart {
  contents: {
    nodes: CartItem[];
    itemCount: number;
  };
  subtotal: string;
  total: string;
  shippingTotal: string;
  discountTotal: string;
  appliedCoupons: {
    nodes: {
      code: string;
      discountAmount: string;
    }[];
  };
}

export interface Page {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  content: string;
  featuredImage: {
    node: ProductImage;
  } | null;
  seo?: SEOData;
}

export interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage: {
    node: ProductImage;
  } | null;
  categories: {
    nodes: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
  seo?: SEOData;
}

export interface SEOData {
  title: string;
  metaDesc: string;
  canonical: string;
  opengraphTitle: string;
  opengraphDescription: string;
  opengraphImage: {
    sourceUrl: string;
  } | null;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: {
    sourceUrl: string;
  } | null;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  path: string;
  parentId: string | null;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  menuItems: {
    nodes: MenuItem[];
  };
}
