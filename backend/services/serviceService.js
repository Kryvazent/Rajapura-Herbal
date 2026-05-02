import service from "../models/service.js";

export const getAllServices = async () => {
    return await service.find({});
};

export const addNewService = async (serviceData) => {
    const newService = new service({
        name: serviceData.name,
        area: serviceData.area,
        address: serviceData.address,
        mobile: serviceData.mobile,
        altMobile: serviceData.altMobile || '',
        mapLabel: serviceData.mapLabel || '',
        icon: serviceData.icon || '🌿',
        color: serviceData.color || '#2D5016',
        lightColor: serviceData.lightColor || 'rgba(45,80,22,0.08)',
        borderColor: serviceData.borderColor || 'rgba(45,80,22,0.2)',
        description: serviceData.description || '',
        services: []
    });

    return await newService.save();
};

export const updateService = async (_id, serviceData) => {
    const updated = await service.findByIdAndUpdate(
        _id,
        serviceData,
        { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
        throw new Error('Service not found');
    }
    return updated;
};

export const deleteService = async (_id) => {
    const deletedService = await service.findByIdAndDelete(_id);
    if (!deletedService) {
        throw new Error('Service not found');
    }
    return deletedService;
};

export const addServiceItem = async (_id, serviceItem) => {
    const location = await service.findById(_id);
    if (!location) {
        throw new Error('Service location not found');
    }
    location.services.push(serviceItem);
    return await location.save();
};

export const updateServiceItem = async (location_id, service_id, serviceItem) => {
    const location = await service.findById(location_id);
    if (!location) {
        throw new Error('Service location not found');
    }
    const serviceDoc = location.services.id(service_id);
    if (!serviceDoc) {
        throw new Error('Service not found');
    }
    Object.assign(serviceDoc, serviceItem);
    await location.save();
    return serviceDoc;
};

export const deleteServiceItem = async (location_id, service_id) => {
    const result = await service.updateOne(
        {
            _id: location_id,
            "services._id": service_id
        },
        {
            $pull: {
                services: { _id: service_id }
            }
        }
    );

    if (result.modifiedCount === 0) {
        throw new Error("Location or service not found");
    }
    return { message: "Service deleted successfully" };
};