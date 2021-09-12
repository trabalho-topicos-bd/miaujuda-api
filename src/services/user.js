const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const driver = require("../db");
const { serviceErrorHandler } = require("../utils/helpers");

const session = driver.session();

const _getAll = async () => {
    try {
        const result = await session.run("MATCH (u:User) RETURN u");

        const arr = result.records.map((el) => ({
            id: el._fields[0].identity.low,
            ...el._fields[0].properties,
        }));

        return arr;
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _getOne = async (values) => {
    try {
        const result = await session.run(
            `MATCH (u:User{email: $email}) RETURN u`,
            {
                email: values.email,
            }
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

        const compareResult = await bcrypt.compare(
            values.password,
            obj.password
        );

        if (!compareResult) {
            throw {
                status: 401,
                message: "Senha incorreta",
            };
        }

        const token = jwt.sign({ id: obj.id }, process.env.SECRET, {
            expiresIn: "1w",
        });

        return { token };
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _createOne = async (values) => {
    try {
        const obj = { ...values };

        obj.password = bcrypt.hashSync(values.password, 10);

        await session.run(
            `CREATE (:User {
            email: $email,
            password: $password
        })`,
            obj
        );
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

const _deleteAll = async () => {
    try {
        await session.run("MATCH (u:User) DELETE u");
    } catch (err) {
        throw serviceErrorHandler(err);
    }
};

module.exports = () => ({
    _getAll,
    _getOne,
    _createOne,
    _deleteAll,
});
