const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    level: { type: String, default: "customer" }, // 2types: customer, admin
  },
  { timestamps: true }
);
// 불필요한 정보를 빼고 갖고 오기
userSchema.method.toJSON = function () {
  const obj = this._doc; // _doc은 현재 mongoose문서에서 모든 데이터를 담고있는 객체를 가리킴
  delete obj.password; // 백엔드에서 프론트엔드로 갈 때 패스워드는 항상 제외
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj; // 위의 조건들을 모두 제거한 후 object를 리턴함
};

userSchema.methods.generateToken = async function () {
  const token = await jwt.sign({ _id: this.id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
