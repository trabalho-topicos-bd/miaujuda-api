const express = require("express");

const userServices = require("../services/user");

const router = express.Router();

const { _getAll, _getOne, _createOne, _deleteAll } = userServices();

router.get("/", async (req, res) => {
  try {
    const data = await _getAll();

    res.status(200).json(data);
  } catch (err) {
    res.status(err.status).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const values = req.body;

    await _createOne(values);

    res.status(201).json({ message: "Registro criado com sucesso" });
  } catch (err) {
    res.status(err.status).send(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const values = req.body;

    const data = await _getOne(values);

    res.status(201).json(data);
  } catch (err) {
    res.status(err.status).send(err);
  }
});

router.delete("/", async (req, res) => {
  try {
    await _deleteAll();

    res.status(200).json({
      message: "Todos os usuários foram deletados com sucesso",
    });
  } catch (err) {
    res.status(err.status).send(err);
  }
});

module.exports = router;
