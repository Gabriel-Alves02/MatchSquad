//Executa após o carregamento completo do documento HTML
document.addEventListener('DOMContentLoaded', function() {
    //Recebe o seletor calendar do atributo id
    var calendarEl = document.getElementById('calendar');

    //Instancia Fullcalendar.Calendar e atribui a variável calendar
    var calendar = new FullCalendar.Calendar(calendarEl, {

      //Definição do cabeçalho do calendário  
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },

      //Tradução para Português Brasil
      locale: 'pt-br',

      //Definição da data inicial
      //initialDate: '2023-01-12', //data padrão
      initialDate: '2025-03-18',
      navLinks: true, // can click day/week names to navigate views
      selectable: true, //permite clicar e arrastar o mouse sobre os dias do calendário
      selectMirror: true, //indica visualmnte a área selecionada antes do usuário soltar o botão do mouse
      
      //Permite arrastar e redimensionar eventos diretamente no calendário
      editable: true,
      dayMaxEvents: true, //máximo de eventos por dia de acordo com a altura da célula deste
      events: [
        {
          title: 'All Day Event',
          start: '2023-01-01'
        },
        {
          title: 'Long Event',
          start: '2023-01-07',
          end: '2023-01-10'
        },
        {
          groupId: 999,
          title: 'Repeating Event',
          start: '2023-01-09T16:00:00'
        },
        {
          groupId: 999,
          title: 'Repeating Event',
          start: '2023-01-16T16:00:00'
        },
        {
          title: 'Conference',
          start: '2023-01-11',
          end: '2023-01-13'
        },
        {
          title: 'Meeting',
          start: '2023-01-12T10:30:00',
          end: '2023-01-12T12:30:00'
        },
        {
          title: 'Lunch',
          start: '2023-01-12T12:00:00'
        },
        {
          title: 'Meeting',
          start: '2023-01-12T14:30:00'
        },
        {
          title: 'Happy Hour',
          start: '2023-01-12T17:30:00'
        },
        {
          title: 'Dinner',
          start: '2023-01-12T20:00:00'
        },
        {
          title: 'Birthday Party',
          start: '2023-01-13T07:00:00'
        },
        {
          title: 'Click for Google',
          url: 'http://google.com/',
          start: '2023-01-28'
        }
      ]
    });

    calendar.render();
  });