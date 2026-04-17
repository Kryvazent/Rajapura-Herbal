export const verifyUserRole = (req, res, next) => {

    if (req.session && req.session.role === 'ADMIN') {
        console.log("Verified as Admin Auth.js")
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

    console.log("Arrived Auth.js")

    if (req.session && req.session.userId) {
        console.log("Checked logged Auth.js")

        next();
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
};
