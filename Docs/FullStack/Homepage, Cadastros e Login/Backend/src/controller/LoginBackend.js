import { pool } from "../database.js";

export const Login = async (request, response, next) => {

    try 
    {
        const { nickname, senha } = request.body;

        const [cliente] = await pool.query(`SELECT * FROM Login WHERE nickname = ? AND senha = ?`, [nickname, senha]);

        if (cliente.length > 0) {
            return response.status(200).json({
                success: true,
                message: "Login autorizado",
                user: cliente[0]
            });
        }

        return response.status(401).json({
            success: false,
            message: "Credenciais inválidas"
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }

};