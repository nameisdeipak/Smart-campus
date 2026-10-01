import express from "express";
import { paymentController } from "../controllers/payment.controller.js";

const route = express.Router();

route.post("/process", paymentController.payProcess);
route.get("/getKey", paymentController.getKey);
route.get("/fees", paymentController.getMyFees);
route.post("/paymentVarification", paymentController.paymentVarification);

export default route;
