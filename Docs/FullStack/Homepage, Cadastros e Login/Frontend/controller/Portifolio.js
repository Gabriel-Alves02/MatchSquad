import { carregarInfoPerfil, habilidadesPortifolio, mediaPortifolio, Registrar, agendadoNovamente, horariosConsultor } from '../service/AJAX.js';
import { getUserId, capitalize } from './SysFx.js';

const profilePic = document.getElementById('profile-pic');
const galeriaCertif = document.getElementById('gallery');
const skillsContainer = document.getElementById('skills-container');
const averageStarsContainer = document.getElementById('average-stars');
const horarioTrab = document.getElementById('horarioTrab');
const nome = document.getElementById('nome');
const bio = document.getElementById('bio');
const endereco = document.getElementById('endereco');
const modalidade = document.getElementById('modalidade');
const prazo = document.getElementById('prazoReag');

const botaoAgendar = document.getElementById('btn-agendar');


let info;
let idValid;
let flagHorario = -1;
const userId = getUserId(1);


document.addEventListener('DOMContentLoaded', async function () {

    const periodoSelect = document.getElementById('periodo');
    const horarioInput = document.getElementById('horario');
    const navbarLogo = document.getElementById('navbarLogo');
    const inputData = document.getElementById("data-agendamento");

    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const amanhaFormatado = amanha.toISOString().split("T")[0];
    inputData.min = amanhaFormatado;

    const urlParams = new URLSearchParams(window.location.search);
    idValid = urlParams.get('id');

    console.log('idValid: ',idValid);

    if (!idValid) {
        idValid = getUserId(0);
        botaoAgendar.style.display = 'none';
        const btnVoltar = document.getElementById('btnVoltar');
        btnVoltar.href = 'MenuConsultor.html';
        navbarLogo.href = 'MenuConsultor.html';
        if (!idValid) {
            console.log('Nao acessado nem por cliente ou consultor');
        }
    }

    configurarLimitesHorario('manha');

    periodoSelect.addEventListener('change', function (e) {
        const novoPeriodo = e.target.value;
        configurarLimitesHorario(novoPeriodo);
    });

    horarioInput.addEventListener('change', function () {
        flagHorario = 1;
    });
    ;

    async function configurarLimitesHorario(periodo) {
        const horarioInput = document.getElementById('horario');
        const hourInitEnd = await horariosConsultor(idValid);
        const horarios = hourInitEnd.user?.[0];

        if (!horarios) {
            console.warn('Horários do consultor não encontrados');
            return;
        }

        let horarioInicio = horarios.horarioInicio.slice(0, 5);
        let horarioFim = horarios.horarioFim.slice(0, 5);

        const comercialMin = '07:00';
        const comercialMax = '17:30';

        if (horarioInicio < comercialMin) horarioInicio = comercialMin;
        if (horarioFim > comercialMax) horarioFim = comercialMax;

        let min, max;

        switch (periodo) {
            case 'manha':
                min = horarioInicio;
                max = '12:00';
                if (max > horarioFim) max = horarioFim;
                break;
            case 'tarde':
                min = '12:00';
                if (min < horarioInicio) min = horarioInicio;
                max = horarioFim;
                break;
            default:
                min = horarioInicio;
                max = horarioFim;
        }

        horarioInput.min = min;
        horarioInput.max = max;

        const horarioAtual = horarioInput.value;
        if (horarioAtual && (horarioAtual < min || horarioAtual > max)) {
            horarioInput.value = '';
        }

    }

    const repetido = await agendadoNovamente(getUserId(1), idValid);

    if (repetido) {
        botaoAgendar.disabled = true;
        botaoAgendar.innerHTML = '<i class="fas fa-calendar-xmark"></i> Já agendado';
    }

    info = await carregarInfoPerfil(idValid, 0);

    let urlImagemPerfil = info.urlImagemPerfil;

    console.log(urlImagemPerfil);


    let userHabilidades = await habilidadesPortifolio(idValid);

    if (info) {
        nome.innerHTML = info.nome;
        bio.innerHTML = info.bio;
        horarioTrab.innerHTML = "Inicia às: " + info.horarioInicio + "<br> Término às: " + info.horarioFim;
        let calcPrazo = (Number(info.prazoMinReag) + 1);
        prazo.innerHTML = `${calcPrazo}`;

        let modCorrect = info.modalidadeTrab;
        if (modCorrect == 'presencial_e_online') {
            modCorrect = modCorrect.replace(/_/g, ' ');
        }
        modalidade.innerHTML = capitalize(modCorrect);

        if (info.modalidadeTrab != 'online') {

            let cepFormatado = '';
            if (info.cep) {
                cepFormatado = (info.cep).substring(0, 5) + '-' + (info.cep).substring(5, 8);
            }

            endereco.innerHTML = ` ${info.endereco}, ${info.numeroCasa}<br>
                    ${info.bairro}, ${info.cidade} (${cepFormatado})`;
        }

        console.log(info.urlImagemPerfil);


        const localStorageUrl = localStorage.getItem('profilePicUrl');

        if (localStorageUrl) {
            profilePic.src = localStorageUrl;
        } else if (urlImagemPerfil) {
            profilePic.src = urlImagemPerfil;
        }
    }


    if (userHabilidades && userHabilidades.success && userHabilidades.habilidades && userHabilidades.habilidades.length > 0) {
        const habilidadesString = userHabilidades.habilidades[0].habilidades;

        if (habilidadesString) {

            const habilidadesArray = habilidadesString.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

            skillsContainer.innerHTML = '';

            habilidadesArray.forEach(skill => {
                const skillBadge = document.createElement('span');
                skillBadge.classList.add('badge', 'badge-info', 'p-2', 'mr-1', 'mb-1');
                skillBadge.textContent = skill;
                skillsContainer.appendChild(skillBadge);
            });
        }
    }

    const res = await mediaPortifolio(idValid);
    let avg;

    if (res.consultor.length === 0) {
        avg = 0;
    } else {
        if (!(Number.isNaN(res.consultor[0].media))) {
            avg = Number(res.consultor[0].media) || 0;
        }

    }

    if (averageStarsContainer) {
        averageStarsContainer.innerHTML = preencherestrelas(avg);
    }

    if (info.urlsCertificados !== null && info.urlsCertificados.length > 0) {

        let certificados = info.urlsCertificados.split(',');

        certificados.forEach(url => {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('col-6', 'col-md-3', 'mb-3');

            const img = document.createElement('img');
            img.src = url;
            img.classList.add('img-fluid', 'rounded', 'border', 'certificate-img');

            imgContainer.appendChild(img);
            galeriaCertif.appendChild(imgContainer);
        });
    }

    ativarZoomEmCertificados();

});


function ativarZoomEmCertificados() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('certificate-img')) {
            const src = e.target.src;

            const modalImg = document.getElementById('modalImg');
            modalImg.src = src;

            const modal = new bootstrap.Modal(document.getElementById('imgModal'));
            modal.show();
        }
    });
}

function preencherestrelas(value) {
    if (typeof value === 'number' && isFinite(value)) {
        let starsHtml = '';
        const roundedValue = Math.round(value * 2) / 2;

        for (let i = 1; i <= 5; i++) {
            if (i <= roundedValue) {
                // Estrela cheia
                starsHtml += `<i class="fas fa-star" style="color: #FFC83D;"></i>`;
            } else if (i - 0.5 === roundedValue) {
                // Meia estrela
                starsHtml += `<i class="fas fa-star-half-alt" style="color: #FFC83D;"></i>`;
            } else {
                // Estrela vazia
                starsHtml += `<i class="far fa-star" style="color: #FFC83D;"></i>`;
            }
        }
        return starsHtml;
    }
    return '-';
}


const modalForm = document.getElementById('modal-agendamento');
modalForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let endHour = '';
    if (flagHorario === 1)
        endHour = document.getElementById('horario').value;
    else
        endHour = '00:00:00';

    const data = document.getElementById('data-agendamento').value;
    const periodo = document.getElementById('periodo').value;
    const infoAdiantada = document.getElementById('infoAdiantada').value;
    const radioSelecionado = document.querySelector('input[name="tipo"]:checked');
    const horario = endHour;

    let urlReuniao = null;

    // if (radioSelecionado.value === 'online') {
    //     urlReuniao = gerarUrlReuniao();
    // }


    if (!data) {
        alert('Por favor, escolha uma data!');
        return;
    }

    const repetido = await agendadoNovamente(getUserId(1), idValid);

    if (repetido) {
        alert("Você já tem um agendamento com esse consultor!");
        fecharModal();
        return;
    }

    const PedidoAgendamento = {
        idConsultor: idValid,
        idCliente: getUserId(1),
        infoAdiantada: infoAdiantada,
        data: data,
        status_situacao: "pendente",
        tipo: radioSelecionado.value,
        periodo: periodo,
        link: urlReuniao,
        horario: horario || '00:00:00'
    };

    Registrar(PedidoAgendamento);
    fecharModal();
    window.location.reload();
});


function abrirModalAgendamento() {
    const modal = document.getElementById('modal-agendamento');
    const modalTitle = document.getElementById('modal-title');

    const nomeConsultor = document.getElementById('nome')?.innerText.trim();

    modalTitle.innerText = `Agendar com ${nomeConsultor}`;
    modal.style.display = 'block';

    document.getElementById('data-agendamento').value = '';
    document.getElementById('periodo').value = 'manha';
    document.getElementById('infoAdiantada').value = '';
    document.querySelector('input[name="tipo"][value="online"]').checked = true;

    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('close')) {
            fecharModal();
        }
    });
}


function fecharModal() {
    document.getElementById('data-agendamento').value = '';
    document.getElementById('periodo').value = 'manha';
    document.getElementById('infoAdiantada').value = '';
    document.getElementById('horario').value = '';
    document.querySelector('input[name="tipo"][value="online"]').checked = true;
    document.getElementById('modal-agendamento').style.display = 'none';
}

document.getElementById('btn-agendar').addEventListener('click', function () {
    abrirModalAgendamento();
});
