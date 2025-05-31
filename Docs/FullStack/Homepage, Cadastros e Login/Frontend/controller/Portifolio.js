import { carregarInfoPerfil, habilidadesPortifolio, mediaPortifolio } from '../service/AJAX.js';
import { getUserId } from './SysFx.js';

const profilePic = document.getElementById('profile-pic');
const galeriaCertif = document.getElementById('gallery');
const skillsContainer = document.getElementById('skills-container');
const averageStarsContainer = document.getElementById('average-stars');
const horarioTrab = document.getElementById('horarioTrab');
const nome = document.getElementById('nome');
const bio = document.getElementById('bio');
const prazo = document.getElementById('prazoReag');

let info;
let idValid;


document.addEventListener('DOMContentLoaded', async function () {

    const urlParams = new URLSearchParams(window.location.search);
    idValid = urlParams.get('id');

    if (!idValid) {
        idValid = getUserId(0);
        if (!idValid) {
            console.log('Nao acessado nem por cliente ou consultor');
        }
    }

    info = await carregarInfoPerfil(idValid, 0);


    let userHabilidades = await habilidadesPortifolio(idValid);

    if (info && info.length > 0) {
        nome.innerHTML = info[0].nome;
        bio.innerHTML = info[0].bio;
        horarioTrab.innerHTML = "Inicia às: " + info[0].horarioInicio + "<br> Término às: " + info[0].horarioFim;
        let calcPrazo = (Number(info[0].prazoMinReag) + 1);
        prazo.innerHTML = `${calcPrazo}`;

        let urlImagemPerfil = info[0].urlImagemPerfil;
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
            console.log('media: ', avg);
        }

    }

    if (averageStarsContainer) {
        averageStarsContainer.innerHTML = preencherestrelas(avg);
    }

    if (info[0].urlsCertificados !== null && info[0].urlsCertificados.length > 0) {

        let certificados = info[0].urlsCertificados.split(',');

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