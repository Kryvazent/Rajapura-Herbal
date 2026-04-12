export const verifyUser = (req, res, next) => {

    if (req.session && req.session.role === 'admin') {
        next();
    } else {

        const status = !req.session?.role ? 401 : 403;
        res.status(status).json({ message: 'Unauthorized' });
    }
};

export const verifyNotLoggin = (req, res, next) => {

    if (req.session && req.session.role) {
        return res.status(400).json({ message: 'Already logged in' });
    }
    next();
};
