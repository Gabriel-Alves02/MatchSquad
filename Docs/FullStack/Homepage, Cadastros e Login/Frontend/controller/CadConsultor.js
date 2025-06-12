import { Cadastrar, carregarHabilidades, buscarNick_Email, buscarPFPJ, enviarCodigoPosCadastro } from "../service/AJAX.js";
import { cpf } from 'https://esm.sh/cpf-cnpj-validator';

let form, grupoEndereco, radiosModalidade;
let nomeusuario, emailusuario, telefoneusuario, nicknameusuario, senhausuario, msgcadastropessoa;
let confirmacaoEmail, confirmacaoSenha, cpfInput, cepInput, enderecoInput;
let numeroInput, complementoInput, bairroInput, cidadeInput;
let msgnome, msgemail, msgphone, msgnickname, msgsenha, msgconfirmacaoemail;
let msgconfirmacaosenha, msgcpf, msgcep, msgnumero;

const nomePattern = /^[A-Za-z\s]+$/;
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const nicknamePattern = /^\S+$/;
const numeroPattern = /^[0-9]+$/;

let htmlHab = '';

function limparErro(elementId) {
    const msgElement = document.getElementById(`msg${elementId}`);
    if (msgElement) {
        msgElement.style.display = 'none';
    }
}

function testeSenha(senha) {
    if (/(012|123|234|345|456|567|678|789)/.test(senha)) {
        return false;
    }

    if (/(987|876|765|654|543|432|321|210)/.test(senha)) {
        return false;
    }

    return true;
}

async function validarFormulario() {
    const errorMessages = document.querySelectorAll('[id^="msg"]');
    errorMessages.forEach(msg => msg.style.display = 'none');

    let isValid = true;

    if (!nomePattern.test(nomeusuario.value)) {
        msgnome.style.display = 'inline-block';
        nomeusuario.value = '';
        isValid = false;
    }

    const rawCpf = cpfInput.value.replace(/\D/g, '');

    if (rawCpf.length === 11) {
        if (!cpf.isValid(rawCpf)) {
            msgcpf.style.display = 'inline-block';
            cpfInput.value = '';
            isValid = false;
        }
    } 

    const resp = await buscarPFPJ (rawCpf);

    console.log(resp);

    if (resp.code === 1) {
        isValid = false;
        msgcadastropessoa.style.display = 'inline-block';
        cpfInput.value = '';
        cpfInput.focus();
    }

    if (!emailPattern.test(emailusuario.value)) {
        msgemail.style.display = 'inline-block';
        emailusuario.value = '';
        msgemail.innerHTML = 'E-mail inválido';
        isValid = false;
    } else if (emailusuario.value !== confirmacaoEmail.value) {
        msgconfirmacaoemail.style.display = 'inline-block';
        confirmacaoEmail.value = '';
        isValid = false;
    }

    if (!phonePattern.test(telefoneusuario.value)) {
        msgphone.style.display = 'inline-block';
        telefoneusuario.value = '';
        isValid = false;
    }

    if (!nicknamePattern.test(nicknameusuario.value) || nicknameusuario.value.length < 5 || nicknameusuario.value.length > 25) {
        msgnickname.style.display = 'inline-block';
        nicknameusuario.value = '';
        msgnickname.innerHTML = 'Nickname deve ter no mínimo 5 e no máximo 25 caracteres';
        isValid = false;
    }

    const objCheck = {
        nickname: nicknameusuario.value,
        email: emailusuario.value
    };
    const nickEmailCheck = await buscarNick_Email(objCheck);

    if (nickEmailCheck.code === 2 || nickEmailCheck.code === 3) {
        msgemail.style.display = 'inline-block';
        emailusuario.value = '';
        confirmacaoEmail.value = '';
        msgemail.innerHTML = 'E-mail já utilizado em nossa plataforma!';
        isValid = false;
    }

    if (nickEmailCheck.code === 1 || nickEmailCheck.code === 3) {
        msgnickname.style.display = 'inline-block';
        nicknameusuario.value = '';
        msgnickname.innerHTML = 'Nickname já utilizado em nossa plataforma!';
        isValid = false;
    }

    if (!testeSenha(senhausuario.value) || senhausuario.value.length < 8) {
        msgsenha.style.display = 'inline-block';
        senhausuario.value = '';
        isValid = false;
    } else if (senhausuario.value !== confirmacaoSenha.value) {
        msgconfirmacaosenha.style.display = 'inline-block';
        confirmacaoSenha.value = '';
        isValid = false;
    }

    const rawCpfValue = cpfInput.value.replace(/\D/g, '');

    if (!cpf.isValid(rawCpfValue)) {
        msgcpf.style.display = 'inline-block';
        cpfInput.value = '';
        msgcpf.innerHTML = 'CPF inválido!';
        isValid = false;
    }

    const valorSelecionado = document.querySelector('input[name="modalidade"]:checked').value;
    if (valorSelecionado === 'presencial' || valorSelecionado === 'presencial_e_online') {
        const rawCepValue = cepInput.value.replace(/\D/g, '');

        if (rawCepValue.length !== 8) {
            msgcep.style.display = 'inline-block';
            cepInput.value = '';
            msgcep.innerHTML = 'CEP deve ter 8 dígitos!';
            isValid = false;
        }

        if (!numeroPattern.test(numeroInput.value) || numeroInput.value.trim() === '') {
            msgnumero.style.display = 'inline-block';
            numeroInput.value = '';
            isValid = false;
        }
        if (enderecoInput.value.trim() === '') {
            isValid = false;
        }
        if (bairroInput.value.trim() === '') {
            isValid = false;
        }
        if (cidadeInput.value.trim() === '') {
            isValid = false;
        }
    }

    return isValid;
}

function getHabilities() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selecionados = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selecionados.push(checkbox.value);
        }
    });
    return selecionados;
}

async function cadastrarUsuario() {
    let listaHab = getHabilities();
    const valorSelecionado = document.querySelector('input[name="modalidade"]:checked').value;

    let objConsultor;

    if (valorSelecionado === 'presencial' || valorSelecionado === 'presencial_e_online') {
        objConsultor = {
            nome: nomeusuario.value,
            cpf: cpfInput.value,
            email: emailusuario.value,
            telefone: telefoneusuario.value,
            nickname: nicknameusuario.value,
            senha: senhausuario.value,
            cep: cepInput.value,
            endereco: enderecoInput.value,
            numero: numeroInput.value,
            bairro: bairroInput.value,
            complemento: complementoInput.value,
            cidade: cidadeInput.value,
            modalidade: valorSelecionado,
            habilidades: listaHab
        };
    } else {
        objConsultor = {
            nome: nomeusuario.value,
            cpf: cpfInput.value,
            email: emailusuario.value,
            telefone: telefoneusuario.value,
            nickname: nicknameusuario.value,
            senha: senhausuario.value,
            cep: null,
            endereco: null,
            numero: null,
            bairro: null,
            complemento: null,
            cidade: null,
            modalidade: valorSelecionado,
            habilidades: listaHab
        };
    }

    await Cadastrar(objConsultor);
    await enviarCodigoPosCadastro('-1', '-1', emailusuario.value);
    window.location.href = "./login.html";

}

async function handleCepInput() {
    let cep = cepInput.value.replace(/\D/g, '');
    limparErro('cep');

    enderecoInput.value = '';
    bairroInput.value = '';
    cidadeInput.value = '';

    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                console.log("CEP não encontrado ou inválido.");
                msgcep.style.display = 'inline-block';
                cepInput.value = '';
                msgcep.innerHTML = 'CEP não encontrado ou inválido.';
                return;
            }

            enderecoInput.value = data.logradouro;
            bairroInput.value = data.bairro;
            cidadeInput.value = data.localidade;
            numeroInput.focus();
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            msgcep.style.display = 'inline-block';
            msgcep.innerHTML = 'Erro ao buscar CEP. Tente novamente.';
            cepInput.value = '';
        }
    }
}

function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue += '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            if (value.length > 10) {
                formattedValue += ') ' + value.substring(2, 7);
            } else {
                formattedValue += ') ' + value.substring(2, 6);
            }
        }
        if (value.length > 6) {
            if (value.length > 10) {
                formattedValue += '-' + value.substring(7, 11);
            } else {
                formattedValue += '-' + value.substring(6, 10);
            }
        }
        e.target.value = formattedValue;
    });
}

function aplicarMascaraCep(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue += value.substring(0, 5);
        }
        if (value.length > 5) {
            formattedValue += '-' + value.substring(5, 8);
        }
        e.target.value = formattedValue;
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    form = document.getElementById('consultorForm');
    grupoEndereco = document.getElementById('grupoendereco');
    radiosModalidade = document.querySelectorAll('input[name="modalidade"]');

    nomeusuario = document.getElementById('nome');
    emailusuario = document.getElementById('email');
    telefoneusuario = document.getElementById('telefone');
    nicknameusuario = document.getElementById('nickname');
    senhausuario = document.getElementById('senha');
    confirmacaoEmail = document.getElementById('confirmacaoEmail');
    confirmacaoSenha = document.getElementById("confirmacaoSenha");
    cpfInput = document.getElementById('cpf');
    cepInput = document.getElementById('cep');
    enderecoInput = document.getElementById('endereco');
    numeroInput = document.getElementById('numero');
    complementoInput = document.getElementById('complemento');
    bairroInput = document.getElementById('bairro');
    cidadeInput = document.getElementById('cidade');

    msgnome = document.getElementById('msgnome');
    msgemail = document.getElementById('msgemail');
    msgphone = document.getElementById('msgphone');
    msgnickname = document.getElementById('msgnickname');
    msgsenha = document.getElementById('msgsenha');
    msgconfirmacaoemail = document.getElementById('msgconfirmacaoemail');
    msgconfirmacaosenha = document.getElementById('msgconfirmacaosenha');
    msgcpf = document.getElementById('msgcpf');
    msgcep = document.getElementById('msgcep');
    msgnumero = document.getElementById('msgnumero');
    msgcadastropessoa = document.getElementById('msgcadastropessoa');

    cepInput.removeAttribute('required');
    enderecoInput.removeAttribute('required');
    numeroInput.removeAttribute('required');
    bairroInput.removeAttribute('required');
    cidadeInput.removeAttribute('required');

    radiosModalidade.forEach(radio => {
        radio.addEventListener('change', function () {
            const valorSelecionado = document.querySelector('input[name="modalidade"]:checked').value;

            if (valorSelecionado === 'presencial' || valorSelecionado === 'presencial_e_online') {
                grupoEndereco.style.display = 'block';
                cepInput.setAttribute('required', 'required');
                enderecoInput.setAttribute('required', 'required');
                numeroInput.setAttribute('required', 'required');
                bairroInput.setAttribute('required', 'required');
                cidadeInput.setAttribute('required', 'required');
            } else {
                grupoEndereco.style.display = 'none';
                cepInput.value = '';
                enderecoInput.value = '';
                numeroInput.value = '';
                complementoInput.value = '';
                bairroInput.value = '';
                cidadeInput.value = '';

                cepInput.removeAttribute('required');
                enderecoInput.removeAttribute('required');
                numeroInput.removeAttribute('required');
                bairroInput.removeAttribute('required');
                cidadeInput.removeAttribute('required');

                limparErro('cep');
                limparErro('numero');
            }
        });
    });

    nomeusuario.addEventListener('keyup', () => limparErro('nome'));
    emailusuario.addEventListener('keyup', () => limparErro('email'));
    confirmacaoEmail.addEventListener('keyup', () => limparErro('confirmacaoemail'));
    telefoneusuario.addEventListener('keyup', () => limparErro('phone'));
    cpfInput.addEventListener('keyup', () => limparErro('cpf'));
    nicknameusuario.addEventListener('keyup', () => limparErro('nickname'));
    senhausuario.addEventListener('keyup', () => limparErro('senha'));
    confirmacaoSenha.addEventListener('keyup', () => limparErro('confirmacaosenha'));
    cepInput.addEventListener('keyup', handleCepInput); // Use a função nomeada
    numeroInput.addEventListener('keyup', () => limparErro('numero'));

    const habilidadesContainer = document.getElementById('habilidadesContainer');
    if (habilidadesContainer) {
        try {
            const consultor = await carregarHabilidades();
            if (consultor && consultor.habilidades) {
                consultor.habilidades.forEach((habilidade) => {
                    htmlHab += `
                        <div class="col-4 text-center">
                            <input type="checkbox" id="${habilidade.nomeHabilidade}" name="${habilidade.nomeHabilidade}" value="${habilidade.idHabilidade}" />
                            <label for="${habilidade.nomeHabilidade}">
                                ${habilidade.nomeHabilidade}
                            </label>
                        </div>
                    `;
                });
                habilidadesContainer.innerHTML = htmlHab;
            } else {
                console.warn("Nenhuma habilidade encontrada ou formato inesperado.");
            }
        } catch (error) {
            console.error("Erro ao carregar habilidades:", error);
        }
    } else {
        console.error("Elemento 'habilidadesContainer' não encontrado.");
    }

    aplicarMascaraTelefone(telefoneusuario);
    aplicarMascaraCep(cepInput);
    aplicarMascaraCpf(cpfInput);

    const initialSelectedModalidade = document.querySelector('input[name="modalidade"]:checked').value;
    if (initialSelectedModalidade !== 'presencial' && initialSelectedModalidade !== 'presencial_e_online') {
        grupoEndereco.style.display = 'none';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let listaHab = getHabilities();

        if (listaHab.length > 3 || listaHab.length <= 0) {
            alert('Por favor, selecione até no máximo 3 de suas melhores expertises');
            return;
        }

        const formValido = await validarFormulario();

        if (formValido) {
            await cadastrarUsuario();
        } else {
            console.log("Formulário inválido. Corrija os erros antes de enviar.");
        }
    });
});


function aplicarMascaraCpf(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
        let formattedValue = '';

        // Aplica a máscara de CPF: XXX.XXX.XXX-XX
        if (value.length > 0) {
            formattedValue = value.substring(0, 3);
        }
        if (value.length > 3) {
            formattedValue += '.' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formattedValue += '.' + value.substring(6, 9);
        }
        if (value.length > 9) {
            formattedValue += '-' + value.substring(9, 11);
        }

        e.target.value = formattedValue;
    });
}