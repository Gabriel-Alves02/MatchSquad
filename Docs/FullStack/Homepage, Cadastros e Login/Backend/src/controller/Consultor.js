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

export const ConsultarMediaConsultor = async (request, response, next) => {

  try {

    const { id } = request.params;

    const [mediaConsultor] = await pool.query
        (
          `SELECT AVG(avaliacao) FROM Reuniao
            GROUP BY idConsultor
            HAVING idConsultor = ?;
        `, [id]
        );

      if (mediaConsultor) {
        return response.status(200).json
          ({
            success: true,
            mediaConsultor
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