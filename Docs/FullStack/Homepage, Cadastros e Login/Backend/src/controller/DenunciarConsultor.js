import { pool } from "../database.js";


export const DenunciarConsultor = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idConsultor, idCliente, descricao } = request.body;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO Denuncia_consultor (idConsultor, idCliente, descricao) 
        VALUES (?, ?, ?);`,
            [idConsultor, idCliente, descricao]
        );

        await connection.commit();

        return response.status(201).json({
            success: true,
            message: "Denúncia realizada com sucesso!"
        });


    } catch (error) {
        await connection.rollback();
        console.error('Erro na denúncia:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }

};
