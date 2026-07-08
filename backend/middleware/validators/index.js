import { body, validationResult } from "express-validator";


export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};


export const loginValidators = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters"),
];


export const productValidators = [
  body("product")
    .notEmpty()
    .withMessage("Product data is required")
    .isObject()
    .withMessage("Product must be an object"),

  body("product.name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("product.sinhalaName")
    .trim()
    .notEmpty()
    .withMessage("Sinhala name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Sinhala name must be between 2 and 100 characters"),

  body("product.category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),

  body("product.description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("product.price")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Price cannot exceed 50 characters"),

  body("product.image")
    .trim()
    .notEmpty()
    .withMessage("Image URL is required")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image must be a valid URL"),

  body("product.badge")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(["Bestseller", "Premium", "New", "Organic"])
    .withMessage("Badge must be one of: Bestseller, Premium, New, Organic"),

  body("product.benefits")
    .optional()
    .isArray()
    .withMessage("Benefits must be an array"),

  body("product.ingredients")
    .optional()
    .isArray()
    .withMessage("Ingredients must be an array"),

  body("product.howToUse")
    .optional()
    .isArray()
    .withMessage("How to use must be an array"),
];


export const provinceValidators = [
  body("province")
    .notEmpty()
    .withMessage("Province data is required")
    .isObject()
    .withMessage("Province must be an object"),

  body("province.name")
    .trim()
    .notEmpty()
    .withMessage("Province name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Province name must be between 2 and 50 characters"),

  body("province.icon")
    .trim()
    .notEmpty()
    .withMessage("Province icon is required")
    .isLength({ max: 50 })
    .withMessage("Icon cannot exceed 50 characters"),
];

export const updateProvinceValidators = [
  body("_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Province name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Province name must be between 2 and 50 characters"),

  body("icon")
    .trim()
    .notEmpty()
    .withMessage("Province icon is required")
    .isLength({ max: 50 })
    .withMessage("Icon cannot exceed 50 characters"),
];

export const deleteProvinceValidators = [
  body("_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),
];


export const addDistrictValidators = [
  body("_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("District name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("District name must be between 2 and 50 characters"),
];

export const updateDistrictValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("District name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("District name must be between 2 and 50 characters"),
];

export const deleteDistrictValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),
];


export const addTownValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Town name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Town name must be between 2 and 50 characters"),
];

export const updateTownValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("town_id")
    .notEmpty()
    .withMessage("Town ID is required")
    .isMongoId()
    .withMessage("Invalid town ID format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Town name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Town name must be between 2 and 50 characters"),
];

export const deleteTownValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("town_id")
    .notEmpty()
    .withMessage("Town ID is required")
    .isMongoId()
    .withMessage("Invalid town ID format"),
];


const shopDataValidators = [
  body("shopData")
    .notEmpty()
    .withMessage("Shop data is required")
    .isObject()
    .withMessage("Shop data must be an object"),

  body("shopData.name")
    .trim()
    .notEmpty()
    .withMessage("Shop name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Shop name must be between 2 and 100 characters"),

  body("shopData.address")
    .trim()
    .notEmpty()
    .withMessage("Shop address is required")
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),

  body("shopData.phone")
    .trim()
    .notEmpty()
    .withMessage("Shop phone is required")
    .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  body("shopData.hours")
    .trim()
    .notEmpty()
    .withMessage("Shop hours is required")
    .isLength({ max: 100 })
    .withMessage("Hours cannot exceed 100 characters"),

  body("shopData.type")
    .notEmpty()
    .withMessage("Shop type is required")
    .isIn(["Pharmacy", "Ayurvedic Store", "Health Center", "Supermarket"])
    .withMessage(
      "Shop type must be one of: Pharmacy, Ayurvedic Store, Health Center, Supermarket"
    ),
];

export const addShopValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("town_id")
    .notEmpty()
    .withMessage("Town ID is required")
    .isMongoId()
    .withMessage("Invalid town ID format"),

  ...shopDataValidators,
];

export const updateShopValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("town_id")
    .notEmpty()
    .withMessage("Town ID is required")
    .isMongoId()
    .withMessage("Invalid town ID format"),

  body("shop_id")
    .notEmpty()
    .withMessage("Shop ID is required")
    .isMongoId()
    .withMessage("Invalid shop ID format"),

  ...shopDataValidators,
];

export const deleteShopValidators = [
  body("province_id")
    .notEmpty()
    .withMessage("Province ID is required")
    .isMongoId()
    .withMessage("Invalid province ID format"),

  body("district_id")
    .notEmpty()
    .withMessage("District ID is required")
    .isMongoId()
    .withMessage("Invalid district ID format"),

  body("town_id")
    .notEmpty()
    .withMessage("Town ID is required")
    .isMongoId()
    .withMessage("Invalid town ID format"),

  body("shop_id")
    .notEmpty()
    .withMessage("Shop ID is required")
    .isMongoId()
    .withMessage("Invalid shop ID format"),
];


export const serviceValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Service name must be between 2 and 100 characters"),

  body("area")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Area cannot exceed 100 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),

  body("mobile")
    .optional({ checkFalsy: true })
    .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
    .withMessage("Please provide a valid mobile number"),

  body("altMobile")
    .optional({ checkFalsy: true })
    .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
    .withMessage("Please provide a valid alternate mobile number"),

  body("icon")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Icon cannot exceed 50 characters"),

  body("color")
    .optional({ checkFalsy: true })
    .matches(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/)
    .withMessage("Color must be a valid hex color (e.g. #2D5016)"),

  body("lightColor")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Light color cannot exceed 100 characters"),

  body("borderColor")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Border color cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

export const updateServiceValidators = [
  body("_id")
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid service ID format"),

  ...serviceValidators,
];

export const deleteServiceValidators = [
  body("_id")
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid service ID format"),
];


export const addServiceItemValidators = [
  body("location_id")
    .notEmpty()
    .withMessage("Location ID is required")
    .isMongoId()
    .withMessage("Invalid location ID format"),

  body("serviceItem")
    .notEmpty()
    .withMessage("Service item data is required")
    .isObject()
    .withMessage("Service item must be an object"),

  body("serviceItem.name")
    .trim()
    .notEmpty()
    .withMessage("Service item name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Service item name must be between 2 and 100 characters"),

  body("serviceItem.description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("serviceItem.duration")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Duration cannot exceed 50 characters"),

  body("serviceItem.icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon cannot exceed 50 characters"),
];

export const updateServiceItemValidators = [
  body("location_id")
    .notEmpty()
    .withMessage("Location ID is required")
    .isMongoId()
    .withMessage("Invalid location ID format"),

  body("service_id")
    .notEmpty()
    .withMessage("Service item ID is required")
    .isMongoId()
    .withMessage("Invalid service item ID format"),

  body("serviceItem")
    .notEmpty()
    .withMessage("Service item data is required")
    .isObject()
    .withMessage("Service item must be an object"),

  body("serviceItem.name")
    .trim()
    .notEmpty()
    .withMessage("Service item name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Service item name must be between 2 and 100 characters"),

  body("serviceItem.description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("serviceItem.duration")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Duration cannot exceed 50 characters"),

  body("serviceItem.icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon cannot exceed 50 characters"),
];

export const deleteServiceItemValidators = [
  body("location_id")
    .notEmpty()
    .withMessage("Location ID is required")
    .isMongoId()
    .withMessage("Invalid location ID format"),

  body("service_id")
    .notEmpty()
    .withMessage("Service item ID is required")
    .isMongoId()
    .withMessage("Invalid service item ID format"),
];
