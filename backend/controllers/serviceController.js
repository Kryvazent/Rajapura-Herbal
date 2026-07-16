import * as serviceService from "../services/serviceService.js";
import { localizeServices } from "../utils/localize.js";


const formatMongooseError = (error) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return { status: 422, message: "Validation failed", errors };
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      status: 409,
      message: `A service with this ${field} already exists`,
    };
  }
  return { status: 500, message: "Internal server error" };
};

export const getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();
    res.status(200).json({ success: true, data: localizeServices(services, req.query.lang) });
  } catch (error) {
    console.error("getAllServices error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching services" });
  }
};

export const addService = async (req, res) => {
  
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Service name is required" });
  }

  try {
    const serviceData = req.body;
    const newService = await serviceService.addNewService(serviceData);
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    console.error("addService error:", error);
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const updateService = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res
      .status(422)
      .json({ success: false, message: "Service ID is required" });
  }

  try {
    const serviceData = req.body;
    const updatedService = await serviceService.updateService(_id, serviceData);
    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    console.error("updateService error:", error);
    if (error.message === "Service not found") {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid service ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const deleteService = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res
      .status(422)
      .json({ success: false, message: "Service ID is required" });
  }

  try {
    await serviceService.deleteService(_id);
    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("deleteService error:", error);
    if (error.message === "Service not found") {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid service ID format" });
    }
    res.status(500).json({ success: false, message: "Error deleting service" });
  }
};

export const addServiceItem = async (req, res) => {
  const { location_id, serviceItem } = req.body;

  
  if (!location_id) {
    return res
      .status(422)
      .json({ success: false, message: "Location ID is required" });
  }
  if (!serviceItem || typeof serviceItem !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Service item data is required" });
  }
  if (!serviceItem.name || !serviceItem.name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Service item name is required" });
  }

  try {
    const updatedService = await serviceService.addServiceItem(
      location_id,
      serviceItem
    );
    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    console.error("addServiceItem error:", error);
    if (error.message === "Service location not found") {
      return res
        .status(404)
        .json({ success: false, message: "Service location not found" });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid location ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const updateServiceItem = async (req, res) => {
  const { location_id, service_id, serviceItem } = req.body;

  
  if (!location_id) {
    return res
      .status(422)
      .json({ success: false, message: "Location ID is required" });
  }
  if (!service_id) {
    return res
      .status(422)
      .json({ success: false, message: "Service item ID is required" });
  }
  if (!serviceItem || typeof serviceItem !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Service item data is required" });
  }
  if (!serviceItem.name || !serviceItem.name.trim()) {
    return res
      .status(422)
      .json({ success: false, message: "Service item name is required" });
  }

  try {
    const updatedService = await serviceService.updateServiceItem(
      location_id,
      service_id,
      serviceItem
    );
    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    console.error("updateServiceItem error:", error);
    if (error.message === "Service location not found") {
      return res
        .status(404)
        .json({ success: false, message: "Service location not found" });
    }
    if (error.message === "Service not found") {
      return res
        .status(404)
        .json({ success: false, message: "Service item not found" });
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

export const deleteServiceItem = async (req, res) => {
  const { location_id, service_id } = req.body;

  if (!location_id) {
    return res
      .status(422)
      .json({ success: false, message: "Location ID is required" });
  }
  if (!service_id) {
    return res
      .status(422)
      .json({ success: false, message: "Service item ID is required" });
  }

  try {
    const result = await serviceService.deleteServiceItem(
      location_id,
      service_id
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("deleteServiceItem error:", error);
    if (error.message === "Location or service not found") {
      return res
        .status(404)
        .json({ success: false, message: "Location or service item not found" });
    }
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid ID format" });
    }
    res
      .status(500)
      .json({ success: false, message: "Error deleting service item" });
  }
};
