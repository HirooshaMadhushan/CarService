const express = require('express');
const router = express.Router();
const { createServicePackage,updateServicePackage,getAllServicePackages ,deleteServicePackage,getServicePackageById } = require('../controllers/package.controller');

router.post('/', createServicePackage);
router.put('/:id', updateServicePackage);
router.get('/', getAllServicePackages);
router.delete('/:id', deleteServicePackage);
router.get('/:id', getServicePackageById);

module.exports = router;
