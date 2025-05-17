import { pool } from "../database.js";

export const RegistrarReuniao = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { cliente, data, assunto, solucoes, infoSolicitada } = request.body;

        if (!cliente || !data || !assunto || !solucoes || !infoSolicitada) {
            return response.status(400).json({
                success: false,
                message: "Todos os campos são obrigatórios"
            });
        }

        await connection.beginTransaction();

        const [idCliente] = await connection.query(
            `SELECT idCliente FROM Cliente WHERE nome = ?;`,
            [cliente]
        );

        const [idReuniao] = await connection.query(
            `SELECT idReuniao FROM Reuniao WHERE idCliente = ? and data = ?;`,
            [idCliente, data]
        );

        const [resultRegistro] = await connection.query(
            `INSERT INTO Registro (assunto, solucoes, infoSolicitada, idReuniao) VALUES (?, ?, ?, ?, ?);`,
            [assunto, solucoes, infoSolicitada, idReuniao]
        );

        await connection.commit();

        response.status(201).json({
            success: true,
            id: result.insertId,
            message: "Registro realizado com sucesso"
        });

    } catch (error) {
        console.error('Erro no registro da reunião:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }

};

export const obterClientesData = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idConsultor } = request.body;

        await connection.beginTransaction();

        const [clientes] = await connection.query(
            `SELECT Cliente.nome Reuniao.data FROM Cliente INNER JOIN Reuniao
            ON Cliente.idCliente = Reuniao.idCliente
            LEFT JOIN Registro
            ON Reuniao.idReuniao = Registro.idReuniao
            WHERE Reuniao.idConsultor = ? and Registro.idReuniao is null;`,
            [idConsultor]
        );

        if (clientes.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum cliente encontrado."
            });
        }

        return response.status(200).json({
            success: true,
            clientes
        });

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }

};