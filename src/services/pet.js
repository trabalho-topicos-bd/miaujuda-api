const driver = require("../db");
const { serviceErrorHandler } = require("../utils/helpers");

const session = driver.session();

const _getAll = async () => {
  try {
    const result = await session.run("MATCH (p:Pet) RETURN p");

    const arr = result.records.map((el) => ({
      id: el._fields[0].identity.low,
      ...el._fields[0].properties,
    }));

    return arr;
  } catch (err) {
    throw serviceErrorHandler(err);
  }
};

const _getOne = async (id) => {
  try {
    const result = await session.run(
      `MATCH (p:Pet) WHERE ID(p) = ${id} RETURN p`
    );

    if (!result.records[0]) {
      throw {
        status: 404,
        message: "Registro não encontrado",
      };
    }

    const obj = {
      id: result.records[0]._fields[0].identity.low,
      ...result.records[0]._fields[0].properties,
    };

    return obj;
  } catch (err) {
    throw serviceErrorHandler(err);
  }
};

// species
// 0 = DOG
// 1 = CAT

// gender
// 0 = MALE
// 1 = FEMALE

const _createOne = async (values) => {
  try {
    await session.run(
      `CREATE (:Pet {
            name: $name,
            species: $species,
            breed: $breed,
            gender: $gender,
            age: $age,
            size: $size,
            castrated: $castrated,
            adopted: $adopted,
            images: $images
        })`,
      values
    );
  } catch (err) {
    throw serviceErrorHandler(err);
  }
};

const _updateOne = async (id, values) => {
  try {
    let query = `MATCH (p:Pet) WHERE ID(p) = ${id} SET`;

    Object.keys(values).forEach((key) => {
      query += ` p.${key} = \$${key},`;
    });

    query = query.substring(0, query.length - 1);

    const result = await session.run(query, values);

    if (result.summary.counters._stats.propertiesSet === 0) {
      throw {
        status: 404,
        message: "Registro não encontrado",
      };
    }
  } catch (err) {
    throw serviceErrorHandler(err);
  }
};

const _deleteAll = async () => {
  try {
    await session.run("MATCH (p:Pet) DELETE p");
  } catch (err) {
    throw serviceErrorHandler(err);
  }
};

const _deleteOne = async (id) => {
  try {
    const result = await session.run(
      `MATCH (p:Pet) WHERE ID(p) = ${id} DELETE p`
    );

    if (result.summary.counters._stats.nodesDeleted === 0) {
      throw {
        status: 404,
        message: "Registro não encontrado",
      };
    }
  } catch (err) {
    throw serviceErrorHandler(err);
  }
};

module.exports = () => ({
  _getAll,
  _getOne,
  _createOne,
  _updateOne,
  _deleteAll,
  _deleteOne,
});
