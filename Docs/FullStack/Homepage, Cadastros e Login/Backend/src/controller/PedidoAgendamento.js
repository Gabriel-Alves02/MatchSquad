import { pool } from "../database.js";
import { EnviarCancelamentoAgendamento } from "../service/sendgrid.js"


export const RegistrarAgendamento = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo, horario } = request.body;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO Reuniao (idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo, horario) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo, horario, link]
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

    try {
        const { idConsultor } = request.params;

        const [agendamentos] = await pool.query(
            `SELECT r.idReuniao, r.idCliente, c.email AS emailCliente, r.idConsultor, con.email AS emailConsultor, 
            r.infoAdiantada, r.data, r.status_situacao, r.tipo, r.periodo, r.horario
            FROM Reuniao r JOIN Cliente c 
            ON r.idCliente = c.idCliente
            JOIN Consultor con ON r.idConsultor = con.idConsultor
            WHERE r.idConsultor = ? AND r.data >= CURRENT_DATE AND r.status_situacao = 'pendente';`,
            [idConsultor]
        );

        // Só carrega agendamento que: sejam do consultor logado, que sejam do dia atual ou futuro e que estejam pendentes.

        // AO ACERTAR O MECANISMO, SERA REFINADO O SQL PARA "ORDER BY data, periodo"

        if (agendamentos.length === 0) {
            return response.status(201).json({
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
    }
};

export const BuscarSolicitacoes = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [agendamentos] = await pool.query(
            `SELECT r.idReuniao, r.idCliente, c.nome, c.email AS emailCliente, 
            r.infoAdiantada, r.data, r.status_situacao, r.tipo, r.periodo, r.horario
            FROM Reuniao r JOIN Cliente c ON r.idCliente = c.idCliente
            WHERE r.idConsultor = ?;`,
            [idConsultor]
        );

        if (agendamentos.length === 0) {
            return response.status(201).json({
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
    }
};


export const AgendamentoRepetido = async (request, response, next) => {

    try {
        const { idCliente, idConsultor } = request.params;

        const [agenda] = await pool.query(
            `SELECT idReuniao FROM Reuniao WHERE idConsultor = ? AND idCliente = ? AND  data >= CURRENT_DATE;`,
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

    }
};

export const CancelaAgendamento = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        const reuniao = request.params;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `UPDATE Reuniao SET status_situacao = ? WHERE idReuniao = ?;`,
            ['cancelada', reuniao.id]
        );

        await connection.commit();

        if (result.changedRows > 0) {

            const [info] = await pool.query(`UPDATE Reuniao SET status_situacao = ? WHERE idReuniao = ?;`,
                [reuniao.id])

            //EnviarCancelamentoAgendamento(email,assunto,data)

            return response.status(200).json({
                success: true,
                message: "Cancelado com sucesso!"
            });
        }

        return response.status(200).json({
            success: true,
            message: "Não encontrado a Reunião!" //id passado foi invalido
        });

    } catch (error) {
        console.error('Erro ao buscar agendamentos na tabela de reunião:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });

    } finally {
        connection.release();
    }
};

export const AtualizaData = async (novaData, novoHorario, id) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const [result] = await connection.query(
            `UPDATE Reuniao SET status_situacao = ?, data = ?, horario = ? WHERE idReuniao = ?;`,
            ['pendente', novaData, novoHorario, id]
        );

        await connection.commit();

        if (result.changedRows > 0) {
            console.log('Alterado com sucesso!')
            return;
        }

        console.log('Não houve alteração em data e horario do agendamento');
        return;

    } catch (error) {
        console.error('Erro ao buscar agendamentos na tabela de reunião:', error);
        await connection.rollback();
        return;

    } finally {
        connection.release();
    }
};