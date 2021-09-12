const express = require("express");

const { authMiddleware } = require("../middleware/auth");
const { featureMiddleware } = require("../middleware/feature");

const petServices = require("../services/pet");

const router = express.Router();

const {
    _getAll,
    _getOne,
    _getIdeal,
    _createOne,
    _updateOne,
    _deleteAll,
    _deleteOne,
} = petServices();

router.get("/", async (req, res) => {
    try {
        const { limit, ...queryParams } = req.query;

        const data = await _getAll(queryParams, limit);

        res.status(200).json(data);
    } catch (err) {
        res.status(err.status).send(err);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const data = await _getOne(req.params.id);

        res.status(200).json(data);
    } catch (err) {
        res.status(err.status).send(err);
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const values = req.body;

        await _createOne(values);

        res.status(201).json({ message: "Registro criado com sucesso" });
    } catch (err) {
        res.status(err.status).send(err);
    }
});

router.post("/find-perfect", featureMiddleware, async (req, res) => {
    try {
        const values = req.body;

        const data = await _getIdeal(values);

        res.status(200).json(data);
    } catch (err) {
        res.status(err.status).send(err);
    }
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const values = req.body;

        await _updateOne(req.params.id, values);

        res.status(201).json({ message: "Registro atualizado com sucesso" });
    } catch (err) {
        res.status(err.status).send(err);
    }
});

router.delete("/", authMiddleware, async (req, res) => {
    try {
        await _deleteAll();

        res.status(200).json({
            message: "Todos os registros de pet foram deletados com sucesso",
        });
    } catch (err) {
        res.status(err.status).send(err);
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        await _deleteOne(req.params.id);

        res.status(200).json({ message: "Registro deletado com sucesso" });
    } catch (err) {
        res.status(err.status).send(err);
    }
});

module.exports = router;
