import { pool } from "../database.js";


export const RegistrarAgendamento = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo } = request.body;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO Reuniao (idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [idConsultor, idCliente, infoAdiantada, data,status_situacao, tipo, periodo]
        );

        await connection.commit();

        response.status(201).json({
            success: true,
            message: "Agendamento realizado com sucesso!"
        });


    } catch (error) {
        await connection.rollback();
        console.error('Erro no cadastro:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }

};


export const BuscarAgendamentos = async (request, response, next) => {
    
    const connection = await pool.getConnection();

    try {
        const { idConsultor } = request.params;

        const [agendamentos] = await connection.query(
            `SELECT idReuniao, idCliente, infoAdiantada, data, status_situacao, tipo, periodo 
             FROM Reuniao 
             WHERE idConsultor = ? 
             ORDER BY data, periodo;`, 
            [idConsultor]
        );

        if (agendamentos.length === 0) {
            return response.status(401).json({
                success: false,
                message: "Nenhum agendamento encontrado para este consultor."
            });
        }

        response.status(200).json({
            success: true,
            agendamentos
        });

    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    } finally {
        connection.release();
    }
};
