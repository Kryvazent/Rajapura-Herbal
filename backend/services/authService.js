import user from "../models/user.js";

export const login = async (username) => {
    return await user.findOne({ username });
};