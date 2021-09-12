const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        if (!req.headers.authorization)
            throw new Error("Credenciais inválidas");

        const token = req.headers.authorization.split(" ")[1];

        jwt.verify(token, process.env.SECRET);

        return next();
    } catch (err) {
        return res.status(401).json({
            status: 401,
            message:
                err.message === "jwt expired"
                    ? "Credenciais expiradas"
                    : err.message,
        });
    }
};

module.exports = {
    authMiddleware,
};
