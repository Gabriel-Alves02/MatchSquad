import sgMail from '@sendgrid/mail';
import { pool } from "../database.js";
import { gerarNum6digitos } from "../controller/SysFx.js";
import { AtualizaData } from "../controller/PedidoAgendamento.js";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export async function EnviarEmailRemarcacao(req, res) {

    const { clienteEmail, consultorEmail, novaData, nomeCliente, novoHorario, id } = req.body;

    let infoHora = ''
    let nome = nomeCliente.split(' - ')[1];
    let dataBr = formatarData(novaData)

    const [dia, mes, ano] = dataBr.split('/');
    const dataIso = `${ano}-${mes}-${dia}`;

    await AtualizaData(dataIso, novoHorario, id);

    if (!(novoHorario === '00:00'))
        infoHora += ` no horário ${novoHorario}`

    const msg = {
        to: clienteEmail,
        from: "matchsquad.brasil@gmail.com",
        subject: `Matchsquad - Consultoria remarcada!`,
        text: `Olá ${nome}, sua consultoria foi remarcada para o dia ${formatarData(novaData)}${infoHora}.`,
        html: `<strong> Olá ${nome},</strong><br>Sua consultoria foi remarcada para o dia <b> ${formatarData(novaData)}${infoHora}</b>.`,
    };

    const msg2 = {
        to: consultorEmail,
        from: "matchsquad.brasil@gmail.com",
        subject: `Matchsquad - Consultoria remarcada!`,
        text: `Comunicação que a consultoria foi remarcada para o dia ${formatarData(novaData)}${infoHora}.`,
        html: `<strong> Comunicação que a consultoria foi remarcada para o dia <b> ${formatarData(novaData)}${infoHora}</b>. Mantenha-se atento a agenda!`,
    };

    try {
        //await sgMail.send(msg);
        //await sgMail.send(msg2);
        console.log("E-mail enviado com sucesso!", msg);
        console.log("E-mail enviado com sucesso!", msg2);
        res.status(200).json({ success: true, message: "E-mail enviado com sucesso" });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.response?.body || error);
        res.status(500).json({ success: false, message: "Falha ao enviar e-mail" });
    }

}


export async function ConfirmacaoEmail(req, res) {

    const usuario = req.body;

    let id = usuario.id || '-1';
    let usertype = usuario.usertype || '-1';
    let email = usuario.email || '-1';

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    let logMail = null;
    let newNum = gerarNum6digitos();
    let msg;
    let search;


    try {

        if (email === '-1') {

            if (usertype === '0' && id !== '-1') {

                [logMail] = await connection.query(
                    `SELECT idLogin,email FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
                );

                await pool.query(`UPDATE Consultor SET bloqueio = ? WHERE idLogin = ?;`, ['1', usuario.id]);
                await pool.query(`UPDATE Login SET senha = ?, codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);
                await connection.commit();
            } else if (usuario.usertype === '1' && id !== '-1') {

                [logMail] = await connection.query(
                    `SELECT idLogin,email FROM Cliente WHERE idCliente = ?;`, [usuario.id]
                );

                await pool.query(`UPDATE Consultor SET bloqueio = ? WHERE idLogin = ?;`, ['1', usuario.id]);
                await pool.query(`UPDATE Login SET senha = ?, codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);
                await connection.commit();
            }

            msg = {
                to: logMail[0].email,
                from: "matchsquad.brasil@gmail.com",
                subject: `Matchsquad - Código de Confirmação`,
                text: `Copie o código de segurança abaixo para prosseguir usando-o como senha. \n\n ${newNum}`,
                html: `Copie o código de segurança abaixo para prosseguir usando-o como senha. <br><br>${newNum}`,
            };

            console.log("MSG DO E-mail!", msg);
            //await sgMail.send(msg);

            return res.status(201).json({ success: true, message: "CAIU NO RETURN do nickname-senha" });

        } else {

            let flag = 0;

            [search] = await connection.query(
                `SELECT idConsultor FROM Consultor WHERE email = ?;`, [email]
            );

            if (search.length > 0) {
                await pool.query(`UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`, ['1', search[0].idConsultor]);
            }

            if (search.length === 0) {
                flag = 1;

                [search] = await connection.query(
                    `SELECT idCliente FROM Cliente WHERE email = ?;`, [email]
                );

                await pool.query(`UPDATE Cliente SET bloqueio = ? WHERE idCliente = ?;`, ['1', search[0].idCliente]);

                if (search.length === 0)
                    return res.status(201).json({ success: false, message: "Erro: E-mail passado não esta na base de dados!" });
            }

            if (flag === 0) {
                const [logMail] = await connection.query(
                    `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [search[0].idConsultor]
                );

                await pool.query(`UPDATE Login SET codigoVerificacao = ?, senha = ? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);
                await connection.commit();

                const [user] = await connection.query(
                    `SELECT nickname, senha FROM Login WHERE idLogin = ?;`, [logMail[0].idLogin]
                );

                msg = {
                    to: email,
                    from: "matchsquad.brasil@gmail.com",
                    subject: `Matchsquad - Recuperação da Conta`,
                    text: `Para o usuário de nickname ${user[0].nickname}. Copie o código de segurança abaixo como senha. \n\n ${user[0].senha}\n\n Não se esqueça de alterar a senha em configurações posteriormente, por questões de segurança!`,
                    html: `<p>Para o usuário de nickname ${user[0].nickname}. Copie o código de segurança abaixo como senha. <br><br> ${user[0].senha}<br><br> <strong>Não se esqueça de alterar a senha em configurações posteriormente, por questões de segurança!</strong></p>`,
                };

                //await sgMail.send(msg);

                console.log("MSG DO E-mail!", msg);

                return res.status(201).json({ success: true, message: "CAIU NO RETURN do Consultor" });

            } else {

                const [logMail] = await connection.query(
                    `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [search[0].idCliente]
                );

                await pool.query(`UPDATE Login SET codigoVerificacao = ?, senha =? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);
                await connection.commit();

                const [user] = await connection.query(
                    `SELECT nickname, senha FROM Login WHERE idLogin = ?;`, [logMail[0].idLogin]
                );

                msg = {
                    to: email,
                    from: "matchsquad.brasil@gmail.com",
                    subject: `Matchsquad - Recuperação da Conta`,
                    text: `Para o usuário de nickname ${user[0].nickname}. Copie o código de segurança abaixo como senha. \n\n ${newNum}\n\n Não se esqueça de alterar a senha em configurações posteriormente, por questões de segurança!`,
                    html: `<p>Para o usuário de nickname ${user[0].nickname}. Copie o código de segurança abaixo como senha. <br><br> ${newNum}<br><br> <strong>Não se esqueça de alterar a senha em configurações posteriormente, por questões de segurança!</strong></p>`,
                };

                //await sgMail.send(msg);

                console.log("MSG DO E-mail!", msg);

                return res.status(201).json({ success: true, message: "CAIU NO RETURN do Cliente" });
            }

        }


    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.response?.body || error);
        res.status(500).json({ success: false, message: "Falha ao enviar e-mail" });
    } finally {
        connection.release();
    }

}

export async function EnviarCancelamentoAgendamento(Email, Assunto, Data) {

    const msg = {
        to: Email,
        from: "matchsquad.brasil@gmail.com",
        subject: `Matchsquad - Consultoria cancelada!`,
        html: `<p><strong> Olá! Estamos fazendo contato para relatar que houve o cancelamento da consultoria agendada ${Assunto} que estava para data ${Data}. </strong><br>
                Solicite um novo agendamento na matchsquad.com.br a qualquer momento ;) </p>`
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

function formatarData(isoDate) {
    const data = new Date(isoDate);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
