const express = require("express");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.array("files"), (req, res) => {
    try {
        const responseArr = [];

        req.files.forEach((file) => {
            const id = fs.readdirSync("public/img");
            const mimetype = file.mimetype.split("/")[1];
            const fileName = `${id.length}.${mimetype}`;

            fs.writeFileSync("public/img/" + fileName, file.buffer);

            responseArr.push(fileName);
        });

        res.status(200).json(responseArr);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
