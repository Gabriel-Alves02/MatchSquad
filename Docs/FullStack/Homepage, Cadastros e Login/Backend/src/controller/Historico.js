import { pool } from "../database.js";

export const LoadMatchHistory = async (request, response, next) => {

    try {
        const user = request.params;

        const [reuniao] = await pool.query(
            `SELECT 
                c.nome, 
                c.urlImagemPerfil, 
                r.data, 
                r.horario, 
                r.status_situacao, 
                r.avaliacao, 
                re.assunto, 
                re.solucoes, 
                re.infoSolicitada
            FROM 
                consultor c
            INNER JOIN 
                reuniao r ON c.idConsultor = r.idConsultor
            INNER JOIN 
                registro re ON r.idReuniao = re.idReuniao;`,
            [user.id]
        );

        if (reuniao.length === 0) {
            return response.status(201).json({
                success: false,
                message: "Não há matches para o cliente"
            });
        }

        return response.status(200).json({
            success: true,
            reuniao
        });

    } catch (error) {
        console.error('Erro ao buscar matches:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};