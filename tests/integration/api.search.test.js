const request = require('supertest');
const app = require('../../app');

describe('Integración HTTP - API de búsqueda', () => {
  test('GET /api/health responde 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ok: true, service: 'smart-garage' });
  });

  test('POST /api/search integra Express + servicio + catálogo', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ q: 'aceite', page: 1 });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.limit).toBe(6);
  });

  test('POST /api/search rechaza body vacío con 400', async () => {
    const response = await request(app).post('/api/search').send({});
    expect(response.status).toBe(400);
    expect(response.body.items).toEqual([]);
  });
});
