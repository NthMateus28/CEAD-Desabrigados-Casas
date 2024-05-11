// Função para aplicar máscara de telefone
function aplicarMascaraTelefone(campo) {
    let telefone = campo.value;

    // Remove caracteres que não são números
    telefone = telefone.replace(/\D/g, "");

    
    // Limita a quantidade de dígitos ao máximo permitido para telefones no Brasil
    telefone = telefone.substring(0, 11); // Garante no máximo 11 dígitos

    // Aplica a máscara (00) 00000-0000
    telefone = telefone.replace(/^(\d{2})(\d)/g, "($1) $2");
    telefone = telefone.replace(/(\d{5})(\d)/, "$1-$2");

    // Atualiza o valor do campo com a máscara
    campo.value = telefone;
}

// Associar a função ao evento `input` do campo telefone
document.getElementById("telefone").addEventListener("input", function() {
    aplicarMascaraTelefone(this);
});


// Função para preencher as cidades a partir da API do IBGE
function carregarCidadesRS() {
    const selectCidade = document.getElementById("cidade");
    
    // Verificar se o elemento <select> está acessível
    if (!selectCidade) {
        console.error("Elemento <select> com id 'cidade' não encontrado.");
        return;
    }

    console.log("Campo de seleção encontrado:", selectCidade);

    // URL para buscar as cidades do Rio Grande do Sul
    const url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/RS/municipios";

    // Fazer a requisição para a API do IBGE
    fetch(url)
        .then(response => {
            // Verificar se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error("Erro na requisição: " + response.statusText);
            }
            return response.json();
        })
        .then(cidades => {
            console.log(`Total de cidades encontradas: ${cidades.length}`);
            cidades.forEach(cidade => {
                console.log(`Adicionando cidade: ${cidade.nome}`);
                const option = document.createElement("option");
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                selectCidade.appendChild(option); // Adiciona a cidade ao campo <select>
            });

            console.log("Preenchimento das cidades concluído.");
            console.log(`Conteúdo final do select: ${selectCidade.innerHTML}`);
        })
        .catch(error => {
            console.error("Erro ao carregar as cidades:", error);
        });
}

// Chamar a função ao carregar a página
document.addEventListener("DOMContentLoaded", carregarCidadesRS);

// Inicializar o Firebase e banco de dados
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    update,
    query,
    orderByChild,
    equalTo,
    get
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

// Variável global para armazenar a chave do desabrigado encontrado
let chaveDesabrigadoEncontrado = "";

document.getElementById("cadastroForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Adiciona a data e hora atual de criação
    data['Created'] = new Date().toISOString();

    fetch("https://api.sheetmonkey.io/form/9do4Rtc1Vc2zQJU4uZwFVN", {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Cadastro realizado com sucesso!');
        event.target.reset(); // Limpar o formulário após o cadastro
        cadastrarDesabrigado();
        }).catch((error) => {
        console.error('Error:', error);
        // alert('Erro ao enviar dados: ' + error.message);
    });
});

// Função para cadastrar desabrigados
function cadastrarDesabrigado(event) {
    event.preventDefault(); // Evitar o recarregamento da página

    // Obter dados do formulário
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const responsavel = document.getElementById("responsavel").value;
    const quantAdultos = document.getElementById("quantAdultos").value;
    const quantCriancas = document.getElementById("quantCriancas").value;
    const quantCestas = document.getElementById("quantCestas").value;
    const dataEntrega = document.getElementById("dataEntrega").value;
    const endereco = document.getElementById("endereco").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const dataCadastro = new Date().toISOString(); // Captura a data e hora atual

    // Criar uma chave única para o novo registro
    const novoRegistroRef = ref(database, 'desabrigados/' + Date.now());

    // Configuração dos dados a serem enviados
    const dadosRegistro = {
        nome,
        telefone,
        responsavel,
        quantAdultos,
        quantCriancas,
        quantCestas,
        dataEntrega,
        endereco,
        cidade,
        estado,
        dataCadastro // Adiciona a data e hora do cadastro
    };


    // Enviar dados para o Realtime Database
    set(novoRegistroRef, dadosRegistro)
    .then(() => {
        alert('Cadastro realizado com sucesso!');
        document.getElementById("cadastroForm").reset(); // Limpar o formulário após o cadastro
    })
    .catch((error) => {
        alert('Erro ao cadastrar: ' + error.message);
    });
}

// Função para buscar desabrigado pelo nome
window.buscarDesabrigado = function() {
    const nomeBuscado = document.getElementById("nome");
    if (!nomeBuscado) {
        console.error("Campo 'nome' não encontrado!");
        return;
    }

    const nomeValor = nomeBuscado.value;
    if (!nomeValor) {
        alert("Por favor, digite um nome para buscar.");
        return;
    }

    const desabrigadosRef = query(ref(database, "desabrigados"), orderByChild("nome"), equalTo(nomeValor));

    get(desabrigadosRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const dados = childSnapshot.val();
                chaveDesabrigadoEncontrado = childSnapshot.key;

                // Preencher os campos do formulário com os dados encontrados
                document.getElementById("nome").value = dados.nome || "";
                document.getElementById("telefone").value = dados.telefone || "";
                document.getElementById("responsavel").value = dados.responsavel || "";
                document.getElementById("quantAdultos").value = dados.quantAdultos || "";
                document.getElementById("quantCriancas").value = dados.quantCriancas || "";
                document.getElementById("quantCestas").value = dados.quantCestas || "";
                document.getElementById("dataEntrega").value = dados.dataEntrega || "";
                document.getElementById("endereco").value = dados.endereco || "";
                document.getElementById("cidade").value = dados.cidade || "";
                document.getElementById("estado").value = dados.estado || "";
            });
        } else {
            alert("Desabrigado não encontrado.");
            chaveDesabrigadoEncontrado = null;
        }
    }).catch((error) => {
        console.error("Erro ao buscar: " + error.message);
    });
}


// Função para alterar os dados de um desabrigado existente
window.alterarDesabrigado = function() {
    if (!chaveDesabrigadoEncontrado) {
        alert("Por favor, busque um desabrigado antes de tentar alterá-lo.");
        return;
    }

    const dadosAtualizados = {
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        responsavel: document.getElementById("responsavel").value,
        quantAdultos: document.getElementById("quantAdultos").value,
        quantCriancas: document.getElementById("quantCriancas").value,
        quantCestas: document.getElementById("quantCestas").value,
        dataEntrega: document.getElementById("dataEntrega").value,
        endereco: document.getElementById("endereco").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value,
        dataCadastro: new Date().toISOString() // Atualiza a data de cadastro para a data atual
    };

    update(ref(database, 'desabrigados/' + chaveDesabrigadoEncontrado), dadosAtualizados)
    .then(() => {
        alert("Dados atualizados com sucesso!");
        document.getElementById("cadastroForm").reset(); // Limpar o formulário após atualizar
    })
    .catch((error) => {
        alert("Erro ao atualizar os dados: " + error.message);
    });
}



// Associar a função `cadastrarDesabrigado` ao evento de envio do formulário
document.getElementById("cadastroForm").addEventListener("submit", cadastrarDesabrigado);

// Adicionar evento `input` para aplicar máscara de CPF ao campo correspondente
document.getElementById("cpfProprietario").addEventListener("input", function () {
    aplicarMascaraCPF(this);
});

// Tornar as funções acessíveis no escopo global
window.buscarDesabrigado = buscarDesabrigado;
window.alterarDesabrigado = alterarDesabrigado;
