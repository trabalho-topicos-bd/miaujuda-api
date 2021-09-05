require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

const userRoutes = require("./routes/user");
const petRoutes = require("./routes/pet");
const storageRoutes = require("./routes/storage");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.basename(path.dirname("public"))));
app.use(cors());

app.get("/", (req, res) => {
  res.redirect("/pet");
});

app.use("/user", userRoutes);

app.use("/pet", petRoutes);

app.use("/storage", storageRoutes);

app.listen(PORT);

console.log(`Server listening on port ${PORT}`);

module.exports = app;
