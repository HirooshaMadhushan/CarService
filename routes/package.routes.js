const express = require('express');
const router = express.Router();
const { createServicePackage,updateServicePackage  } = require('../controllers/package.controller');

router.post('/', createServicePackage);
router.put('/:id', updateServicePackage);

module.exports = router;
