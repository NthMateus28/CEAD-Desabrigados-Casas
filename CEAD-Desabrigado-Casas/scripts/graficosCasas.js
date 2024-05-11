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
const database = getDatabase(app); // Inicialize o Realtime Database

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

    // Se o gráfico já foi criado, apenas atualize os dados
    if (graficoPizza) {
        graficoPizza.data.datasets[0].data = [
            quantEntregue,
            quantAguardando
        ];
        graficoPizza.update(); // Atualiza os dados no gráfico
    } else {
        // Cria o gráfico de pizza pela primeira vez
        graficoPizza = new Chart(contexto, {
            type: "pie", // Tipo de gráfico de pizza
            data: {
                labels: [
                    "Entregue",
                    "Aguardando"
                ],
                datasets: [
                    {
                        label: "Status das Entregas",
                        data: [
                            quantEntregue,
                            quantAguardando
                        ],
                        backgroundColor: [
                            "#4CAF50", // Verde para Entregue
                            "#FFC107" // Amarelo para Aguardando
                        ]
                    }
                ]
            },
            options: {
                responsive: true
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
