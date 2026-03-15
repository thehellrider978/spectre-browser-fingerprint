const express = require('express');
const router  = express.Router();
router.get('/', (req, res) => {
  res.json({ status: 'operational', version: '1.0.0', developer: '@HACKEROFHELL', timestamp: new Date().toISOString() });
});
module.exports = router;
