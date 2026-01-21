import express from "express";
import fs from "fs";

const router = express.Router();
const readDB = () => JSON.parse(fs.readFileSync("db.json"));


router.get("/allorders", (req, res) => {
  const db = readDB();
  res.json({
    count: db.orders.length,
    orders: db.orders
  });
});


router.get("/cancelled-orders", (req, res) => {
  const db = readDB();
  const cancelled = db.orders.filter(o => o.status === "cancelled");

  res.json({
    count: cancelled.length,
    orders: cancelled
  });
});

router.get("/shipped", (req, res) => {
  const db = readDB();
  const shipped = db.orders.filter(o => o.status === "shipped");

  res.json({
    count: shipped.length,
    orders: shipped
  });
});

router.get("/total-revenue/:productId", (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id == req.params.productId);

  if (!product) return res.status(404).json({ message: "Product not found" });

  const revenue = db.orders
    .filter(o => o.productId == product.id && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.quantity * product.price, 0);

  res.json({ totalRevenue: revenue });
});

router.get("/alltotalrevenue", (req, res) => {
  const db = readDB();

  const revenue = db.orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({ totalRevenue: revenue });
});

export default router;
