var express = require("express");
var router = express.Router();
var productSchema = require("../models/Products.model");
var orderSchema = require("../models/Order.model");
var verifyToken = require("../middleware/jwt_decode.middleware");

/* GET users listing. */
router.get("/", verifyToken, async function (req, res, next) {
  try {
    const order = await orderSchema.find();
    const result = [];
    if (order) {
      await Promise.all(
        order.map(async (orders, index) => {
          const products = await productSchema.findById(orders.product_id);

          let data = {
            order_id: orders._id,
            user_id: orders.user_id,
            name: products.name,
            price: products.price,
            count: orders.count,
          };
          result.push(data);
        })
      );

      res.status(200).json({ status: 200, message: "success", data: result });
    } else {
      res
        .status(400)
        .json({ status: 400, message: "ไม่พบข้อมูลรายการสินค้า", data: [] });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "ระบบเกิดข้อผิดพลาด", data: [] });
  }
});

module.exports = router;
