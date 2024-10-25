import { openDatabase } from "../database.js";


export const CadastrarConsultor = async (request, response, next) => {

    const { nome, cpf, email, telefone, nickname, senha, habilidades } = request.body;

    const DB = await openDatabase();

    const consultores = await DB.all(`SELECT * FROM Consultor;`);

    const consultorRepetido = consultores.find(consultor => consultor.cpf == cpf);

    if (consultorRepetido) {
        DB.close();
        return response.status(400).send("Usuário já cadastrado!");
    }

    const addLogin = await DB.run(`INSERT INTO Login(nickname,senha) VALUES (?,?);`, [nickname, senha]);

    const addConsultor = await DB.run(`INSERT INTO Consultor(nome,cpf,email,telefone,idLogin) VALUES (?,?,?,?,?);`, [nome, cpf, email, telefone,addLogin.lastID]);
    
    for (const element of habilidades) {
        await DB.run(`INSERT INTO Consultor_Habilidades (idConsultor,idHabilidade) VALUES (?, ?);`, [addConsultor.lastID,element]);
    }

    DB.close();

    response.status(200).send("Cadastrado com sucesso!");

};