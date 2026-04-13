export const verifyUserRole = (req, res, next) => {

    if (req.session && req.session.role === 'ADMIN') {
        next();
    } else {

        const status = !req.session?.role ? 401 : 403;
        res.status(status).json({ message: 'Unauthorized' });
    }
};

export const verifyNotLoggin = (req, res, next) => {

    if (req.session && req.session.userId) {
        return res.status(400).json({ message: 'Already logged in' });
    }
    next();
};

export const verifyLoggin = (req, res, next) => {

    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
};
