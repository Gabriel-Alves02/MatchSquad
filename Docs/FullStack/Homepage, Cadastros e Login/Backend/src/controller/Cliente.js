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

    response.status(400).send('Não cadastrado');

};

export const CadastrarCliente = async (request, response, next) => {

    const { nome, cpf_cnpj, email, telefone, nickname, senha } = request.body;

    const DB = await openDatabase();

    const clientes = await DB.all(`SELECT * FROM Cliente;`);

    const clienteRepetido = clientes.find(cliente => cliente.cpf_cnpj == cpf_cnpj);

    if (clienteRepetido) {
        DB.close();
        return response.status(400).send("Usuário já cadastrado!");
    }

    const addCliente = await DB.run(`INSERT INTO Cliente(nome,cpf_cnpj,email,telefone) VALUES (?,?,?,?);`, [nome, cpf_cnpj, email, telefone]);

    const addLogin = await DB.run(`INSERT INTO Login(nickname,senha,idCliente) VALUES (?,?,?);`, [nickname, senha, addCliente.lastID]);

    DB.close();

    response.status(200).send("Cadastrado com sucesso!");

};