import { pool } from "../database.js";

export const QtdeConsultoriasAgendadas = async (request, response, next) => {
    try {
        const { id } = request.params;

        const [rows] = await pool.query(
            `SELECT status_situacao, COUNT(*) as total
             FROM Reuniao
             WHERE idConsultor = ?
             GROUP BY status_situacao`,
            [id]
        );

        const statusMap = {
            pendente: 0,
            realizada: 0,
            cancelada: 0,
            total: 0
        };

        rows.forEach(row => {
            statusMap[row.status_situacao] = row.total;
        });

        const resultadoFinal = [
            statusMap.pendente,
            statusMap.realizada,
            statusMap.cancelada,
            (statusMap.pendente + statusMap.realizada + statusMap.cancelada)
        ];

        return response.status(200).json({
            success: true,
            data: resultadoFinal
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de consultorias agendadas:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const DiasSemanaConsultoriaDetalhado = async (request, response, next) => {
    try {
        const { id } = request.params;

        const [rows] = await pool.query(
            `SELECT data FROM Reuniao WHERE idConsultor = ?`,
            [id]
        );

        const diasDaSemana = [
            'domingo',
            'segunda-feira',
            'terça-feira',
            'quarta-feira',
            'quinta-feira',
            'sexta-feira',
            'sábado' // <-- COM ACENTO AQUI
        ];

        const contagem = {
            'segunda-feira': 0,
            'terça-feira': 0,
            'quarta-feira': 0,
            'quinta-feira': 0,
            'sexta-feira': 0,
            'sábado': 0, // <-- COM ACENTO AQUI
            'domingo': 0
        };

        rows.forEach(row => {
            const data = new Date(row.data);
            const diaSemana = diasDaSemana[data.getDay()];
            contagem[diaSemana]++;
        });

        const resultadoFinal = [
            contagem['segunda-feira'],
            contagem['terça-feira'],
            contagem['quarta-feira'],
            contagem['quinta-feira'],
            contagem['sexta-feira'],
            contagem['sábado'],
            contagem['domingo']
        ];

        return response.status(200).json({
            success: true,
            data: resultadoFinal
        });

    } catch (error) {
        console.error('Erro ao buscar dias da semana:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const HistoricoAvaliacaoConsultor = async (request, response, next) => {
    try {
        const { id } = request.params;

        const [rows] = await pool.query(
            `SELECT avaliacao
             FROM Reuniao
             WHERE idConsultor = ?
             ORDER BY data ASC, horario ASC`,
            [id]
        );

        const labels = [];
        const avaliacoes = [];
        let soma = 0;
        let count = 0;

        rows.forEach((row, index) => {
            const nota = row.avaliacao ?? 0;
            labels.push(`#${index + 1}ª`);
            avaliacoes.push(nota ?? 0);
            if (nota !== null && nota !== undefined) {
                soma += nota;
                count++;
            }
        });

        const media = count > 0 ? parseFloat((soma / count).toFixed(1)) + 1 : 0;

        labels.push('Média');
        avaliacoes.push(media);

        return response.status(200).json({
            success: true,
            labels,
            data: avaliacoes
        });

    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        return response.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
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