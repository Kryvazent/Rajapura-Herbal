import Shop from "../models/Shop.js";

const getShopDocument = async () => {
    let shopDoc = await Shop.findOne({});
    if (!shopDoc) {
        shopDoc = new Shop({ provinces: [] });
        await shopDoc.save();
    }
    return shopDoc;
};

// Province CRUD
export const addProvince = async (provinceData) => {
    const shopDoc = new Shop(provinceData);
    await shopDoc.save();
    return shopDoc;
};

export const updateProvince = async (_id, updateData) => {
    const shopDoc = await Shop.findOne({ _id: _id });
    if (!shopDoc) {
        throw new Error('Province not found');
    }
    shopDoc.name = updateData.name;
    shopDoc.icon = updateData.icon;
    await shopDoc.save();
    return shopDoc;
};

export const deleteProvince = async (_id) => {
    const shopDoc = await Shop.findOne({ _id });
    if (!shopDoc) {
        throw new Error('Province not found');
    }
    return Shop.deleteOne({ _id });
};

// District CRUD
export const addDistrict = async (_id, districtData) => {
    const shopDoc = await Shop.findOne({ _id })
    shopDoc.districts.push(districtData)
    return await shopDoc.save()
};

export const updateDistrict = async (province_id, district_id, updateData) => {
    const province = await Shop.findById(province_id);
    if (!province) {
        throw new Error('Province not found');
    }
    const district = province.districts.id(district_id);
    if (!district) {
        throw new Error('District not found');
    }
    district.name = updateData.name;
    await province.save();
    return district;
};

export const deleteDistrict = async (province_id, district_id) => {
    const result = await Shop.updateOne(
        { _id: province_id },
        {
            $pull: {
                districts: { _id: district_id }
            }
        }
    );
    if (result.modifiedCount === 0) {
        throw new Error("Province or District not found");
    }
    return { message: "District deleted successfully" };
};

// Town CRUD
export const addTown = async (province_id, district_id, townData) => {
    const province = await Shop.findById(province_id);
    if (!province) {
        throw new Error('Province not found');
    }
    const district = province.districts.id(district_id);
    if (!district) {
        throw new Error('District not found');
    }
    district.towns.push(townData)
    return await province.save()
};

export const updateTown = async (province_id, district_id, town_id, updateData) => {
    const province = await Shop.findById(province_id);
    if (!province) {
        throw new Error('Province not found');
    }
    const district = province.districts.id(district_id);
    if (!district) {
        throw new Error('District not found');
    }
    const town = district.towns.id(town_id);
    if (!town) {
        throw new Error('Town not found');
    }
    town.name = updateData.name;
    return await province.save();
};

export const deleteTown = async (province_id, district_id, town_id) => {
    const result = await Shop.updateOne(
        { _id: province_id, "districts._id": district_id },
        {
            $pull: {
                "districts.$.towns": { _id: town_id }
            }
        }
    );
    if (result.modifiedCount === 0) {
        throw new Error("Province, District or Town not found");
    }
    return { message: "Town deleted successfully" };
};

// Shop CRUD
export const addShop = async (province_id, district_id, town_id, shopData) => {
    const province = await Shop.findById(province_id);
    if (!province) {
        throw new Error('Province not found');
    }
    const district = province.districts.id(district_id);
    if (!district) {
        throw new Error('District not found');
    }
    const town = district.towns.id(town_id);
    if (!town) {
        throw new Error('Town not found');
    }
    town.shops.push(shopData)
    return await province.save();
};

export const updateShop = async (province_id, district_id, town_id, shop_id, shopData) => {
    const province = await Shop.findById(province_id);
    if (!province) {
        throw new Error('Province not found');
    }
    const district = province.districts.id(district_id);
    if (!district) {
        throw new Error('District not found');
    }
    const town = district.towns.id(town_id);
    if (!town) {
        throw new Error('Town not found');
    }
    const shop = town.shops.id(shop_id);
    if (!shop) {
        throw new Error('Shop not found');
    }
    shop.name = shopData.name;
    shop.address = shopData.address;
    shop.phone = shopData.phone;
    shop.hours = shopData.hours;
    shop.type = shopData.type;
    return await province.save();
};

export const deleteShop = async (province_id, district_id, town_id, shop_id) => {
    const result = await Shop.updateOne(
        {
            _id: province_id,
            "districts._id": district_id,
            "districts.towns._id": town_id
        },
        {
            $pull: {
                "districts.$[d].towns.$[t].shops": { _id: shop_id }
            }
        },
        {
            arrayFilters: [
                { "d._id": district_id },
                { "t._id": town_id }
            ]
        }
    );
    if (result.modifiedCount === 0) {
        throw new Error("Province, District, Town or Shop not found");
    }
    return { message: "Shop deleted successfully" };
};

export const getAllProvinces = async () => {
    return await Shop.find();
};

export const getAllShops = async () => {
    const shopDoc = await Shop.find();
    return shopDoc;
};

export const addShopWizard = async (wizardData) => {
    // console.log("199 : ", wizardData);
    const {
        provMode,
        selectedProvId,
        newProvName,
        newProvIcon,
        distMode,
        selectedDistId,
        newDistName,
        townMode,
        selectedTownId,
        newTownName,
        shopForm
    } = wizardData;

    let province;
    if (provMode === 'existing') {
        province = await Shop.findById(selectedProvId);
        if (!province) throw new Error('Province not found');
    } else {
        province = new Shop({
            name: newProvName,
            icon: newProvIcon,
            districts: []
        });
    }
    let district;
    if (distMode === 'existing') {
        district = province.districts.id(selectedDistId);
        if (!district) throw new Error('District not found');
    } else {
        province.districts.push({
            name: newDistName,
            towns: []
        });
        district = province.districts[province.districts.length - 1];
    }
    let town;
    if (townMode === 'existing') {
        town = district.towns.id(selectedTownId);
        if (!town) throw new Error('Town not found');
    } else {
        district.towns.push({
            name: newTownName,
            shops: []
        });
        town = district.towns[district.towns.length - 1];
    }
    town.shops.push(shopForm);
    await province.save();
    return {
        shop: town.shops[town.shops.length - 1],
        province
    };
};