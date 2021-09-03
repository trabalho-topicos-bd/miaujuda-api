const express = require('express');

const petServices = require('../services/pet');

const router = express.Router();

const {_getAll, _create} = petServices();

router.get('/', async (req, res) => {
    try {
        const data = await _getAll();

        res.json(data);
    } catch (err) {
        res.status(500).send("Something went wrong internally");
    }
})

router.post('/', async (req, res) => {
    try {
        const values = req.body;

        const data = await _create(values);

        res.json(data);
    } catch (err) {
        res.status(500).send("Something went wrong internally");
    }
})

module.exports = router