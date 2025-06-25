import { info } from "console";
import { pool } from "../database.js";
import { EnviarCancelamentoAgendamento, EnviarConfirmacaoAgendamento } from "../service/sendgrid.js"


export const RegistrarAgendamento = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo, horario, link } = request.body;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO Reuniao (idConsultor, idCliente, infoAdiantada, data, status_situacao, tipo, periodo, horario, link) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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

export const AlterarAgendamento = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        const { idReuniao } = request.params;
        const { idCliente, idConsultor, infoAdiantada, data, status_situacao, tipo, periodo, link, horario } = request.body;

        await connection.beginTransaction();

        const [result] = await pool.query(
            `UPDATE Reuniao
             SET infoAdiantada = ?, data = ?, status_situacao = ?, tipo = ?, periodo = ?, horario = ?, link = ?
             WHERE idReuniao = ?`,
            [infoAdiantada, data, status_situacao, tipo, periodo, horario, link, idReuniao]
        );

        await connection.commit();

        if (result.affectedRows === 0) {
            return response.status(201).json({
                success: false,
                message: "Não foi possivel atualizar a reunião!"
            });
        }

        return response.status(200).json({
            success: true,
            message: "Reunião alterada."
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
            WHERE r.idConsultor = ? AND r.data >= CURRENT_DATE AND r.status_situacao IN ('pendente', 'confirmada');`,
            [idConsultor]
        );

        // Só carrega agendamento que: sejam do consultor logado, que sejam do dia atual ou futuro e que estejam pendentes.

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
            `SELECT idReuniao, infoAdiantada, data, status_situacao, tipo, periodo, horario, link
             FROM Reuniao
             WHERE idConsultor = ? AND idCliente = ?
             AND (status_situacao = 'pendente' OR status_situacao = 'confirmada');`,
            [idConsultor, idCliente]
        );


        if (agenda.length === 0) {
            return response.status(200).json({
                success: false,
                message: "Não tem agendamento repetido. Pode agendar!",
                agendamento: null
            });
        }

        return response.status(200).json({
            success: true,
            message: "Tem agendamento deste cliente para este consultor. Você pode editá-lo.",
            agendamento: agenda[0]
        });

    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const CancelaAgendamento = async (request, response) => {
    let connection;

    try {

        connection = await pool.getConnection();
        const { id } = request.params;

        if (!id) {
            return response.status(201).json({
                success: false,
                message: "ID da reunião não fornecido."
            });
        }

        await connection.beginTransaction();

        const [updateResult] = await connection.query(
            `UPDATE Reuniao SET status_situacao = 'cancelada' WHERE idReuniao = ?;`,
            [id]
        );

        if (updateResult.changedRows === 0) {
            await connection.rollback();
            return response.status(201).json({
                success: false,
                message: "Reunião não encontrada ou já estava cancelada."
            });
        }

        const [reuniaoDetalhes] = await connection.query(
            `SELECT
                r.data,
                r.infoAdiantada,
                co.email as emailConsultor,
                cli.email as emailCliente
            FROM Reuniao r
            INNER JOIN Consultor co ON co.idConsultor = r.idConsultor
            INNER JOIN Cliente cli ON cli.idCliente = r.idCliente
            WHERE r.idReuniao = ?;`,
            [id]
        );

        await connection.commit();

        if (reuniaoDetalhes.length > 0) {
            const { data, assunto, emailConsultor, emailCliente } = reuniaoDetalhes[0];

            const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
            const assuntoEmail = assunto || "Consultoria";

            await EnviarCancelamentoAgendamento([emailConsultor, emailCliente], assuntoEmail, dataFormatada);

        } else {
            console.warn(`Detalhes da reunião (ID: ${id}) não encontrados após cancelamento. E-mails de notificação não enviados.`);
        }

        return response.status(200).json({
            success: true,
            message: "Agendamento cancelado com sucesso e e-mails de notificação enviados."
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }
        console.error('Erro ao cancelar agendamento:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao cancelar agendamento."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const ConfirmaAgendamento = async (request, response) => {
    let connection;

    try {
        connection = await pool.getConnection();
        const { id } = request.params;
        const { type } = request.body;

        if (!id) {
            return response.status(400).json({
                success: false,
                message: "ID da reunião não fornecido."
            });
        }

        await connection.beginTransaction();

        let jitsiLink;

        if (type === 0) {
            jitsiLink = gerarUrlReuniao();
        }
        else {
            jitsiLink = null;
        }


        const [updateResult] = await connection.query(
            `UPDATE Reuniao SET status_situacao = 'confirmada', link = ? WHERE idReuniao = ?;`,
            [jitsiLink, id]
        );

        if (updateResult.changedRows === 0) {
            await connection.rollback();
            return response.status(404).json({
                success: false,
                message: "Reunião não encontrada ou já estava confirmada."
            });
        }

        const [reuniaoDetalhes] = await connection.query(
            `SELECT
                r.data,
                r.horario,
                r.link,
                co.nome AS nomeConsultor,
                co.email AS emailConsultor,
                cli.nome AS nomeCliente,
                cli.email AS emailCliente
            FROM Reuniao r
            INNER JOIN Consultor co ON co.idConsultor = r.idConsultor
            INNER JOIN Cliente cli ON cli.idCliente = r.idCliente
            WHERE r.idReuniao = ?;`,
            [id]
        );

        await connection.commit();

        if (reuniaoDetalhes.length > 0) {
            const {
                data,
                horario,
                link,
                nomeConsultor,
                emailConsultor,
                nomeCliente,
                emailCliente,
            } = reuniaoDetalhes[0];

            const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
            const horarioFormatado = horario ? horario.substring(0, 5) : '';
            const assuntoEmail = "Consultoria";


            await EnviarConfirmacaoAgendamento(
                [emailConsultor, emailCliente],
                assuntoEmail,
                dataFormatada,
                horarioFormatado,
                nomeConsultor,
                nomeCliente,
                link
            );

        } else {
            console.warn(`Detalhes da reunião (ID: ${id}) não encontrados após confirmação. E-mails de notificação não enviados.`);
        }

        return response.status(200).json({
            success: true,
            message: "Agendamento confirmado com sucesso e e-mails de notificação enviados.",
            jitsiLink: jitsiLink
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Erro ao confirmar agendamento:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao confirmar agendamento."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const AtualizaData = async (novaData, novoHorario, idReuniao) => {

    const connection = await pool.getConnection();

    let periodo = 'manha';

    try {

        await connection.beginTransaction();

        const infoData = new Date(`${novaData}T${novoHorario}:00`);

        console.log('infoData', infoData, 'tipo data: ', typeof infoData);

        if (infoData.getHours() > 12) {
            console.log('entrou no if');
            periodo = 'tarde';
        }

        const [result] = await connection.query(
            `UPDATE Reuniao SET status_situacao = 'pendente', data = ?, horario = ?, periodo = ? WHERE idReuniao = ?;`,
            [novaData, novoHorario, periodo, idReuniao]
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

export const ConcluiAgendamento = async (req, res, next) => {

    const connection = await pool.getConnection();

    try {

        const info = req.params;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `UPDATE Reuniao SET status_situacao = 'concluida' WHERE idReuniao = ?;`,
            [info.idReuniao]
        );

        await connection.commit();

        if (result.changedRows > 0) {

            return res.status(200).json({
                success: true,
                message: "Confirmado com sucesso!"
            });
        }

        return res.status(201).json({
            success: false,
            message: "Não encontrado a Reunião!"
        });

    } catch (error) {
        console.error('Erro ao buscar agendamentos na tabela de reunião:', error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });

    } finally {
        connection.release();
    }
};

function gerarUrlReuniao() {
    let sufixoUrl = Math.random().toString(36).substring(2, 10);
    sufixoUrl = "consultoria_" + sufixoUrl;

    const baseUrl = 'https://8x8.vc/vpaas-magic-cookie-6b44b110cace40f8a723c05a52aa3bc8/';

    const urlSala = baseUrl + sufixoUrl;

    return urlSala;
}