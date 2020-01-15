const verifyToken = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/auth/login');
    }
}

module.exports = verifyToken;