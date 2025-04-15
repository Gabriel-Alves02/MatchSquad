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

    return response.status(404).json({
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
    //console.error('Erro na procura do codigo de verificação: ', error);
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

    return response.status(200).json({
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

    if (usuario.userType === '0') {
      [checkChange] = await connection.query(`UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`, [0, usuario.id]);
      flag = 1;
    } else if (usuario.userType === '1') {
      [checkChange] = await connection.query(`UPDATE Cliente SET bloqueio = ? WHERE idCliente = ?;`, [0, usuario.id]);
      flag = 1;
    }

    await connection.commit();

    if (flag === 1) {
      return response.status(200).json({
        success: true,
        message: "Enviado",
        checkChange
      });
    }

    return response.status(200).json({
      success: false,
      message: "Não enviado"
    });

  } catch (error) {
    console.error('Erro na procura do cliente : ', error);
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
