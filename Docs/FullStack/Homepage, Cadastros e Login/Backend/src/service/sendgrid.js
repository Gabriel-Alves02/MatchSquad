import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_KEY);

// const msg = {
//     to: "", //variavel para email
//     from: "", //variavel para email
//     subject: "", //variavel para email
//     text: "", //variavel para email
//     html: "", //variavel para email
// };

// sgMail.send(msg);

export async function enviarEmailRemarcacao(req, res) {
    const { clienteEmail, novaData, nomeCliente } = req.body;

    let nome = nomeCliente.split(' - ')[1];

    const msg = {
        to: clienteEmail,
        from: "matchsquad.brasil@gmail.com",
        subject: `Consultoria remarcada!`,
        text: `Olá ${nome}, sua consultoria foi remarcada para o dia ${formatarData(novaData)}.`,
        html: `<strong>Olá ${nome},</strong><br>Sua consultoria foi remarcada para o dia <b>${formatarData(novaData)}</b>.`,
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
