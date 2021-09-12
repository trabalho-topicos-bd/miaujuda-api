const driver = require("../db");
const { serviceErrorHandler } = require("../utils/helpers");

const session = driver.session();

const _getAll = async (query = {}, limit = 20) => {
    try {
        const keys = Object.keys(query);

        let matchQuery = "";

        if (keys.length > 0) {
            keys.forEach((key, index) => {
                const keyword = index === 0 ? "WHERE" : "AND";
                const whereClause =
                    key === "name"
                        ? `p.${key} =~ '(?ui).*${query[key]}.*'\n`
                        : `p.${key} = ${query[key]}\n`;

                matchQuery += `${keyword} ${whereClause}`;
            });
        }

        const result = await session.run(
            `MATCH (p:Pet)
            ${matchQuery}
            WITH collect(p) as matched
            RETURN size(matched), matched[..${limit}]`
        );

        const rows = result.records[0]._fields[1].map((el) => ({
            id: el.identity.low,
            ...el.properties,
        }));

        return {
            count: result.records[0]._fields[0].low,
            rows,
        };
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

const _getIdeal = async (values) => {
    try {
        const arrX = [];
        const arrY = [];

        Object.keys(values).forEach((key) => {
            arrX.push(values[key]);
            arrY.push(`f.${key}`);
        });

        const result = await session.run(
            `MATCH (f:Feature)<-[:Has]-(p:Pet)
            WITH f, p, gds.alpha.similarity.euclidean([${arrX}], [${arrY}]) AS similarity
            RETURN p as pet, similarity
            ORDER BY similarity`
        );

        if (!result.records[0]) {
            throw {
                status: 404,
                message: "Registro não encontrado",
            };
        }

        const arr = result.records.reverse().map((result) => ({
            pet: {
                id: result.get("pet").identity.low,
                ...result.get("pet").properties,
            },
            similarity: result.get("similarity"),
        }));

        return arr;
    } catch (err) {
        console.log(err);
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
        await session.run("MATCH (p:Pet) DETACH DELETE p");
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _deleteOne = async (id) => {
    try {
        const result = await session.run(
            `MATCH (p:Pet) WHERE ID(p) = ${id} DETACH DELETE p`
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
    _getIdeal,
    _createOne,
    _updateOne,
    _deleteAll,
    _deleteOne,
});
