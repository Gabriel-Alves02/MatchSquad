import { getUserId } from './SysFx.js';
import { carregarAgendamentos } from '../service/req_respManager.js';

document.addEventListener('DOMContentLoaded', async function () {

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        selectable: true,
        validRange: {
            start: moment().format('YYYY-MM-DD')
        },
        resources: [
            {
                id: 'a',
                title: 'Room A'
            }
        ],
        events: [
            {
                id: '1',
                resourceId: 'a',
                title: 'Meeting',
                start: '2025-01-01',
            }
        ],
        dateClick: function (info) {
            alert('clicked ' + info.dateStr);
        },
        select: function (info) {
            alert('selected ' + info.startStr + ' to ' + info.endStr);
        }
    });

    calendar.render();

    const idConsultor = getUserId(0);

    if (idConsultor) {
        const agendamentos = await carregarAgendamentos(idConsultor);
        console.log("Agendamentos recebidos:", agendamentos);
    } else {
        console.log("Nenhum usuário logado.");
    }
});