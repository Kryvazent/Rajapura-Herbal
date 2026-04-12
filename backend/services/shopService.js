import shop from "../models/Shop.js";

export const getAllShops = async () => {

    return await shop.find({});
}