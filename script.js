
// --- Funções da Página de Custos Fixos ---

const fixedCostsUl = document.getElementById("fixed-costs-ul");
const costNameInput = document.getElementById("cost-name");
const costPercentageInput = document.getElementById("cost-percentage");
const addUpdateCostBtn = document.getElementById("add-update-cost-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const resetCostsBtn = document.getElementById("reset-costs-btn");
const editCostIndexInput = document.getElementById("edit-cost-index");

const defaultFixedCosts = [
    { name: "Etiqueta de envio", percentage: 15 },
    { name: "BagyPay", percentage: 1 },
    { name: "Tráfego Pago", percentage: 1 },
    { name: "Influencer", percentage: 1 },
    { name: "Taxa Mercado Pago", percentage: 5.31 },
    { name: "Caixas", percentage: 2.5 },
    { name: "Cupom desconto", percentage: 10 },
    { name: "Fita de caixas", percentage: 2 },
    { name: "Aluguel", percentage: 20 },
    { name: "Custo de marketing adicional", percentage: 5 },
];

let currentFixedCosts = [];

// Função para salvar custos no localStorage (será chamada pelas funções de manipulação)
function saveCostsToLocalStorage() {
    try {
        localStorage.setItem("fixedCosts", JSON.stringify(currentFixedCosts));
    } catch (e) {
        console.error("Erro ao salvar custos fixos no localStorage:", e);
        alert("Não foi possível salvar os custos fixos. O armazenamento local pode estar cheio ou indisponível.");
    }
}

// Função para carregar custos do localStorage ou usar padrão
function loadCosts() {
    try {
        const storedCosts = localStorage.getItem("fixedCosts");
        if (storedCosts) {
            const parsedCosts = JSON.parse(storedCosts);
            // Validação básica para garantir que é um array de objetos com as propriedades esperadas
            if (Array.isArray(parsedCosts) && parsedCosts.every(cost => typeof cost === 'object' && cost !== null && 'name' in cost && 'percentage' in cost)) {
                currentFixedCosts = parsedCosts;
            } else {
                 console.warn("Dados de custos fixos inválidos no localStorage. Usando padrão.");
                 currentFixedCosts = [...defaultFixedCosts]; // Usa cópia dos padrões
                 saveCostsToLocalStorage(); // Salva os padrões se os dados armazenados eram inválidos
            }
        } else {
            currentFixedCosts = [...defaultFixedCosts]; // Usa cópia dos padrões se não houver nada salvo
            saveCostsToLocalStorage(); // Salva os padrões na primeira vez
        }
    } catch (e) {
        console.error("Erro ao carregar custos fixos do localStorage:", e);
        currentFixedCosts = [...defaultFixedCosts]; // Usa cópia dos padrões em caso de erro
    }
    renderFixedCostsList();
}

// Função para renderizar a lista de custos fixos na UI
function renderFixedCostsList() {
    if (!fixedCostsUl) return;
    fixedCostsUl.innerHTML = ""; // Limpa a lista
    if (currentFixedCosts.length === 0) {
        fixedCostsUl.innerHTML = "<li>Nenhum custo fixo cadastrado.</li>";
        return;
    }
    currentFixedCosts.forEach((cost, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="cost-info">
                <span class="cost-name">${escapeHTML(cost.name)}</span>
                <span class="cost-percentage">(${parseFloat(cost.percentage).toFixed(2).replace(".", ",")}%)</span>
            </div>
            <div class="cost-actions">
                <button class="edit-cost-btn primary" data-index="${index}">Editar</button>
                <button class="delete-cost-btn secondary" data-index="${index}">Excluir</button>
            </div>
        `;
        fixedCostsUl.appendChild(li);
    });

    // Adiciona listeners aos botões de editar e excluir
    document.querySelectorAll(".edit-cost-btn").forEach(button => {
        button.addEventListener("click", handleEditCost);
    });
    document.querySelectorAll(".delete-cost-btn").forEach(button => {
        button.addEventListener("click", handleDeleteCost);
    });
    
    // Recalcula a precificação se a página da calculadora estiver visível
    if (!calculatorPage.classList.contains('hidden')) {
        calculatePricing();
    }
}

// Função para escapar HTML e prevenir XSS simples
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Função para lidar com Adicionar/Atualizar Custo
function handleAddUpdateCost(event) {
    event.preventDefault();
    const name = costNameInput.value.trim();
    const percentage = parseFloat(costPercentageInput.value);
    const index = parseInt(editCostIndexInput.value);

    if (!name || isNaN(percentage) || percentage < 0) {
        alert("Por favor, insira um nome válido e um percentual não negativo para o custo.");
        return;
    }

    const newCost = { name, percentage };

    if (index === -1) { // Adicionar novo custo
        currentFixedCosts.push(newCost);
    } else { // Atualizar custo existente
        currentFixedCosts[index] = newCost;
    }

    saveCostsToLocalStorage();
    renderFixedCostsList();
    resetCostForm();
}

// Função para lidar com Edição de Custo (preencher formulário)
function handleEditCost(event) {
    const index = parseInt(event.target.dataset.index);
    const costToEdit = currentFixedCosts[index];

    costNameInput.value = costToEdit.name;
    costPercentageInput.value = costToEdit.percentage;
    editCostIndexInput.value = index;

    addUpdateCostBtn.textContent = "Atualizar Custo";
    cancelEditBtn.classList.remove("hidden");
    costNameInput.focus();
}

// Função para lidar com Exclusão de Custo
function handleDeleteCost(event) {
    const index = parseInt(event.target.dataset.index);
    const costToDelete = currentFixedCosts[index];
    
    if (confirm(`Tem certeza que deseja excluir o custo "${costToDelete.name}"?`)) {
        currentFixedCosts.splice(index, 1);
        saveCostsToLocalStorage();
        renderFixedCostsList();
        resetCostForm(); // Reseta o form caso o item deletado estivesse em edição
    }
}

// Função para resetar o formulário de custo
function resetCostForm() {
    costNameInput.value = "";
    costPercentageInput.value = "";
    editCostIndexInput.value = -1;
    addUpdateCostBtn.textContent = "Adicionar Custo";
    cancelEditBtn.classList.add("hidden");
}

// Função para lidar com o Reset para Custos Padrão
function handleResetCosts() {
    if (confirm("Tem certeza que deseja resetar todos os custos para os valores padrão? Esta ação não pode ser desfeita.")) {
        currentFixedCosts = [...defaultFixedCosts]; // Usa cópia dos padrões
        saveCostsToLocalStorage();
        renderFixedCostsList();
        resetCostForm();
    }
}

// Adiciona listeners aos botões da página de custos
if (addUpdateCostBtn) {
    addUpdateCostBtn.addEventListener("click", handleAddUpdateCost);
}
if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", resetCostForm);
}
if (resetCostsBtn) {
    resetCostsBtn.addEventListener("click", handleResetCosts);
}

// --- Inicialização Geral ---

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona elementos após o DOM carregar
    const calculatorPage = document.getElementById('calculator-page');
    const costsPage = document.getElementById('costs-page');
    const navCalculator = document.getElementById('nav-calculator');
    const navCosts = document.getElementById('nav-costs');

    // Navegação entre páginas
    if (navCalculator && navCosts && calculatorPage && costsPage) {
        navCalculator.addEventListener('click', () => {
            calculatorPage.classList.remove('hidden');
            costsPage.classList.add('hidden');
            navCalculator.classList.add('active');
            navCosts.classList.remove('active');
            // Recalcula ao mudar para a página da calculadora se necessário
            calculatePricing(); 
        });

        navCosts.addEventListener('click', () => {
            calculatorPage.classList.add('hidden');
            costsPage.classList.remove('hidden');
            navCalculator.classList.remove('active');
            navCosts.classList.add('active');
            // Renderiza a lista de custos ao mudar para a página de custos
            renderFixedCostsList(); 
        });
    }

    // Carrega os custos fixos iniciais (do localStorage ou padrão)
    loadCosts();

    // Chama o cálculo inicial na página da calculadora (se for a página ativa)
    if (!calculatorPage.classList.contains('hidden')) {
       calculatePricing();
    }

    // Registro do Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar Service Worker:', error);
            });
    }
    console.log('App inicializado e pronto.');
});


