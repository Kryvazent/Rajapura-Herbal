import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        hours: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "Pharmacy",
                "Ayurvedic Store",
                "Health Center",
                "Supermarket",
            ],
        },
    },
    { _id: false }
);

const townSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        shops: [shopSchema],
    },
    { _id: false }
);

const districtSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        towns: [townSchema],
    },
    { _id: false }
);

const provinceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        icon: {
            type: String,
            required: true,
        },
        districts: [districtSchema],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Store", provinceSchema);