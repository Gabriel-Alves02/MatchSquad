import { pool } from "../database.js";

export const GetComplaints = async (request, response, next) => {

    try {

        const [complain] = await pool.query(
            `   SELECT 
                    d.*, 
                    c.nome AS nome_cliente,
                    c.email AS email_cliente,
                    cs.nome AS nome_consultor,
                    cs.email AS email_consultor
                FROM
                    denuncia d
                INNER JOIN 
                    cliente c ON d.idCliente = c.idCliente
                INNER JOIN 
                    consultor cs ON d.idConsultor = cs.idConsultor;`,
        );

        if (complain.length === 0) {
            return response.status(201).json({
                success: false,
                message: "Nenhuma denuncia registrada."
            });
        }

        return response.status(200).json({
            success: true,
            complain
        });

    } catch (error) {
        console.error('Erro ao buscar denuncias:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};