// --- Funções da Calculadora ---

const productCostInput = document.getElementById("product-cost");
const markupInput = document.getElementById("markup");
const calculateBtn = document.getElementById("calculate-btn");

const suggestedPriceEl = document.getElementById("suggested-price");
const profitPerProductEl = document.getElementById("profit-per-product");
const realProfitMarginEl = document.getElementById("real-profit-margin");
const productsToCoverCostEl = document.getElementById("products-to-cover-cost");

const profitEstimatorTableBody = document.querySelector("#profit-estimator tbody");
const salesEstimatorTableBody = document.querySelector("#sales-estimator tbody");

const FIXED_MONTHLY_COST = 6768.00;

// Função para formatar valores em Reais (BRL)
function formatCurrency(value) {
    if (isNaN(value) || value === null) return "R$ 0,00";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Função para formatar percentuais
function formatPercentage(value) {
    if (isNaN(value) || value === null) return "0,0%";
    return (value * 100).toFixed(1).replace(".", ",") + "%";
}

// Função para obter o percentual total de custos fixos (agora usa currentFixedCosts)
function getTotalFixedCostPercentage() {
    if (!currentFixedCosts || currentFixedCosts.length === 0) {
        // Se não houver custos carregados, tenta carregar ou usa padrão (redundante se loadCosts já rodou)
        // loadCosts(); // Evitar chamar loadCosts aqui para não criar loop, assume que já foi chamado
        // Se ainda assim estiver vazio, retorna 0 ou um valor padrão?
        // Por segurança, vamos usar os padrões se currentFixedCosts estiver vazio
        const defaultTotal = defaultFixedCosts.reduce((sum, cost) => sum + (parseFloat(cost.percentage) || 0), 0);
        return defaultTotal / 100;
    }
    const totalPercentage = currentFixedCosts.reduce((sum, cost) => sum + (parseFloat(cost.percentage) || 0), 0);
    return totalPercentage / 100; // Retorna como decimal (ex: 0.65 para 65%)
}

// Função principal de cálculo
function calculatePricing() {
    // Garante que os elementos existem antes de tentar acessá-los
    if (!productCostInput || !markupInput || !suggestedPriceEl || !profitPerProductEl || !realProfitMarginEl || !productsToCoverCostEl || !profitEstimatorTableBody || !salesEstimatorTableBody) {
        console.error("Elementos da calculadora não encontrados no DOM.");
        return;
    }

    const cost = parseFloat(productCostInput.value);
    const markup = parseFloat(markupInput.value);

    if (isNaN(cost) || cost <= 0 || isNaN(markup) || markup < 1) {
        // Não mostra alerta, apenas reseta os campos para não ser intrusivo
        console.warn("Inputs inválidos para cálculo.");
        suggestedPriceEl.textContent = formatCurrency(0);
        profitPerProductEl.textContent = formatCurrency(0);
        realProfitMarginEl.textContent = formatPercentage(0);
        productsToCoverCostEl.textContent = "0";
        profitEstimatorTableBody.innerHTML = "";
        salesEstimatorTableBody.innerHTML = "";
        return;
    }

    const totalFixedCostPercentage = getTotalFixedCostPercentage();

    // 1. Preço Sugerido de Venda
    const suggestedPrice = cost * markup;
    suggestedPriceEl.textContent = formatCurrency(suggestedPrice);

    // 2. Lucro por Produto (considerando custos fixos percentuais sobre o preço)
    const fixedCostAmount = suggestedPrice * totalFixedCostPercentage;
    const profitPerProduct = suggestedPrice - cost - fixedCostAmount;
    profitPerProductEl.textContent = formatCurrency(profitPerProduct);

    // 3. Margem de Lucro Real
    const realProfitMargin = suggestedPrice > 0 ? profitPerProduct / suggestedPrice : 0;
    realProfitMarginEl.textContent = formatPercentage(realProfitMargin);

    // 4. Quantidade de Produtos para Cobrir Custo Fixo Mensal
    const productsToCoverCost = profitPerProduct > 0 ? Math.ceil(FIXED_MONTHLY_COST / profitPerProduct) : Infinity;
    productsToCoverCostEl.textContent = isFinite(productsToCoverCost) ? productsToCoverCost.toString() : "Incalculável";

    // 5. Preencher Tabela Estimador de Lucro
    populateProfitEstimator(cost, markup, totalFixedCostPercentage);

    // 6. Preencher Tabela Estimador de Vendas
    populateSalesEstimator(profitPerProduct);
}

// Função para popular a tabela Estimador de Lucro
function populateProfitEstimator(cost, baseMarkup, totalFixedCostPercentage) {
    profitEstimatorTableBody.innerHTML = ""; // Limpa a tabela
    const markupsToEstimate = [baseMarkup - 0.5, baseMarkup - 0.25, baseMarkup, baseMarkup + 0.25, baseMarkup + 0.5].filter(m => m >= 1);

    markupsToEstimate.forEach(markup => {
        const price = cost * markup;
        const fixedCost = price * totalFixedCostPercentage;
        const profit = price - cost - fixedCost;
        const margin = price > 0 ? profit / price : 0;

        const row = `<tr>
            <td>${markup.toFixed(2).replace(".", ",")}x</td>
            <td>${formatCurrency(price)}</td>
            <td>${formatCurrency(profit)}</td>
            <td>${formatPercentage(margin)}</td>
        </tr>`;
        profitEstimatorTableBody.innerHTML += row;
    });
}

// Função para popular a tabela Estimador de Vendas
function populateSalesEstimator(profitPerProduct) {
    salesEstimatorTableBody.innerHTML = ""; // Limpa a tabela
    const salesQuantities = [5, 30, 100, 250, 500, 1000];

    salesQuantities.forEach(quantity => {
        const totalProfit = profitPerProduct * quantity;
        const row = `<tr>
            <td>${quantity}</td>
            <td>${formatCurrency(totalProfit)}</td>
        </tr>`;
        salesEstimatorTableBody.innerHTML += row;
    });
}

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

// Função para salvar custos no localStorage
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
            if (Array.isArray(parsedCosts) && parsedCosts.every(cost => typeof cost === 'object' && cost !== null && 'name' in cost && 'percentage' in cost)) {
                currentFixedCosts = parsedCosts;
            } else {
                 console.warn("Dados de custos fixos inválidos no localStorage. Usando padrão.");
                 currentFixedCosts = [...defaultFixedCosts];
                 saveCostsToLocalStorage();
            }
        } else {
            currentFixedCosts = [...defaultFixedCosts];
            saveCostsToLocalStorage();
        }
    } catch (e) {
        console.error("Erro ao carregar custos fixos do localStorage:", e);
        currentFixedCosts = [...defaultFixedCosts];
    }
    // Não renderiza aqui, será chamado no DOMContentLoaded ou na troca de aba
}

// Função para renderizar a lista de custos fixos na UI
function renderFixedCostsList() {
    if (!fixedCostsUl) return;
    fixedCostsUl.innerHTML = "";
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

    document.querySelectorAll(".edit-cost-btn").forEach(button => {
        button.addEventListener("click", handleEditCost);
    });
    document.querySelectorAll(".delete-cost-btn").forEach(button => {
        button.addEventListener("click", handleDeleteCost);
    });
    
    // Recalcula a precificação APENAS se a página da calculadora estiver visível
    const calculatorPage = document.getElementById('calculator-page');
    if (calculatorPage && !calculatorPage.classList.contains('hidden')) {
        calculatePricing();
    }
}

// Função para escapar HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Função para lidar com Adicionar/Atualizar Custo
function handleAddUpdateCost(event) {
    event.preventDefault();
    if (!costNameInput || !costPercentageInput || !editCostIndexInput) return;
    const name = costNameInput.value.trim();
    const percentage = parseFloat(costPercentageInput.value);
    const index = parseInt(editCostIndexInput.value);

    if (!name || isNaN(percentage) || percentage < 0) {
        alert("Por favor, insira um nome válido e um percentual não negativo para o custo.");
        return;
    }

    const newCost = { name, percentage };

    if (index === -1) {
        currentFixedCosts.push(newCost);
    } else {
        currentFixedCosts[index] = newCost;
    }

    saveCostsToLocalStorage();
    renderFixedCostsList();
    resetCostForm();
}

// Função para lidar com Edição de Custo
function handleEditCost(event) {
    if (!costNameInput || !costPercentageInput || !editCostIndexInput || !addUpdateCostBtn || !cancelEditBtn) return;
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
    
    if (confirm(`Tem certeza que deseja excluir o custo "${escapeHTML(costToDelete.name)}"?`)) {
        currentFixedCosts.splice(index, 1);
        saveCostsToLocalStorage();
        renderFixedCostsList();
        resetCostForm();
    }
}

// Função para resetar o formulário de custo
function resetCostForm() {
    if (!costNameInput || !costPercentageInput || !editCostIndexInput || !addUpdateCostBtn || !cancelEditBtn) return;
    costNameInput.value = "";
    costPercentageInput.value = "";
    editCostIndexInput.value = -1;
    addUpdateCostBtn.textContent = "Adicionar Custo";
    cancelEditBtn.classList.add("hidden");
}

// Função para lidar com o Reset para Custos Padrão
function handleResetCosts() {
    if (confirm("Tem certeza que deseja resetar todos os custos para os valores padrão? Esta ação não pode ser desfeita.")) {
        currentFixedCosts = [...defaultFixedCosts];
        saveCostsToLocalStorage();
        renderFixedCostsList();
        resetCostForm();
    }
}

// --- Inicialização Geral ---

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona elementos após o DOM carregar
    const calculatorPage = document.getElementById('calculator-page');
    const costsPage = document.getElementById('costs-page');
    const navCalculator = document.getElementById('nav-calculator');
    const navCosts = document.getElementById('nav-costs');

    // Carrega os custos fixos iniciais (do localStorage ou padrão)
    loadCosts(); 

    // Adiciona listeners da calculadora
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculatePricing);
    }
    if(productCostInput) {
        productCostInput.addEventListener("input", calculatePricing); // Usar 'input' para cálculo em tempo real
    }
    if(markupInput) {
        markupInput.addEventListener("input", calculatePricing); // Usar 'input' para cálculo em tempo real
    }

    // Adiciona listeners da página de custos
    if (addUpdateCostBtn) {
        addUpdateCostBtn.addEventListener("click", handleAddUpdateCost);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", resetCostForm);
    }
    if (resetCostsBtn) {
        resetCostsBtn.addEventListener("click", handleResetCosts);
    }

    // Navegação entre páginas
    if (navCalculator && navCosts && calculatorPage && costsPage) {
        navCalculator.addEventListener('click', () => {
            calculatorPage.classList.remove('hidden');
            costsPage.classList.add('hidden');
            navCalculator.classList.add('active');
            navCosts.classList.remove('active');
            calculatePricing(); // Recalcula ao mostrar a página
        });

        navCosts.addEventListener('click', () => {
            calculatorPage.classList.add('hidden');
            costsPage.classList.remove('hidden');
            navCalculator.classList.remove('active');
            navCosts.classList.add('active');
            renderFixedCostsList(); // Renderiza a lista ao mostrar a página
        });
    }

    // Renderiza a lista de custos na inicialização (se a página de custos for a padrão, o que não é o caso)
    // Mas é bom renderizar uma vez para que os listeners de editar/excluir sejam adicionados
    renderFixedCostsList(); 

    // Chama o cálculo inicial na página da calculadora (se for a página ativa)
    if (calculatorPage && !calculatorPage.classList.contains('hidden')) {
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
