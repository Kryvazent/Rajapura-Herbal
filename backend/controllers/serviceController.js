import * as serviceService from "../services/serviceService.js";

export const getAllServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
};

export const addService = async (req, res) => {
    try {
        const serviceData = req.body;
        const newService = await serviceService.addNewService(serviceData);
        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ message: 'Error adding service', error: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const { _id } = req.body;
        const serviceData = req.body;
        const updatedService = await serviceService.updateService(_id, serviceData);
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: 'Error updating service', error: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { _id } = req.body;
        await serviceService.deleteService(_id);
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error: error.message });
    }
};

export const addServiceItem = async (req, res) => {
    console.log(req.body)
    try {
        const { location_id, serviceItem } = req.body;
        const updatedService = await serviceService.addServiceItem(location_id, serviceItem);
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: 'Error adding service item', error: error.message });
    }
};

export const updateServiceItem = async (req, res) => {
    try {
        const { location_id, service_id, serviceItem } = req.body;
        const updatedService = await serviceService.updateServiceItem(location_id, service_id, serviceItem);
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: 'Error updating service item', error: error.message });
    }
};

export const deleteServiceItem = async (req, res) => {
    try {
        const { location_id, service_id } = req.body;
        const updatedService = await serviceService.deleteServiceItem(location_id, service_id);
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service item', error: error.message });
    }
};