const catalogo = require("../../data/catalogo.json");

function norm(s) {
  return (s || "").toString().trim().toLowerCase();
}

exports.search = (req, res) => {
  const q = norm(req.query.q);
  const category = norm(req.query.category);
  const tags = norm(req.query.tags).split(",").filter(Boolean);
  const min = req.query.min ? Number(req.query.min) : null;
  const max = req.query.max ? Number(req.query.max) : null;
  const sort = norm(req.query.sort) || "relevance";
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

  let items = catalogo.map(x => ({ ...x }));

  // Búsqueda simple (q)
  if (q) {
    items = items
      .map(item => {
        const hayTitle = norm(item.title).includes(q);
        const hayDesc = norm(item.description).includes(q);
        const hayTags = (item.tags || []).some(t => norm(t).includes(q));

        let score = 0;
        if (hayTitle) score += 3;
        if (hayDesc) score += 2;
        if (hayTags) score += 1;

        return { ...item, score };
      })
      .filter(x => x.score > 0);
  } else {
    // si q viene vacío, no buscamos, mostramos "todo" (o podrías mostrar populares)
    items = items.map(x => ({ ...x, score: 0 }));
  }

  // Filtros avanzados
  if (category) items = items.filter(x => norm(x.category) === category);
  if (min !== null) items = items.filter(x => Number(x.price) >= min);
  if (max !== null) items = items.filter(x => Number(x.price) <= max);
  if (tags.length) {
    items = items.filter(x => (x.tags || []).some(t => tags.includes(norm(t))));
  }

  // Ordenamiento
  if (sort === "newest") items.sort((a,b) => new Date(b.date) - new Date(a.date));
  else if (sort === "price_asc") items.sort((a,b) => a.price - b.price);
  else if (sort === "price_desc") items.sort((a,b) => b.price - a.price);
  else items.sort((a,b) => (b.score || 0) - (a.score || 0)); // relevance

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  res.json({
    query: { q, category, tags, min, max, sort, page, limit },
    total,
    page,
    limit,
    items: paged.map(x => ({
      id: x.id,
      title: x.title,
      snippet: x.description.slice(0, 120),
      category: x.category,
      tags: x.tags,
      date: x.date,
      price: x.price
    }))
  });
};
