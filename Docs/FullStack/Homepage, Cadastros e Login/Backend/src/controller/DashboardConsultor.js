import { pool } from "../database.js";

export const qtdeConsultoriasAgendadas = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [qtdeAgendadas] = await pool.query(
            `SELECT count(*) FROM Reuniao
            GROUP BY idConsultor
            HAVING idConsultor = ? AND status = 'agendada' AND MONTH(data) = MONTH(sysdate)`,
            [idConsultor]
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
        const { idConsultor } = request.params;

        const [qtdeCanceladas] = await pool.query(
            `SELECT count(*) FROM Reuniao
            GROUP BY idConsultor
            HAVING idConsultor = ? AND status = 'cancelada' AND MONTH(data) = MONTH(sysdate)`,
            [idConsultor]
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
        const { idConsultor } = request.params;

        const [qtdeConcluidas] = await pool.query(
            `SELECT count(*) FROM Reuniao
            GROUP BY idConsultor
            HAVING idConsultor = ? AND status = 'concluida' AND MONTH(data) = MONTH(sysdate)`,
            [idConsultor]
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

export const consultaMediaAvaliacao = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [mediaAvaliacao] = await pool.query(
            `SELECT AVG(avaliacao) FROM Reuniao
            GROUP BY idConsultor
            HAVING idConsultor = ?`,
            [idConsultor]
        )

        return response.status(200).json({
            success: true,
            mediaAvaliacao
        });

    } catch (error) {
        console.error('Erro ao buscar média de avaliações:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaTopClientes = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [topClientes] = await pool.query(
            `SELECT Cliente.nome, Cliente.urlImagemPerfil COUNT(*) as qtdeConsultorias FROM Reuniao INNER JOIN Cliente
            ON Reuniao.idCliente = Cliente.idCliente
            GROUP BY idCliente
            HAVING idConsultor = ?
            ORDER BY qtdeConsultorias DESC
            LIMIT 5`,
            [idConsultor]
        )

        if (topClientes.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum match encontrado para este consultor."
            });
        }

        return response.status(200).json({
            success: true,
            topClientes
        });

    } catch (error) {
        console.error('Erro ao buscar top cinco clientes com mais consultorias:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaClientesVoltam = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [qtdeClientesVoltam] = await pool.query(
            `SELECT COUNT(*) FROM (SELECT COUNT(*) AS qtde FROM Reuniao
            GROUP BY idCliente
            HAVING idConsultor = ? AND qtde > 1)`,
            [idConsultor]
        )

        return response.status(200).json({
            success: true,
            qtdeClientesVoltam
        });

    } catch (error) {
        console.error('Erro ao buscar clientes que voltam:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const consultaClientesNaoVoltam = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [qtdeClientesNaoVoltam] = await pool.query(
            `SELECT COUNT(*) FROM (SELECT COUNT(*) AS qtde FROM Reuniao
            GROUP BY idCliente
            HAVING idConsultor = ? AND qtde = 1)`,
            [idConsultor]
        )

        return response.status(200).json({
            success: true,
            qtdeClientesNaoVoltam
        });

    } catch (error) {
        console.error('Erro ao buscar clientes que não voltam:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const qtdeAvaliacao = async (request, response, next) => {

    try {
        const { idConsultor } = request.params;

        const [qtdeAvaliacao] = await pool.query(
            `SELECT avaliacao, COUNT(*) FROM Reuniao
            GROUP BY avaliacao
            HAVING idConsultor = ?
            ORDER BY avaliacao ASC`,
            [idConsultor]
        )

        return response.status(200).json({
            success: true,
            qtdeAvaliacao
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de avaliações:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};