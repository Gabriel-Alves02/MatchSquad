import { pool } from "../database.js";

export const consultaQtdeUsuariosAtivos = async (request, response, next) => {

    try {

        const [qtdeUsuariosAtivos] = await pool.query(
            `SELECT COUNT(*) FROM Cliente
            GROUP BY bloqueio
            HAVING bloqueio = 0`
        )

        qtdeUsuariosAtivos += await pool.query(
            `SELECT COUNT(*) FROM Consultor
            GROUP BY bloqueio
            HAVING bloqueio = 0`
        )

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
            `SELECT COUNT(*) FROM Cliente
            GROUP BY bloqueio
            HAVING bloqueio = 1`
        )

        qtdeUsuariosInativos += await pool.query(
            `SELECT COUNT(*) FROM Consultor
            GROUP BY bloqueio
            HAVING bloqueio = 1`
        )

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
            `SELECT COUNT(*) FROM Cliente INNER JOIN Denuncia
            ON Cliente.idCliente = Denuncia.idDenunciado AND sentido = 1
            GROUP BY idCliente`
        )

        qtdeUsuariosDenunciados += await pool.query(
            `SELECT COUNT(*) FROM Consultor INNER JOIN Denuncia
            ON Consultor.idConsultor = Denuncia.idDenunciado AND sentido = 0
            GROUP BY idConsultor`
        )

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
            `SELECT COUNT(*) FROM Consultores`
        )

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
            `SELECT COUNT(*) FROM Clientes`
        )

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
            `SELECT COUNT(*) FROM Reuniao
            WHERE status = 'agendada' AND MONTH(data) = MONTH(sysdate)`
        )

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
            `SELECT COUNT(*) FROM Reuniao
            WHERE status = 'cancelada' AND MONTH(data) = MONTH(sysdate)`
        )

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
            `SELECT COUNT(*) FROM Reuniao
            WHERE status = 'concluida' AND MONTH(data) = MONTH(sysdate)`
        )

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

export const consultaTopConsultores = async (request, response, next) => {

    try {

        const [topConsultores] = await pool.query(
            `SELECT Consultor.nome, Consultor.urlImagemPerfil, COUNT(*) as qtdeConsultorias FROM Reuniao INNER JOIN Consultor
            ON Reuniao.idConsultor = Cliente.idConsultor
            GROUP BY Consultor.idConsultor
            HAVING Reuniao.status = 'concluida'
            ORDER BY qtdeConsultorias DESC
            LIMIT 5`
        )

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