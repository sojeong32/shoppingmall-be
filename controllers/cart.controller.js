const Cart = require("../models/Cart");

const cartController = {};
cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다, 만들어주기
      cart = new Cart({ userId });
      await cart.save();
    }

    // 이미 카트에 들어있는 아이템이냐?
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      // 그렇다면 에러 ('이미 아이템이 카트에 있습니다.')
      throw new Error("이미 아이템이 카트에 있습니다.");
      // 카트에 아이템을 추가
    }
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.deleteItemFromCart = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");

    cart.items = cart.items.filter((item) => !item._id.equals(itemId));
    await cart.save();

    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.updateItemFromCart = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");

    const item = cart.items.find((item) => item._id.equals(itemId));
    if (!item) throw new Error("아이템을 찾을 수 없습니다.");

    item.qty = qty;
    await cart.save();

    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ status: "success", cartItemQty: 0 });
    }

    const totalQty = cart.items.reduce((sum, item) => sum + item.qty, 0);

    res.status(200).json({ status: "success", cartItemQty: totalQty });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
