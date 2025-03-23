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

export const UserType = async (request, response, next) => {

    try 
    {
        const { nickname } = request.body;


        const [user] = await pool.query(`SELECT * FROM Login WHERE nickname = ?`, [nickname]);

        if (user.length > 0) {

            const [cliente] = await pool.query(`SELECT idCliente FROM Cliente WHERE idLogin = ?`, [user[0].idLogin]);

            const [consultor] = await pool.query(`SELECT idConsultor FROM Consultor WHERE idLogin = ?`, [user[0].idLogin]);


            //RETORNA 1 CASO CLIENTE E 0 CASO CONSULTOR

            if (cliente.length > 0) {
                return response.status(200).json({
                    success: true,
                    message: "1",
                    user: cliente[0]
                });
            }

            if (consultor.length > 0) {
                return response.status(200).json({
                    success: true,
                    message: "0",
                    user: consultor[0]
                });
            }

            return response.status(401).json({
                success: false,
                message: "Não tem nem cliente e nem consultor com o nickname informado!"
            });
        }

        return response.status(401).json({
            success: false,
            message: "Não existe este login"
        });


    } catch (error) {
        console.error('Erro:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }

};