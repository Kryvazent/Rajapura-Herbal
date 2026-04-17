import * as storeService from '../services/storeServices.js';

export const getAllStores = async (req,res) => {

    try {
        const stores = await storeService.getAllStores();
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stores', error });
    }
};

export const addStore = async (req, res) => {

    const { _id, ...storeData } = req.body.store;
    try {

        const store = await storeService.addStore(storeData);
        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Error adding store', error });
    }
};

export const deleteStore = async (req, res) => {
    const { id } = req.body;

    try {
        await storeService.deleteStore(id);
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting store', error });
    }
};

export const updateStore = async (req, res) => {

    console.log("Arrived controller")

    const { _id, ...storeData } = req.body.store;
    try {

        await storeService.deleteStore(_id);
        const store = await storeService.addStore(storeData);
        res.status(200).json(store);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating store', error });
    }

};