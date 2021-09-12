const featureMiddleware = (req, res, next) => {
    try {
        const values = req.body;

        Object.keys(values)
            .filter((key) => key !== "id")
            .filter((key) => key !== "id_pet")
            .forEach((key) => {
                if (!(values[key] >= 1 && values[key] <= 4)) {
                    throw {
                        status: 400,
                        message: `Valor inválido passado para ${key}`,
                    };
                }
            });

        return next();
    } catch (err) {
        return res.status(err.status).json(err);
    }
};

module.exports = {
    featureMiddleware,
};
