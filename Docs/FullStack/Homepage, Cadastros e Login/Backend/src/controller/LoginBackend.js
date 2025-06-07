import { pool } from "../database.js";

export const Login = async (request, response, next) => {

    try {
        const { nickname, senha } = request.body;


        const [usuario] = await pool.query(`SELECT * FROM Login WHERE nickname = ? AND senha = ?`, [nickname, senha]);

        if (usuario.length > 0) {
            return response.status(200).json({
                success: true,
                message: "Login autorizado",
                user: usuario[0]
            });
        }

        return response.status(201).json({
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

export const UserType = async (request, response, next) => {

    try {

        const { nickname } = request.body;

        const [user] = await pool.query(`SELECT tipo, idLogin FROM Login WHERE nickname = ?`, [nickname]);

        if (user.length === 0) {
            return response.status(201).json({
                success: false,
                message: "-1"
            });
        }


        if (user[0].tipo === 0) {

            const [consultor] = await pool.query(`SELECT idConsultor FROM consultor WHERE idLogin = ?`, [user[0].idLogin]);

            return response.status(200).json({
                success: true,
                message: "0",
                user: consultor[0].idConsultor
            });
        }

        if (user[0].tipo === 1) {
            const [cliente] = await pool.query(`SELECT idCliente FROM cliente WHERE idLogin = ?`, [user[0].idLogin]);

            return response.status(200).json({
                success: true,
                message: "1",
                user: cliente[0].idCliente
            });
        }

        if (user[0].tipo === 3) {
            return response.status(200).json({
                success: true,
                message: "3",
            });
        }


    } catch (error) {
        console.error('Erro:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }

};