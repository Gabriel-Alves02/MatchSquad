import { pool } from "../database.js";


export const CadastrarConsultor = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { nome, cpf, email, telefone, nickname, senha, habilidades } = request.body;

        if (!nome || !cpf || !email || !telefone || !nickname || !senha || !habilidades) {
            return response.status(400).json({
                success: false,
                message: "Todos os campos são obrigatórios"
            });
        }

        await connection.beginTransaction();

        const [consultorExistente] = await connection.query(
            `SELECT idConsultor FROM Consultor WHERE cpf = ?;`, [cpf]
        );

        if (consultorExistente.length > 0) {
            await connection.rollback();
            return response.status(409).json({
                success: false,
                message: "CPF já cadastrado"
            });
        }

        const [resultLogin] = await connection.query(
            `INSERT INTO Login (nickname, senha) VALUES (?, ?);`,
            [nickname, senha]
        );


        const [consultorResult] = await connection.query(
            `INSERT INTO Consultor 
            (nome, cpf, email, telefone, idLogin) 
            VALUES (?, ?, ?, ?, ?);`,
            [nome, cpf, email, telefone, resultLogin.insertId]
        );

        const insertHabilidades = habilidades.map(async (idHabilidade) => {
            await connection.query(
                `INSERT INTO Consultor_Habilidades 
                (idConsultor, idHabilidade) 
                VALUES (?, ?)`,
                [consultorResult.insertId, Number(idHabilidade)]
            );
        });

        await Promise.all(insertHabilidades);
        await connection.commit();

        return response.status(201).json({
            success: true,
            id: consultorResult.insertId,
            message: "Cadastro realizado com sucesso"
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


export const GetHabilidades = async (request, response, next) => {

    try {

        const [habilidades] = await pool.query(
            `SELECT * FROM habilidade;`,
        );

        if (habilidades.length > 0) {
            return response.status(200).json({
                success: true,
                habilidades
            });
        }

        return response.status(201).json({
            success: false,
            message: "Sem habilidades resgatadas do banco"
        });

    } catch (error) {
        console.error('Erro ao buscar habilidades:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });

    }
};

export const RecordMeetLog = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {

        const { idReuniao, assunto, solucoes, infoSolicitada } = request.body;

        if (!idReuniao || !assunto || !solucoes || !infoSolicitada) {
            return response.status(400).json({
                success: false,
                message: "Todos os campos são obrigatórios: idReuniao, assunto, solucoes, infoSolicitada."
            });
        }

        await connection.beginTransaction();

        const [meet] = await connection.query(
            `SELECT idConsultor, idCliente FROM Reuniao WHERE idReuniao = ?;`, [idReuniao]
        );

        if (meet.length === 0) {
            await connection.rollback();
            return response.status(404).json({
                success: false,
                message: "Reunião não encontrada no sistema."
            });
        }

        const [existingRecord] = await connection.query(
            `SELECT idReuniao FROM registro WHERE idReuniao = ?;`, [idReuniao]
        );

        if (existingRecord.length > 0) {
            await connection.rollback();
            return response.status(409).json({
                success: false,
                message: "Um registro para esta reunião já existe."
            });
        }

        const [recordResult] = await connection.query(
            `INSERT INTO registro (idReuniao, assunto, solucoes, infoSolicitada) VALUES (?, ?, ?, ?);`,
            [idReuniao, assunto, solucoes, infoSolicitada]
        );

        await connection.commit();

        if (recordResult.affectedRows > 0) {
            return response.status(201).json({
                success: true,
                message: "Registro da reunião adicionado com sucesso."
            });
        } else {
            await connection.rollback();
            return response.status(500).json({
                success: false,
                message: "Falha ao adicionar o registro da reunião por motivo desconhecido."
            });
        }

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao registrar reunião:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return response.status(409).json({
                success: false,
                message: "Um registro para esta reunião já existe."
            });
        }
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao processar o registro da reunião."
        });
    } finally {
        connection.release();
    }
};