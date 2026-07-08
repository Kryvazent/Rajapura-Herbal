import express from "express";
import * as authMiddleware from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import {
  loginValidators,
  handleValidationErrors,
} from "../middleware/validators/index.js";

const router = express.Router();

router.post(
  "/login",
  authMiddleware.verifyNotLoggin,
  loginValidators,
  handleValidationErrors,
  authController.login
);

router.post("/logout", authMiddleware.verifyLoggin, authController.logout);

router.get("/status", authController.status);

router.post(
  "/change-password",
  authMiddleware.verifyLoggin,
  authController.changePassword
);

router.get("/me", authMiddleware.verifyLoggin, authController.getMe);

router.put("/me", authMiddleware.verifyLoggin, authController.updateMe);

export default router;