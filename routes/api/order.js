const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/ordersController');
const ROLES_LIST = require('../../config/allowedRoles');
const verifyRoles = require('../../middlewares/verifyRole');

router.route('/')
    .post(productsController.createOrder);

router.route('/kitchen/')
    .get(verifyRoles(ROLES_LIST.Chef), productsController.getWaitingOrdersQueue)
    .post(verifyRoles(ROLES_LIST.Chef), productsController.openOrderFromQueue)
    .delete(verifyRoles(ROLES_LIST.Chef), productsController.closeOrderFromQueue);

router.route('/all/')
    .get(verifyRoles(ROLES_LIST.Admin), productsController.getOrdersQueue);


module.exports = router;