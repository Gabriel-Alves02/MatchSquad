import { comunicarGeral } from '../service/AJAX.js';

let modalComunicadosInstance = null;
let formComunicados = null;
let radioDestinoEmail = null; 
let inputEmailEspecificoDiv = null;
let inputEmailEspecifico = null;
let modalComunicadosElement = null;

export function abrirModalComunicados() {

    if (!modalComunicadosInstance) {
        modalComunicadosInstance = new bootstrap.Modal(modalComunicadosElement);
    }

    formComunicados.reset();
    inputEmailEspecificoDiv.style.display = 'none';
    inputEmailEspecifico.removeAttribute('required');
    modalComunicadosInstance.show();
}

document.addEventListener('DOMContentLoaded', function () {

    modalComunicadosElement = document.getElementById('modalComunicados');
    formComunicados = document.getElementById('formComunicados');
    radioDestinoEmail = document.querySelectorAll('input[name="destinoEmail"]');
    inputEmailEspecificoDiv = document.getElementById('inputEmailEspecifico');
    inputEmailEspecifico = document.getElementById('emailEspecifico');

    if (!modalComunicadosInstance) {
        modalComunicadosInstance = new bootstrap.Modal(modalComunicadosElement);
    }

    radioDestinoEmail.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === '4') {
                inputEmailEspecificoDiv.style.display = 'block';
                inputEmailEspecifico.setAttribute('required', 'required');
            } else {
                inputEmailEspecificoDiv.style.display = 'none';
                inputEmailEspecifico.removeAttribute('required');
                inputEmailEspecifico.value = '';
            }
        });
    });

    if (formComunicados) {
        formComunicados.addEventListener('submit', async function (event) {
            event.preventDefault();

            const assunto = document.getElementById('assuntoComunicado').value.trim();
            const mensagem = document.getElementById('mensagemComunicado').value.trim();
            const destinoSelecionado = document.querySelector('input[name="destinoEmail"]:checked').value;
            let emailEspecifico = null;

            if (destinoSelecionado === '4') {
                emailEspecifico = document.getElementById('emailEspecifico').value.trim();
                if (!emailEspecifico) {
                    alert("Por favor, digite o e-mail do usuário específico.");
                    return;
                }

                if (!/\S+@\S+\.\S+/.test(emailEspecifico)) {
                    alert("Por favor, digite um e-mail em formato válido.");
                    return;
                }
            }

            if (!assunto || !mensagem) {
                alert("Por favor, preencha todos os campos obrigatórios: Título, Assunto e Conteúdo.");
                return;
            }

            const dadosComunicado = {
                assunto: assunto,
                corpo: mensagem,
                emailEspecifico: emailEspecifico
            };

            console.log("Dados do comunicado:", dadosComunicado);
            console.log("Destino selecionado:", destinoSelecionado);

            await comunicarGeral(destinoSelecionado, dadosComunicado);

            modalComunicadosInstance.hide();
            formComunicados.reset();
           
        });
    }
});