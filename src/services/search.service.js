const catalogo = require('../data/catalogo.json');

const ALLOWED_SORT = new Set(['relevance', 'newest', 'price_asc', 'price_desc']);
const ALLOWED_CATEGORIES = new Set([
  'Mantenimiento', 'Llantas', 'Frenos', 'Diagnóstico', 'Eléctrico',
  'Suspensión', 'Servicio', 'Motor', 'Enfriamiento', 'Climatización',
  'Transmisión', 'Dirección', 'Inspección', 'Escape', 'Estética'
]);
const FIXED_LIMIT = 6;

const toNum = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const safeStr = (v) => (typeof v === 'string' ? v.trim() : '');
const safeArr = (v) => Array.isArray(v)
  ? v
  : (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

function validateAndNormalize(body = {}) {
  const q = safeStr(body.q).toLowerCase();
  const category = safeStr(body.category);
  const sort = safeStr(body.sort) || 'relevance';
  const tags = safeArr(body.tags).map((t) => t.toLowerCase());
  const min = toNum(body.min);
  const max = toNum(body.max);
  const page = Math.max(1, parseInt(body.page || 1, 10));
  const limit = FIXED_LIMIT;
  const loadAll = body.loadAll === true || body.loadAll === 'true';

  const hasFilters = Boolean(category) || tags.length || min !== null || max !== null;
  if (!q && !hasFilters && !loadAll) {
    return { ok: false, status: 400, msg: 'Debes escribir algo o seleccionar al menos un filtro.' };
  }
  if (q.length > 60) return { ok: false, status: 400, msg: 'La búsqueda es demasiado larga (máx 60).' };
  if (!ALLOWED_SORT.has(sort)) return { ok: false, status: 400, msg: 'sort inválido.' };
  if (category && !ALLOWED_CATEGORIES.has(category)) return { ok: false, status: 400, msg: 'Categoría inválida.' };
  if (min !== null && (Number.isNaN(min) || min < 0 || min > 999999)) return { ok: false, status: 400, msg: 'min inválido.' };
  if (max !== null && (Number.isNaN(max) || max < 0 || max > 999999)) return { ok: false, status: 400, msg: 'max inválido.' };
  if (min !== null && max !== null && min > max) return { ok: false, status: 400, msg: 'min no puede ser mayor que max.' };
  if (q && !/[a-z0-9áéíóúüñ\s]/i.test(q)) return { ok: false, status: 400, msg: 'La búsqueda contiene caracteres inválidos.' };

  return { ok: true, q, category, sort, tags, min, max, page, limit, loadAll };
}

function scoreItem(item, q, tagsQ = []) {
  if (!q) return 0;
  let score = 0;
  const title = String(item.title || '').toLowerCase();
  const description = String(item.description || '').toLowerCase();
  const itemTags = (item.tags || []).map((x) => String(x).toLowerCase());
  const joinedTags = itemTags.join(' ');

  if (title.includes(q)) score += 6;
  if (description.includes(q)) score += 3;
  if (joinedTags.includes(q)) score += 2;

  if (tagsQ.length) {
    const set = new Set(itemTags);
    for (const tag of tagsQ) {
      if (set.has(tag)) score += 1;
    }
  }
  return score;
}

function searchCatalog(body = {}, source = catalogo) {
  const v = validateAndNormalize(body);
  if (!v.ok) return v;

  const { q, category, tags, min, max, sort, page, limit } = v;
  let items = [...source];

  if (category) items = items.filter((i) => i.category === category);
  if (min !== null) items = items.filter((i) => Number(i.price) >= min);
  if (max !== null) items = items.filter((i) => Number(i.price) <= max);
  if (tags.length) {
    items = items.filter((i) => {
      const set = new Set((i.tags || []).map((x) => String(x).toLowerCase()));
      return tags.some((tag) => set.has(tag));
    });
  }

  const scored = items
    .map((i) => ({ ...i, _score: scoreItem(i, q, tags) }))
    .filter((i) => (q ? i._score > 0 : true));

  if (sort === 'relevance') scored.sort((a, b) => b._score - a._score);
  if (sort === 'newest') scored.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sort === 'price_asc') scored.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === 'price_desc') scored.sort((a, b) => Number(b.price) - Number(a.price));

  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (page > totalPages) {
    return { ok: true, status: 200, code: 200, message: 'No hay más páginas para mostrar.', total, page, limit, totalPages, items: [] };
  }

  const start = (page - 1) * limit;
  const paged = scored.slice(start, start + limit).map(({ _score, ...rest }) => rest);

  if (total === 0) {
    return { ok: true, status: 200, code: 200, message: 'Producto/servicio no encontrado con los criterios seleccionados.', total, page, limit, totalPages: 1, items: [] };
  }

  return { ok: true, status: 200, code: 200, message: 'Búsqueda realizada correctamente.', total, page, limit, totalPages, items: paged };
}

module.exports = {
  ALLOWED_SORT,
  ALLOWED_CATEGORIES,
  FIXED_LIMIT,
  validateAndNormalize,
  scoreItem,
  searchCatalog
};
