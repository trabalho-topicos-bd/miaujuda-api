const driver = require('../db');

const session = driver.session();

const _getAll = async () => {
    try {
        const result = await session.run("MATCH (p:Pet) RETURN p");

        const arr = result.records.map((el) => ({
            id: el._fields[0].identity.low,
            name: el._fields[0].properties.name,
        }));

        return JSON.stringify(arr);
    } catch (err) {
        throw err;
    }
};

const _create = async (name = "") => {
    try {
        await session.run("CREATE (a:Pet {name: $name})", {
            name,
        });
    } catch (err) {
        throw err;
    }
};

module.exports = () => ({
    _getAll,
    _create,
})