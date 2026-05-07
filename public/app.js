const products = [
  { id: 'p1', name: 'Coffee Beans', price: 8.99 },
  { id: 'p2', name: 'Green Tea', price: 4.5 },
  { id: 'p3', name: 'Ceramic Mug', price: 12.0 },
  { id: 'p4', name: 'French Press', price: 24.99 }
];

const productListEl = document.getElementById('product-list');
const cartItemsEl = document.getElementById('cart-items');
const cartSummaryEl = document.getElementById('cart-summary');
const clearCartBtn = document.getElementById('clear-cart');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function renderProducts() {
  productListEl.innerHTML = products
    .map(
      (item) => `
      <article class="product-card">
        <h3>${item.name}</h3>
        <p class="price">${formatCurrency(item.price)}</p>
        <button class="btn btn-add" data-product-id="${item.id}" type="button">Add to Cart</button>
      </article>
    `
    )
    .join('');
}

function renderCart(cartResponse) {
  const { cart, totalItems, totalPrice } = cartResponse;

  if (!Array.isArray(cart) || cart.length === 0) {
    cartItemsEl.innerHTML = '<li>Your cart is empty.</li>';
  } else {
    cartItemsEl.innerHTML = cart
      .map(
        (item) =>
          `<li>${item.name} x ${item.qty} - ${formatCurrency(item.price * item.qty)}</li>`
      )
      .join('');
  }

  cartSummaryEl.textContent = `Items: ${totalItems} | Total: ${formatCurrency(totalPrice)}`;
}

async function fetchCart() {
  const response = await fetch('/cart');

  if (!response.ok) {
    throw new Error('Unable to fetch cart.');
  }

  return response.json();
}

async function addToCart(productId) {
  const product = products.find((entry) => entry.id === productId);

  if (!product) {
    return;
  }

  const response = await fetch('/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...product, qty: 1 })
  });

  if (!response.ok) {
    throw new Error('Unable to add item.');
  }

  const data = await response.json();
  renderCart(data);
}

async function clearCart() {
  const response = await fetch('/cart/clear', { method: 'POST' });

  if (!response.ok) {
    throw new Error('Unable to clear cart.');
  }

  const data = await response.json();
  renderCart(data);
}

productListEl.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-product-id]');

  if (!button) {
    return;
  }

  try {
    await addToCart(button.dataset.productId);
  } catch (error) {
    console.error(error);
    alert('Could not add item to cart. Check console for details.');
  }
});

clearCartBtn.addEventListener('click', async () => {
  try {
    await clearCart();
  } catch (error) {
    console.error(error);
    alert('Could not clear cart. Check console for details.');
  }
});

async function init() {
  renderProducts();

  try {
    const cart = await fetchCart();
    renderCart(cart);
  } catch (error) {
    console.error(error);
    cartItemsEl.innerHTML = '<li>Failed to load cart.</li>';
    cartSummaryEl.textContent = 'Items: 0 | Total: $0.00';
  }
}

init();