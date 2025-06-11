import { enviarImagemParaBlob, excluirImagensDoBlob } from '../azureBlob.js';
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

    if (bloqStatus[0].bloqueio === -1) {
      return response.status(200).json({
        success: true,
        message: -1
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

export const GetIfNickEmailIsValid = async (request, response) => {

  try {
    const newUser = request.body;

    const [rows] = await pool.query(
      `
      SELECT 1 as tipo_duplicidade FROM Login WHERE nickname = ?
      UNION ALL
      SELECT 2 as tipo_duplicidade FROM Consultor WHERE email = ?
      UNION ALL
      SELECT 2 as tipo_duplicidade FROM Cliente WHERE email = ?;
      `,
      [newUser.nickname, newUser.email, newUser.email]
    );

    let returnCode = 0;

    const foundTypes = new Set();

    rows.forEach(row => {
      foundTypes.add(row.tipo_duplicidade);
    });

    if (foundTypes.has(1) && foundTypes.has(2)) {
      returnCode = 3; // Ambos repetidos
    } else if (foundTypes.has(2)) {
      returnCode = 2; //  Email repetido
    } else if (foundTypes.has(1)) {
      returnCode = 1; // Nickname repetido
    }

    if (returnCode === 0) {
      return response.status(200).json({ valid: true, code: returnCode, message: "Cadastro válido!" });
    } else {
      return response.status(201).json({ valid: false, code: returnCode, message: "Dados já cadastrados!" });
    }

  } catch (error) {
    console.error("Erro ao verificar nickname-email:", error);

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
      const [perfil] = await pool.query(
        `SELECT
                    c.idConsultor,
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
                    c.modalidadeTrab,  -- Adicionado
                    c.cep,             -- Adicionado
                    c.endereco,        -- Adicionado
                    c.numeroCasa,      -- Adicionado
                    c.bairro,          -- Adicionado
                    c.complemento,     -- Adicionado
                    c.cidade,          -- Adicionado
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
        return response.status(200).json({
          success: true,
          perfil
        });
      }
    }


    if (usertype === '0') {
      const [perfil] = await pool.query(
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
                    c.modalidadeTrab,   -- <--- ATENÇÃO AQUI: Nome da coluna no DB
                    c.cep,
                    c.endereco,
                    c.numeroCasa,       -- <--- ATENÇÃO AQUI: Nome da coluna no DB
                    c.bairro,
                    c.complemento,
                    c.cidade,
                    GROUP_CONCAT(ce.urlCertificado SEPARATOR ',') AS urlsCertificados
                FROM
                    Consultor c
                LEFT JOIN
                    Certificados ce ON c.idConsultor = ce.idConsultor
                WHERE
                    c.idConsultor = ?
                GROUP BY
                    c.idConsultor;`,
        [id]
      );

      if (perfil.length > 0) {
        return response.status(200).json({
          success: true,
          perfil: perfil[0]
        });
      }
    }

        if (usertype === '1') {
      const [perfil] = await pool.query(
        `SELECT
                    c.nome,
                    c.email,
                    c.telefone,
                    c.urlImagemPerfil,
                    c.redeSocial,
                    c.bio
          FROM
                    Cliente c
          WHERE
                    c.idCliente = ? ;`,
        [id]
      );

      if (perfil.length > 0) {
        return response.status(200).json({
          success: true,
          perfil: perfil[0]
        });
      }
    }

    return response.status(201).json({
      success: false,
      message: "Perfil não encontrado."
    });

  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor ao carregar perfil."
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
      await connection.query(
        `UPDATE Consultor SET 
                nome = ?, 
                email = ?, 
                telefone = ?, 
                valorHora = ?,
                redeSocial = ?,
                horarioInicio = ?,
                horarioFim = ?,
                prazoMinReag = ?,
                bio = ?,
                modalidadeTrab = ?,       
                endereco = ?,             
                numeroCasa = ?,           
                cidade = ?,               
                bairro = ?,               
                complemento = ?,          
                cep = ?                   
                WHERE idConsultor = ?;`,
        [
          info.nome,
          info.email,
          info.telefone,
          info.valorHora,
          info.redeSocial,
          info.horarioInicio,
          info.horarioFim,
          info.prazoMinReag,
          info.bio,
          info.modalidade,
          info.endereco,
          info.numero,
          info.cidade,
          info.bairro,
          info.complemento,
          info.cep,
          id
        ]
      );
      flag = 1;
    } else if (usertype === '1') {
      await connection.query(
        `UPDATE Cliente SET nome = ?, email = ?, telefone = ?, redeSocial = ?, bio = ? WHERE idCliente = ?;`,
        [info.nome, info.email, info.telefone, info.redeSocial, info.bio, id]
      );
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
    console.error("Erro ao atualizar perfil do consultor:", error); // Adicionei um console.error para depuração
    return response.status(500).json({
      success: false,
      message: "Erro interno de servidor ao atualizar perfil."
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

export const WipeCloud = async (req, res) => {

  const connection = await pool.getConnection();

  try {

    const usuario = req.params;

    if (!usuario.id || !usuario.usertype) {
      return res.status(201).json({
        success: false,
        message: 'ID do usuário e tipo de usuário são obrigatórios.'
      });

    }

    let idLoginUsuario = null;

    await connection.beginTransaction();

    if (usuario.usertype === '0') {

      const [userIdentity] = await connection.query(
        `SELECT idLogin FROM Consultor WHERE idConsultor = ? ;`, [usuario.id]
      );

      if (userIdentity.length === 0) {

        await connection.rollback();
        return res.status(201).json({ success: false, message: 'Consultor não encontrado.' });

      }

      idLoginUsuario = userIdentity[0].idLogin;

      await connection.query(`UPDATE Consultor SET urlImagemPerfil = 'https://matchsquadb.blob.core.windows.net/usuarios/no_avatar.png' WHERE idConsultor = ?;`, [usuario.id]);
      await connection.query(`DELETE FROM Certificados WHERE idConsultor = ?;`, [usuario.id]);

    } else if (usuario.usertype === '1') {

      const [userIdentity] = await connection.query(
        `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [usuario.id]
      );

      if (userIdentity.length === 0) {

        await connection.rollback();
        return res.status(201).json({ success: false, message: 'Cliente não encontrado.' });

      }

      idLoginUsuario = userIdentity[0].idLogin;

      await connection.query(`UPDATE Cliente SET urlImagemPerfil = 'https://matchsquadb.blob.core.windows.net/usuarios/no_avatar.png' WHERE idCliente = ?;`, [usuario.id]);

    } else {

      await connection.rollback();
      return res.status(201).json({ success: false, message: 'Tipo de usuário inválido.' });

    }

    await excluirImagensDoBlob(idLoginUsuario);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Imagens excluídas com sucesso!'
    });

  } catch (error) {
    console.error("Erro ao limpar imagens do usuário:", error);
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: "Problema interno no servidor ao limpar imagens!"
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

export const GetWorkRange = async (request, response, next) => {

  try {

    const usuario = request.params;

    const [user] = await pool.query(
      `SELECT horarioInicio, horarioFim FROM Consultor WHERE idConsultor = ?;`, [usuario.idConsultor]
    );


    if (user.length > 0) {
      return response.status(200).json({
        success: true,
        user
      });
    }

    return response.status(201).json({
      success: false,
      message: "Não encontrado horarios de inicio e final de expediente deste consultor."
    });

  } catch (error) {
    console.error('Erro na procura dos dados do consultor >', error);
    return response.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }

};