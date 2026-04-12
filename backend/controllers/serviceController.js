import * as serviceService from "../services/serviceService.js";

export const getAllServices = async (req, res) => {

    try {
        const services = await serviceService.getAllServices();
        res.status(200).json(services);
    } catch (error) {  
        res.status(500).json({ message: 'Error fetching services', error });
    }
};