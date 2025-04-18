import express from 'express';
import cors from 'cors';
import { CadastrarCliente } from './controller/Cliente.js';
import { Login } from './controller/LoginBackend.js';
import { UserType } from './controller/LoginBackend.js';
import { CadastrarConsultor } from './controller/Consultor.js';
import { RegistrarAgendamento, BuscarAgenda, AgendamentoRepetido } from './controller/PedidoAgendamento.js';
import { GetCode, GetName, GetBlockStatus, RefreshBlock, GetIfNicknameIsValid } from './controller/SysFx.js';
import { EnviarEmailRemarcacao, ConfirmacaoEmail } from './service/sendgrid.js';

const app = express();

app.use(cors({
    origin: "*", // Pode ser ajustado para permitir apenas domínios específicos exemplo http://127.0.0.1:8000
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["X-PINGOTHER", "Content-Type", "Authorization"]
}));

app.use(express.json()); // exp interpreta txt por padrão, aux p/ o body ser lido
                            // Habilita parsing de JSON no body das requisições

//ENDPOINTS
app.post('/clientes/cadCliente', CadastrarCliente);
app.post('/clientes/cadConsultor', CadastrarConsultor);
app.post('/checks', UserType );
app.post('/clientes/login', Login);
app.post('/consultores/login', Login);
app.post('/clientes/agendamento', RegistrarAgendamento);
app.post('/notifications', EnviarEmailRemarcacao)

app.put('/notifications', ConfirmacaoEmail)
app.put('/checks/verified', RefreshBlock)

app.get('/consultores/agenda/:idConsultor', BuscarAgenda);
app.post('/consultores/agenda/:idConsultor', EnviarEmailRemarcacao);
app.get('/checks/:nickname', GetIfNicknameIsValid);
app.get('/checks/:id/:usertype/name', GetName);
app.get('/checks/:id/:usertype/code', GetCode);
app.get('/checks/:id/:usertype/block', GetBlockStatus);
app.get("/checks/:idCliente/:idConsultor", AgendamentoRepetido);



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