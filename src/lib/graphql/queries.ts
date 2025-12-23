export const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    id
    databaseId
    name
    slug
    description
    shortDescription
    ... on SimpleProduct {
      price
      regularPrice
      salePrice
      onSale
      stockStatus
      stockQuantity
    }
    ... on VariableProduct {
      price
      regularPrice
      salePrice
      onSale
      stockStatus
      variations(first: 100) {
        nodes {
          id
          databaseId
          name
          price
          regularPrice
          salePrice
          stockStatus
          stockQuantity
          attributes {
            nodes {
              name
              value
            }
          }
        }
      }
    }
    image {
      id
      sourceUrl
      altText
      title
    }
    galleryImages(first: 10) {
      nodes {
        id
        sourceUrl
        altText
        title
      }
    }
    productCategories {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    attributes {
      nodes {
        id
        name
        options
        variation
      }
    }
  }
`;

export const GET_PRODUCTS = `
  ${PRODUCT_FIELDS}
  query GetProducts($first: Int = 12, $after: String, $where: RootQueryToProductConnectionWhereArgs) {
    products(first: $first, after: $after, where: $where) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = `
  ${PRODUCT_FIELDS}
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ...ProductFields
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`;

export const GET_PRODUCT_CATEGORIES = `
  query GetProductCategories($first: Int = 100) {
    productCategories(first: $first, where: { hideEmpty: true }) {
      nodes {
        id
        databaseId
        name
        slug
        description
        image {
          id
          sourceUrl
          altText
        }
        parent {
          node {
            id
            slug
            name
          }
        }
        children {
          nodes {
            id
            databaseId
            name
            slug
          }
        }
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = `
  ${PRODUCT_FIELDS}
  query GetCategoryBySlug($slug: ID!, $first: Int = 12, $after: String) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      image {
        id
        sourceUrl
        altText
      }
      seo {
        title
        metaDesc
        canonical
      }
    }
    products(first: $first, after: $after, where: { categoryIn: [$slug] }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const GET_PAGE_BY_SLUG = `
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      databaseId
      title
      slug
      content
      featuredImage {
        node {
          id
          sourceUrl
          altText
        }
      }
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`;

export const GET_MENU = `
  query GetMenu($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 100) {
      nodes {
        id
        label
        url
        path
        parentId
      }
    }
  }
`;

export const GET_CART = `
  query GetCart {
    cart {
      contents {
        nodes {
          key
          product {
            node {
              id
              databaseId
              name
              slug
              image {
                sourceUrl
                altText
              }
            }
          }
          variation {
            node {
              id
              databaseId
              name
              price
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
          quantity
          total
          subtotal
        }
        itemCount
      }
      subtotal
      total
      shippingTotal
      discountTotal
      appliedCoupons {
        nodes {
          code
          discountAmount
        }
      }
    }
  }
`;

export const ADD_TO_CART = `
  mutation AddToCart($productId: Int!, $quantity: Int = 1, $variationId: Int) {
    addToCart(input: { productId: $productId, quantity: $quantity, variationId: $variationId }) {
      cartItem {
        key
        product {
          node {
            id
            name
          }
        }
        quantity
        total
      }
    }
  }
`;

export const UPDATE_CART_ITEM = `
  mutation UpdateCartItem($key: ID!, $quantity: Int!) {
    updateItemQuantities(input: { items: [{ key: $key, quantity: $quantity }] }) {
      cart {
        contents {
          itemCount
        }
        total
      }
    }
  }
`;

export const REMOVE_CART_ITEM = `
  mutation RemoveCartItem($keys: [ID!]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        contents {
          itemCount
        }
        total
      }
    }
  }
`;
