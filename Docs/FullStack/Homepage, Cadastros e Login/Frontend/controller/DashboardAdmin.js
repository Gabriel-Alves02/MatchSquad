import { obterArrayQtdBloqDashboard, obterArrayAvgAvaliacaoConsultor, obterArrayTop5Consultores } from '../service/AJAX.js';

const id = 1; // admin

Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', async function () {

    const bloqUserStatus = await obterArrayQtdBloqDashboard();

    const avalConsult = await obterArrayAvgAvaliacaoConsultor();

    const top5 = await obterArrayTop5Consultores();

    const valorMaximo = Math.max(...top5.data);
    const suggestedMax = Math.ceil(valorMaximo / 5) * 5;

    const dadosBackend =
    {
        pie: {
            labels: ['Ativos', 'Bloqueados', 'Banidos'],
            datasets: [{
                label: '',
                data: bloqUserStatus.ambos,
                backgroundColor: ['rgba(47, 255, 0, 0.7)', 'rgba(39, 49, 39, 0.93)', 'rgba(237, 9, 59, 0.9)']
            }]
        },
        line: {
            labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
            datasets: [{
                label: 'Consultores contados',
                data: avalConsult.data,
                fill: false,
                backgroundColor: 'rgb(231, 255, 45)',
                tension: 0.3
            }]
        },
        bar: {
            labels: top5.labels,
            datasets: [{
                label: '',
                data: top5.data,
                backgroundColor: ['rgba(167, 9, 54, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(16, 176, 43, 0.7)', 'rgba(0, 0, 0, 0.9)', 'rgba(71, 35, 231, 0.7)']
            }]
        }
    }


    const configs =
        [
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
                                text: 'Overview Status dos Usuários'
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
                                text: `Variação da Avaliação Média dos Consultores da Plataforma`
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
            },
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
                                display: true, text: 'TOP 5 Consultores\n(Por qtd. de Reuniões)'
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
            }
        ];

    configs.forEach(({ id, config }) => {
        new Chart(document.getElementById(id), config);
    });
});