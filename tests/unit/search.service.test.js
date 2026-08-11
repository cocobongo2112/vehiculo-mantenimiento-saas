const { validateAndNormalize, scoreItem, searchCatalog, FIXED_LIMIT } = require('../../src/services/search.service');

describe('Caja blanca y pruebas unitarias - búsqueda Smart Garage', () => {
  test('rechaza una búsqueda vacía sin filtros', () => {
    expect(validateAndNormalize({})).toMatchObject({ ok: false, status: 400 });
  });

  test('permite carga inicial explícita y fuerza límite de 6', () => {
    const result = validateAndNormalize({ loadAll: true, limit: 999 });
    expect(result.ok).toBe(true);
    expect(result.limit).toBe(FIXED_LIMIT);
  });

  test.each([
    [{ q: 'a'.repeat(61) }, 'demasiado larga'],
    [{ q: 'aceite', sort: 'hack' }, 'sort inválido'],
    [{ category: 'Inexistente' }, 'Categoría inválida'],
    [{ min: -1 }, 'min inválido'],
    [{ max: 1000000 }, 'max inválido'],
    [{ min: 500, max: 100 }, 'min no puede ser mayor'],
    [{ q: '!!!' }, 'caracteres inválidos']
  ])('cubre ramas de validación %#', (payload, expectedMessage) => {
    const result = validateAndNormalize(payload);
    expect(result.ok).toBe(false);
    expect(result.msg).toContain(expectedMessage);
  });

  test('scoreItem recorre tags y prioriza título sobre descripción', () => {
    const item = { title: 'Cambio de aceite', description: 'Servicio preventivo de motor', tags: ['aceite', 'motor'] };
    const titleScore = scoreItem(item, 'aceite', ['motor']);
    const descriptionScore = scoreItem(item, 'preventivo', []);
    expect(titleScore).toBeGreaterThan(descriptionScore);
    expect(titleScore).toBe(9); // 6 título + 2 coincidencia en tags + 1 tag de filtro
  });

  test('ordena por precio ascendente y pagina resultados', () => {
    const source = [
      { id: 1, title: 'A', description: 'x', tags: [], category: 'Motor', price: 300, date: '2026-01-01' },
      { id: 2, title: 'B', description: 'x', tags: [], category: 'Motor', price: 100, date: '2026-01-02' },
      { id: 3, title: 'C', description: 'x', tags: [], category: 'Motor', price: 200, date: '2026-01-03' }
    ];
    const result = searchCatalog({ category: 'Motor', sort: 'price_asc' }, source);
    expect(result.items.map((x) => x.price)).toEqual([100, 200, 300]);
  });

  test('devuelve 200 e items vacíos cuando no hay coincidencias', () => {
    const result = searchCatalog({ q: 'zzzz-no-existe' });
    expect(result.status).toBe(200);
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });

  test('acepta tags como cadena separada por comas y los normaliza', () => {
  const result = validateAndNormalize({
    tags: 'aceite, motor, frenos'
  });

  expect(result.ok).toBe(true);
  expect(result.tags).toEqual(['aceite', 'motor', 'frenos']);
});

test('ordena resultados del más reciente al más antiguo', () => {
  const source = [
    {
      id: 1,
      title: 'Servicio básico',
      description: 'Servicio',
      category: 'Servicio',
      price: 500,
      tags: ['servicio'],
      date: '2025-01-01'
    },
    {
      id: 2,
      title: 'Servicio reciente',
      description: 'Servicio',
      category: 'Servicio',
      price: 700,
      tags: ['servicio'],
      date: '2026-07-01'
    }
  ];

  const result = searchCatalog(
    {
      loadAll: true,
      sort: 'newest'
    },
    source
  );

  expect(result.ok).toBe(true);
  expect(result.items[0].id).toBe(2);
  expect(result.items[1].id).toBe(1);
});

test('ordena resultados por precio descendente', () => {
  const source = [
    {
      id: 1,
      title: 'Servicio económico',
      description: 'Servicio',
      category: 'Servicio',
      price: 500,
      tags: ['servicio'],
      date: '2026-01-01'
    },
    {
      id: 2,
      title: 'Servicio premium',
      description: 'Servicio',
      category: 'Servicio',
      price: 1500,
      tags: ['servicio'],
      date: '2026-01-01'
    }
  ];

  const result = searchCatalog(
    {
      loadAll: true,
      sort: 'price_desc'
    },
    source
  );

  expect(result.ok).toBe(true);
  expect(result.items[0].price).toBe(1500);
  expect(result.items[1].price).toBe(500);
});

test('devuelve lista vacía cuando se solicita una página inexistente', () => {
  const source = [
    {
      id: 1,
      title: 'Cambio de aceite',
      description: 'Mantenimiento preventivo',
      category: 'Mantenimiento',
      price: 800,
      tags: ['aceite'],
      date: '2026-01-01'
    }
  ];

  const result = searchCatalog(
    {
      loadAll: true,
      page: 99
    },
    source
  );

  expect(result.ok).toBe(true);
  expect(result.status).toBe(200);
  expect(result.items).toEqual([]);
  expect(result.message).toBe('No hay más páginas para mostrar.');
});
  
});
