import { pool } from "../database.js";
import { gerarNum6digitos } from "./SysFx.js";


export const CadastrarConsultor = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        let {
            nome,
            cpf,
            email,
            telefone,
            nickname,
            senha,
            habilidades,
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            modalidade
        } = request.body;

        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) {
            return response.status(201).json({
                success: false,
                message: "CPF inválido. Deve conter 11 dígitos numéricos."
            });
        }

        if (!nome || !cpf || !email || !telefone || !nickname || !senha || !habilidades || !modalidade) {
            return response.status(201).json({
                success: false,
                message: "Campos obrigatórios gerais (nome, cpf, email, telefone, nickname, senha, habilidades, modalidade) não preenchidos."
            });
        }

        if (modalidade === 'presencial' || modalidade === 'presencial_e_online') {
            if (!cep || !endereco || !numero || !bairro || !cidade) {
                return response.status(201).json({
                    success: false,
                    message: "Para modalidades 'presencial' ou 'presencial_e_online', os campos de endereço (CEP, Endereço, Número, Bairro, Cidade) são obrigatórios."
                });
            }

            cep = cep.replace(/\D/g, '');
            if (cep.length !== 8) {
                return response.status(201).json({
                    success: false,
                    message: "CEP inválido. Deve conter 8 dígitos numéricos."
                });
            }
        }

        await connection.beginTransaction();

        const [consultorExistente] = await connection.query(
            `SELECT idConsultor FROM Consultor WHERE cpf = ?;`, [cpf]
        );

        if (consultorExistente.length > 0) {
            await connection.rollback();
            return response.status(409).json({
                success: false,
                message: "CPF já cadastrado."
            });
        }

        const code = gerarNum6digitos();

        const [resultLogin] = await connection.query(
            `INSERT INTO Login (nickname, senha, codigoVerificacao, tipo) VALUES (?, ?, ?, ?);`,
            [nickname, senha, code, 0]
        );

        const valorBloqueio = 1;

        const valoresConsultor = [
            nome,
            cpf,
            email,
            telefone,
            resultLogin.insertId,
            modalidade,
            (modalidade === 'presencial' || modalidade === 'presencial_e_online') ? cep : null,
            (modalidade === 'presencial' || modalidade === 'presencial_e_online') ? endereco : null,
            (modalidade === 'presencial' || modalidade === 'presencial_e_online') ? numero : null,
            (modalidade === 'presencial' || modalidade === 'presencial_e_online') ? bairro : null,
            (modalidade === 'presencial' || modalidade === 'presencial_e_online') ? complemento : null,
            (modalidade === 'presencial' || modalidade === 'presencial_e_online') ? cidade : null,
            valorBloqueio
        ];

        const [consultorResult] = await connection.query(
            `INSERT INTO Consultor
             (nome, cpf, email, telefone, idLogin, modalidadeTrab, cep, endereco, numeroCasa, bairro, complemento, cidade, bloqueio)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            valoresConsultor
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

        return response.status(200).json({
            success: true,
            id: consultorResult.insertId,
            message: "Cadastro realizado com sucesso"
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro no cadastro do consultor:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao cadastrar consultor."
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


export const GetHabConsultor = async (request, response, next) => {

    const { id } = request.params;

    try {

        const [habilidades] = await pool.query(
            `SELECT 
                GROUP_CONCAT(h.nomeHabilidade SEPARATOR ', ') AS habilidades 
            FROM
                habilidade as h 
            INNER JOIN
                consultor_habilidades as ch
            ON 
                h.idHabilidade = ch.idHabilidade 
            WHERE
                ch.idConsultor = ?;`, [id]
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

export const ConsultarMediaConsultor = async (request, response, next) => {

    try {

        const { id } = request.params;

        const [consultor] = await pool.query
            (
                `SELECT 
                    AVG(avaliacao) as media
                FROM 
                    Reuniao
                GROUP BY
                    idConsultor
                HAVING
                    idConsultor = ?;
                `, [id]
            );

        if (consultor) {
            return response.status(200).json
                ({
                    success: true,
                    consultor
                });
        }


        return response.status(201).json({
            success: true,
            message: "Media não encontrada."
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};