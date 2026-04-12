import service from "../models/service";

export const getAllServices = async () => {

    return await service.find({});
};