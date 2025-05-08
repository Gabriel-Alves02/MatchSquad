import { pool } from "../database.js";

export const consultaQtdeUsuariosAtivos = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [qtdeUsuariosAtivos] = await pool.query(
            `SELECT count(*) FROM Cliente
            group by bloqueio
            having bloqueio = 0`
        )

        qtdeUsuariosAtivos += await pool.query(
            `SELECT count(*) FROM Consultor
            group by bloqueio
            having bloqueio = 0`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeUsuariosAtivos
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de usuários ativos:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};