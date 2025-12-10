const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn");

router.post("/", async (req, res) => {
  try {
    const { current, date, time, mid, products } = req.body || {};
    const uid = req.session?.user?.uid;

    if (!uid) {
      return res.status(401).json({ msg: "Not logged in." });
    }
    if (!mid || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: "mid and products are required." });
    }

    let dateTime;
    if (current) {
      dateTime = new Date();
    } else {
      if (!date || !time) {
        return res.status(400).json({
          msg: "date and time are required unless current=true.",
        });
      }
      const iso = `${date}T${time}:00`;
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ msg: "Invalid date/time." });
      }
      dateTime = d;
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    const dt =
      `${dateTime.getFullYear()}-${pad2(dateTime.getMonth() + 1)}-${pad2(
        dateTime.getDate()
      )} ` +
      `${pad2(dateTime.getHours())}:${pad2(dateTime.getMinutes())}:${pad2(
        dateTime.getSeconds()
      )}`;

    // normalize products
    const cleaned = products
      .map((p) => {
        const product_type = String(p.product_type ?? "").trim();
        const grams = Number(p.grams);
        const descriptionRaw =
          p.description != null ? String(p.description).trim() : "";
        const description = descriptionRaw.length ? descriptionRaw : null;
        return { product_type, grams, description };
      })
      .filter((p) => p.product_type && Number.isFinite(p.grams));

    if (cleaned.length === 0) {
      return res.status(400).json({ msg: "No valid products provided." });
    }

    await DB.addProductBulk(dt, Number(mid), uid, cleaned);

    return res.json({ msg: "Inventory saved." });
  } catch (err) {
    console.error("inventory post error:", err);
    return res.status(500).json({ msg: "Server error." });
  }
});

router.get("/", async (req, res) => {
  try {
    const mid = req.query.mid ? Number(req.query.mid) : null;
    const rows = await DB.listProducts(mid);
    return res.json({ products: rows });
  } catch (err) {
    console.error("inventory list error:", err);
    return res.status(500).json({ msg: "Database error." });
  }
});

module.exports = router;
