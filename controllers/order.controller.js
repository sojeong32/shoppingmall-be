const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 데이터 보낸거 받아와 userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    // 재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    // 재고가 충분하지 않는 아이템이 있었다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    // order를 만들자!
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    console.log("새로운주문", newOrder);
    console.log("생성된 orderNum:", newOrder.orderNum);
    await newOrder.save();
    // save후에 카트를 비워주자
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrders = async (req, res) => {
  try {
    const { userId } = req;
    const { page, ordernum, limit = 3 } = req.query;

    const query = { userId };
    if (ordernum) {
      query.orderNum = { $regex: ordernum, $options: "i" };
    }

    const totalOrders = await Order.countDocuments(query);
    let orders;

    if (page) {
      const totalPageNum = Math.ceil(totalOrders / limit);
      orders = await Order.find(query)
        .populate("userId", "name email")
        .populate({
          path: "items.productId",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      res.status(200).json({
        status: "success",
        orders,
        total: totalOrders,
        pages: totalPageNum,
      });
    } else {
      orders = await Order.find(query)
        .populate({
          path: "items.productId",
        })
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json({
        status: "success",
        orders,
        total: totalOrders,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      const error = new Error("주문이 없습니다.");
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ status: "success", order });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = orderController;
