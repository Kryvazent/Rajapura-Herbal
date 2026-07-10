import express from "express";
import * as productController from "../controllers/productController.js";
import * as storeController from "../controllers/storeController.js";
import * as serviceController from "../controllers/serviceController.js";
import * as userController from "../controllers/userController.js";
import * as authMiddleware from "../middleware/auth.js";
import * as roleMiddleware from "../middleware/roleMiddleware.js";
import { deleteUploadThingFile } from "./uploadthing.js";
import {
  handleValidationErrors,
  productValidators,
  deleteProductValidators,
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


router.use(authMiddleware.verifyLoggin);


router.delete("/uploadthing-file", deleteUploadThingFile);


router.post(
  "/add-product",
  productValidators,
  handleValidationErrors,
  productController.addProduct
);
router.delete(
  "/delete-product",
  deleteProductValidators,
  handleValidationErrors,
  productController.deleteProduct
);
router.put(
  "/update-product",
  productValidators,
  handleValidationErrors,
  productController.updateProduct
);


router.post(
  "/add-province",
  provinceValidators,
  handleValidationErrors,
  storeController.addProvince
);
router.put(
  "/update-province",
  updateProvinceValidators,
  handleValidationErrors,
  storeController.updateProvince
);
router.delete(
  "/delete-province",
  deleteProvinceValidators,
  handleValidationErrors,
  storeController.deleteProvince
);


router.post(
  "/add-district",
  addDistrictValidators,
  handleValidationErrors,
  storeController.addDistrict
);
router.put(
  "/update-district",
  updateDistrictValidators,
  handleValidationErrors,
  storeController.updateDistrict
);
router.delete(
  "/delete-district",
  deleteDistrictValidators,
  handleValidationErrors,
  storeController.deleteDistrict
);


router.post(
  "/add-town",
  addTownValidators,
  handleValidationErrors,
  storeController.addTown
);
router.put(
  "/update-town",
  updateTownValidators,
  handleValidationErrors,
  storeController.updateTown
);
router.delete(
  "/delete-town",
  deleteTownValidators,
  handleValidationErrors,
  storeController.deleteTown
);


router.post(
  "/add-shop",
  addShopValidators,
  handleValidationErrors,
  storeController.addShop
);
router.put(
  "/update-shop",
  updateShopValidators,
  handleValidationErrors,
  storeController.updateShop
);
router.delete(
  "/delete-shop",
  deleteShopValidators,
  handleValidationErrors,
  storeController.deleteShop
);
router.get("/provinces", storeController.getAllProvinces);
router.post("/add-shop-wizard", storeController.addShopWizard);


router.post(
  "/services",
  serviceValidators,
  handleValidationErrors,
  serviceController.addService
);
router.put(
  "/services",
  updateServiceValidators,
  handleValidationErrors,
  serviceController.updateService
);
router.delete(
  "/services",
  deleteServiceValidators,
  handleValidationErrors,
  serviceController.deleteService
);
router.post(
  "/services/item",
  addServiceItemValidators,
  handleValidationErrors,
  serviceController.addServiceItem
);
router.put(
  "/services/item",
  updateServiceItemValidators,
  handleValidationErrors,
  serviceController.updateServiceItem
);
router.delete(
  "/services/item",
  deleteServiceItemValidators,
  handleValidationErrors,
  serviceController.deleteServiceItem
);


router.get("/users",roleMiddleware.verifyCurrentRole, userController.getAllStaff);
router.get("/users/search",roleMiddleware.verifyCurrentRole, userController.searchUsers);
router.get("/users/:id", roleMiddleware.verifyCurrentRole, userController.getUserById);
router.post("/users",  roleMiddleware.verifyCurrentRole, userController.createUser);
router.put("/users/:id",  roleMiddleware.verifyCurrentRole, userController.updateUser);
router.delete("/users/:id",  roleMiddleware.verifyCurrentRole, userController.deleteUser);
router.patch("/users/:id/toggle-status", roleMiddleware.verifyCurrentRole, userController.toggleUserStatus);

export default router;
