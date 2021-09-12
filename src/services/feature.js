const driver = require("../db");
const { serviceErrorHandler } = require("../utils/helpers");

const session = driver.session();

const _getAll = async () => {
    try {
        const result = await session.run(`
        MATCH (f:Feature)<-[:Has]-(p:Pet)
        RETURN id(p) as id_pet, p as pet, id(f) as id, f as feature`);

        const arr = result.records.map((record) => ({
            id: record.get("id").low,
            ...record.get("feature").properties,
            pet: {
                id: record.get("id_pet").low,
                ...record.get("pet").properties,
            },
        }));

        return arr;
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _getOne = async (id) => {
    try {
        const result = await session.run(
            `MATCH (f:Feature)<-[:Has]-(p:Pet)
            WHERE ID(f) = ${id}
            RETURN p as pet, f as feature`
        );

        if (!result.records[0]) {
            throw {
                status: 404,
                message: "Registro não encontrado",
            };
        }

        const obj = {
            id: result.records[0].get("feature").identity.low,
            ...result.records[0].get("feature").properties,
            pet: {
                id: result.records[0].get("pet").identity.low,
                ...result.records[0].get("pet").properties,
            },
            // ...result.records[1]._fields[1].properties,
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
        const result = await session.run(
            `MATCH (p:Pet)
            WHERE ID(p) = $id_pet
            CREATE (f:Feature {
                experience: $experience,
                cost: $cost,
                love: $love,
                peace: $peace,
                intelligence: $intelligence,
                loyalty: $loyalty,
                spare_time: $spare_time,
                space_to_explore: $space_to_explore,
                trainable: $trainable,
                cuteness: $cuteness
            })
            CREATE (p)-[:Has]->(f)`,
            values
        );

        if (result.summary.counters._stats.relationshipsCreated === 0) {
            throw {
                status: 404,
                message: "Pet não encontrado",
            };
        }
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _updateOne = async (id, values) => {
    try {
        let query = `MATCH (f:Feature) WHERE ID(f) = ${id} SET`;

        Object.keys(values).forEach((key) => {
            query += ` f.${key} = \$${key},`;
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
        await session.run("MATCH (f:Feature) DETACH DELETE f");
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _deleteOne = async (id) => {
    try {
        const result = await session.run(
            `MATCH (f:Feature) WHERE ID(f) = ${id} DETACH DELETE f`
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
