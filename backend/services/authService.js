import user from "../models/User.js";

export const login = async (username) => {
    return await user.findOne({ email: username });
};
