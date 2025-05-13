import { pool } from "../database.js";

export const ConsultarUsuariosDenunciados = async (request, response, next) => {

    try {
        const { nomeUsuario } = request.params;

        const [cliente] = await pool.query(
            `SELECT idCliente FROM Cliente
            WHERE nome = ?`,
            [nomeUsuario]
        )

        if(cliente) {
            const [denunciados] = await pool.query(
                `SELECT Cliente.idCliente, Cliente.nome, count(*) as qtdeDenuncias FROM Cliente
                inner join Denuncia_cliente
                on Cliente.idCliente = Denuncia_cliente.idCliente
                group by Cliente.idCliente
                having Cliente.nome = ?`,
                [nomeUsuario]
            )
        }
        else {
            const [denunciados] = await pool.query(
                `SELECT Consultor.idConsultor, Consultor.nome, count(*) as qtdeDenuncias FROM Consultor
                inner join Denuncia_consultor
                on Consultor.idConsultor = Denuncia_consultor.idConsultor
                group by Consultor.idConsultor
                having Consultor.nome = ?`,
                [nomeUsuario]
            )
        }

        if (denunciados.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhum usuario encontrado."
            });
        }

        return response.status(200).json({
            success: true,
            denunciados
        });

    } catch (error) {
        console.error('Erro ao buscar usuarios:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const ConsultarDenuncias = async (request, response, next) => {

    try {
        const { idUsuario, tipoUsuario } = request.params;

        if(tipoUsuario === '1'){
            const [denuncias] = await pool.query(
                `SELECT Denuncia_cliente.descricao, Cliente.nome as nomeDenunciado, Consultor.nome as nomeDenunciante FROM Cliente inner join Denuncia_cliente
                on Cliente.idCliente = Denuncia_cliente.idCliente inner join Consultor
                on Denuncia_cliente.idConsultor = Consultor.idConsultor
                WHERE idCliente = ?`,
                [idUsuario]
            )
        }
        if(tipoUsuario === '0') {
            const [denuncias] = await pool.query(
                `SELECT Denuncia_consultor.descricao, Consultor.nome as nomeDenunciado, Cliente.nome as nomeDenunciante FROM onsultor inner join Denuncia_consultor
                on Consultor.idConsultor = Denuncia_consultor.idConsultor inner join Cliente
                on Denuncia_consultor.idCliente = Cliente.idCliente
                WHERE idConsultor = ?`,
                [idUsuario]
            )
        }

        if (denuncias.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Nenhuma denuncia encontrada."
            });
        }

        return response.status(200).json({
            success: true,
            denuncias
        });

    } catch (error) {
        console.error('Erro ao buscar denuncias:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
};

export const BloquearUsuario = async (request, response, next) => {

    const connection = await pool.getConnection();

    try {
        const usuario = request.params;

        await connection.beginTransaction();

        if(usuario.tipo == 'Cliente'){
            const [result] = await connection.query(
                `UPDATE Cliente SET bloqueio = ? WHERE idCliente = ?;`,
                [0, usuario.id]
            );
        }
        else {
            const [result] = await connection.query(
                `UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`,
                [0, usuario.id]
            );
        }

        await connection.commit();

        if (result.changedRows > 0) {
            return response.status(200).json({
                success: true,
                message: "Bloqueado com sucesso!"
            });
        }

        return response.status(200).json({
            success: true,
            message: "Não encontrado o usuário!" //id passado foi invalido
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return response.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });

    } finally {
        connection.release();
    }
};