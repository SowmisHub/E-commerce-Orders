import express from "express";
import fs from "fs";

const router = express.Router();

const readDB = () => JSON.parse(fs.readFileSync("db.json"));
const writeDB = (data) =>
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

router.post("/", (req, res) => {
  const db = readDB();

  const newProduct = {
    id: db.products.length + 1,
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock
  };

  db.products.push(newProduct);
  writeDB(db);

  res.status(201).json(newProduct);
});

export default router;
