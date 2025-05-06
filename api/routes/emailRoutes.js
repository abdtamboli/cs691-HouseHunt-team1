import express from "express";
import {
  scheduleVisit,
  propertyInquiry,
  purchaseInvoice,
} from "../controllers/emailController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Verify user must be logged in to send email
router.post("/schedule-visit", verifyToken, scheduleVisit);
router.post("/property-inquiry", verifyToken, propertyInquiry);
router.post("/purchase-invoice", verifyToken, purchaseInvoice);

export default router;
