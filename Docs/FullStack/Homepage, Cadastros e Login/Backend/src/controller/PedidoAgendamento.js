import { pool } from "../database.js";


export const RegistrarAgendamento = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo } = request.body;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO Reuniao (idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo]
        );

        await connection.commit();

        return response.status(201).json({
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


export const BuscarAgenda = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        const { idConsultor } = request.params;

        const [agendamentos] = await connection.query(
            `SELECT r.idReuniao, r.idCliente, c.email AS emailCliente, r.idConsultor, con.email AS emailConsultor, 
            r.infoAdiantada, r.data, r.status_situacao, r.tipo, r.periodo, r.horario
            FROM Reuniao r JOIN Cliente c 
            ON r.idCliente = c.idCliente
            JOIN Consultor con ON r.idConsultor = con.idConsultor
            WHERE r.idConsultor = ? AND r.data >= CURRENT_DATE;`,
            [idConsultor]
        );

        // AO ACERTAR O MECANISMO, SERA REFINADO O SQL PARA "ORDER BY data, periodo"

        if (agendamentos.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum agendamento encontrado para este consultor."
            });
        }

        return response.status(200).json({
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


export const AgendamentoRepetido = async (request, response, next) => {
    const connection = await pool.getConnection();
    try {
        const { idCliente, idConsultor } = request.params;

        const [agenda] = await connection.query(
            `SELECT idReuniao FROM Reuniao WHERE idConsultor = ? AND idCliente = ?;`,
            [idConsultor, idCliente]
        );

        if (agenda.length === 0) {
            return response.status(200).json({
                success: false,
                message: "Não tem agendamento repetido. Pode agendar!"
            });
        }

        return response.status(409).json({
            success: true,
            message: "Tem agendamento deste cliente para este consultor. Não pode agendar!"
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