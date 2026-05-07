# Express Shopping Cart

This project converts a static shopping cart website into an ExpressJS app.
The frontend stays in `public/`, while cart state is managed by backend routes using cookies.

## Project Structure

```text
ShoppingCart-ExpressJS/
|- server.js
|- package.json
|- public/
|  |- index.html
|  |- styles.css
|  |- app.js
|- routes/
|  |- cart.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the app:

```text
http://localhost:3000
```

## API Endpoints

- `GET /cart` - Retrieve the cart from cookies.
- `POST /cart/add` - Add an item to the cart cookie.
- `POST /cart/clear` - Clear the cart cookie.

### Example API Calls

```js
await fetch('/cart/add', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ id: 'p1', name: 'Coffee Beans', price: 8.99, qty: 1 })
});

const cart = await fetch('/cart').then((res) => res.json());

await fetch('/cart/clear', { method: 'POST' });
```

## Notes

- Cart data is stored in cookies through Express and `cookie-parser`.
- The browser frontend communicates with server routes using `fetch`.
- Bonus ideas (not implemented): admin route for all carts, JSON-file storage.