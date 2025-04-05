import { pool } from "../database.js";
//import { enviarParaBlob } from "../azureBlob.js";

export const CadastrarCliente = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { nome, cpf_cnpj, email, telefone, nickname, senha } = request.body;

        if (!nome || !cpf_cnpj || !email || !telefone || !nickname || !senha) {
            return response.status(400).json({
                success: false,
                message: "Todos os campos são obrigatórios"
            });
        }

        await connection.beginTransaction();

        const [clienteExistente] = await connection.query(
            `SELECT idCliente FROM Cliente WHERE cpf_cnpj = ?;`,
            [cpf_cnpj]
        );

        if (clienteExistente.length > 0) {
            await connection.rollback();
            return response.status(409).json({
                success: false,
                message: "CPF/CNPJ já cadastrado"
            });
        }

        const [resultLogin] = await connection.query(
            `INSERT INTO Login (nickname, senha) VALUES (?, ?);`,
            [nickname, senha]
        );


        const [result] = await connection.query(
            `INSERT INTO Cliente 
            (nome, cpf_cnpj, email, telefone, idLogin) 
            VALUES (?, ?, ?, ?, ?);`,
            [nome, cpf_cnpj, email, telefone, resultLogin.insertId]
        );

        await connection.commit();

        // // Criar um objeto JSON com os dados do cliente e A IMAGEM DE PERFIL
        // const dadosCliente = {
        //     id: result.insertId,
        //     nome
        // };

        // // Criar um nome único para o arquivo (ex: cliente_123.json)
        // const nomeArquivo = `cliente_${result.insertId}_imagem.json`;

        // // Enviar os dados para o Azure Blob Storage
        // await enviarParaBlob(dadosCliente, nomeArquivo);

        response.status(201).json({
            success: true,
            id: result.insertId,
            message: "Cadastro realizado com sucesso, e imagem no repositorio como blob"
        });

    } catch (error) {
        console.error('Erro no cadastro do cliente:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }

};


export const GetClienteName = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        
        const cliente  = request.params;

        await connection.beginTransaction();

        const [clienteExiste] = await connection.query(
            `SELECT nome FROM Cliente WHERE idCliente = ?;`, [cliente.idCliente]
        );

        if (clienteExiste.length > 0) {
            return response.status(200).json({
                success: true,
                message: clienteExiste[0].nome
            });
        }

        response.status(409).json({
            success: false,
            message: "Sem nome para este id."
        });

    } catch (error) {
        console.error('Erro na procura do cliente >', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }

};
