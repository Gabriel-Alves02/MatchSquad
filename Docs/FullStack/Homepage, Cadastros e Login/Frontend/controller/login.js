import { getUser, getUserConsultor, userType, buscarCodigo, temBloqueio, enviarCodigo, verificado } from "../service/AJAX.js";
import { getUserId } from "./SysFx.js";

const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    let username = document.getElementById('nick').value;
    let codigoBanco = null;

    try {
        const test = await userType(username);

        let objLogin = {
            nickname: username,
            senha: document.getElementById('senha').value
        };

        if (test.message === "0") {
            localStorage.setItem("idConsultor", test.user);
            let idConsultor = getUserId(0);
            let codigo = null;
            const block = await temBloqueio(idConsultor, 0);
            if (block.message === 1) {
                do {
                    codigoBanco = await buscarCodigo(idConsultor, 0);
                    codigo = Number(window.prompt("Codigo de confirmação enviado no email:"));

                    if (codigo == null || codigo == "") {
                        break;
                    }

                    if (codigoBanco.message === codigo) {
                        alert("Parabéns! Conta verificada com sucesso.");
                        verificado(idConsultor, 0);
                        break;
                    }
                    
                    if (codigoBanco.message !== codigo) {
                        enviarCodigo(idConsultor, 0);
                        alert("Código invalido, consulte o email novamente para verificar o código de confirmação.");
                        break;
                    }

                } while (1);
            }
            //getUserConsultor(objLogin);

        } else if (test.message === "1") {
            localStorage.setItem("idCliente", test.user);
            let idCliente = getUserId(1);
            let codigo = null;
            const block = await temBloqueio(idCliente, 1);

            if (block.message === 1) {
                do {
                    codigoBanco = await buscarCodigo(idCliente, 1);
                    codigo = Number(window.prompt("Codigo de confirmação enviado no email:"));

                    if (codigo == null || codigo == "") {
                        break;
                    }

                    if (codigoBanco.message === codigo) {
                        alert("Parabéns! Conta verificada com sucesso.");
                        verificado(idCliente, 1);
                        break;
                    }
                    
                    if (codigoBanco.message !== codigo) {
                        alert("Código invalido, consulte o email novamente para verificar o código de confirmação.");
                        enviarCodigo(idCliente, 1);
                        break;
                    }

                } while (1);

            }
            //getUser(objLogin);
        } else {
            throw new Error('Erro na seleção binária do cliente ou consultor');
        }

    } catch (error) {
        console.error('Erro no login.js:', error);
    }

});