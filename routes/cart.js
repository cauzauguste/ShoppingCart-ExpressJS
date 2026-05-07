const express = require('express');

const router = express.Router();
const CART_COOKIE = 'shopping_cart';
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function parseCartCookie(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function normalizeItem(input) {
  const id = String(input.id || '').trim();
  const name = String(input.name || '').trim();
  const price = Number(input.price);
  const qty = Number.isInteger(Number(input.qty)) ? Number(input.qty) : 1;

  if (!id || !name || Number.isNaN(price) || price < 0 || qty < 1) {
    return null;
  }

  return {
    id,
    name,
    price,
    qty
  };
}

function summarizeCart(cart) {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    cart,
    totalItems,
    totalPrice: Number(totalPrice.toFixed(2))
  };
}

function setCartCookie(res, cart) {
  res.cookie(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS
  });
}

router.get('/cart', (req, res) => {
  const cart = parseCartCookie(req.cookies[CART_COOKIE]);
  res.json(summarizeCart(cart));
});

router.post('/cart/add', (req, res) => {
  const item = normalizeItem(req.body);

  if (!item) {
    return res.status(400).json({
      error: 'Invalid item. Required fields: id, name, price, qty(optional).'
    });
  }

  const cart = parseCartCookie(req.cookies[CART_COOKIE]);
  const existingIndex = cart.findIndex((entry) => entry.id === item.id);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += item.qty;
  } else {
    cart.push(item);
  }

  setCartCookie(res, cart);
  return res.status(201).json(summarizeCart(cart));
});

router.post('/cart/clear', (_req, res) => {
  res.clearCookie(CART_COOKIE);
  return res.json({
    message: 'Cart cleared.',
    cart: [],
    totalItems: 0,
    totalPrice: 0
  });
});

module.exports = router;