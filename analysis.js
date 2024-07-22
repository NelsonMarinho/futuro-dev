document.addEventListener('DOMContentLoaded', () => {
    fetch('/carregamentos')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const carregamentos = data.carregamentos;

                // Inicializa gráficos
                const totalCarregadoChart = initializeChart('totalCarregadoChart', 'Total Carregado no Mês', 'kg');
                const totalVagoesChart = initializeChart('totalVagoesChart', 'Total de Vagões no Mês');
                const totalPorDestinoChart = initializeChart('totalPorDestinoChart', 'Total por Destino', 'kg', 'pie');
                const quantidadeCarregamentosChart = initializeChart('quantidadeCarregamentosChart', 'Quantidade de Carregamentos por Mês');
                const totalPorFilialChart = initializeChart('totalPorFilialChart', 'Total por Filial', 'kg');

                // Popula o seletor de anos
                const yearSelect = document.getElementById('yearSelect');
                const years = Array.from(new Set(carregamentos.map(c => c.data.substring(0, 4)))).sort();
                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });

                // Adicionar evento de mudança aos seletores de material e ano
                document.getElementById('materialSelect').addEventListener('change', function() {
                    updateCharts(carregamentos, totalCarregadoChart, totalVagoesChart, totalPorDestinoChart, quantidadeCarregamentosChart, totalPorFilialChart);
                });
                document.getElementById('yearSelect').addEventListener('change', function() {
                    updateCharts(carregamentos, totalCarregadoChart, totalVagoesChart, totalPorDestinoChart, quantidadeCarregamentosChart, totalPorFilialChart);
                });

                // Inicializa a visualização com todos os dados
                updateCharts(carregamentos, totalCarregadoChart, totalVagoesChart, totalPorDestinoChart, quantidadeCarregamentosChart, totalPorFilialChart);
            } else {
                alert('Erro ao carregar os carregamentos.');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
        });
});

function initializeChart(chartId, label, unit = '', type = 'bar') {
    const ctx = document.getElementById(chartId).getContext('2d');
    return new Chart(ctx, {
        type: type,
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: type === 'bar' ? {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(200, 200, 200, 0.3)'
                    },
                    ticks: {
                        color: '#333',
                        callback: function(value) {
                            return value + unit;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#333'
                    }
                }
            } : {},
            plugins: {
                legend: {
                    display: type !== 'bar',
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#333',
                    font: {
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        return value.toLocaleString(); // Formatação com separadores de milhar
                    }
                }
            }
        }
    });
}

function updateCharts(carregamentos, totalCarregadoChart, totalVagoesChart, totalPorDestinoChart, quantidadeCarregamentosChart, totalPorFilialChart) {
    const material = document.getElementById('materialSelect').value;
    const year = document.getElementById('yearSelect').value;

    const totalPorMes = {};
    const totalVagoesPorMes = {};
    const totalPorDestino = {};
    const totalPorFilial = {};
    const quantidadePorMes = {};

    carregamentos.forEach(c => {
        if ((material !== 'todos' && c.material !== material) || (year !== 'todos' && c.data.substring(0, 4) !== year)) {
            return;
        }
        
        const mes = c.data.substring(0, 7);
        const mesFormatado = mes.split('-').reverse().join('-');

        if (!totalPorMes[mesFormatado]) totalPorMes[mesFormatado] = 0;
        if (!totalVagoesPorMes[mesFormatado]) totalVagoesPorMes[mesFormatado] = 0;
        if (!totalPorDestino[c.destino]) totalPorDestino[c.destino] = 0;
        if (!quantidadePorMes[mesFormatado]) quantidadePorMes[mesFormatado] = 0;
        if (!totalPorFilial[c.filial]) totalPorFilial[c.filial] = 0;

        totalPorMes[mesFormatado] += parseFloat(c.volume);
        totalVagoesPorMes[mesFormatado] += parseInt(c.vagoes);
        totalPorDestino[c.destino] += parseFloat(c.volume);
        totalPorFilial[c.filial] += parseFloat(c.volume);
        quantidadePorMes[mesFormatado] += 1; // Incrementa a quantidade de carregamentos no mês
    });

    // Atualiza os gráficos com os novos dados filtrados
    updateChart(totalCarregadoChart, Object.keys(totalPorMes), Object.values(totalPorMes), 'kg');
    updateChart(totalVagoesChart, Object.keys(totalVagoesPorMes), Object.values(totalVagoesPorMes));
    updateChart(totalPorDestinoChart, Object.keys(totalPorDestino), Object.values(totalPorDestino), 'kg');
    updateChart(quantidadeCarregamentosChart, Object.keys(quantidadePorMes), Object.values(quantidadePorMes));
    updateChart(totalPorFilialChart, Object.keys(totalPorFilial), Object.values(totalPorFilial), 'kg');
}

function updateChart(chart, labels, data, unit = '') {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = labels.map((_, index) => getBootstrapColor(index));
    chart.data.datasets[0].borderColor = labels.map((_, index) => getBootstrapColor(index).replace('0.7', '1'));
    chart.update();
}

const bootstrapColors = [
    'rgba(0, 123, 255, 0.7)',  // Primary
    'rgba(40, 167, 69, 0.7)',  // Success
    'rgba(255, 193, 7, 0.7)',  // Warning
    'rgba(220, 53, 69, 0.7)',  // Danger
    'rgba(23, 162, 184, 0.7)', // Info
    'rgba(108, 117, 125, 0.7)',// Secondary
    'rgba(52, 58, 64, 0.7)',   // Dark
    'rgba(255, 255, 255, 0.7)' // Light
];

function getBootstrapColor(index) {
    return bootstrapColors[index % bootstrapColors.length];
}
