import express from 'express';
import cors from 'cors';
import { CadastrarCliente, Reviewed } from './controller/Cliente.js';
import { Login } from './controller/LoginBackend.js';
import { UserType } from './controller/LoginBackend.js';
import { CadastrarConsultor, GetHabilidades, RecordMeetLog, GetHabConsultor, ConsultarMediaConsultor } from './controller/Consultor.js';
import { RegistrarAgendamento, BuscarAgenda, BuscarSolicitacoes, AgendamentoRepetido, CancelaAgendamento, ConfirmaAgendamento, ConcluiAgendamento } from './controller/PedidoAgendamento.js';
import { GetCode, GetPrazo, GetName, GetBlockStatus, RefreshBlock, GetIfNickEmailIsValid, GetIfPFPJIsValid, LoadProfile, RefreshProfile, GoCloudImage, GoCloudCertificateImage, WipeCloud, GetPassword, EndUser, RefreshPassword, SubmitComplaint, GetReport, GetWorkRange } from './controller/SysFx.js';
import { EnviarEmailRemarcacao, ConfirmacaoEmail, ConfirmacaoEmailPosCadastro, SendAnnouncement } from './service/sendgrid.js';
import { RegistrarReuniao } from './controller/RegistrarReuniao.js';
import { ConsultarHistorico } from './controller/HistoricoConsultorias.js';
import { LoadMatchHistory, LoadHistory } from './controller/Historico.js';
import { GetComplaints, ChangeReportStatus, EndReport } from './controller/Denuncias.js'
import { QtdeConsultoriasAgendadas, DiasSemanaConsultoriaDetalhado, HistoricoAvaliacaoConsultor } from './controller/DashboardConsultor.js';
import { QtdeUsuariosPorBloqueio, MediasAvaliacaoConsultores, TopConsultoresPorReunioesRealizadas } from './controller/DashboardAdministrador.js';

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(cors({
    origin: "*", //  http://127.0.0.1:8000
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["X-PINGOTHER", "Content-Type", "Authorization"]
}));

app.use(express.json()); // exp interpreta txt por padrão, aux p/ o body ser lido
// Habilita parsing de JSON no body das requisições

//ENDPOINTS
app.post('/clientes/cadCliente', CadastrarCliente);
app.post('/clientes/cadConsultor', CadastrarConsultor);
app.post('/checks', UserType );
app.post('/checks/:id/:usertype/denuncia', SubmitComplaint );
app.post('/clientes/login', Login);
app.post('/consultores/login', Login);
app.post('/administradores/login', Login);
app.post('/clientes/agendamento', RegistrarAgendamento);
app.post('/notifications', EnviarEmailRemarcacao)
app.post('/clientes/registrarReuniao', RegistrarReuniao);
app.put('/clientes/avaliacao', Reviewed );
app.put('/notifications', ConfirmacaoEmail);
app.put('/notifications/cadastrado', ConfirmacaoEmailPosCadastro);
app.put('/checks/verified', RefreshBlock);
app.put('/checks/agenda/:id/cancela', CancelaAgendamento ); // Antes tinha para cliente e consultor, foi unificado
app.put('/checks/agenda/:id/confirma', ConfirmaAgendamento );
app.put('/consultores/reuniao-concluida/:idReuniao', ConcluiAgendamento );
//app.put('/administrador/denuncias/banir', BloquearUsuario)
app.get('/consultores/habilidades', GetHabilidades);
app.get('/consultores/habilidades/:id', GetHabConsultor);
app.get('/consultores/media/:id', ConsultarMediaConsultor );
app.get('/consultores/agenda/:idConsultor', BuscarAgenda);
app.get('/administradores/denuncias', GetComplaints );
app.put('/administradores/statusDenuncia/:idDenuncia', ChangeReportStatus );
app.put('/administradores/vereditoDenuncia/:opt', EndReport );
app.get('/consultores/historico/:idConsultor', BuscarSolicitacoes);
app.post('/consultores/agenda', EnviarEmailRemarcacao);
app.post('/checks/nickname-email', GetIfNickEmailIsValid);
app.post('/checks/cpf-cnpj', GetIfPFPJIsValid);
app.get('/checks/horarios/:idConsultor', GetWorkRange );
app.get('/checks/:id/:usertype/name', GetName);
app.get('/consultores/:id/prazo', GetPrazo);
app.get('/checks/:id/:usertype/code', GetCode);
app.get('/checks/:id/:usertype/block', GetBlockStatus);
app.get("/checks/:idCliente/:idConsultor", AgendamentoRepetido);
app.get('/consultores/historico/:nomeCliente', ConsultarHistorico);
app.get('/checks/denuncia/:id/:usertype/:id2', GetReport);
app.get('/clientes/historico/:id', LoadMatchHistory);
app.get('/consultores/solicitacoes/:id', LoadHistory);
app.post('/consultores/registrarReuniao', RecordMeetLog);


app.post('/administradores/comunicados/:numberOpt', SendAnnouncement);

// app.get('/administrador/denuncias/:nomeUsuario', ConsultarUsuariosDenunciados);
// app.get('/administrador/denuncias/:idUsuario/:tipoUsuario', ConsultarDenuncias);

app.get("/checks/perfil/:id/:usertype", LoadProfile);
app.put("/checks/perfil/:id/:usertype/refresh", RefreshProfile);
app.post("/checks/perfil/:id/:usertype/image", upload.single('profilePic'), GoCloudImage)
app.post("/consultores/perfil/:id/certificados", upload.single('certificatePic'), GoCloudCertificateImage);
app.delete("/checks/perfil/:id/:usertype/limparImagens", WipeCloud );


app.put("/checks/senha/:id/:usertype/refresh", RefreshPassword)

app.get("/checks/:id/:usertype/senha", GetPassword);
app.put("/checks/:id/:usertype/desativar", EndUser);

app.get("/consultores/dashboard/totalAgendamentos/:id", QtdeConsultoriasAgendadas);
app.get("/consultores/dashboard/demandaDias/:id", DiasSemanaConsultoriaDetalhado);
app.get("/consultores/dashboard/historicoAvaliacao/:id", HistoricoAvaliacaoConsultor);

app.get("/administradores/dashboard/totalDenuncias", QtdeUsuariosPorBloqueio);
app.get("/administradores/dashboard/mediaAvaliacao", MediasAvaliacaoConsultores);
app.get("/administradores/dashboard/top5Consultores", TopConsultoresPorReunioesRealizadas);


app.get('/ping', (request,response,next) => {
    response.send({
        message: "pong"
    });
});


//console.log("host: " + process.env.DB_HOST, "user: " + process.env.DB_USER,"password: " + process.env.DB_PASSWORD,"database: " + process.env.DB_NAME);

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}...`);
});

/*
).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`A porta ${PORT} já está em uso!`);
    }
})
*/