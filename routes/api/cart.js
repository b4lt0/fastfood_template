const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cartController');
const ROLES_LIST = require('../../config/allowedRoles');
const verifyRoles = require('../../middlewares/verifyRole');

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addItemToCart);
    //.delete(cartController.deleteFromCart); (see cartController:30-40)

module.exports = router;