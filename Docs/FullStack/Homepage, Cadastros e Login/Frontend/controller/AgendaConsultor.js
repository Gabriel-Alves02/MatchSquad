import { getUserId } from './SysFx.js';
import { buscarNome, buscarPrazo, confirmacaoEmail, carregarAgendamentos, agendamentoCancelado, confirmarReuniao } from '../service/AJAX.js';
import { createPopper } from '../node_modules/@popperjs/core/dist/esm/popper.js';



const idConsultor = getUserId(0);

document.addEventListener('DOMContentLoaded', async function () {

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        selectable: true,
        displayEventTime: false,
        editable: true,
        dayMaxEvents: true,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        validRange: {
            start: moment().format('YYYY-MM-DD')
        },
        eventClick: async function (info) {

            try {
                let resp = confirm(`Deseja cancelar o agendamento ?\nCliente: ${info.event._def.title} \nPeriodo: ${info.event.extendedProps.periodo} \nStatus: ${info.event.extendedProps.status}`);

                if (resp) {
                    await agendamentoCancelado (info.event.extendedProps.idReuniao);
                    alert("Agendamento excluido com sucesso!");
                    info.event.remove();
                }
            } catch (error) {
                console.error("Erro ao buscar o nome do cliente:", error);
            }
        }, eventDrop: async function (info) {
            const evento = info.event;
            const novaData = evento.start.toISOString();
            const clienteEmail = evento.extendedProps.emailCliente; // armazenar no extendedProps no momento do carregamento
            const consultorEmail = evento.extendedProps.emailConsultor; // idem

            const modal = document.getElementById('timeModal');
            const inputHorario = document.getElementById('horarioInput');
            const confirmBtn = document.getElementById('confirmHorario');

            inputHorario.value = '';

            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';

            let novoHorario = '';
            let payload = '';

            confirmBtn.onclick = async () => {

                const fullHorario = inputHorario.value;

                modal.style.display = 'none';

                payload = {
                    clienteEmail: clienteEmail,
                    consultorEmail: consultorEmail,
                    novaData: novaData,
                    nomeCliente: evento.title,
                    novoHorario: fullHorario,
                    id: info.event.extendedProps.idReuniao
                };

                console.log(payload);

                await confirmacaoEmail (payload);
                window.location.reload();
            };


        },
        eventDidMount: async function (info) {

            let hoje = new Date();
            let eventoData = new Date(info.event.start);

            let diffEmDias = Math.floor((eventoData - hoje) / (1000 * 60 * 60 * 24));

            const prazoReag = await buscarPrazo(idConsultor);

            if (diffEmDias < prazoReag.message) {
                info.event.setProp('editable', false);

                if (info.event.extendedProps.status !== 'confirmada') {
                    await confirmarReuniao (info.event.extendedProps.idReuniao);
                    info.event.extendedProps.status = 'confirmada';
                    window.location.reload();
                }
            } else {
                info.event.setProp('editable', true);
            }

            let tooltip = document.createElement('div');
            tooltip.classList.add('tooltip-custom');
            tooltip.innerHTML = `Cliente: ${info.event._def.title} <br>Info: ${info.event.extendedProps.infoAdiantada}<br>Periodo: ${info.event.extendedProps.periodo}<br>Status: ${info.event.extendedProps.status}<br>Horario: ${info.event.extendedProps.horario}`;
            document.body.appendChild(tooltip);

            const popperInstance = createPopper(info.el, tooltip, {
                placement: 'top',
                modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
            });


            info.el.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });


            info.el.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }
    });

    calendar.render();

    if (idConsultor) {

        try {
            const response = await carregarAgendamentos(idConsultor);

            if (response) {

                const eventosPromises = response.agendamentos.map(async agendamento => {
                    const cliente = await buscarNome(agendamento.idCliente, 1);
                    return {
                        title: `[${agendamento.tipo}] - ${cliente.message}`,
                        start: agendamento.data,
                        allDay: false,
                        extendedProps: {
                            idReuniao: agendamento.idReuniao,
                            idCliente: agendamento.idCliente,
                            infoAdiantada: agendamento.infoAdiantada,
                            periodo: agendamento.periodo,
                            horario: agendamento.horario,
                            status: agendamento.status_situacao,
                            emailCliente: agendamento.emailCliente,
                            emailConsultor: agendamento.emailConsultor
                        }
                    };
                });

                const eventos = await Promise.all(eventosPromises);

                eventos.forEach(evento => calendar.addEvent(evento));

            } else {
                alert("Ainda sem nenhum cliente agendado em seu calendário.");
            }

        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
        }

    }
});