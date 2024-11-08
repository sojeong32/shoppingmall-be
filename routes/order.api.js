const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

router.post("/", authController.authenticate, orderController.createOrder);
router.get("/", authController.authenticate, orderController.getOrders);
router.get("/list", authController.authenticate, orderController.getOrderList);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
