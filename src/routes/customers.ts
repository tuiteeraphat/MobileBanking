import express from "express";
import * as CustomerControllers from "../controllers/customers";
import { requiresAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", requiresAuth, CustomerControllers.getAuthenticatedUser);
router.post("/getCustomer", CustomerControllers.getCustomer);
router.post("/signUp", CustomerControllers.SignUp);
router.post("/signIn", CustomerControllers.SignIn);
router.post("/signOut", CustomerControllers.SignOut);

export default router;
