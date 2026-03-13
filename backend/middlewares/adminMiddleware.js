module.exports = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ заборонено. Ця дія дозволена лише Адміністраторам.' });
    }
    next();
};