import express from "express";
import fs from "fs";

const router = express.Router();

const readDB = () => JSON.parse(fs.readFileSync("db.json"));
const writeDB = (data) =>
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

const today = () => new Date().toISOString().split("T")[0];


router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const db = readDB();

  const product = db.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock === 0 || quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  const order = {
    id: db.orders.length + 1,
    productId,
    quantity,
    totalAmount: product.price * quantity,
    status: "placed",
    createdAt: today()
  };

  product.stock -= quantity;
  db.orders.push(order);
  writeDB(db);

  res.status(201).json(order);
});


router.get("/", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});


router.delete("/:id", (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === "cancelled")
    return res.status(400).json({ message: "Already cancelled" });
  if (order.createdAt !== today())
    return res.status(400).json({ message: "Cannot cancel" });

  order.status = "cancelled";

  const product = db.products.find(p => p.id === order.productId);
  product.stock += order.quantity;

  writeDB(db);
  res.json(order);
});


router.patch("/change-status/:id", (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === "cancelled" || order.status === "delivered")
    return res.status(400).json({ message: "Cannot change status" });

  if (order.status === "placed") order.status = "shipped";
  else if (order.status === "shipped") order.status = "delivered";

  writeDB(db);
  res.json(order);
});

export default router;
