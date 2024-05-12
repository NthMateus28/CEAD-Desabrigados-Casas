import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    onChildAdded
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIaDFQIV0jm4TUqQPI-bn6OE0vD020KaM",
    authDomain: "cead-abrigados-casas.firebaseapp.com",
    databaseURL: "https://cead-abrigados-casas-default-rtdb.firebaseio.com",
    projectId: "cead-abrigados-casas",
    storageBucket: "cead-abrigados-casas.appspot.com",
    messagingSenderId: "576711679063",
    appId: "1:576711679063:web:569a5f605649b0d1e65712",
    measurementId: "G-GFEE37TTR2"
};

// Inicialize o app Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Variáveis para contar os status
let quantEntregue = 0;
let quantAguardando = 0;

// Referência à lista de desabrigados
const desabrigadosRef = ref(database, "desabrigados");

// Inicializa a estrutura do gráfico para pizza
let graficoPizza;

// Função para atualizar o gráfico de pizza com novos dados
function atualizarGrafico() {
    const contexto = document.getElementById("graficoIdades").getContext("2d");

    if (graficoPizza) {
        graficoPizza.data.datasets[0].data = [quantEntregue, quantAguardando];
        graficoPizza.update();
    } else {
        graficoPizza = new Chart(contexto, {
            type: 'pie',
            data: {
                labels: ["Entregue", "Aguardando"],
                datasets: [{
                    label: 'Status das Entregas',
                    data: [quantEntregue, quantAguardando],
                    backgroundColor: ['#4CAF50', '#FFC107'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        color: '#000',
                        anchor: 'end',
                        align: 'start',
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value*100 / sum).toFixed(2)+"%";
                            return value + ' (' + percentage + ')';
                        }
                    }
                }
            }
            
        });
    }
}

// Processar cada nova entrada ao ser adicionada
onChildAdded(desabrigadosRef, (snapshot) => {
    const dados = snapshot.val();
    const estado = dados.estado;

    // Contar com base no estado da entrega
    if (estado === "Entregue") {
        quantEntregue++;
    } else if (estado === "Aguardando") {
        quantAguardando++;
    }

    // Atualizar o gráfico com os novos valores
    atualizarGrafico();
});

// Certifique-se de que a biblioteca de etiquetas de dados está registrada se estiver usando a versão mais recente do Chart.js.
Chart.register(ChartDataLabels);
