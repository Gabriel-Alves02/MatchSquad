import { pool } from "../database.js";

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
            [nome, cpf_cnpj, email, telefone,  resultLogin.insertId]
        );

        await connection.commit();

        response.status(201).json({
            success: true,
            id: result.insertId,
            message: "Cadastro realizado com sucesso"
        });

    } catch (error) {
        console.error('Erro no cadastro do cliente:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }finally {
        connection.release();
    }

};