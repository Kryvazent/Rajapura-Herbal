import service from "../models/service.js";

export const getAllServices = async () => {

    return await service.find({});
};