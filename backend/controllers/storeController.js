import * as shopService from '../services/shopService.js';

// Province CRUD
export const addProvince = async (req, res) => {
    try {
        const { name, icon } = req.body.province;
        const province = await shopService.addProvince({ name, icon, districts: [] });
        res.status(201).json(province);
    } catch (error) {
        console.error('Error adding province:', error);
        res.status(500).json({ message: 'Error adding province', error: error.message });
    }
};

export const updateProvince = async (req, res) => {
    try {
        const { _id, name, icon } = req.body;
        const updatedProvince = await shopService.updateProvince(_id, { name, icon });
        res.status(200).json(updatedProvince);
    } catch (error) {
        console.error('Error updating province:', error);
        res.status(500).json({ message: 'Error updating province', error: error.message });
    }
};

export const deleteProvince = async (req, res) => {
    try {
        const { _id } = req.body;
        await shopService.deleteProvince(_id);
        res.status(200).json({ message: 'Province deleted successfully' });
    } catch (error) {
        console.error('Error deleting province:', error);
        res.status(500).json({ message: 'Error deleting province', error: error.message });
    }
};

// District CRUD
export const addDistrict = async (req, res) => {
    try {
        const { _id, name } = req.body;
        const district = await shopService.addDistrict(_id, { name, towns: [] });
        res.status(201).json(district);
    } catch (error) {
        console.error('Error adding district:', error);
        res.status(500).json({ message: 'Error adding district', error: error.message });
    }
};

export const updateDistrict = async (req, res) => {
    try {
        const { province_id, district_id, name } = req.body;
        const updatedDistrict = await shopService.updateDistrict(province_id, district_id, { name });
        res.status(200).json(updatedDistrict);
    } catch (error) {
        console.error('Error updating district:', error);
        res.status(500).json({ message: 'Error updating district', error: error.message });
    }
};

export const deleteDistrict = async (req, res) => {
    try {
        const { province_id, district_id } = req.body;
        await shopService.deleteDistrict(province_id, district_id);
        res.status(200).json({ message: 'District deleted successfully' });
    } catch (error) {
        console.error('Error deleting district:', error);
        res.status(500).json({ message: 'Error deleting district', error: error.message });
    }
};

// Town CRUD
export const addTown = async (req, res) => {
    try {
        const { province_id, district_id, name } = req.body;
        const town = await shopService.addTown(province_id, district_id, { name, shops: [] });
        res.status(201).json(town);
    } catch (error) {
        console.error('Error adding town:', error);
        res.status(500).json({ message: 'Error adding town', error: error.message });
    }
};

export const updateTown = async (req, res) => {
    console.log(req.body)
    try {
        const { province_id, district_id, town_id, name } = req.body;
        const updatedTown = await shopService.updateTown(province_id, district_id, town_id, { name });
        res.status(200).json(updatedTown);
    } catch (error) {
        console.error('Error updating town:', error);
        res.status(500).json({ message: 'Error updating town', error: error.message });
    }
};

export const deleteTown = async (req, res) => {
    console.log(req.body)
    try {
        const { province_id, district_id, town_id } = req.body;
        await shopService.deleteTown(province_id, district_id, town_id);
        res.status(200).json({ message: 'Town deleted successfully' });
    } catch (error) {
        console.error('Error deleting town:', error);
        res.status(500).json({ message: 'Error deleting town', error: error.message });
    }
};

// Shop CRUD
export const addShop = async (req, res) => {
    try {
        const { provinceIndex, districtIndex, townIndex, shopData } = req.body;
        const shop = await shopService.addShop(provinceIndex, districtIndex, townIndex, shopData);
        res.status(201).json(shop);
    } catch (error) {
        console.error('Error adding shop:', error);
        res.status(500).json({ message: 'Error adding shop', error: error.message });
    }
};

export const updateShop = async (req, res) => {
    try {
        const { provinceIndex, districtIndex, townIndex, shopIndex, shopData } = req.body;
        const updatedShop = await shopService.updateShop(provinceIndex, districtIndex, townIndex, shopIndex, shopData);
        res.status(200).json(updatedShop);
    } catch (error) {
        console.error('Error updating shop:', error);
        res.status(500).json({ message: 'Error updating shop', error: error.message });
    }
};

export const deleteShop = async (req, res) => {
    try {
        const { provinceIndex, districtIndex, townIndex, shopIndex } = req.body;
        await shopService.deleteShop(provinceIndex, districtIndex, townIndex, shopIndex);
        res.status(200).json({ message: 'Shop deleted successfully' });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ message: 'Error deleting shop', error: error.message });
    }
};

// Get all provinces
export const getAllProvinces = async (req, res) => {
    try {
        const provinces = await shopService.getAllProvinces();
        res.status(200).json(provinces);
    } catch (error) {
        console.error('Error fetching provinces:', error);
        res.status(500).json({ message: 'Error fetching provinces', error: error.message });
    }
};

// Wizard - Add shop with nested creation
export const addShopWizard = async (req, res) => {
    try {
        const { wizardData } = req.body;
        const result = await shopService.addShopWizard(wizardData);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in wizard shop creation:', error);
        res.status(500).json({ message: 'Error creating shop via wizard', error: error.message });
    }
};