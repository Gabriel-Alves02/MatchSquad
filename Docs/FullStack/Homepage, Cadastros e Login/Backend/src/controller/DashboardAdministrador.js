import { pool } from "../database.js";

export const consultaQtdeUsuariosAtivos = async (request, response, next) => {

    try {

        const [qtdeUsuariosAtivos] = await pool.query(
            `SELECT count(*) FROM Cliente
            group by bloqueio
            having bloqueio = 0`
        )

        qtdeUsuariosAtivos += await pool.query(
            `SELECT count(*) FROM Consultor
            group by bloqueio
            having bloqueio = 0`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeUsuariosAtivos
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de usuários ativos:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaQtdeUsuariosInativos = async (request, response, next) => {

    try {

        const [qtdeUsuariosInativos] = await pool.query(
            `SELECT count(*) FROM Cliente
            group by bloqueio
            having bloqueio = 1`
        )

        qtdeUsuariosInativos += await pool.query(
            `SELECT count(*) FROM Consultor
            group by bloqueio
            having bloqueio = 1`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeUsuariosInativos
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de usuários inativos:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaQtdeUsuariosDenunciados = async (request, response, next) => {

    try {

        const [qtdeUsuariosDenunciados] = await pool.query(
            `SELECT count(*) FROM Cliente inner join Denuncia_cliente
            on Cliente.idCliente = Denuncia_Cliente.idCliente
            group by idCliente`
        )

        qtdeUsuariosDenunciados += await pool.query(
            `SELECT count(*) FROM Consultor inner join Denuncia_consultor
            on Consultor.idConsultor = Denuncia_consultor.idConsultor
            group by idConsultor`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeUsuariosDenunciados
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de usuários denunciados:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaQtdeConsultores = async (request, response, next) => {

    try {

        const [qtdeConsultores] = await pool.query(
            `SELECT count(*) FROM Consultores`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeConsultores
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de consultores', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaQtdeClientes = async (request, response, next) => {

    try {

        const [qtdeClientes] = await pool.query(
            `SELECT count(*) FROM Clientes`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeClientes
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de clientes', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const qtdeConsultoriasAgendadas = async (request, response, next) => {

    try {

        const [qtdeAgendadas] = await pool.query(
            `SELECT count(*) FROM Reuniao
            WHERE status = 'agendada' and month(data) = month(sysdate)`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeAgendadas
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de consultorias agendadas:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const qtdeConsultoriasCanceladas = async (request, response, next) => {

    try {

        const [qtdeAgendadas] = await pool.query(
            `SELECT count(*) FROM Reuniao
            WHERE status = 'cancelada' and month(data) = month(sysdate)`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeCanceladas
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de consultorias canceladas:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const qtdeConsultoriasConcluidas = async (request, response, next) => {

    try {

        const [qtdeAgendadas] = await pool.query(
            `SELECT count(*) FROM Reuniao
            WHERE status = 'concluida' and month(data) = month(sysdate)`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            qtdeConcluidas
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de consultorias concluidas:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaTopClientes = async (request, response, next) => {

    try {

        const [topConsultores] = await pool.query(
            `SELECT Consultor.nome, count(*) as qtdeConsultorias FROM Reuniao inner join Consultor
            on Reuniao.idConsultor = Cliente.idConsultor
            group by idConsultor
            order by qtdeConsultorias desc
            limit 5`
        )

        /*if (consultorias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }*/

        return response.status(200).json({
            success: true,
            topConsultores
        });

    } catch (error) {
        console.error('Erro ao buscar top cinco consultores com mais consultorias:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};