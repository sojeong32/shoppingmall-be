const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    shipTo: { type: Object, required: true },
    contact: { type: String, required: true },
    userId: { type: mongoose.objectId, ref: User, required: true },
    status: { type: String, default: "preparing" },
    orderNumber: { type: String },
    totalPrice: { type: Number, required: true, default: 0 },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, default: 1 },
        size: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);
// 불필요한 정보를 빼고 갖고 오기
orderSchema.method.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
