const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const productsController = require('../../controllers/productController');
const ROLES_LIST = require('../../config/allowedRoles');
const verifyRoles = require('../../middlewares/verifyRole');

router.route('/')
    .get(productsController.getAllProducts)
    .post(verifyRoles(ROLES_LIST.Admin), productsController.createProduct)
    .put(verifyRoles(ROLES_LIST.Admin), productsController.updateProduct)
    .delete(verifyRoles(ROLES_LIST.Admin), productsController.deleteProduct);

router.route('/:id')
    .get(productsController.getProduct);

module.exports = router;