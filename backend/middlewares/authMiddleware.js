const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ error: 'Немає доступу. Авторизуйтесь.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).json({ error: 'Сесія закінчилась. Будь ласка, увійдіть знову.' });
    }
};