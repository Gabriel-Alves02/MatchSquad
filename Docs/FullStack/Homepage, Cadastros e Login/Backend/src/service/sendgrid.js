import sgMail from '@sendgrid/mail';
import { pool } from "../database.js";
import { gerarNum6digitos } from "../controller/SysFx.js";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export async function EnviarEmailRemarcacao(req, res) {
    
    const { clienteEmail, novaData, nomeCliente } = req.body;

    let nome = nomeCliente.split(' - ')[1];

    const msg = {
        to: clienteEmail,
        from: "matchsquad.brasil@gmail.com",
        subject: `Matchsquad - Consultoria remarcada!`,
        text: `Olá ${nome}, sua consultoria foi remarcada para o dia ${formatarData(novaData)}.`,
        html: `<strong> Olá ${nome},</strong><br>Sua consultoria foi remarcada para o dia <b> ${formatarData(novaData)}</b>.`,
    };

    try {
        //await sgMail.send(msg);
        console.log("E-mail enviado com sucesso!", msg);
        res.status(200).json({ success: true, message: "E-mail enviado com sucesso" });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.response?.body || error);
        res.status(500).json({ success: false, message: "Falha ao enviar e-mail" });
    }

}


export async function ConfirmacaoEmail(req, res) {

    const usuario = req.body;

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    let logMail = null;

    let newNum = gerarNum6digitos();

    if (usuario.userType === '0') {
        [logMail] = await connection.query(
            `SELECT idLogin,email FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
        );
        
        await pool.query(`UPDATE Login SET codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, logMail[0].idLogin]);

    } else if (usuario.userType === '1') {
        [logMail] = await connection.query(
            `SELECT idLogin,email FROM Cliente WHERE idCliente = ?;`, [usuario.id]
        );
        
        await pool.query(`UPDATE Login SET codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, logMail[0].idLogin]);
    }
    

    const msg = {
        to: logMail[0].email,
        from: "matchsquad.brasil@gmail.com",
        subject: `Matchsquad - Código de Confirmação`,
        text: `Copie o código de segurança abaixo para prosseguir. \n\n ${newNum}`,
        html: `Copie o código de segurança abaixo para prosseguir. <br><br>${newNum}`,
    };

    await connection.commit();

    try {
        //await sgMail.send(msg);
        console.log("MSG DO E-mail!", msg);
        res.status(200).json({ success: true, message: "E-mail enviado com sucesso" });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.response?.body || error);
        res.status(500).json({ success: false, message: "Falha ao enviar e-mail" });
    } finally {
        connection.release();
    }

}

function formatarData(isoDate) {
    const data = new Date(isoDate);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
