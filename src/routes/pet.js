const express = require('express');

const petServices = require('../services/pet');

const router = express.Router();

const {_getAll} = petServices();

router.get('/', async (req, res) => {
    try {
        // const data = await _getAll();

        // console.log(data);

        res.send('Get pets');
    } catch (err) {
        res.status(500).send("Something went wrong internally");
    }
})

module.exports = router