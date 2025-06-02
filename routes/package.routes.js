const express = require('express');
const router = express.Router();
const { createServicePackage,updateServicePackage,getAllServicePackages  } = require('../controllers/package.controller');

router.post('/', createServicePackage);
router.put('/:id', updateServicePackage);
router.get('/', getAllServicePackages);

module.exports = router;
