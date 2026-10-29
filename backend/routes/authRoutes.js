import express from "express";
import * as authMiddleware from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import {
  loginValidators,
  customerRegistrationIdentityValidators,
  customerRegistrationValidators,
  handleValidationErrors,
} from "../middleware/validators/index.js";

const router = express.Router();

router.post(
  "/customer/register/send-code",
  customerRegistrationIdentityValidators,
  handleValidationErrors,
  authController.sendCustomerRegistrationCode
);

router.post(
  "/customer/register",
  customerRegistrationValidators,
  handleValidationErrors,
  authController.registerCustomer
);

router.post(
  "/admin/login",
  loginValidators,
  handleValidationErrors,
  authController.loginAdmin
);

router.post(
  "/customer/login",
  loginValidators,
  handleValidationErrors,
  authController.loginCustomer
);

router.post("/admin/logout", authMiddleware.verifyLoggin, authController.logout);
router.post("/customer/logout", authMiddleware.verifyLoggin, authController.logout);

router.get("/admin/status", authController.status);
router.get("/customer/status", authController.status);

router.post(
  "/admin/change-password",
  authMiddleware.verifyLoggin,
  authController.changePassword
);
router.post("/customer/change-password", authMiddleware.verifyLoggin, authController.changePassword);

router.get("/admin/me", authMiddleware.verifyLoggin, authController.getMe);
router.get("/customer/me", authMiddleware.verifyLoggin, authController.getMe);

router.put("/admin/me", authMiddleware.verifyLoggin, authController.updateMe);

export default router;
