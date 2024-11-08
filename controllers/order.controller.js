const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const orderController = {};
const PAGE_SIZE = 3;

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

    const orders = await Order.find({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });

    const totalItemNum = await Order.find({ userId }).countDocuments();

    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

    res.status(200).json({ status: "success", data: orders, totalPageNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    let { page, ordernum } = req.query;

    const cond = ordernum
      ? {
          orderNum: { $regex: ordernum, $options: "i" },
        }
      : {};

    let query = Order.find(cond)
      .populate("userId", "email name")
      .populate({
        path: "items",
        populate: { path: "productId", select: "name" },
      });
    let response = { status: "success" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      const totalItemNum = await Order.find(cond).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const orderList = await query.exec();
    response.data = orderList;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      { status },
      { new: true }
    );

    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    res.status(404).json({ status: "fail", data: error.message });
  }
};

module.exports = orderController;
