const Product = require("../models/Product");

const PAGE_SIZE = 5;
const productController = {};
productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      // 최종 몇 개 페이지인지
      // 데이터가 총 몇 개 있는지
      const totlaItemNum = await Product.find(cond).count();
      // 데이터 총 갯수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totlaItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    // 쿼리를 따로 실행시킴
    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
