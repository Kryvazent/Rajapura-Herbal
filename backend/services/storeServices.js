import store from '../models/Store.js'

export const getAllStores = async () => {

    return await store.find({});
};

export const addStore = async (storeData) => {

    const newStore = new store(storeData);
    return await newStore.save();
};

export const deleteStore = async (id) => {
    await store.findByIdAndDelete(id);
};