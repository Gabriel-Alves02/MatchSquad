import express from 'express';
import cors from 'cors';
import { CadastrarCliente, Reviewed } from './controller/Cliente.js';
import { Login } from './controller/LoginBackend.js';
import { UserType } from './controller/LoginBackend.js';
import { CadastrarConsultor, GetHabilidades, RecordMeetLog } from './controller/Consultor.js';
import { RegistrarAgendamento, BuscarAgenda, BuscarSolicitacoes, AgendamentoRepetido, CancelaAgendamento } from './controller/PedidoAgendamento.js';
import { GetCode, GetPrazo, GetName, GetBlockStatus, RefreshBlock, GetIfNicknameIsValid, LoadProfile, RefreshProfile, GoCloudImage, GetPassword, EndUser, RefreshPassword, SubmitComplaint, GetReport } from './controller/SysFx.js';
import { EnviarEmailRemarcacao, ConfirmacaoEmail, SendAnnouncement } from './service/sendgrid.js';
import { RegistrarReuniao } from './controller/RegistrarReuniao.js';
import { ConsultarHistorico } from './controller/HistoricoConsultorias.js';
import { LoadMatchHistory, LoadHistory } from './controller/Historico.js';
import { GetComplaints } from './controller/Denuncias.js'
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
app.put('/checks/verified', RefreshBlock);
app.put('/consultores/agenda/:id', CancelaAgendamento );
app.put('/clientes/agenda/:id', CancelaAgendamento );
//app.put('/administrador/denuncias/bloquearUsuario', BloquearUsuario)
app.get('/consultores/habilidades', GetHabilidades);
app.get('/consultores/agenda/:idConsultor', BuscarAgenda);
app.get('/administradores/denuncias', GetComplaints );
app.get('/consultores/historico/:idConsultor', BuscarSolicitacoes);
app.post('/consultores/agenda/:idConsultor', EnviarEmailRemarcacao);
app.get('/checks/:nickname', GetIfNicknameIsValid);
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
app.put("/checks/senha/:id/:usertype/refresh", RefreshPassword)

app.get("/checks/:id/:usertype/senha", GetPassword);
app.put("/checks/:id/:usertype/desativar", EndUser);



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