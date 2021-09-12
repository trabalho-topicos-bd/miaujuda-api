const neo4j = require("neo4j-driver");

const { uri, user, password } = require("./config");

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

module.exports = driver;
