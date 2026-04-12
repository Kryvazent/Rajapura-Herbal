import * as authService from '../services/authService.js';

export const login = async (req, res) => {

    const { username, password } = req.body;

    const user = await authService.login(username);
    if (user && await user.comparePassword(password)) {

        req.session.role = user.role;
        req.session.userId = user._id;

        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }

};