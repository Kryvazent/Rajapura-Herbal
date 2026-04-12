import * as ShopService from '../services/shopService.js';

export const getAllShops = async (req, res) => {
    try {
        const shops = await ShopService.getAllShops();
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shops', error });
    }
};