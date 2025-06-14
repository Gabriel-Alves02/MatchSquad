import { carregarInfoPerfil, buscarHabilidades } from '../service/AJAX.js';
import { capitalize } from './SysFx.js';

let consultores = [];
const searchBar = document.getElementById('searchBar');
const filtroHabilidade = document.getElementById('filtroHabilidade');
// Novas referências para os elementos de filtro
const filtroModalidade = document.getElementById('filtroModalidade');
const filtroCidade = document.getElementById('filtroCidade');

const botaoPesquisa = document.getElementById('botaoPesquisa');
const container = document.getElementById('maingrid');

let idConsultor;

document.addEventListener("DOMContentLoaded", async function () {
    await carregarHabilidades();

    consultores = await carregarInfoPerfil('-1', '-1');

    console.log(consultores);

    popularFiltroCidades(consultores);
    renderizarConsultores(consultores);

    verificarCamposFiltro();
    filtrarConsultores();
});

const form = document.getElementById('consultores-grid');
form.addEventListener('click', (event) => {
    if (event.target.closest('summary')) {
        return;
    }

    const card = event.target.closest('.card-body');

    if (card) {
        idConsultor = card.getAttribute('data-value');
        console.log('idCon: ', idConsultor);
        window.open(`./Portifolio.html?id=${idConsultor}`, '_self');
    }
});

async function carregarHabilidades() {
    const res = await buscarHabilidades();
    const select = document.getElementById('filtroHabilidade');
    const allOption = document.createElement('option');
    allOption.value = "";
    allOption.textContent = "Todas as habilidades";
    select.appendChild(allOption);
    res.habilidades.forEach(hab => {
        const opt = document.createElement('option');
        opt.value = hab.nomeHabilidade;
        opt.textContent = hab.nomeHabilidade;
        select.appendChild(opt);
    });
}

function popularFiltroCidades(listaConsultores) {
    const cidades = new Set();
    listaConsultores.forEach(consultor => {
        if (consultor.cidade) {
            cidades.add(consultor.cidade.trim());
        }
    });

    const selectCidade = document.getElementById('filtroCidade');
    selectCidade.innerHTML = '<option value="">Todas as cidades</option>';

    Array.from(cidades).sort().forEach(cidade => {
        const opt = document.createElement('option');
        opt.value = cidade;
        opt.textContent = cidade;
        selectCidade.appendChild(opt);
    });
}

function renderizarConsultores(lista) {
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p class="text-center w-100">Nenhum consultor encontrado com os filtros selecionados.</p>';
        return;
    }

    lista.forEach((consultor) => {
        let enderecoDisplay = '';
        let modCorrect = consultor.modalidadeTrab;

        if (modCorrect === 'presencial_e_online') {
            modCorrect = modCorrect.replace(/_/g, ' ');
        }
        modCorrect = capitalize(modCorrect);

        if (consultor.modalidadeTrab !== 'online') {
            enderecoDisplay = consultor.cidade ? `${consultor.cidade}` : '';
        }

        let bioDescr = consultor.bio;
        if (bioDescr === null || bioDescr.length > 50) {
            bioDescr = 'Abra meu portfólio para saber mais.';
        }

        const cardHTML = `
            <div class="col-md-4">
                <div class="card mb-4 shadow-sm">
                    <div class="card-body" data-value="${consultor.idConsultor}">
                        <img src="${consultor.urlImagemPerfil}" class="img-box" alt="">
                        <br><br>
                        <h5 class="card-title">${consultor.nome}</h5>
                        <h6 class="card-text">${modCorrect}</h6>
                        <h7 class="card-text">${enderecoDisplay}</h7>
                        <details class="card-text">
                            <summary>${consultor.habilidades}</summary>
                            <span>${bioDescr}</span>
                        </details>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function verificarCamposFiltro() {
    const textoBusca = searchBar.value.trim();
    const habilidadeSelecionada = filtroHabilidade.value;
    const modalidadeSelecionada = filtroModalidade.value; // Novo
    const cidadeSelecionada = filtroCidade.value; // Novo

    botaoPesquisa.disabled = (textoBusca === '' && habilidadeSelecionada === '' && modalidadeSelecionada === '' && cidadeSelecionada === '');
}

filtroModalidade.addEventListener('change', () => {
    filtrarConsultores();
    verificarCamposFiltro();
});

filtroCidade.addEventListener('change', () => {
    filtrarConsultores();
    verificarCamposFiltro();
});


botaoPesquisa.addEventListener('click', () => {
    filtrarConsultores();
});

filtroHabilidade.addEventListener('change', () => {
    filtrarConsultores();
    verificarCamposFiltro();
});

searchBar.addEventListener('input', () => {
    verificarCamposFiltro();
    filtrarConsultores();
});


function filtrarConsultores() {
    const textoBusca = searchBar.value.trim().toLowerCase();
    const habilidadeSelecionada = filtroHabilidade.value;
    const modalidadeSelecionada = filtroModalidade.value;
    const cidadeSelecionada = filtroCidade.value;

    const resultadoFiltrado = consultores
        .filter(c => {
            const nomeMatch = c.nome.toLowerCase().includes(textoBusca);
            const habilidadeMatch = habilidadeSelecionada === '' || c.habilidades.includes(habilidadeSelecionada);


            let modalidadeMatch = true;
            if (modalidadeSelecionada === 'online') {
                modalidadeMatch = c.modalidadeTrab === 'online' || c.modalidadeTrab === 'presencial_e_online';
            } else if (modalidadeSelecionada === 'presencial') {

                modalidadeMatch = c.modalidadeTrab !== 'online';
            }

            let cidadeMatch = true;
            if (cidadeSelecionada !== '') {
                cidadeMatch = c.cidade && c.cidade.toLowerCase() === cidadeSelecionada.toLowerCase();
            }

            return nomeMatch && habilidadeMatch && modalidadeMatch && cidadeMatch;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));

    renderizarConsultores(resultadoFiltrado);
}