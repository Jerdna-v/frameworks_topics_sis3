const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn.js");


router.post("/", async (req, res) => {
    const { date, mid, amount } = req.body;

    if (!date || !mid || amount === undefined) {
        return res.status(400).json({ success: false, msg: "Missing required fields." });
    }

    try {
        const exists = await DB.checkMachineExists(mid);
        if (!exists) {
            return res.status(404).json({ success: false, msg: "Machine ID not found." });
        }

        await DB.insertCashFlow(date, mid, amount);
        res.status(200).json({ success: true, msg: "Cash flow recorded successfully." });
    } catch (err) {
        console.error("Error inserting cash flow:", err);
        res.status(500).json({ success: false, msg: "Internal server error." });
    }
});

module.exports = router;
