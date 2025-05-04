import { pool } from "../database.js";

export const ConsultarHistorico = async (request, response, next) => {

    try {
        const { nomeCliente } = request.params;

        const [idCliente] = await pool.query(
            `SELECT idCliente FROM Cliente
            WHERE nome = ?`,
            [nomeCliente]
        )

        const [consultorias] = await pool.query(
            `SELECT Cliente.nome, Reuniao.horario, Reuniao.data, Reuniao.horario, Reuniao.status, Reuniao.avaliacao
            FROM Reuniao inner join Cliente
            on Reuniao.idCliente = Cliente.idCliente
            WHERE Reuniao.idCliente = ?`,
            [idCliente]
        );

        if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhuma consultoria encontrada para este cliente."
            });
        }

        return response.status(200).json({
            success: true,
            consultorias
        });

    } catch (error) {
        console.error('Erro ao buscar consultorias:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};