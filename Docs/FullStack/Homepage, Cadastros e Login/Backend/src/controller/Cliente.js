import { pool } from "../database.js";
import { gerarNum6digitos } from "./SysFx.js";

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

        const code = gerarNum6digitos();

        const [resultLogin] = await connection.query(
            `INSERT INTO Login (nickname, senha, codigoVerificacao, tipo) VALUES (?, ?, ?, ?);`,
            [nickname, senha, code, 1]
        );


        const [result] = await connection.query(
            `INSERT INTO Cliente 
            (nome, cpf_cnpj, email, telefone, idLogin) 
            VALUES (?, ?, ?, ?, ?);`,
            [nome, cpf_cnpj, email, telefone, resultLogin.insertId]
        );

        await connection.commit();

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

export const Reviewed = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const info = request.body;

        await connection.beginTransaction();

        const [alter] = await connection.query(`UPDATE reuniao SET avaliacao = ?, comentario = ? WHERE idReuniao = ?;`,
            [info.nota, info.comentario, info.idReuniao]);

        await connection.commit();

        if (alter.affectedRows > 0) {
            return response.status(200).json({
                success: true,
                message: "Avaliação feita com sucesso!"
            });
        }

        return response.status(201).json({
            success: false,
            message: "Sem sucesso em avaliar"
        });

    } catch (error) {
        return response.status(500).json({
            success: false,
            message: "Erro interno de servidor"
        });
    } finally {
        connection.release();
    }

};