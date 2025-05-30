import { enviarImagemParaBlob } from '../azureBlob.js';
import path from 'path';
import { pool } from "../database.js";

export function gerarNum6digitos() {
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

export const GetName = async (request, response, next) => {

  try {

    const usuario = request.params;
    let username = null;

    if (usuario.usertype === '0') {
      [username] = await pool.query(
        `SELECT nome FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
      );
    } else if (usuario.usertype === '1') {
      [username] = await pool.query(
        `SELECT nome FROM Cliente WHERE idCliente = ?;`, [usuario.id]
      );
    }

    if (username.length > 0) {
      return response.status(200).json({
        success: true,
        message: username[0].nome
      });
    }

    return response.status(201).json({
      success: false,
      message: "Nome não encontrado para este id."
    });

  } catch (error) {
    console.error('Erro na procura do cliente >', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }

};


export const GetPrazo = async (request, response, next) => {

  try {

    const usuario = request.params;

    if (usuario) {
      const [username] = await pool.query(
        `SELECT prazoMinReag FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
      );

      if (username.length > 0) {
        return response.status(200).json({
          success: true,
          message: username[0].prazoMinReag
        });
      }
    }

    return response.status(201).json({
      success: false,
      message: "Nome não encontrado para este id."
    });

  } catch (error) {
    console.error('Erro na procura do consultor >', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }

};

export const GetCode = async (request, response, next) => {

  try {

    const usuario = request.params;

    let userIdentity = null;

    if (usuario.usertype === '0') {
      [userIdentity] = await pool.query(
        `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
      );
    } else if (usuario.usertype === '1') {
      [userIdentity] = await pool.query(
        `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [usuario.id]
      );
    }

    const [codigo] = await pool.query(
      `SELECT codigoVerificacao FROM Login WHERE idLogin = ?;`, [userIdentity[0].idLogin]
    );

    if (codigo.length > 0) {
      return response.status(200).json({
        success: true,
        message: codigo[0].codigoVerificacao
      });
    }

    return response.status(404).json({
      success: false,
      message: "Erro ao tentar encontrar o codigo."
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Erro de servidor"
    });
  }

};


export const GetBlockStatus = async (request, response, next) => {

  try {

    const usuario = request.params;

    let bloqStatus;

    if (usuario.usertype === '0') {
      [bloqStatus] = await pool.query(
        `SELECT bloqueio FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
      );
    } else if (usuario.usertype === '1') {
      [bloqStatus] = await pool.query(
        `SELECT bloqueio FROM Cliente WHERE idCliente = ?;`, [usuario.id]
      );
    }

    if (bloqStatus[0].bloqueio === 1) {
      return response.status(200).json({
        success: true,
        message: 1
      });
    }

    return response.status(201).json({
      success: false,
      message: 0
    });

  } catch (error) {
    console.error('Erro na procura do cliente >', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }

};


export const RefreshBlock = async (request, response, next) => {

  const connection = await pool.getConnection();

  try {

    const usuario = request.body;
    let flag = 0;
    let checkChange = null;

    await connection.beginTransaction();

    if (usuario.usertype === '0') {
      [checkChange] = await connection.query(`UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`, ['0', usuario.id]);
      flag = 1;
    } else if (usuario.usertype === '1') {
      [checkChange] = await connection.query(`UPDATE Cliente SET bloqueio = ? WHERE idCliente = ?;`, ['0', usuario.id]);
      flag = 1;
    }

    await connection.commit();

    if (flag === 1) {
      return response.status(200).json({
        success: true,
        message: "Alterado",
        checkChange
      });
    }

    return response.status(201).json({
      success: false,
      message: "Não verificado"
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Erro interno de servidor"
    });
  } finally {
    connection.release();
  }

};

export const GetIfNicknameIsValid = async (request, response) => {

  try {
    const user = request.params;

    const [rows] = await pool.query(
      'SELECT COUNT(*) as total FROM Login WHERE nickname = ?;',
      [user.nickname]
    );

    if (rows[0].total === 0) {
      return response.status(200).json({ valid: true });
    }

    return response.status(200).json({ valid: false });

  } catch (error) {
    console.error("Erro ao verificar nickname:", error);
    return response.status(500).json({
      success: false,
      message: "Problema interno no servidor!"
    });
  }

};


export const LoadProfile = async (request, response, next) => {

  try {

    const { id, usertype } = request.params;

    if (id === '-1' && usertype === '-1') {
      const [perfil] = await pool.query
        (
          `SELECT 
            c.nome,
            c.email,
            c.telefone,
            c.valorHora,
            c.urlImagemPerfil,
            c.redeSocial,
            c.horarioInicio,
            c.horarioFim,
            c.prazoMinReag,
            c.bio,
            GROUP_CONCAT(h.nomeHabilidade SEPARATOR ', ') AS habilidades
        FROM 
            Consultor c
        INNER JOIN 
            Consultor_Habilidades ch ON ch.idConsultor = c.idConsultor
        INNER JOIN 
            Habilidade h ON h.idHabilidade = ch.idHabilidade
        GROUP BY 
            c.idConsultor;
        `
        );

      if (perfil.length > 0) {
        return response.status(200).json
          ({
            success: true,
            perfil
          });
      }

    }


    if (usertype === '0') {
      const [perfil] = await pool.query(
        `SELECT 
          c.nome,c.email,c.telefone,c.valorHora,c.urlImagemPerfil,c.redeSocial,c.horarioInicio,c.horarioFim,c.prazoMinReag,c.bio, GROUP_CONCAT(ce.urlCertificado SEPARATOR ',') AS urlsCertificados
        FROM
          Consultor c
        LEFT JOIN
          Certificados ce ON c.idConsultor = ce.idConsultor
        WHERE
          c.idConsultor = ?
        GROUP BY
          c.idConsultor;`, [id]
      );

      if (perfil.length > 0) {
        return response.status(200).json({
          success: true,
          perfil
        });
      }

    } else if (usertype === '1') {
      const [perfil] = await pool.query(
        `SELECT nome,email,telefone,redeSocial,urlImagemPerfil,bio FROM Cliente WHERE idCliente = ?;`, [id]
      );

      if (perfil.length > 0) {
        return response.status(200).json({
          success: true,
          perfil
        });
      }
    }

    return response.status(201).json({
      success: true,
      message: "Perfil não encontrado."
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

export const RefreshProfile = async (request, response, next) => {

  const connection = await pool.getConnection();

  try {

    const { id, usertype } = request.params;
    const info = request.body;
    let flag = 0;

    await connection.beginTransaction();

    if (usertype === '0') {
      await connection.query(`UPDATE Consultor SET email = ?, telefone = ?, valorHora = ?,redeSocial = ?,horarioInicio = ?,horarioFim = ?,prazoMinReag = ?,bio = ? WHERE idConsultor = ?;`,
        [info.email, info.telefone, info.valorHora, info.redeSocial, info.horarioInicio, info.horarioFim, info.prazoMinReag, info.bio, id]);
      flag = 1;
    } else if (usertype === '1') {
      await connection.query(`UPDATE Cliente SET email = ?, telefone = ?, redeSocial = ?, bio = ? WHERE idCliente = ?;`,
        [info.email, info.telefone, info.redeSocial, info.bio, id]);
      flag = 1;
    }

    await connection.commit();

    if (flag === 1) {
      return response.status(200).json({
        success: true,
        message: "Seus dados foram alterados com sucesso!"
      });
    }

    return response.status(201).json({
      success: false,
      message: "Sem sucesso em alterar os dados"
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Erro interno de servidor"
    });
  } finally {
    connection.release();
  }

};

export const GoCloudImage = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const usuario = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada.'
      });
    }

    let url = null;

    await connection.beginTransaction();

    if (usuario.usertype === '0') {
      const [userIdentity] = await pool.query(
        `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
      );

      url = await enviarImagemParaBlob(file.buffer, userIdentity[0].idLogin, file.originalname);

      await connection.query(`UPDATE Consultor SET urlImagemPerfil = ? WHERE idConsultor = ?;`,
        [url, usuario.id]);

    } else if (usuario.usertype === '1') {
      const [userIdentity] = await pool.query(
        `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [usuario.id]
      );


      url = await enviarImagemParaBlob(file.buffer, userIdentity[0].idLogin, file.originalname);

      await connection.query(`UPDATE Cliente SET urlImagemPerfil = ? WHERE idCliente = ?;`,
        [url, usuario.id]);
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Imagem enviada com sucesso!',
      url
    });

  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    return res.status(500).json({
      success: false,
      message: "Problema interno no servidor!"
    });
  } finally {
    connection.release();
  }
};

export const GoCloudCertificateImage = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const usuario = req.params;
    const file = req.file;

    if (!file) {
      return res.status(201).json({
        success: false,
        message: 'Nenhum certificado foi enviado.'
      });
    }

    let url = null;
    let idLoginUsuario = null;

    await connection.beginTransaction();

    const [userIdentity] = await pool.query(
      `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
    );

    idLoginUsuario = userIdentity[0].idLogin;

    url = await enviarImagemParaBlob(file.buffer, idLoginUsuario, file.originalname, 'certificados');
    
    await connection.query(
      `INSERT INTO Certificados (idConsultor, urlCertificado, descricao) VALUES (?, ?, ?);`,
      [usuario.id, url, file.originalname]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Certificado enviado com sucesso!',
      url
    });

  } catch (error) {
    console.error("Erro ao enviar certificado:", error);
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: "Problema interno no servidor ao enviar certificado!"
    });
  } finally {
    connection.release();
  }
};

export const RefreshPassword = async (request, response, next) => {

  const connection = await pool.getConnection();

  try {

    const { id, usertype } = request.params;
    const info = request.body;
    let flag = 0;

    await connection.beginTransaction();

    if (usertype === '0') {
      const [user] = await pool.query(
        `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [id]
      );

      await connection.query(`UPDATE Login SET senha = ? WHERE idLogin = ?;`,
        [info.novaSenha, user[0].idLogin]);
      flag = 1;

    } else if (usertype === '1') {
      const [user] = await pool.query(
        `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [id]
      );

      await connection.query(`UPDATE Login SET senha = ? WHERE idLogin = ?;`,
        [info.novaSenha, user[0].idLogin]);
      flag = 1;
    }

    await connection.commit();

    if (flag === 1) {
      return response.status(200).json({
        success: true,
        message: "Seus dados foram alterados com sucesso!"
      });
    }

    return response.status(201).json({
      success: false,
      message: "Sem sucesso em alterar os dados"
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Erro interno de servidor"
    });
  } finally {
    connection.release();
  }

};

export const GetPassword = async (request, response, next) => {

  try {

    const { id, usertype } = request.params;

    if (usertype === '0') {
      const [perfil] = await pool.query(
        `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [id]
      );

      if (perfil.length > 0) {

        const [user] = await pool.query(
          `SELECT senha FROM Login WHERE idLogin = ?;`, [perfil[0].idLogin]
        );

        return response.status(200).json({
          success: true,
          message: user[0].senha
        });
      }

    } else if (usertype === '1') {
      const [perfil] = await pool.query(
        `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [id]
      );

      if (perfil.length > 0) {

        const [user] = await pool.query(
          `SELECT senha FROM Login WHERE idLogin = ?;`, [perfil[0].idLogin]
        );

        return response.status(200).json({
          success: true,
          message: user[0].senha
        });
      }

    }

    return response.status(201).json({
      success: true,
      message: "Senha não encontrada."
    });

  } catch (error) {
    console.error('Erro na busca da senha:', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

export const EndUser = async (request, response, next) => {

  const connection = await pool.getConnection();

  try {

    const { id, usertype } = request.params;
    let flag = 0;

    await connection.beginTransaction();

    if (usertype === '0') {
      await connection.query(`UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`,
        ['1', id]);
      flag = 1;
    } else if (usertype === '1') {
      await connection.query(`UPDATE Cliente SET  bloqueio = ? WHERE idCliente = ?;`,
        ['1', id]);
      flag = 1;
    }

    await connection.commit();

    if (flag === 1) {
      return response.status(200).json({
        success: true,
        message: "Seus dados foram alterados com sucesso!"
      });
    }

    return response.status(201).json({
      success: false,
      message: "Sem sucesso em alterar os dados"
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Erro interno de servidor"
    });
  } finally {
    connection.release();
  }

};


export const SubmitComplaint = async (request, response, next) => {

  //Quando consultor -denuncia-> cliente, sentido = 0
  //Quando cliente -denuncia-> consultor, sentido = 1

  const connection = await pool.getConnection();

  try {

    const { id, usertype } = request.params;

    const { idReuniao, gravidade, comentario, dataReuniao } = request.body;

    await connection.beginTransaction();

    if (usertype === '0') {
      const [cliente] = await connection.query(`SELECT idCliente FROM reuniao WHERE idReuniao = ?;`, [idReuniao]);

      if (cliente.length > 0) {
        await connection.query(`INSERT INTO Denuncia (idConsultor, idCliente, gravidade, descricao, sentido, dataDenuncia) VALUES (?, ?, ?, ?, ?, ?);`,
          [id, cliente[0].idCliente, gravidade, comentario, usertype, dataReuniao]);
      }

      await connection.commit();

      return response.status(200).json({
        success: true,
        message: "Denuncia realizada ao cliente!"
      });

    } else if (usertype === '1') {

      const [consultor] = await connection.query(`SELECT idConsultor FROM reuniao WHERE idReuniao = ?;`, [idReuniao]);

      if (consultor.length > 0) {
        await connection.query(`INSERT INTO Denuncia (idCliente, idConsultor, gravidade, descricao, sentido, dataDenuncia) VALUES ( ?, ?, ?, ?, ?, ?);`,
          [id, consultor[0].idConsultor, gravidade, comentario, usertype, dataReuniao]);
      }

      await connection.commit();

      return response.status(200).json({
        success: true,
        message: "Denuncia realizada ao consultor!"
      });

    }


    return response.status(201).json({
      success: false,
      message: "Denuncia falhou!"
    });


  } catch (error) {
    await connection.rollback();
    console.error('Erro no cadastro:', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
  finally {
    connection.release();
  }

};



export const GetReport = async (request, response, next) => {

  try {

    const { id, usertype, id2 } = request.params;

    if (usertype === '0') {

      const [report] = await pool.query(`SELECT * FROM denuncia WHERE idConsultor = ? AND idCliente = ? AND sentido = 0 ;`, [id, id2]);

      if (report.length > 0) {
        return response.status(200).json({
          success: true,
          message: true
        });
      }

    } else if (usertype === '1') {

      const [report] = await pool.query(`SELECT * FROM denuncia WHERE idCliente = ? AND idConsultor = ? AND sentido = 1 ;`, [id, id2]);


      if (report.length > 0) {
        return response.status(200).json({
          success: true,
          message: true
        });
      }
    }


    return response.status(201).json({
      success: true,
      message: false
    });


  } catch (error) {

    console.error('Erro ao pegar denuncia:', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }

};