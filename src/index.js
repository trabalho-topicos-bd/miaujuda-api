const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const app = express();

const uri = "neo4j://localhost:7687";
const user = "neo4j";
const password = "abc123";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

const PORT = 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

const createUser = async (name = "") => {
  const result = await session.run("CREATE (a:Person {name: $name}) RETURN a", {
    name,
  });

  const singleRecord = result.records[0];
  const node = singleRecord.get(0);

  return node;
};

const listUsers = async () => {
  const result = await session.run("MATCH (p:Person) RETURN p");

  const arr = result.records.map((el) => ({
    id: el._fields[0].identity.low,
    name: el._fields[0].properties.name,
  }));

  return JSON.stringify(arr);
};

app.post("/person", (req, res) => {
  res.send(createUser(req.body.name));
});

app.get("/person", async (_, res) => {
  const result = await listUsers();

  res.send(result);
});

app.listen(PORT);

module.exports = app;
