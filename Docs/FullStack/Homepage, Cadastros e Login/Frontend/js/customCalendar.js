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
      //events: requisição ao banco de dados
    });

    calendar.render();
  });