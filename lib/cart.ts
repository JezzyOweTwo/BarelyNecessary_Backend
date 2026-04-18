export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

function notifyCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cart:updated"));
}

function notifyItemAdded(name: string, quantity: number) {
  if (typeof document === "undefined") return;
  const label =
    typeof name === "string" && name.trim() ? name.trim() : "Item";
  document.dispatchEvent(
    new CustomEvent("cart:itemAdded", {
      bubbles: true,
      detail: { name: label, quantity },
    })
  );
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
  notifyCartUpdated();
}

export function addToCart(product: CartItem) {
  const cart = getCart();

  const existing = cart.find(
    (item) => item.product_id === product.product_id
  );

  let lineQuantity: number;
  if (existing) {
    existing.quantity += 1;
    lineQuantity = existing.quantity;
  } else {
    cart.push({ ...product, quantity: 1 });
    lineQuantity = 1;
  }

  saveCart(cart);
  notifyItemAdded(
    typeof product.name === "string" ? product.name : "",
    lineQuantity
  );
}

export function setCartItemQuantity(product_id: number, quantity: number) {
  const cart = getCart();
  const next = cart
    .map((item) =>
      item.product_id === product_id
        ? { ...item, quantity: Math.max(1, Math.floor(quantity)) }
        : item
    )
    .filter((item) => item.quantity > 0);
  saveCart(next);
}

export function removeFromCart(product_id: number) {
  const cart = getCart();
  saveCart(cart.filter((item) => item.product_id !== product_id));
}

export function clearCart() {
  saveCart([]);
}