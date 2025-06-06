import { carregarInfoPerfil, buscarHabilidades } from '../service/AJAX.js';


let consultores = [];
const searchBar = document.getElementById('searchBar');
const filtroHabilidade = document.getElementById('filtroHabilidade');
const botaoPesquisa = document.getElementById('botaoPesquisa');
const container = document.getElementById('maingrid');


let idConsultor;

document.addEventListener("DOMContentLoaded", async function () {

    await carregarHabilidades();

    consultores = await carregarInfoPerfil('-1', '-1');

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
        //localStorage.setItem("idConsultor", card.getAttribute('data-value'));
        idConsultor = card.getAttribute('data-value');

        console.log('idCon: ', idConsultor);

        window.open(`./Portifolio.html?id=${idConsultor}`, '_self');
    }
});

/*
//Criação da url da reunião:
function gerarUrlReuniao() {
    const sufixoUrl = matchMedia.random().toString(36).substring(2, 10);
    sufixoUrl = "consultoria_" + sufixoUrl;

    // Essa é a base JaaS (8x8.vc + ID do projeto)
    const baseUrl = 'https://8x8.vc/vpaas-magic-cookie-6b44b110cace40f8a723c05a52aa3bc8/';

    const urlSala = baseUrl + sufixoUrl;   
    
    return urlSala;
}
*/


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

function renderizarConsultores(lista) {
    container.innerHTML = '';

    lista.forEach((consultor) => {
        const cardHTML = `
            <div class="col-md-4">
                <div class="card mb-4 shadow-sm">
                    <div class="card-body" data-value="${consultor.idConsultor}">
                        <img src="${consultor.urlImagemPerfil}" class="img-box" alt="">
                        <br><br>
                        <h5 class="card-title">${consultor.nome}</h5>
                        <details class="card-text">
                            <summary>${consultor.habilidades}</summary>
                            <span>${consultor.bio}</span>
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

    botaoPesquisa.disabled = textoBusca === '' && habilidadeSelecionada === '';
}

botaoPesquisa.addEventListener('click', () => {
    filtrarConsultores();
});

filtroHabilidade.addEventListener('change', () => {
    filtrarConsultores();
});

function filtrarConsultores() {
    const textoBusca = searchBar.value.trim().toLowerCase();
    const habilidadeSelecionada = filtroHabilidade.value;

    const resultadoFiltrado = consultores
        .filter(c => {
            const nomeMatch = c.nome.toLowerCase().includes(textoBusca);
            const habilidadeMatch = habilidadeSelecionada === '' || habilidadeSelecionada === 'Todas as habilidades' || c.habilidades.includes(habilidadeSelecionada);
            return nomeMatch && habilidadeMatch;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome)); // ordenação alfabética por nome

    renderizarConsultores(resultadoFiltrado);
}


searchBar.addEventListener('input', verificarCamposFiltro);
filtroHabilidade.addEventListener('change', verificarCamposFiltro);