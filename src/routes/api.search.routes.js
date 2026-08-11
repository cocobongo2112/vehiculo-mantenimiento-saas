const router = require('express').Router();
const { searchCatalog } = require('../services/search.service');

router.post('/', (req, res) => {
  const result = searchCatalog(req.body);
  if (!result.ok) {
    return res.status(result.status).json({
      code: result.status,
      message: result.msg,
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 1,
      items: []
    });
  }

  const { ok, status, ...payload } = result;
  return res.status(status).json(payload);
});

module.exports = router;
