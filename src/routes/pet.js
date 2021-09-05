const express = require("express");
const jwt = require("jsonwebtoken");

const petServices = require("../services/pet");

const router = express.Router();

const { _getAll, _getOne, _createOne, _updateOne, _deleteAll, _deleteOne } =
  petServices();

const jwtMiddleware = (req, res, next) => {
  try {
    if (!req.headers.authorization) throw new Error("Credenciais inválidas");

    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.SECRET);

    return next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message:
        err.message === "jwt expired" ? "Credenciais expiradas" : err.message,
    });
  }
};

router.get("/", async (req, res) => {
  try {
    const data = await _getAll();

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

router.post("/", jwtMiddleware, async (req, res) => {
  try {
    const values = req.body;

    await _createOne(values);

    res.status(201).json({ message: "Registro criado com sucesso" });
  } catch (err) {
    res.status(err.status).send(err);
  }
});

router.patch("/:id", jwtMiddleware, async (req, res) => {
  try {
    const values = req.body;

    await _updateOne(req.params.id, values);

    res.status(201).json({ message: "Registro atualizado com sucesso" });
  } catch (err) {
    res.status(err.status).send(err);
  }
});

router.delete("/", jwtMiddleware, async (req, res) => {
  try {
    await _deleteAll();

    res.status(200).json({
      message: "Todos os registros de pet foram deletados com sucesso",
    });
  } catch (err) {
    res.status(err.status).send(err);
  }
});

router.delete("/:id", jwtMiddleware, async (req, res) => {
  try {
    await _deleteOne(req.params.id);

    res.status(200).json({ message: "Registro deletado com sucesso" });
  } catch (err) {
    console.log(err);
    res.status(err.status).send(err);
  }
});

module.exports = router;
