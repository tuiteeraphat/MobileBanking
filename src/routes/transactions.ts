import express from "express";
import * as TransactionControllers from "../controllers/transactions";

const router = express.Router();

router.post("/getTransaction", TransactionControllers.getTransaction);
router.post("/sendMoney", TransactionControllers.SendMoney);

export default router;
