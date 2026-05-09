import * as shopService from "../services/shopService.js";

// Helper to format mongoose validation errors
const formatMongooseError = (error) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return { status: 422, message: "Validation failed", errors };
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      status: 409,
      message: `A province with this ${field} already exists`,
    };
  }
  return { status: 500, message: "Internal server error" };
};

// Province CRUD
export const addProvince = async (req, res) => {
  if (!req.body.province || typeof req.body.province !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Province data is required" });
  }

  const { name, icon } = req.body.province;

  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Province name is required" });
  }
  if (!icon || !icon.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Province icon is required" });
  }

  try {
    const province = await shopService.addProvince({
      name: name.trim(),
      icon: icon.trim(),
      districts: [],
    });
    res.status(201).json({ success: true, data: province });
  } catch (error) {
    console.error("addProvince error:", error);
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const updateProvince = async (req, res) => {
  const { _id, name, icon } = req.body;

  if (!_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Province name is required" });
  }
  if (!icon || !icon.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Province icon is required" });
  }

  try {
    const updatedProvince = await shopService.updateProvince(_id, {
      name: name.trim(),
      icon: icon.trim(),
    });
    res.status(200).json({ success: true, data: updatedProvince });
  } catch (error) {
    console.error("updateProvince error:", error);
    if (error.message === "Province not found") {
      return res
        .status(404)
        .json({ success: false, message: "Province not found" });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid province ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const deleteProvince = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }

  try {
    await shopService.deleteProvince(_id);
    res
      .status(200)
      .json({ success: true, message: "Province deleted successfully" });
  } catch (error) {
    console.error("deleteProvince error:", error);
    if (error.message === "Province not found") {
      return res
        .status(404)
        .json({ success: false, message: "Province not found" });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid province ID format" });
    }
    res
      .status(500)
      .json({ success: false, message: "Error deleting province" });
  }
};

// District CRUD
export const addDistrict = async (req, res) => {
  const { _id, name } = req.body;

  if (!_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "District name is required" });
  }

  try {
    const district = await shopService.addDistrict(_id, {
      name: name.trim(),
      towns: [],
    });
    res.status(201).json({ success: true, data: district });
  } catch (error) {
    console.error("addDistrict error:", error);
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid province ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const updateDistrict = async (req, res) => {
  const { province_id, district_id, name } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "District name is required" });
  }

  try {
    const updatedDistrict = await shopService.updateDistrict(
      province_id,
      district_id,
      { name: name.trim() }
    );
    res.status(200).json({ success: true, data: updatedDistrict });
  } catch (error) {
    console.error("updateDistrict error:", error);
    if (
      error.message === "Province not found" ||
      error.message === "District not found"
    ) {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res
      .status(500)
      .json({ success: false, message: "Error updating district" });
  }
};

export const deleteDistrict = async (req, res) => {
  const { province_id, district_id } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }

  try {
    await shopService.deleteDistrict(province_id, district_id);
    res
      .status(200)
      .json({ success: true, message: "District deleted successfully" });
  } catch (error) {
    console.error("deleteDistrict error:", error);
    if (error.message === "Province or District not found") {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res
      .status(500)
      .json({ success: false, message: "Error deleting district" });
  }
};

// Town CRUD
export const addTown = async (req, res) => {
  const { province_id, district_id, name } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Town name is required" });
  }

  try {
    const town = await shopService.addTown(province_id, district_id, {
      name: name.trim(),
      shops: [],
    });
    res.status(201).json({ success: true, data: town });
  } catch (error) {
    console.error("addTown error:", error);
    if (
      error.message === "Province not found" ||
      error.message === "District not found"
    ) {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Error adding town" });
  }
};

export const updateTown = async (req, res) => {
  const { province_id, district_id, town_id, name } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!town_id) {
    return res
      .status(422)
      .json({ success: false, message: "Town ID is required" });
  }
  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Town name is required" });
  }

  try {
    const updatedTown = await shopService.updateTown(
      province_id,
      district_id,
      town_id,
      { name: name.trim() }
    );
    res.status(200).json({ success: true, data: updatedTown });
  } catch (error) {
    console.error("updateTown error:", error);
    if (
      error.message === "Province not found" ||
      error.message === "District not found" ||
      error.message === "Town not found"
    ) {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Error updating town" });
  }
};

export const deleteTown = async (req, res) => {
  const { province_id, district_id, town_id } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!town_id) {
    return res
      .status(422)
      .json({ success: false, message: "Town ID is required" });
  }

  try {
    await shopService.deleteTown(province_id, district_id, town_id);
    res
      .status(200)
      .json({ success: true, message: "Town deleted successfully" });
  } catch (error) {
    console.error("deleteTown error:", error);
    if (error.message === "Province, District or Town not found") {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Error deleting town" });
  }
};

// Shop CRUD
export const addShop = async (req, res) => {
  const { province_id, district_id, town_id, shopData } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!town_id) {
    return res
      .status(422)
      .json({ success: false, message: "Town ID is required" });
  }
  if (!shopData || typeof shopData !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Shop data is required" });
  }
  if (!shopData.name || !shopData.name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop name is required" });
  }
  if (!shopData.address || !shopData.address.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop address is required" });
  }
  if (!shopData.phone || !shopData.phone.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop phone is required" });
  }
  if (!shopData.hours || !shopData.hours.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop hours is required" });
  }
  const validTypes = [
    "Pharmacy",
    "Ayurvedic Store",
    "Health Center",
    "Supermarket",
  ];
  if (!shopData.type || !validTypes.includes(shopData.type)) {
    return res.status(422).json({
      success: false,
      message: "Shop type must be one of: Pharmacy, Ayurvedic Store, Health Center, Supermarket",
    });
  }

  try {
    const shop = await shopService.addShop(
      province_id,
      district_id,
      town_id,
      shopData
    );
    res.status(201).json({ success: true, data: shop });
  } catch (error) {
    console.error("addShop error:", error);
    if (
      error.message === "Province not found" ||
      error.message === "District not found" ||
      error.message === "Town not found"
    ) {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const updateShop = async (req, res) => {
  const { province_id, district_id, town_id, shop_id, shopData } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!town_id) {
    return res
      .status(422)
      .json({ success: false, message: "Town ID is required" });
  }
  if (!shop_id) {
    return res
      .status(422)
      .json({ success: false, message: "Shop ID is required" });
  }
  if (!shopData || typeof shopData !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Shop data is required" });
  }
  if (!shopData.name || !shopData.name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop name is required" });
  }
  if (!shopData.address || !shopData.address.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop address is required" });
  }
  if (!shopData.phone || !shopData.phone.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop phone is required" });
  }
  if (!shopData.hours || !shopData.hours.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop hours is required" });
  }
  const validTypes = [
    "Pharmacy",
    "Ayurvedic Store",
    "Health Center",
    "Supermarket",
  ];
  if (!shopData.type || !validTypes.includes(shopData.type)) {
    return res.status(422).json({
      success: false,
      message: "Shop type must be one of: Pharmacy, Ayurvedic Store, Health Center, Supermarket",
    });
  }

  try {
    const updatedShop = await shopService.updateShop(
      province_id,
      district_id,
      town_id,
      shop_id,
      shopData
    );
    res.status(200).json({ success: true, data: updatedShop });
  } catch (error) {
    console.error("updateShop error:", error);
    if (
      error.message === "Province not found" ||
      error.message === "District not found" ||
      error.message === "Town not found" ||
      error.message === "Shop not found"
    ) {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const deleteShop = async (req, res) => {
  const { province_id, district_id, town_id, shop_id } = req.body;

  if (!province_id) {
    return res
      .status(422)
      .json({ success: false, message: "Province ID is required" });
  }
  if (!district_id) {
    return res
      .status(422)
      .json({ success: false, message: "District ID is required" });
  }
  if (!town_id) {
    return res
      .status(422)
      .json({ success: false, message: "Town ID is required" });
  }
  if (!shop_id) {
    return res
      .status(422)
      .json({ success: false, message: "Shop ID is required" });
  }

  try {
    await shopService.deleteShop(province_id, district_id, town_id, shop_id);
    res
      .status(200)
      .json({ success: true, message: "Shop deleted successfully" });
  } catch (error) {
    console.error("deleteShop error:", error);
    if (error.message === "Province, District, Town or Shop not found") {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Error deleting shop" });
  }
};

export const getAllProvinces = async (req, res) => {
  try {
    const provinces = await shopService.getAllProvinces();
    res.status(200).json({ success: true, data: provinces });
  } catch (error) {
    console.error("getAllProvinces error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching provinces" });
  }
};

export const addShopWizard = async (req, res) => {
  const { wizardData } = req.body;

  // Validate wizard data exists
  if (!wizardData || typeof wizardData !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Wizard data is required" });
  }

  const {
    provMode,
    selectedProvId,
    newProvName,
    newProvIcon,
    distMode,
    selectedDistId,
    newDistName,
    townMode,
    selectedTownId,
    newTownName,
    shopForm,
  } = wizardData;

  // Validate province section
  if (!provMode || !["existing", "new"].includes(provMode)) {
    return res
      .status(422)
      .json({ success: false, message: "Province mode must be 'existing' or 'new'" });
  }
  if (provMode === "existing" && !selectedProvId) {
    return res
      .status(422)
      .json({ success: false, message: "Please select an existing province" });
  }
  if (provMode === "new") {
    if (!newProvName || !newProvName.trim()) {
      return res
        .status(422)
        .json({ success: false, message: "New province name is required" });
    }
    if (!newProvIcon || !newProvIcon.trim()) {
      return res
        .status(422)
        .json({ success: false, message: "New province icon is required" });
    }
  }

  // Validate district section
  if (!distMode || !["existing", "new"].includes(distMode)) {
    return res
      .status(422)
      .json({ success: false, message: "District mode must be 'existing' or 'new'" });
  }
  if (distMode === "existing" && !selectedDistId) {
    return res
      .status(422)
      .json({ success: false, message: "Please select an existing district" });
  }
  if (distMode === "new" && (!newDistName || !newDistName.trim())) {
    return res
      .status(422)
      .json({ success: false, message: "New district name is required" });
  }

  // Validate town section
  if (!townMode || !["existing", "new"].includes(townMode)) {
    return res
      .status(422)
      .json({ success: false, message: "Town mode must be 'existing' or 'new'" });
  }
  if (townMode === "existing" && !selectedTownId) {
    return res
      .status(422)
      .json({ success: false, message: "Please select an existing town" });
  }
  if (townMode === "new" && (!newTownName || !newTownName.trim())) {
    return res
      .status(422)
      .json({ success: false, message: "New town name is required" });
  }

  // Validate shop form
  if (!shopForm || typeof shopForm !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Shop details are required" });
  }
  if (!shopForm.name || !shopForm.name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop name is required" });
  }
  if (!shopForm.address || !shopForm.address.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop address is required" });
  }
  if (!shopForm.phone || !shopForm.phone.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop phone is required" });
  }
  if (!shopForm.hours || !shopForm.hours.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Shop hours is required" });
  }
  const validTypes = [
    "Pharmacy",
    "Ayurvedic Store",
    "Health Center",
    "Supermarket",
  ];
  if (!shopForm.type || !validTypes.includes(shopForm.type)) {
    return res.status(422).json({
      success: false,
      message: "Shop type must be one of: Pharmacy, Ayurvedic Store, Health Center, Supermarket",
    });
  }

  try {
    const result = await shopService.addShopWizard(wizardData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("addShopWizard error:", error);
    if (
      error.message === "Province not found" ||
      error.message === "District not found" ||
      error.message === "Town not found"
    ) {
      return res
        .status(404)
        .json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};