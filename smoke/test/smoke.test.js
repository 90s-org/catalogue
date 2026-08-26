// Confirms the live catalogue deployment is up and its core routes work end to
// end against real data. Deliberately shallow — edge cases and error paths are
// covered by catalogue's own unit tests (test/app.test.js), not here.
const { CATALOGUE_URL, getJSON, waitUntilHealthy } = require('./helpers');

beforeAll(async () => {
    await waitUntilHealthy();
});

test('GET /health reports the app and database both up', async () => {
    const { status, body } = await getJSON(`${CATALOGUE_URL}/health`);
    expect(status).toBe(200);
    expect(body.app).toBe('OK');
    expect(body.mongo).toBe(true);
});

test('GET /products returns real seed data', async () => {
    const { status, body } = await getJSON(`${CATALOGUE_URL}/products`);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
});

test('GET /product/:sku returns a real product by sku', async () => {
    const { body: products } = await getJSON(`${CATALOGUE_URL}/products`);
    const sku = products[0].sku;

    const { status, body } = await getJSON(`${CATALOGUE_URL}/product/${encodeURIComponent(sku)}`);
    expect(status).toBe(200);
    expect(body.sku).toBe(sku);
});

test('GET /categories returns at least one category', async () => {
    const { status, body } = await getJSON(`${CATALOGUE_URL}/categories`);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
});

test('GET /products/:cat filters to that category', async () => {
    const { body: categories } = await getJSON(`${CATALOGUE_URL}/categories`);
    const category = categories[0];

    const { status, body } = await getJSON(`${CATALOGUE_URL}/products/${encodeURIComponent(category)}`);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.every((p) => p.categories.includes(category))).toBe(true);
});

test('GET /search/:text finds a real product by its own name', async () => {
    const { body: products } = await getJSON(`${CATALOGUE_URL}/products`);
    const term = products[0].name.split(' ')[0];

    const { status, body } = await getJSON(`${CATALOGUE_URL}/search/${encodeURIComponent(term)}`);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((p) => p.sku === products[0].sku)).toBe(true);
});
