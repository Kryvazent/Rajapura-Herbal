import * as authService from '../services/authService.js';

export const login = async (req, res) => {

    const { username, password } = req.body;

    const user = await authService.login(username);
    if (user && await user.comparePassword(password)) {

        req.session.role = user.role;
        req.session.userId = user._id;

        req.session.save((err) => {
            if (err) return res.status(500).json({ message: "Session save failed" });
            res.status(200).json({ message: "Logged in", role: user.role });
        });

    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }

};

export const logout = (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }

        // 2. Clear the cookie from the user's browser
        // 'connect.sid' is the default name, change it if you renamed yours
        res.clearCookie('connect.sid');

        res.status(200).json({ message: 'Logged out successfully' });
    });
};

export const status = (req, res) => {

    if (req.session && req.session.userId) {
        // Session is valid
        return res.status(200).json({
            authenticated: true,
            role: req.session.role
        });
    }
    // Session expired or doesn't exist
    res.status(401).json({ authenticated: false });

};