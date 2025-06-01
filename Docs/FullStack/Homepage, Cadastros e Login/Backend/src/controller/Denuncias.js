import { pool } from "../database.js";

export const GetComplaints = async (request, response, next) => {

    try {

        const [complain] = await pool.query(
            `   SELECT 
                    d.*, 
                    c.nome AS nome_cliente,
                    c.email AS email_cliente,
                    cs.nome AS nome_consultor,
                    cs.email AS email_consultor
                FROM
                    denuncia d
                INNER JOIN 
                    cliente c ON d.idCliente = c.idCliente
                INNER JOIN 
                    consultor cs ON d.idConsultor = cs.idConsultor;`,
        );

        if (complain.length === 0) {
            return response.status(201).json({
                success: false,
                message: "Nenhuma denuncia registrada."
            });
        }

        return response.status(200).json({
            success: true,
            complain
        });

    } catch (error) {
        console.error('Erro ao buscar denuncias:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const ChangeReportStatus = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        const denuncia = request.params;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `UPDATE denuncia SET status = ? WHERE idDenuncia = ?;`,
            ['em analise', denuncia.idDenuncia]
        );

        await connection.commit();

        if (result.changedRows > 0) {

            return response.status(200).json({
                success: true,
                message: "Alterado com sucesso!"
            });
        }

        return response.status(201).json({
            success: true,
            message: "Não encontrado a denuncia!"
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

export const EndReport = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        const { opt } = request.params;
        const denuncia = request.body;

        await connection.beginTransaction();

        if (opt === '0') {
            const [result] = await connection.query(
                `UPDATE denuncia SET status = ?, obs = ? WHERE idDenuncia = ?;`,
                ['resolvido', denuncia.obs, denuncia.idDenuncia]
            );

            await connection.commit();

            if (result.changedRows > 0) {
                return response.status(200).json({
                    success: true,
                    message: "Denuncia alterada para status resolvido. Não banido!"
                });
            }
        }

        else if (opt === '1') {

            const [result] = await connection.query(
                `UPDATE denuncia SET status = ?, obs = ? WHERE idDenuncia = ?;`,
                ['resolvido', denuncia.obs, denuncia.idDenuncia]
            );

            if (result.changedRows > 0) {

                const [denunciaDetails] = await connection.query(
                    `SELECT sentido, idCliente, idConsultor FROM denuncia WHERE idDenuncia = ?;`,
                    [denuncia.idDenuncia]
                );

                if (denunciaDetails.length > 0) {

                    const { sentido, idCliente, idConsultor } = denunciaDetails[0];

                    if (sentido === 0) {
                        const [reportado] = await connection.query(
                            `UPDATE cliente SET dataBan = ?, obs = ?, bloqueio = ? WHERE idCliente = ?;`,
                            [(denuncia.data.substring(0, 10)), ('Banido. Admin msg: ' + denuncia.obs), '-1', idCliente]
                        );

                        if (reportado.changedRows > 0) {
                            await connection.commit();
                            return response.status(200).json({
                                success: true,
                                message: "Denúncia atualizada para resolvida e cliente banido."
                            });
                        }

                    } else if (sentido === 1) {
                        const [reportado] = await connection.query(
                            `UPDATE consultor SET dataBan = ?, obs = ?, bloqueio = ? WHERE idConsultor = ?;`,
                            [(denuncia.data.substring(0, 10)), ('Banido. Admin msg: ' + denuncia.obs), '-1', idConsultor]
                        );


                        if (reportado.changedRows > 0) {
                            await connection.commit();
                            return response.status(200).json({
                                success: true,
                                message: "Denúncia atualizada para resolvida e consultor banido."
                            });
                        }
                    }
                }
            }
        }

        return response.status(201).json({
            success: false,
            message: "Nenhuma alteração feita nas denuncias!"
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao encerrar denúncia:', error);

        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor."
        });

    } finally {
        connection.release();
    }
};
