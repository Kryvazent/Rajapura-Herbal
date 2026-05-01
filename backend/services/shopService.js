import Shop from "../models/Shop.js";

// Helper function to get the shop document
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
    console.log("Shop service : ", _id)
    const shopDoc = await Shop.findOne({ _id });
    console.log(shopDoc)
    if (!shopDoc) {
        throw new Error('Province not found');
    }
    return Shop.deleteOne({ _id });
};

// District CRUD
export const addDistrict = async (provinceIndex, districtData) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]) {
        throw new Error('Province not found');
    }
    shopDoc.provinces[provinceIndex].districts.push(districtData);
    await shopDoc.save();
    return shopDoc.provinces[provinceIndex].districts[
        shopDoc.provinces[provinceIndex].districts.length - 1
    ];
};

export const updateDistrict = async (provinceIndex, districtIndex, updateData) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]) {
        throw new Error('District not found');
    }
    shopDoc.provinces[provinceIndex].districts[districtIndex].name = updateData.name;
    await shopDoc.save();
    return shopDoc.provinces[provinceIndex].districts[districtIndex];
};

export const deleteDistrict = async (provinceIndex, districtIndex) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]) {
        throw new Error('District not found');
    }
    shopDoc.provinces[provinceIndex].districts.splice(districtIndex, 1);
    await shopDoc.save();
};

// Town CRUD
export const addTown = async (provinceIndex, districtIndex, townData) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]) {
        throw new Error('District not found');
    }
    shopDoc.provinces[provinceIndex].districts[districtIndex].towns.push(townData);
    await shopDoc.save();
    return shopDoc.provinces[provinceIndex].districts[districtIndex].towns[
        shopDoc.provinces[provinceIndex].districts[districtIndex].towns.length - 1
    ];
};

export const updateTown = async (provinceIndex, districtIndex, townIndex, updateData) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]?.towns[townIndex]) {
        throw new Error('Town not found');
    }
    shopDoc.provinces[provinceIndex].districts[districtIndex].towns[townIndex].name = updateData.name;
    await shopDoc.save();
    return shopDoc.provinces[provinceIndex].districts[districtIndex].towns[townIndex];
};

export const deleteTown = async (provinceIndex, districtIndex, townIndex) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]?.towns[townIndex]) {
        throw new Error('Town not found');
    }
    shopDoc.provinces[provinceIndex].districts[districtIndex].towns.splice(townIndex, 1);
    await shopDoc.save();
};

// Shop CRUD
export const addShop = async (provinceIndex, districtIndex, townIndex, shopData) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]?.towns[townIndex]) {
        throw new Error('Town not found');
    }

    // Generate new shop ID
    const allShops = shopDoc.provinces
        .flatMap(p => p.districts)
        .flatMap(d => d.towns)
        .flatMap(t => t.shops);
    const newId = allShops.reduce((max, shop) => Math.max(max, shop.id || 0), 0) + 1;

    const newShop = { id: newId, ...shopData };
    shopDoc.provinces[provinceIndex].districts[districtIndex].towns[townIndex].shops.push(newShop);
    await shopDoc.save();
    return newShop;
};

export const updateShop = async (provinceIndex, districtIndex, townIndex, shopIndex, shopData) => {
    const shopDoc = await getShopDocument();
    const shop = shopDoc.provinces[provinceIndex]?.districts[districtIndex]?.towns[townIndex]?.shops[shopIndex];

    if (!shop) {
        throw new Error('Shop not found');
    }

    // Keep the existing ID
    const shopId = shop.id;
    shopDoc.provinces[provinceIndex].districts[districtIndex].towns[townIndex].shops[shopIndex] = {
        id: shopId,
        ...shopData
    };

    await shopDoc.save();
    return shopDoc.provinces[provinceIndex].districts[districtIndex].towns[townIndex].shops[shopIndex];
};

export const deleteShop = async (provinceIndex, districtIndex, townIndex, shopIndex) => {
    const shopDoc = await getShopDocument();
    if (!shopDoc.provinces[provinceIndex]?.districts[districtIndex]?.towns[townIndex]?.shops[shopIndex]) {
        throw new Error('Shop not found');
    }
    shopDoc.provinces[provinceIndex].districts[districtIndex].towns[townIndex].shops.splice(shopIndex, 1);
    await shopDoc.save();
};

// Get all provinces
export const getAllProvinces = async () => {
    return await Shop.find();
};

export const getAllShops = async () => {
    const shopDoc = await getShopDocument();
    return shopDoc;
};

// Wizard - Create shop with nested structures
export const addShopWizard = async (wizardData) => {
    const shopDoc = await getShopDocument();

    let province;
    let provinceIndex;

    // Handle Province
    if (wizardData.provMode === 'existing') {
        provinceIndex = shopDoc.provinces.findIndex(p => p.name === wizardData.selectedProvName);
        if (provinceIndex === -1) throw new Error('Province not found');
        province = shopDoc.provinces[provinceIndex];
    } else {
        // Create new province
        const newProvince = {
            name: wizardData.newProvName,
            icon: wizardData.newProvIcon,
            districts: []
        };
        shopDoc.provinces.push(newProvince);
        provinceIndex = shopDoc.provinces.length - 1;
        province = shopDoc.provinces[provinceIndex];
    }

    let district;
    let districtIndex;

    // Handle District
    if (wizardData.distMode === 'existing') {
        districtIndex = province.districts.findIndex(d => d.name === wizardData.selectedDistName);
        if (districtIndex === -1) throw new Error('District not found');
        district = province.districts[districtIndex];
    } else {
        // Create new district
        const newDistrict = {
            name: wizardData.newDistName,
            towns: []
        };
        province.districts.push(newDistrict);
        districtIndex = province.districts.length - 1;
        district = province.districts[districtIndex];
    }

    let town;
    let townIndex;

    // Handle Town
    if (wizardData.townMode === 'existing') {
        townIndex = district.towns.findIndex(t => t.name === wizardData.selectedTownName);
        if (townIndex === -1) throw new Error('Town not found');
        town = district.towns[townIndex];
    } else {
        // Create new town
        const newTown = {
            name: wizardData.newTownName,
            shops: []
        };
        district.towns.push(newTown);
        townIndex = district.towns.length - 1;
        town = district.towns[townIndex];
    }

    // Generate new shop ID
    const allShops = shopDoc.provinces
        .flatMap(p => p.districts)
        .flatMap(d => d.towns)
        .flatMap(t => t.shops);
    const newId = allShops.reduce((max, shop) => Math.max(max, shop.id || 0), 0) + 1;

    // Add shop
    const newShop = {
        id: newId,
        ...wizardData.shopForm
    };
    town.shops.push(newShop);

    await shopDoc.save();

    return {
        shop: newShop,
        provinces: shopDoc.provinces
    };
};