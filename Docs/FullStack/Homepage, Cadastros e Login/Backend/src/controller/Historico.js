import { pool } from "../database.js";

export const LoadMatchHistory = async (request, response, next) => {

    try {
        const user = request.params;

        const [reuniao] = await pool.query(
            `SELECT 
                r.idReuniao,
                r.idConsultor,
                c.nome, 
                c.urlImagemPerfil,
                r.tipo,
                r.data, 
                r.horario, 
                r.status_situacao, 
                r.avaliacao, 
                re.assunto, 
                re.solucoes, 
                re.infoSolicitada,
                r.avaliacao,
                r.comentario,
                r.link
            FROM 
                reuniao r
            INNER JOIN 
                consultor c ON r.idConsultor = c.idConsultor
            LEFT JOIN 
                registro re ON r.idReuniao = re.idReuniao
            WHERE
                r.idCliente = ?;`,
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


export const LoadHistory = async (request, response, next) => {

    try {
        const user = request.params;

        const [reuniao] = await pool.query(
            `SELECT 
                r.idReuniao,
                r.idCliente,
                r.infoAdiantada,
                c.nome, 
                c.urlImagemPerfil, 
                r.data, 
                r.horario, 
                r.status_situacao, 
                r.avaliacao, 
                re.assunto, 
                re.solucoes, 
                re.infoSolicitada,
                r.avaliacao,
                r.tipo,
                r.comentario,
                r.link
            FROM 
                reuniao r
            INNER JOIN 
                cliente c ON r.idCliente = c.idCliente
            LEFT JOIN 
                registro re ON r.idReuniao = re.idReuniao
            WHERE
                r.idConsultor = ?;`,
            [user.id]
        );

        if (reuniao.length === 0) {
            return response.status(201).json({
                success: false,
                message: "Não há consultas para o consultor"
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