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
// endereco não precisa ser global, é usado apenas na renderização

document.addEventListener("DOMContentLoaded", async function () {
    await carregarHabilidades();

    consultores = await carregarInfoPerfil('-1', '-1');

    console.log(consultores);

    popularFiltroCidades(consultores); // Chamar para popular as cidades
    renderizarConsultores(consultores);

    verificarCamposFiltro();
    // Chamar filtrarConsultores() para aplicar quaisquer filtros iniciais (e.g., se houver valores pré-selecionados)
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
    // Limpar opções existentes, exceto a primeira "Todas as cidades"
    selectCidade.innerHTML = '<option value="">Todas as cidades</option>';

    // Adicionar cidades ordenadas
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

        // Apenas mostra o endereço se a modalidade não for 'online'
        if (consultor.modalidadeTrab !== 'online') {
            enderecoDisplay = consultor.cidade ? `${consultor.cidade}` : '';
            // Se quiser bairro também, descomente a linha abaixo e ajuste:
            // enderecoDisplay = `${consultor.bairro ? consultor.bairro + ', ' : ''}${consultor.cidade}`;
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

    // O botão de pesquisa estará desabilitado se TODOS os campos de filtro estiverem vazios/selecionados como "Todas"
    botaoPesquisa.disabled = (textoBusca === '' && habilidadeSelecionada === '' && modalidadeSelecionada === '' && cidadeSelecionada === '');
}

// Event listeners para os novos filtros
filtroModalidade.addEventListener('change', () => {
    filtrarConsultores();
    verificarCamposFiltro(); // Atualiza o estado do botão
});

filtroCidade.addEventListener('change', () => {
    filtrarConsultores();
    verificarCamposFiltro(); // Atualiza o estado do botão
});

// Event listeners já existentes
botaoPesquisa.addEventListener('click', () => {
    filtrarConsultores();
});

filtroHabilidade.addEventListener('change', () => {
    filtrarConsultores();
    verificarCamposFiltro(); // Atualiza o estado do botão
});

searchBar.addEventListener('input', () => {
    verificarCamposFiltro();
    filtrarConsultores(); // Adicionado para filtrar ao digitar
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

            // Lógica para filtro de modalidade
            let modalidadeMatch = true;
            if (modalidadeSelecionada === 'online') {
                modalidadeMatch = c.modalidadeTrab === 'online' || c.modalidadeTrab === 'presencial_e_online';
            } else if (modalidadeSelecionada === 'presencial') {
                // Considera "presencial" e "presencial_e_online" como "presencial / ambos"
                modalidadeMatch = c.modalidadeTrab !== 'online';
            }
            // Se modalidadeSelecionada for '', modalidadeMatch permanece true (todas as modalidades)

            // Lógica para filtro de cidade
            let cidadeMatch = true;
            if (cidadeSelecionada !== '') {
                cidadeMatch = c.cidade && c.cidade.toLowerCase() === cidadeSelecionada.toLowerCase();
            }

            return nomeMatch && habilidadeMatch && modalidadeMatch && cidadeMatch;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome)); // ordenação alfabética por nome

    renderizarConsultores(resultadoFiltrado);
}