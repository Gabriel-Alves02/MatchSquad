import { openDatabase } from "../database.js";

export const Login = async (request, response, next) => {

    const { nickname, senha } = request.body;

    const DB = await openDatabase();

    const cliente = await DB.get(`SELECT * FROM Login WHERE nickname = ? AND senha = ?;`, [nickname, senha]);

    if (cliente) {
        response.status(200).send("Login autorizado");
        return;
    }

    DB.close();

    response.status(400).send('Login Negado');

};