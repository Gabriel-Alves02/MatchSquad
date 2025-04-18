import { getUserId } from './SysFx.js';
import { buscarNome, enviarRemarcacao, carregarAgendamentos } from '../service/AJAX.js';
import { createPopper } from '../node_modules/@popperjs/core/dist/esm/popper.js';


document.addEventListener('DOMContentLoaded', async function () {

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        selectable: true,
        displayEventTime: false,
        editable: true,
        validRange: {
            start: moment().format('YYYY-MM-DD')
        },
        editable: true,
        // dateClick: function (info) {
        //     alert('clicked ' + info.dateStr);
        // },
        // select: function (info) {
        //     alert('selected ' + info.startStr + ' to ' + info.endStr);
        // },
        eventClick: async function (info) {

            try {
                alert(`Cliente: ${info.event._def.title} \nInfo: ${info.event.extendedProps.infoAdiantada}\nPeriodo: ${info.event.extendedProps.periodo}\nStatus: ${info.event.extendedProps.status}\nHorario: ${info.event.extendedProps.horario}`);

            } catch (error) {
                console.error("Erro ao buscar o nome do cliente:", error);
                alert("Erro ao carregar os detalhes do cliente.");
            }
        }, eventDrop: async function (info) {
            const evento = info.event;
            const novaData = evento.start.toISOString();
            const clienteEmail = evento.extendedProps.emailCliente; // armazenar no extendedProps no momento do carregamento
            const consultorEmail = evento.extendedProps.emailConsultor; // idem

            const payload = {
                clienteEmail: clienteEmail,
                consultorEmail: consultorEmail,
                novaData: novaData,
                nomeCliente: evento.title,
            };

            enviarRemarcacao(payload);

        },
        eventDidMount: function (info) {

            let hoje = new Date();
            let eventoData = new Date(info.event.start);

            let diffEmDias = Math.floor((eventoData - hoje) / (1000 * 60 * 60 * 24));

            if (diffEmDias <= 1) {
                info.el.classList.add("no-drag");
            }

            let tooltip = document.createElement('div');
            tooltip.classList.add('tooltip-custom');
            tooltip.innerHTML = `Cliente: ${info.event._def.title} <br>Info: ${info.event.extendedProps.infoAdiantada}<br>Periodo: ${info.event.extendedProps.periodo}<br>Status: ${info.event.extendedProps.status}<br> Horario: ${info.event.extendedProps.horario}`;
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

    const idConsultor = getUserId(0);

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
