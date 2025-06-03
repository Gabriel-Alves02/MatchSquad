import { pool } from "../database.js";

export const QtdeUsuariosPorBloqueio = async (request, response, next) => {
    try {

        const [clientesRows] = await pool.query(
            `SELECT bloqueio, COUNT(*) as total
             FROM Cliente
             GROUP BY bloqueio`
        );


        const [consultoresRows] = await pool.query(
            `SELECT bloqueio, COUNT(*) as total
             FROM Consultor
             GROUP BY bloqueio`
        );

        const statusBloqueioClientes = {
            '0': 0, // Ativo
            '1': 0, // Desativado
            '-1': 0 // Banido
        };

        const statusBloqueioConsultores = {
            '0': 0, // Ativo
            '1': 0, // Desativado
            '-1': 0 // Banido
        };

        clientesRows.forEach(row => {
            statusBloqueioClientes[String(row.bloqueio)] = row.total;
        });

        consultoresRows.forEach(row => {
            statusBloqueioConsultores[String(row.bloqueio)] = row.total;
        });

        const clientesData = [
            statusBloqueioClientes['0'],
            statusBloqueioClientes['1'],
            statusBloqueioClientes['-1']
        ];

        const consultoresData = [
            statusBloqueioConsultores['0'],
            statusBloqueioConsultores['1'],
            statusBloqueioConsultores['-1']
        ];

        const ambosData = [
            clientesData[0] + consultoresData[0],
            clientesData[1] + consultoresData[1],
            clientesData[2] + consultoresData[2]
        ];

        return response.status(200).json({
            success: true,
            ambos: ambosData
        });

    } catch (error) {
        console.error('Erro ao buscar quantidade de usuários por bloqueio:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar status de usuários"
        });
    }
};


export const MediasAvaliacaoConsultores = async (request, response, next) => {
    try {

        const [rows] = await pool.query(
            `SELECT
                idConsultor,
                AVG(avaliacao) as media_avaliacao
            FROM
                Reuniao
            WHERE
                status_situacao = 'realizada' AND avaliacao IS NOT NULL AND avaliacao <> 0
            GROUP BY
                idConsultor;`
        );

        const contagemPorFaixa = {
            '1': 0, // <= 1
            '2': 0, // <= 2
            '3': 0, // <= 3
            '4': 0, // <= 4
            '5': 0  // <= 5
        };

        rows.forEach(row => {
            const media = parseFloat(row.media_avaliacao);

            if (media > 0 && media <= 1) {
                contagemPorFaixa['1']++;
            } else if (media > 1 && media <= 2) {
                contagemPorFaixa['2']++;
            } else if (media > 2 && media <= 3) {
                contagemPorFaixa['3']++;
            } else if (media > 3 && media <= 4) {
                contagemPorFaixa['4']++;
            } else if (media > 4 && media <= 5) {
                contagemPorFaixa['5']++;
            }
        });

        const resultadoFinal = [
            contagemPorFaixa['1'],
            contagemPorFaixa['2'],
            contagemPorFaixa['3'],
            contagemPorFaixa['4'],
            contagemPorFaixa['5']
        ];

        return response.status(200).json({
            success: true,
            data: resultadoFinal
        });

    } catch (error) {
        console.error('Erro ao buscar médias de avaliação dos consultores:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar médias de avaliação."
        });
    }
};


export const TopConsultoresPorReunioesRealizadas = async (request, response, next) => {
    try {
     
        const [rows] = await pool.query(
            `SELECT
                C.nome as nome_consultor,
                C.idConsultor as id,
                COUNT(R.idReuniao) as total_reunioes_realizadas
            FROM
                Consultor C
            JOIN
                Reuniao R ON C.idConsultor = R.idConsultor
            WHERE
                R.status_situacao = 'realizada'
            GROUP BY
                C.idConsultor, C.nome
            ORDER BY
                total_reunioes_realizadas DESC
            LIMIT 5;`
        );

        const nomesConsultores = [];
        const quantidadeReunioes = [];

        rows.forEach(row => {
            nomesConsultores.push(`(${row.id})` + row.nome_consultor);
            quantidadeReunioes.push(row.total_reunioes_realizadas);
        });

        return response.status(200).json({
            success: true,
            labels: nomesConsultores,      
            data: quantidadeReunioes       
        });

    } catch (error) {
        console.error('Erro ao buscar Top Consultores por reuniões realizadas:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar Top Consultores."
        });
    }
};