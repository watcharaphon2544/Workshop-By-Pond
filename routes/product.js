var express = require("express");
var router = express.Router();
const verifyToken = require("../middleware/jwt_decode.middleware");
const productSchema = require("../models/Products.model");
const orderSchema = require("../models/Order.model");
var multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", verifyToken, async function (req, res, next) {
  try {
    const products = await productSchema.find();
    if (products) {
      res.status(200).send({ status: 200, message: "success", data: products });
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

router.get("/:id", verifyToken, async function (req, res, next) {
  let { id } = req.params;
  try {
    const products = await productSchema.findById(id);
    if (products) {
      res.status(200).send({ status: 200, message: "success", data: products });
    } else {
      res
        .status(400)
        .json({ status: 400, message: "ไม่พบข้อมูลรายการสินค้า", data: {} });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 500, message: "ระบบเกิดข้อผิดพลาด", data: {} });
  }
});

router.post(
  "/",
  [verifyToken, upload.single("image")],
  async function (req, res, next) {
    const { name, price, count } = req.body;
    let image = req.file?.filename ?? null;

    let playload = { name, price, count };

    try {
      if (image !== undefined || image !== null) {
        playload.image = image;
      }

      const product = new productSchema(playload);
      if (product) {
        await product.save();
        res.status(201).json({
          status: 201,
          message: "เพิ่มข้อมูลสินค้าสำเร็จ",
          data: product,
        });
      } else {
        res.status(201).json({
          status: 201,
          message: "ไม่พบข้อมูลสินค้า",
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: 500, message: "เกิดข้อผิดพลาด", data: {} });
    }
  }
);

router.put(
  "/:id",
  [verifyToken, upload.single("image")],
  async function (req, res, next) {
    let { id } = req.params;
    let { name, price, count } = req.body;
    let image = req.file?.filename ?? null;

    try {
      let playload = {
        name: name,
        price: price,
        count: count,
      };

      if (image !== undefined || image !== null) {
        playload.image = image;
      }

      const products = await productSchema.findById(id);
      if (products) {
        await productSchema.findByIdAndUpdate(id, playload);
        res.status(200).json({
          status: 200,
          message: "แก้ไขข้อมูลสินค้าสำเร็จ",
          data: products,
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "ไม่พบข้อมูลรายการสินค้าที่จะแก้ไข",
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: 500, message: "เกิดข้อผิดพลาด", data: {} });
    }
  }
);

router.delete("/:id", verifyToken, async function (req, res, next) {
  try {
    let { id } = req.params;
    const products = await productSchema.findById(id);
    if (products) {
      await productSchema.findByIdAndDelete(id);
      res
        .status(200)
        .json({ status: 200, message: "ลบข้อมูลสินค้าสำเร็จ", data: products });
    } else {
      res.status(404).json({
        status: 404,
        message: "ไม่พบข้อมูลรายการสินค้าที่จะลบ",
        data: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "เกิดข้อผิดพลาด", data: {} });
  }
});

router.get("/:id/order", verifyToken, async function (req, res, next) {
  let { id } = req.params;
  try {
    const order = await orderSchema.findById(id);
    if (order) {
      const products = await productSchema.findById(order.product_id);

      let data = {
        order_id: order.id,
        user_id: order.user_id,
        product_id: order.product_id,
        name: products.name,
        price: products.price,
        count: order.count,
      };
      res.status(200).json({ status: 200, message: "success", data: data });
    } else {
      res
        .status(400)
        .json({ status: 400, message: "ไม่พบข้อมูลรายการสินค้า", data: {} });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "เกิดข้อผิดพลาด", data: [] });
  }
});

router.post("/:id/order", verifyToken, async function (req, res, next) {
  try {
    let { id } = req.params;
    const { user_id, count } = req.body;

    const checkProduct = await productSchema.findById(id);
    if (!checkProduct) {
      return res
        .status(400)
        .json({ status: 400, message: "ไม่พบข้อมูลสินค้า", data: {} });
    } else {
      if (count < checkProduct.count || count === checkProduct.count) {
        let playload = { user_id: user_id, product_id: id, count: count };
        const order = new orderSchema(playload);
        await order.save();
        let sum = +checkProduct.count - count;
        await productSchema.findByIdAndUpdate(id, { count: sum });
        let data = {
          product_id: id,
          product_name: checkProduct.name,
          count_product: sum,
          user_id: user_id,
          count_order: count,
          date: new Date(),
        };

        return res.status(201).json({
          status: 201,
          message: "เพิ่มข้อมูลสินค้าสำเร็จ",
          data: data,
        });
      } else {
        return res
          .status(400)
          .json({ status: 400, message: "จํานวนสินค้าไม่เพียงพอ", data: {} });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "เกิดข้อผิดพลาด", data: {} });
  }
});

module.exports = router;
