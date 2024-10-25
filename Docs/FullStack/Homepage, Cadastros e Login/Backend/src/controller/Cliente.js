import { openDatabase } from "../database.js";

export const CadastrarCliente = async (request, response, next) => {

    const { nome, cpf_cnpj, email, telefone, nickname, senha } = request.body;

    const DB = await openDatabase();

    const clientes = await DB.all(`SELECT * FROM Cliente;`);

    const clienteRepetido = clientes.find(cliente => cliente.cpf_cnpj == cpf_cnpj);

    if (clienteRepetido) {
        DB.close();
        return response.status(400).send("Usuário já cadastrado!");
    }

    const addLogin = await DB.run(`INSERT INTO Login(nickname,senha) VALUES (?,?);`, [nickname, senha]);

    const addCliente = await DB.run(`INSERT INTO Cliente(nome,cpf_cnpj,email,telefone,idLogin) VALUES (?,?,?,?,?);`, [nome, cpf_cnpj, email, telefone, addLogin.lastID]);

    

    DB.close();

    response.status(200).send(`Cadastrado com sucesso! ${addCliente}`);

};
