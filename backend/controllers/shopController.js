import * as ShopService from '../services/shopService.js';
import { localizeShops } from "../utils/localize.js";

export const getAllShops = async (req, res) => {
    try {
        const shops = await ShopService.getAllShops();
        res.status(200).json(localizeShops(shops, req.query.lang));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shops', error });
    }
};
