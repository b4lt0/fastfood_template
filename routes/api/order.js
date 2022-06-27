const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/ordersController');
const ROLES_LIST = require('../../config/allowedRoles');
const verifyRoles = require('../../middlewares/verifyRole');

router.route('/')
    .post(ordersController.createOrder);

router.route('/events')
    .post(ordersController.handleSSE);

router.route('/kitchen/')
    .get(verifyRoles(ROLES_LIST.Chef), ordersController.getWaitingOrdersQueue)
    .post(verifyRoles(ROLES_LIST.Chef), ordersController.openOrderFromQueue)
    .delete(verifyRoles(ROLES_LIST.Chef), ordersController.closeOrderFromQueue);

router.route('/all/')
    .get(verifyRoles(ROLES_LIST.Admin), ordersController.getOrdersQueue);


module.exports = router;