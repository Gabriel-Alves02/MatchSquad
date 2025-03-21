import express from 'express';
import cors from 'cors';
import { CadastrarCliente } from './controller/Cliente.js';
import { Login } from './controller/LoginBackend.js';
import { CadastrarConsultor } from './controller/Consultor.js';
import { RegistrarPedido } from './controller/PedidoAgendamento.js';

const app = express();

app.use(cors({
    origin: "*", // Pode ser ajustado para permitir apenas domínios específicos
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["X-PINGOTHER", "Content-Type", "Authorization"]
}));

app.use(express.json()); // exp interpreta txt por padrão, aux p/ o body ser lido
                            // Habilita parsing de JSON no body das requisições

//ENDPOINTS
app.post('/clientes/login', Login);
app.post('/clientes/cadCliente', CadastrarCliente);
app.post('/clientes/cadConsultor', CadastrarConsultor);

app.post('/clientes/pedidoAgendamento', RegistrarPedido);

// console.log("Banco de Dados:", process.env.DB_NAME);
// console.log("Rodando na porta:", process.env.PORT);

//BASTIDORES

app.get('/ping', (request,response,next) => {
    response.send({
        message: "pong"
    });
});

console.log("host: " + process.env.DB_HOST, "user: " + process.env.DB_USER,"password: " + process.env.DB_PASSWORD,"database: " + process.env.DB_NAME);

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