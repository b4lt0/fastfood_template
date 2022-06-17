const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/allowedRoles');
const verifyRoles = require('../../middlewares/verifyRole');
const transactionController = require("../../controllers/transactionController");

router.route('/pay/')
    .post(transactionController.pay);

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin), transactionController.getTransactions)
    .delete(verifyRoles(ROLES_LIST.Admin), transactionController.deleteTransaction);

module.exports = router;