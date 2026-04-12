
export const verifyUser = (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};