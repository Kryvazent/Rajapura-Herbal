import express from "express";
import * as productController from "../controllers/productController.js";
import * as storeController from "../controllers/storeController.js";
import * as serviceController from "../controllers/serviceController.js";
import * as userController from "../controllers/userController.js"; // ← ADD THIS
import {
  handleValidationErrors,
  productValidators,
  provinceValidators,
  updateProvinceValidators,
  deleteProvinceValidators,
  addDistrictValidators,
  updateDistrictValidators,
  deleteDistrictValidators,
  addTownValidators,
  updateTownValidators,
  deleteTownValidators,
  addShopValidators,
  updateShopValidators,
  deleteShopValidators,
  serviceValidators,
  updateServiceValidators,
  deleteServiceValidators,
  addServiceItemValidators,
  updateServiceItemValidators,
  deleteServiceItemValidators,
} from "../middleware/validators/index.js";

const router = express.Router();

// ─── Product routes ───────────────────────────────────────────────────────────
router.post("/add-product", productValidators, handleValidationErrors, productController.addProduct);
router.delete("/delete-product", handleValidationErrors, productController.deleteProduct);
router.put("/update-product", productValidators, handleValidationErrors, productController.updateProduct);

// ─── Province routes ──────────────────────────────────────────────────────────
router.post("/add-province", provinceValidators, handleValidationErrors, storeController.addProvince);
router.put("/update-province", updateProvinceValidators, handleValidationErrors, storeController.updateProvince);
router.delete("/delete-province", deleteProvinceValidators, handleValidationErrors, storeController.deleteProvince);

// ─── District routes ──────────────────────────────────────────────────────────
router.post("/add-district", addDistrictValidators, handleValidationErrors, storeController.addDistrict);
router.put("/update-district", updateDistrictValidators, handleValidationErrors, storeController.updateDistrict);
router.delete("/delete-district", deleteDistrictValidators, handleValidationErrors, storeController.deleteDistrict);

// ─── Town routes ──────────────────────────────────────────────────────────────
router.post("/add-town", addTownValidators, handleValidationErrors, storeController.addTown);
router.put("/update-town", updateTownValidators, handleValidationErrors, storeController.updateTown);
router.delete("/delete-town", deleteTownValidators, handleValidationErrors, storeController.deleteTown);

// ─── Shop routes ──────────────────────────────────────────────────────────────
router.post("/add-shop", addShopValidators, handleValidationErrors, storeController.addShop);
router.put("/update-shop", updateShopValidators, handleValidationErrors, storeController.updateShop);
router.delete("/delete-shop", deleteShopValidators, handleValidationErrors, storeController.deleteShop);
router.get("/provinces", storeController.getAllProvinces);
router.post("/add-shop-wizard", storeController.addShopWizard);

// ─── Service routes ───────────────────────────────────────────────────────────
router.post("/services", serviceValidators, handleValidationErrors, serviceController.addService);
router.put("/services", updateServiceValidators, handleValidationErrors, serviceController.updateService);
router.delete("/services", deleteServiceValidators, handleValidationErrors, serviceController.deleteService);
router.post("/services/item", addServiceItemValidators, handleValidationErrors, serviceController.addServiceItem);
router.put("/services/item", updateServiceItemValidators, handleValidationErrors, serviceController.updateServiceItem);
router.delete("/services/item", deleteServiceItemValidators, handleValidationErrors, serviceController.deleteServiceItem);

// ─── User management routes ───────────────────────────────────────────────────
router.get("/users", userController.getAllStaff);
router.get("/users/search", userController.searchUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.patch("/users/:id/toggle-status", userController.toggleUserStatus);

export default router;