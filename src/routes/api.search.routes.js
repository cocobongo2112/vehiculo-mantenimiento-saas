const router = require("express").Router();
const catalogo = require("../data/catalogo.json");

// ---- helpers ----
const toNum = (v) => (v === "" || v === null || v === undefined) ? null : Number(v);
const safeStr = (v) => (typeof v === "string" ? v.trim() : "");
const safeArr = (v) =>
  Array.isArray(v)
    ? v
    : (typeof v === "string"
        ? v.split(",").map(s => s.trim()).filter(Boolean)
        : []);

const ALLOWED_SORT = new Set(["relevance", "newest", "price_asc", "price_desc"]);

const ALLOWED_CATEGORIES = new Set([
  "Mantenimiento", "Llantas", "Frenos", "Diagnóstico", "Eléctrico",
  "Suspensión", "Servicio", "Motor", "Enfriamiento", "Climatización",
  "Transmisión", "Dirección", "Inspección", "Escape", "Estética"
]);

const FIXED_LIMIT = 6;

function validateAndNormalize(body) {
  const q = safeStr(body.q).toLowerCase();
  const category = safeStr(body.category); // exacto como catálogo
  const sort = safeStr(body.sort) || "relevance";
  const tags = safeArr(body.tags).map(t => t.toLowerCase());

  const min = toNum(body.min);
  const max = toNum(body.max);

  const page = Math.max(1, parseInt(body.page || 1, 10));
  const limit = FIXED_LIMIT; // ✅ SIEMPRE 6

  const loadAll = body && (body.loadAll === true || body.loadAll === "true");

  // ✅ Si no hay búsqueda ni filtros -> 400
  // ✅ PERO si es carga inicial (loadAll) -> permitir traer todo
  const hasFilters = Boolean(category) || tags.length || min !== null || max !== null;
  if (!q && !hasFilters && !loadAll) {
    return { ok: false, status: 400, msg: "Debes escribir algo o seleccionar al menos un filtro." };
  }

  // Seguridad / validación
  if (q.length > 60) return { ok: false, status: 400, msg: "La búsqueda es demasiado larga (máx 60)." };
  if (!ALLOWED_SORT.has(sort)) return { ok: false, status: 400, msg: "sort inválido." };

  if (category && !ALLOWED_CATEGORIES.has(category)) {
    return { ok: false, status: 400, msg: "Categoría inválida." };
  }

  if (min !== null && (Number.isNaN(min) || min < 0 || min > 999999)) {
    return { ok: false, status: 400, msg: "min inválido." };
  }
  if (max !== null && (Number.isNaN(max) || max < 0 || max > 999999)) {
    return { ok: false, status: 400, msg: "max inválido." };
  }
  if (min !== null && max !== null && min > max) {
    return { ok: false, status: 400, msg: "min no puede ser mayor que max." };
  }
  // si q existe pero no tiene letras/números (solo símbolos), invalidar
if (q && !/[a-z0-9áéíóúüñ\s]/i.test(q)) {
  return { ok: false, status: 400, msg: "La búsqueda contiene caracteres inválidos." };
}

  return { ok: true, q, category, sort, tags, min, max, page, limit, loadAll };
}

function scoreItem(item, q, tagsQ) {
  let score = 0;
  if (!q) return score;

  const t = (item.title || "").toLowerCase();
  const d = (item.description || "").toLowerCase();
  const itags = (item.tags || []).map(x => String(x).toLowerCase()).join(" ");

  if (t.includes(q)) score += 6;
  if (d.includes(q)) score += 3;
  if (itags.includes(q)) score += 2;

  if (tagsQ && tagsQ.length) {
    const set = new Set((item.tags || []).map(x => String(x).toLowerCase()));
    for (const tg of tagsQ) if (set.has(tg)) score += 1;
  }
  return score;
}

// ✅ POST para que NO se vean parámetros en la URL
router.post("/", (req, res) => {
  const v = validateAndNormalize(req.body);
  if (!v.ok) {
    return res.status(400).json({
      code: 400,
      message: v.msg,
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 1,
      items: []
    });
  }

  const { q, category, tags, min, max, sort, page, limit } = v;

  let items = [...catalogo];

  // filtros
  if (category) items = items.filter(i => i.category === category);
  if (min !== null) items = items.filter(i => Number(i.price) >= min);
  if (max !== null) items = items.filter(i => Number(i.price) <= max);

  if (tags.length) {
    items = items.filter(i => {
      const set = new Set((i.tags || []).map(x => String(x).toLowerCase()));
      return tags.some(t => set.has(t));
    });
  }

  // score + búsqueda
  const scored = items
    .map(i => ({ ...i, _score: scoreItem(i, q, tags) }))
    .filter(i => q ? i._score > 0 : true);

  // sort
  if (sort === "relevance") scored.sort((a, b) => b._score - a._score);
  if (sort === "newest") scored.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sort === "price_asc") scored.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") scored.sort((a, b) => b.price - a.price);

  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Si piden una página mayor a las existentes, regresamos items vacíos (200)
  if (page > totalPages) {
    return res.status(200).json({
      code: 200,
      message: "No hay más páginas para mostrar.",
      total,
      page,
      limit,
      totalPages,
      items: []
    });
  }

  const start = (page - 1) * limit;
  const paged = scored.slice(start, start + limit).map(({ _score, ...rest }) => rest);

  // ✅ 200 aunque no haya resultados
  if (total === 0) {
    return res.status(200).json({
      code: 200,
      message: "Producto/servicio no encontrado con los criterios seleccionados.",
      total,
      page,
      limit,
      totalPages: 1,
      items: []
    });
  }

  return res.status(200).json({
    code: 200,
    message: "Búsqueda realizada correctamente.",
    total,
    page,
    limit,
    totalPages,
    items: paged
  });
});

module.exports = router;