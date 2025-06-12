import sgMail from '@sendgrid/mail';
import { pool } from "../database.js";
import { gerarNum6digitos } from "../controller/SysFx.js";
import { AtualizaData } from "../controller/PedidoAgendamento.js";

sgMail.setApiKey(process.env.SENDGRID_KEY);


export async function EnviarEmailRemarcacao(req, res) {

    const { clienteEmail, consultorEmail, novaData, nomeCliente, novoHorario, idReuniao } = req.body;

    let infoHora = ''
    let dataBr = formatarData(novaData)

    const [dia, mes, ano] = dataBr.split('/');
    const dataIso = `${ano}-${mes}-${dia}`;

    await AtualizaData(dataIso, novoHorario, idReuniao);

    if (!(novoHorario === '00:00'))
        infoHora += ` no horário ${novoHorario}`

    const msg = {
        to: clienteEmail,
        from: "matchsquad.brazil@gmail.com",
        subject: `Matchsquad - Consultoria remarcada!`,
        text: `Olá ${nomeCliente}, sua consultoria foi remarcada para o dia ${formatarData(novaData)}${infoHora}.`,
        html: `<strong> Olá ${nomeCliente},</strong><br>Sua consultoria foi remarcada para o dia <b> ${formatarData(novaData)}${infoHora}</b>.`,
    };

    const msg2 = {
        to: consultorEmail,
        from: "matchsquad.brazil@gmail.com",
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
        //Esta entrando pelo login
        if (email === '-1') {

            if (usertype === '0' && id !== '-1') {

                [logMail] = await connection.query(
                    `SELECT idLogin,email FROM Consultor WHERE idConsultor = ?;`, [usuario.id]
                );

                await pool.query(`UPDATE Consultor SET bloqueio = ? WHERE idLogin = ?;`, ['1', usuario.id]);
                await pool.query(`UPDATE Login SET senha = ?, codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);

            } else if (usuario.usertype === '1' && id !== '-1') {

                [logMail] = await connection.query(
                    `SELECT idLogin,email FROM Cliente WHERE idCliente = ?;`, [usuario.id]
                );

                await pool.query(`UPDATE Consultor SET bloqueio = ? WHERE idLogin = ?;`, ['1', usuario.id]);
                await pool.query(`UPDATE Login SET senha = ?, codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);

            }

            await connection.commit();

            msg = {
                to: logMail[0].email,
                from: "matchsquad.brazil@gmail.com",
                subject: `Matchsquad - Código de Confirmação`,
                text: `Por segurança alteramos sua senha. Copie o código de segurança abaixo para prosseguir E USE COMO SENHA. \n\n ${newNum}\n\n Não se esqueça de alterar a senha em configurações posteriormente, por questões de segurança!`,
                html: `<p>Copie o código de segurança abaixo para prosseguir usando-o como senha. <br><br>${newNum}<br><br> <strong>Não se esqueça de alterar a senha em configurações posteriormente, por questões de segurança!</strong></p>`,
            };

            console.log("MSG DO E-mail!", msg);
            //await sgMail.send(msg);

            return res.status(200).json({ success: true, message: "CAIU NO RETURN do nickname-senha" });

        } else {
            //Esta entrando pelo Esqueci a Senha
            let flag = 0;

            [search] = await connection.query(
                `SELECT idConsultor FROM Consultor WHERE email = ?;`, [email]
            );

            if (search.length > 0) {
                await connection.query(`UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`, ['1', search[0].idConsultor]);
            }

            if (search.length === 0) {
                flag = 1;

                [search] = await connection.query(
                    `SELECT idCliente FROM Cliente WHERE email = ?;`, [email]
                );

                await connection.query(`UPDATE Cliente SET bloqueio = ? WHERE idCliente = ?;`, ['1', search[0].idCliente]);

                if (search.length === 0)
                    return res.status(201).json({ success: false, message: "Erro: E-mail passado não esta na base de dados!" });
            }

            if (flag === 0) {
                const [logMail] = await connection.query(
                    `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [search[0].idConsultor]
                );

                await connection.query(`UPDATE Login SET codigoVerificacao = ?, senha = ? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);
                await connection.commit();

                const [user] = await connection.query(
                    `SELECT nickname, senha FROM Login WHERE idLogin = ?;`, [logMail[0].idLogin]
                );

                msg = {
                    to: email,
                    from: "matchsquad.brazil@gmail.com",
                    subject: `Matchsquad - Acesso a Conta`,
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

                await connection.query(`UPDATE Login SET codigoVerificacao = ?, senha =? WHERE idLogin = ?;`, [newNum, newNum, logMail[0].idLogin]);
                await connection.commit();

                const [user] = await connection.query(
                    `SELECT nickname, senha FROM Login WHERE idLogin = ?;`, [logMail[0].idLogin]
                );

                msg = {
                    to: email,
                    from: "matchsquad.brazil@gmail.com",
                    subject: `Matchsquad - Acesso a Conta`,
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

export async function ConfirmacaoEmailPosCadastro(req, res) {

    const usuario = req.body;

    let id = usuario.id || '-1';
    let usertype = usuario.usertype || '-1';
    let email = usuario.email || '-1';

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    let newNum = gerarNum6digitos();
    let msg;
    let search;

    try {

        let flag = 0;

        [search] = await connection.query(
            `SELECT idConsultor FROM Consultor WHERE email = ?;`, [email]
        );

        if (search.length > 0) {
            await connection.query(`UPDATE Consultor SET bloqueio = ? WHERE idConsultor = ?;`, ['1', search[0].idConsultor]);
        }

        if (search.length === 0) {
            flag = 1;

            [search] = await connection.query(
                `SELECT idCliente FROM Cliente WHERE email = ?;`, [email]
            );

            await connection.query(`UPDATE Cliente SET bloqueio = ? WHERE idCliente = ?;`, ['1', search[0].idCliente]);

            if (search.length === 0)
                return res.status(201).json({ success: false, message: "Erro: E-mail passado não esta na base de dados!" });
        }

        if (flag === 0) {
            const [logMail] = await connection.query(
                `SELECT idLogin FROM Consultor WHERE idConsultor = ?;`, [search[0].idConsultor]
            );

            await connection.query(`UPDATE Login SET codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, logMail[0].idLogin]);
            
            await connection.commit();

            const [user] = await connection.query(
                `SELECT nickname, senha FROM Login WHERE idLogin = ?;`, [logMail[0].idLogin]
            );

            msg = {
                to: email,
                from: "matchsquad.brazil@gmail.com",
                subject: `Matchsquad - Acesso a Conta`,
                text: `Para o usuário de nickname ${user[0].nickname} e senha ${user[0].senha}. Copie o código de segurança a seguir ${newNum}.`,
                html: `<p>Para o usuário de nickname ${user[0].nickname} e senha ${user[0].senha}. Copie o código de segurança a seguir ${newNum}</p>.`,
            };

            //await sgMail.send(msg);

            console.log("MSG DO E-mail!", msg);

            return res.status(201).json({ success: true, message: "CAIU NO RETURN do Consultor" });

        } else {

            const [logMail] = await connection.query(
                `SELECT idLogin FROM Cliente WHERE idCliente = ?;`, [search[0].idCliente]
            );

            await connection.query(`UPDATE Login SET codigoVerificacao = ? WHERE idLogin = ?;`, [newNum, logMail[0].idLogin]);
            
            await connection.commit();

            const [user] = await connection.query(
                `SELECT nickname, senha FROM Login WHERE idLogin = ?;`, [logMail[0].idLogin]
            );

            msg = {
                to: email,
                from: "matchsquad.brazil@gmail.com",
                subject: `Matchsquad - Acesso a Conta`,
                text: `Para o usuário de nickname ${user[0].nickname} e senha ${user[0].senha}. Copie o código de segurança a seguir ${newNum}.`,
                html: `<p>Para o usuário de nickname ${user[0].nickname} e senha ${user[0].senha}. Copie o código de segurança a seguir ${newNum}</p>.`,
            };

            //await sgMail.send(msg);

            console.log("MSG DO E-mail!", msg);

            return res.status(201).json({ success: true, message: "CAIU NO RETURN do Cliente" });
        }


    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.response?.body || error);
        res.status(500).json({ success: false, message: "Falha ao enviar e-mail" });
    } finally {
        connection.release();
    }

}

export async function EnviarCancelamentoAgendamento(Emails, Assunto, Data) {

    const msg = {
        to: Emails,
        from: "matchsquad.brazil@gmail.com",
        subject: `Matchsquad - Agendamento cancelado!`,
        html: `<p><strong> Olá! Estamos fazendo contato para relatar que houve o cancelamento de seu agendamento (${Data}) sobre ${Assunto}. Nossos consultores estão aguardando o seu retorno, e Matchsquad agradece a compreensão! </strong><br>
                Solicite um agendamento novamente em nossa plataforma a qualquer momento ;) </p>`
    };

    try {
        //await sgMail.send(msg);
        console.log("E-mail de cancelamento enviado com sucesso!", msg);

    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
    }

}

export async function EnviarConfirmacaoAgendamento(
    Emails,
    Assunto,
    Data,
    Horario,
    NomeConsultor,
    NomeCliente,
    JitsiLink
) {
    let nomeCli = NomeCliente;
    let nomeCon = NomeConsultor;

    let hora;
    if (Horario == '00:00')
        hora = '';
    else
        hora = `<li><strong>Horário:</strong> ${Horario}</li>`;

    const msg = {
        to: Emails,
        from: "matchsquad.brazil@gmail.com",
        subject: `Matchsquad - Agendamento confirmado: ${Assunto}!`,
        html: `
            <p><strong>Olá!</strong></p>
            <p>A sua consultoria de <strong>${NomeConsultor}</strong> está confirmada!</p>
            <p><strong>Detalhes da Reunião:</strong></p>
            <ul>
                <li><strong>Assunto:</strong> ${Assunto}</li>
                <li><strong>Data:</strong> ${Data}</li>
                ${hora}
                <li><strong>Link da Videochamada:</strong> <a href="${JitsiLink}">${JitsiLink}</a></li>
            </ul>
            <p>Por favor, acesse o link no horário agendado para iniciar sua videochamada.</p>
            <p>Qualquer dúvida, estamos à disposição.</p>
            <p>Atenciosamente,<br>
            A equipe Matchsquad</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log("E-mail de confirmação PRONTO para envio:", msg);
    } catch (error) {
        console.error("Erro ao enviar e-mail de confirmação:", error.response ? error.response.body : error);
        throw error;
    }
}

export async function SendAnnouncement(req, res) {

    const opt = req.params;

    const pack = req.body;

    if (!opt.numberOpt) {
        return res.status(201).json({ success: false, message: "Parâmetro obrigatório não passado." });
    }

    const numberOpt = parseInt(opt.numberOpt, 10);

    if (isNaN(numberOpt) || numberOpt < 0 || numberOpt > 4) {
        return res.status(201).json({ success: false, message: "Opção inválida" });
    }

    if (opt.numberOpt === '1') {


        const [rows] = await pool.query(`SELECT email FROM cliente WHERE bloqueio = 0;`);

        const emailClientes = rows.map(row => row.email);

        const msg = {
            to: emailClientes,
            from: "matchsquad.brazil@gmail.com",
            subject: `${pack.assunto}`,
            text: `${pack.corpo}`
        };

        console.log("MSG clientes", msg);

        try {
            //await sgMail.send(msg);
            return res.status(200).json({ success: true, message: "E-mails enviados aos clientes com sucesso!" });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error.response?.body || error);
            res.status(500).json({ success: false, message: "Falha ao enviar e-mail oas clientes" });
        }

    }

    if (opt.numberOpt === '2') {
        const [rows] = await pool.query(`SELECT email FROM consultor WHERE bloqueio = 0;`);

        const emailConsultores = rows.map(row => row.email);

        const msg = {
            to: emailConsultores,
            from: "matchsquad.brazil@gmail.com",
            subject: `${pack.assunto}`,
            text: `${pack.corpo}`
        };

        console.log("MSG consultores", msg);

        try {
            //await sgMail.send(msg);
            return res.status(200).json({ success: true, message: "E-mails enviados aos consultores com sucesso!" });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error.response?.body || error);
            res.status(500).json({ success: false, message: "Falha ao enviar e-mail oas consultores" });
        }
    }

    if (opt.numberOpt === '3') {
        const [rowsCli] = await pool.query(`SELECT email FROM cliente WHERE bloqueio = 0;`);
        const [rowsCon] = await pool.query(`SELECT email FROM consultor WHERE bloqueio = 0;`);

        const emailClientes = rowsCli.map(row => row.email);
        const emailConsultores = rowsCon.map(row => row.email);

        const allEmails = emailConsultores.concat(emailClientes);

        const msg = {
            to: allEmails,
            from: "matchsquad.brazil@gmail.com",
            subject: `${pack.assunto}`,
            text: `${pack.corpo}`
        };

        console.log("MSG clientes e consultores", msg);

        try {
            //await sgMail.send(msg);
            return res.status(200).json({ success: true, message: "E-mails enviados aos consultores com sucesso!" });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error.response?.body || error);
            res.status(500).json({ success: false, message: "Falha ao enviar e-mail oas consultores" });
        }
    }

    if (opt.numberOpt === '4') {

        if (!(pack.emailEspecifico)) {
            return res.status(201).json({ success: false, message: "Sem email singular para o envio" });
        }

        const msg = {
            to: pack.emailEspecifico,
            from: "matchsquad.brazil@gmail.com",
            subject: `${pack.assunto}`,
            text: `${pack.corpo}`
        };

        console.log("MSG especifico", msg);

        try {
            //await sgMail.send(msg);
            return res.status(200).json({ success: true, message: "E-mails enviados aos consultores com sucesso!" });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error.response?.body || error);
            res.status(500).json({ success: false, message: "Falha ao enviar e-mail oas consultores" });
        }
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
