import { obterArrayAgendamentoDashboard, obterArrayDemandaDiaAgendamento, obterArrayHistAvaliacao } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

const id = getUserId(0);

Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', async function () {

    const infoStatus = await obterArrayAgendamentoDashboard(id);
    const infoDias = await obterArrayDemandaDiaAgendamento(id);
    const infoHistAval = await obterArrayHistAvaliacao(id);

    const labelsAvaliacao = infoHistAval.labels.slice(0, -1);
    const dadosAvaliacao = infoHistAval.data.slice(0, -1);
    const mediaAvaliacao = infoHistAval.data[infoHistAval.data.length - 1];

    const max = infoStatus.data[3];
    const suggestedMax = Math.ceil(max / 5) * 5;

    const dadosBackend =
    {
        bar: {
            labels: ['Pendentes', 'Confirmadas', 'Concluidas', 'Canceladas', 'Total'],
            datasets: [{
                label: '',
                data: infoStatus.data,
                backgroundColor: ['rgba(167, 9, 54, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(16, 176, 43, 0.7)', 'rgba(0, 0, 0, 0.9)']
            }]
        },
        pie: {
            labels: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'],
            datasets: [{
                label: '',
                data: infoDias.data,
                backgroundColor: ['rgba(29, 0, 109, 0.7)', 'rgba(47, 255, 0, 0.7)', 'rgba(80, 0, 0, 0.7)', 'rgba(230, 240, 22, 0.7)', 'rgba(233, 83, 215, 0.7)', 'rgba(255, 123, 0, 0.7)', 'rgba(10, 218, 237, 0.7)']
            }]
        },
        line: {
            labels: labelsAvaliacao,
            datasets: [{
                label: 'Avaliação por Reunião',
                data: dadosAvaliacao,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.3
            }]
        }
    }


    const configs =
        [
            {
                id: 'barChart',
                config: {
                    type: 'bar',
                    data: dadosBackend.bar,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                suggestedMax: suggestedMax,
                                ticks: {
                                    callback: function (value) {
                                        if (Number.isInteger(value)) {
                                            return value;
                                        }
                                    },
                                    stepSize: 1
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true, text: 'Consultorias Overview'
                            },
                            legend: {
                                display: false
                            },
                            datalabels: {
                                display: false
                            }
                        }
                    }
                }
            },
            {
                id: 'pieChart',
                config: {
                    type: 'pie',
                    data: dadosBackend.pie,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Qtd. Histórica de Demanda/Dia'
                            },
                            datalabels: {
                                color: 'grey',
                                display: (context) => {
                                    return context.dataset.data[context.dataIndex] !== 0;
                                },
                                formatter: (value) => value,
                                font: { weight: 'bold', size: 14 },
                                anchor: 'end',
                                align: 'start'
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                }
            },
            {
                id: 'lineChart',
                config: {
                    type: 'line',
                    data: dadosBackend.line,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 6,
                                ticks: {
                                    stepSize: 1
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: `Variação da Avaliação (Média: ${mediaAvaliacao})`
                            },
                            legend: {
                                display: true 
                            },
                            datalabels: {
                                display: true,
                                align: 'end',
                                anchor: 'end',
                                formatter: (value) => value
                            }
                        }
                    }
                }
            }
        ];

    configs.forEach(({ id, config }) => {
        new Chart(document.getElementById(id), config);
    });
});