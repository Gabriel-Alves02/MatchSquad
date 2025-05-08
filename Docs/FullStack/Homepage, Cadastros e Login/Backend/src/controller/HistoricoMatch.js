import { pool } from "../database.js";

export const ConsultarHistoricoMatch = async (request, response, next) => {

    try {
        const { nomeConsultor } = request.params;

        const [idConsultor] = await pool.query(
            `SELECT idConsultor FROM Consultor
            WHERE nome = ?`,
            [nomeConsultor]
        )

        const [matches] = await pool.query(
            `SELECT Consultor.nome, Reuniao.horario, Reuniao.data, Reuniao.horario, Reuniao.status, Reuniao.avaliacao
            FROM Reuniao inner join Consultor
            on Reuniao.idConsultor = Consultor.idConsultor
            WHERE Reuniao.idConsultor = ?`,
            [idConsultor]
        );

        if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }

        return response.status(200).json({
            success: true,
            matches
        });

    } catch (error) {
        console.error('Erro ao buscar matches:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};