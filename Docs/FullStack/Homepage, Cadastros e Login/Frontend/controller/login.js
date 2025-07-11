import { getUser, getUserConsultor, userType, buscarCodigo, buscarSenha, temBloqueio, enviarCodigo, buscarBanStatus, verificado, getAdmin } from "../service/AJAX.js";
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

        if (test.message === '-1') {
            alert('Este nickname não existe para nenhum usuário!');
            return;
        }


        if (test.message === "0") {

            localStorage.setItem("idConsultor", test.user);
            let idConsultor = getUserId(0);
            let codigo = null;
            const block = await temBloqueio(idConsultor, 0);

            if (block.message === -1) {
                alert("Você se encontra banido da nossa plataforma por não seguir os termos de uso!")
                return;
            }

            if (block.message === 1) {
                alert('Novos usuários ou usuários desativados, precisam realizar confirmação de código solicitada')
                //await enviarCodigoPosCadastro(idConsultor, 0);
                do {
                    codigoBanco = await buscarCodigo(idConsultor, '0');
                    codigo = Number(window.prompt("Codigo de confirmação enviado no email:"));

                    if (codigo == null || codigo == "") {
                        break;
                    }

                    if (codigoBanco.message === codigo) {
                        alert("Parabéns! Conta verificada com sucesso.");
                        verificado(idConsultor, 0);
                        const resp = await buscarSenha(idConsultor, 0);

                        if (resp.message == codigo) {
                            getUserConsultor(objLogin, '1');
                            break;
                        } else {
                            getUserConsultor(objLogin, '-1');
                            break;
                        }

                    }

                    if (codigoBanco.message !== codigo) {
                        enviarCodigo(idConsultor, 0, '-1');
                        alert("Código invalido, consulte o email novamente para verificar o código de confirmação.");
                        break;
                    }

                } while (1);
            } else {
                getUserConsultor(objLogin, '-1');
            }


        }
        else if (test.message === "1") {

            localStorage.setItem("idCliente", test.user);
            let idCliente = getUserId(1);
            let codigo = null;
            const block = await temBloqueio(idCliente, 1);

            if (block.message === -1) {
                alert("Você se encontra banido da nossa plataforma por não seguir os termos de uso!")
                return;
            }

            if (block.message === 1) {
                //await enviarCodigoPosCadastro(idConsultor, 0);
                alert('Novos usuários ou usuários excluídos, precisam realizar confirmação de código!')
                do {
                    codigoBanco = await buscarCodigo(idCliente, '1');
                    codigo = Number(window.prompt("Codigo de confirmação enviado no email:"));

                    if (codigo == null || codigo == "") {
                        break;
                    }
                    if (codigoBanco.message === codigo) {
                        alert("Parabéns! Conta verificada com sucesso.");
                        verificado(idCliente, 1);

                        const resp = await buscarSenha(idCliente, 1);

                        if (resp.message == codigo) {
                            getUser(objLogin, '1');
                            break;
                        } else {
                            getUser(objLogin, '-1');
                            break;
                        }
                    }

                    if (codigoBanco.message !== codigo) {
                        alert("Código invalido, consulte o email novamente para verificar o código de confirmação.");
                        enviarCodigo(idCliente, 1, '-1');
                        break;
                    }

                } while (1);

            } else {
                getUser(objLogin, '-1');
            }

        }
        else if (test.message === "3") {
            getAdmin(objLogin);
        }

    } catch (error) {
        console.error('Erro no login.js:', error);
    }

});

const modalSenha = document.getElementById('modal-dialog');

modalSenha.addEventListener('submit', async (event) => {
    event.preventDefault();

    let modalBody = document.getElementById('modal-body');
    let email = document.getElementById('email').value


    const infoBan = await buscarBanStatus(email);

    if (infoBan) {
        if (infoBan.status === 9) {
            modalBody.innerHTML = `
                <div class="text-center">
                    <p class="lead">Este email não esta cadastrado em nossa plataforma. Tente novamente. </p>
                </div>
            `;
        }

        else if (infoBan.status === -1) {
            modalBody.innerHTML = `
                <div class="text-center">
                    <p class="lead">Você se encontra banido da nossa plataforma por não seguir com os termos de uso. </p>
                </div>
            `;
        }

        else if (infoBan.status === 1 || infoBan.status === 0) {
            modalBody.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                    <p class="lead">Enviado email contendo o nickname e código para recuperação de acesso no ${email}. Consulte a caixa de entrada ou spam, e use este código como senha para logar na próxima vez =)</p>
                </div>
            `;

            enviarCodigo('-1', '-1', email);
        }

    } else {
        console.log('Erro interno. Entre em contato com o suporte da plataforma');
    }


});