import { carregarDenuncias, comunicarGeral, trocarStatusDenuncia, finalizarDenuncia } from '../service/AJAX.js';
import { capitalize } from '../controller/SysFx.js';


let denuncias = [];
let modalComunicadosInstance = null;
let modalResolucaoInstance = null;
const modalComunicadosElement = document.getElementById('modalComunicados');


const emailField = document.getElementById('inputEmailEspecifico');

const filtros = document.getElementById('filtrosDenuncias');
const predefinedOptions = {
    gravidade: ['Baixa', 'Moderada', 'Grave'],
    sentido: ['Consultor → Cliente', 'Cliente → Consultor'],
    status: ['Pendente', 'Em analise', 'Resolvido']
};

document.addEventListener('DOMContentLoaded', async () => {


    if (!modalComunicadosInstance) {
        modalComunicadosInstance = new bootstrap.Modal(modalComunicadosElement);
    }

    try {
        const response = await carregarDenuncias();
        denuncias = response.complain;

        //console.log(denuncias)

        denuncias.sort((a, b) => new Date(b.dataDenuncia) - new Date(a.dataDenuncia));

        renderizarTabelaDenuncias(denuncias);
        aplicarFiltrosDenuncias();
        configurarFiltroDinamico();

        if (formComunicados) {
            formComunicados.addEventListener('submit', async function (event) {
                event.preventDefault();

                const assunto = document.getElementById('assuntoComunicado').value.trim();
                const mensagem = document.getElementById('mensagemComunicado').value.trim();
                const destinoSelecionado = '4';

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

                await comunicarGeral(destinoSelecionado, dadosComunicado);

                modalComunicadosInstance.hide();
                formComunicados.reset();

            });

        }


    } catch (error) {
        console.error("Erro ao carregar denúncias:", error);
    }
});

function formatarData(isoDate) {
    const data = new Date(isoDate);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function renderizarTabelaDenuncias(denunciasFiltradas) {
    const tabela = document.getElementById('tabelaDenuncias');
    let html = '';

    if (denunciasFiltradas.length === 0) {
        tabela.innerHTML = '<tr><td colspan="9" class="text-center">Nenhuma denúncia encontrada.</td></tr>';
        return;
    }

    html = denunciasFiltradas.map(denuncia => {
        let btnAcoes =
            `
        <div class="d-flex flex-nowrap justify-content-center gap-1">
            <button class="btn btn-outline-primary btn-sm contact-btn" data-id="${denuncia.idDenuncia}">Contato</button>
            <button class="btn btn-outline-primary btn-sm done-btn" data-id="${denuncia.idDenuncia}">Resolvido</button>
            <button class="btn btn-danger btn-sm ban-btn">Banir</button>
        </div>
        `;

        const previewDescricao = denuncia.descricao.length > 10 ?
            `${denuncia.descricao.substring(0, 10)}...` : denuncia.descricao;

        if (denuncia.status === 'resolvido') {
            return `
            <tr>
                <td>${formatarData(denuncia.dataDenuncia)}</td>
                <td>${denuncia.idDenuncia}</td>
                <td>${['Baixa', 'Moderada', 'Grave'][denuncia.gravidade]}</td>
                <td>${denuncia.sentido === 0 ? denuncia.nome_consultor : denuncia.nome_cliente}</td>
                <td>${denuncia.sentido === 0 ? 'Consultor → Cliente' : 'Cliente → Consultor'}</td>
                <td>${denuncia.sentido === 0 ? denuncia.nome_cliente : denuncia.nome_consultor}</td>
                <td>
                    <div class="descricao-cell" data-id="${denuncia.idDenuncia}">
                        <span class="preview-descricao">
                            ${previewDescricao}&ensp;
                            <button class="btn btn-outline-primary btn-sm expand-btn" data-bs-toggle="modal" data-bs-target="#descricaoModal">Expandir</button>
                        </span>
                    </div>
                </td>
                <td>${capitalize(denuncia.status)}</td>
                <td></td>
            </tr>
        `;
        } else {
            return `
            <tr>
                <td>${formatarData(denuncia.dataDenuncia)}</td>
                <td>${denuncia.idDenuncia}</td>
                <td>${['Baixa', 'Moderada', 'Grave'][denuncia.gravidade]}</td>
                <td>${denuncia.sentido === 0 ? denuncia.nome_consultor : denuncia.nome_cliente}</td>
                <td>${denuncia.sentido === 0 ? 'Consultor → Cliente' : 'Cliente → Consultor'}</td>
                <td>${denuncia.sentido === 0 ? denuncia.nome_cliente : denuncia.nome_consultor}</td>
                <td>
                    <div class="descricao-cell" data-id="${denuncia.idDenuncia}">
                        <span class="preview-descricao">
                            ${previewDescricao}&ensp;
                            <button class="btn btn-outline-primary btn-sm expand-btn" data-bs-toggle="modal" data-bs-target="#descricaoModal">Expandir</button>
                        </span>
                    </div>
                </td>
                <td>${capitalize(denuncia.status)}</td>
                <td>${btnAcoes}</td>
            </tr>
        `;
        }
    }).join('');

    tabela.innerHTML = html;
    atribuirEventosContato();
    atribuirEventosDescricao();
    atribuirEventosBanimento();
    atribuirEventosResolvido();
}

function configurarFiltroDinamico() {
    filtros.addEventListener('change', aoTrocarFiltro);
    aoTrocarFiltro();
}

function aoTrocarFiltro() {
    const filtroSelecionado = filtros.value;
    const container = document.querySelector('.historic-input-group');
    let inputAntigo = document.getElementById('searchBarDenuncias');
    if (inputAntigo) inputAntigo.remove();

    let novoElemento;
    if (['denunciante', 'denunciado'].includes(filtroSelecionado)) {
        novoElemento = document.createElement('input');
        novoElemento.type = 'search';
        novoElemento.placeholder = 'Pesquisar usuários';
    } else {
        novoElemento = document.createElement('select');

        const optionPadrao = new Option('Todos', '');
        novoElemento.appendChild(optionPadrao);

        (predefinedOptions[filtroSelecionado] || []).forEach(opcao => {
            novoElemento.appendChild(new Option(opcao, opcao));
        });
    }

    novoElemento.id = 'searchBarDenuncias';
    novoElemento.className = 'form-control me-2';
    container.insertBefore(novoElemento, filtros.nextSibling);

    novoElemento.addEventListener('input', aplicarFiltrosDenuncias);
    aplicarFiltrosDenuncias();
}

function aplicarFiltrosDenuncias() {
    const searchInput = document.getElementById('searchBarDenuncias');
    const termoPesquisa = searchInput?.value.toLowerCase().trim() || '';
    const filtroSelecionado = filtros.value;

    const filtradas = denuncias.filter(denuncia => {
        let valor = '';

        switch (filtroSelecionado) {
            case 'denunciante':
                valor = denuncia.sentido === 0 ? denuncia.nome_consultor : denuncia.nome_cliente;
                break;
            case 'denunciado':
                valor = denuncia.sentido === 0 ? denuncia.nome_cliente : denuncia.nome_consultor;
                break;
            case 'gravidade':
                valor = ['baixa', 'moderada', 'grave'][denuncia.gravidade];
                break;
            case 'sentido':
                valor = denuncia.sentido === 0 ? 'consultor → cliente' : 'cliente → consultor';
                break;
            case 'status':
                valor = denuncia.status.toLowerCase();
                break;
            default:
                return true;
        }

        return valor.toLowerCase().includes(termoPesquisa);
    });

    renderizarTabelaDenuncias(filtradas);
}


function atribuirEventosContato() {
    document.querySelectorAll('.contact-btn').forEach(botao => {
        botao.addEventListener('click', async event => {
            const id = parseInt(event.target.getAttribute('data-id'));
            const denuncia = denuncias.find(d => d.idDenuncia === id);
            if (!denuncia) return;

            await trocarStatusDenuncia(id);

            abrirModalComunicados();

            const radio = document.getElementById('destinoEspecifico');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }

            const inputEmail = document.getElementById('emailEspecifico');
            if (inputEmail) {
                inputEmail.value = `${denuncia.email_cliente}, ${denuncia.email_consultor}`;
            }
        });
    });
}

function atribuirEventosDescricao() {
    document.querySelectorAll('button[data-bs-toggle="modal"]').forEach(botao => {
        botao.addEventListener('click', event => {
            const descricaoCell = event.target.closest('.descricao-cell');
            const id = descricaoCell?.getAttribute('data-id');
            const denuncia = denuncias.find(d => d.idDenuncia == id);

            if (denuncia) {
                document.getElementById('descricaoConteudo').textContent = denuncia.descricao;
            }
        });
    });
}

function abrirModalComunicados() {
    if (!modalComunicadosInstance) {
        const modalElement = document.getElementById('modalComunicados');
        modalComunicadosInstance = new bootstrap.Modal(modalElement);
    }

    modalComunicadosInstance.show();
    emailField.style.display = 'block';
}

let modalBanimentoInstance = null;
let denunciaSelecionada = null;

function atribuirEventosBanimento() {
    document.querySelectorAll('.ban-btn').forEach(botao => {
        botao.addEventListener('click', event => {
            const linha = event.target.closest('tr');
            const id = parseInt(linha.querySelector('.contact-btn').getAttribute('data-id'));
            denunciaSelecionada = denuncias.find(d => d.idDenuncia === id);
            if (!denunciaSelecionada) return;

            const modalElement = document.getElementById('modalBanimento');
            if (!modalBanimentoInstance) {
                modalBanimentoInstance = new bootstrap.Modal(modalElement);
            }

            // Limpa campo
            document.getElementById('motivoBanimento').value = '';
            modalBanimentoInstance.show();
        });
    });
}

function atribuirEventosResolvido() {
    document.querySelectorAll('.done-btn').forEach(botao => {
        botao.addEventListener('click', event => {
            const id = parseInt(event.target.getAttribute('data-id'));
            denunciaSelecionada = denuncias.find(d => d.idDenuncia === id);

            const modalElement = document.getElementById('modalResolucao');
            if (!modalResolucaoInstance) {
                modalResolucaoInstance = new bootstrap.Modal(modalElement);
            }

            document.getElementById('mensagemResolucao').value = '';

            modalResolucaoInstance.show();
        });
    });
}

document.getElementById('confirmarResolucao').addEventListener('click', async () => {
    const mensagem = document.getElementById('mensagemResolucao').value.trim();

    if (!mensagem) {
        alert("Por favor, escreva uma mensagem de resolução.");
        return;
    }

    const objDone = {
        idDenuncia: denunciaSelecionada?.idDenuncia,
        obs: mensagem
        //data: new Date().toISOString()
    };

    try {
        modalResolucaoInstance.hide();
        await finalizarDenuncia(objDone, '0');
        const atualizada = await carregarDenuncias();
        denuncias = atualizada.complain;
        renderizarTabelaDenuncias(denuncias);

    } catch (error) {
        console.error("Erro ao resolver:", error);
        alert("Erro ao marcar como resolvido.");
    }
});


document.getElementById('confirmarBanimento').addEventListener('click', async () => {
    const motivo = document.getElementById('motivoBanimento').value.trim();
    if (!motivo) {
        alert("Por favor, informe o motivo do banimento.");
        return;
    }

    const objBanimento = {
        data: new Date().toISOString(),
        obs: motivo,
        idDenuncia: denunciaSelecionada?.idDenuncia
    };


    modalBanimentoInstance.hide();
    await finalizarDenuncia(objBanimento, '1');
    const atualizada = await carregarDenuncias();
    denuncias = atualizada.complain;
    renderizarTabelaDenuncias(denuncias);
});
