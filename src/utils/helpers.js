const serviceErrorHandler = (err) => {
    if (typeof err === "object" && "status" in err) return err;

    return {
        status: 500,
        message: "Erro interno",
    };
};

module.exports = {
    serviceErrorHandler,
};
