import { pool } from "../database.js";


export const RegistrarPedido = async (request, response, next) => {

    const connection = await pool.getConnection();

   try{
        console.log(request.body);

    } catch (error) {
        await connection.rollback();
        console.error('Erro no cadastro:', error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }

};