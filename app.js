// app.js - Versão 1: Apenas GET

// Configuração da API
const API_URL = 'https://jsonplaceholder.typicode.com/todos';
let tasks = [];
let currentFilter = 'all';

// Elementos do DOM
const tasksList = document.getElementById('tasksList');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const apiStatus = document.getElementById('apiStatus');
const filterButtons = document.querySelectorAll('.filter-btn');

// Função para mostrar erro
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Função para verificar status da API
async function checkApiStatus() {
    try {
        const response = await fetch(API_URL + '?_limit=1');
        if (response.ok) {
            apiStatus.textContent = '🟢 API Online - Conectado ao JSONPlaceholder';
            apiStatus.className = 'api-status online';
            return true;
        } else {
            throw new Error('API não respondeu corretamente');
        }
    } catch (error) {
        apiStatus.textContent = '🔴 API Offline - Verifique sua conexão';
        apiStatus.className = 'api-status offline';
        return false;
    }
}

// Função para buscar tarefas da API
async function fetchTasks() {
    try {
        loading.style.display = 'block';
        tasksList.innerHTML = '';

        // Fazendo requisição GET para a API
        const response = await fetch(API_URL + '?_limit=10'); // Pegando apenas 10 tarefas

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Adaptando os dados da API para nosso formato
        tasks = data.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            category: task.id % 3 === 0 ? 'Trabalho' :
                task.id % 3 === 1 ? 'Estudos' : 'Pessoal'
        }));

        renderTasks();

    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        showError('Não foi possível carregar as tarefas. Tente novamente.');
    } finally {
        loading.style.display = 'none';
    }
}

// Função para renderizar tarefas
function renderTasks() {
    const filteredTasks = filterTasks();

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<li style="text-align: center; padding: 20px; color: #666;">Nenhuma tarefa encontrada</li>';
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title ${task.completed ? 'completed' : ''}">
                    ${task.title}
                </div>
                <span class="task-category">${task.category}</span>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${task.id})">✏️</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </li>
    `).join('');

    // Adicionar event listeners aos checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

// Função para filtrar tarefas
function filterTasks() {
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Event listeners para filtros
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});


// Função para adicionar nova tarefa
async function addTask(title, category) {
    try {
        loading.style.display = 'block';

        // Dados da nova tarefa
        const newTask = {
            title: title,
            completed: false,
            userId: 1 // A API JSONPlaceholder requer um userId
        };

        // Requisição POST
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const createdTask = await response.json();

        // A API retorna um ID novo (geralmente 201)
        // Adaptando para nosso formato
        const taskToAdd = {
            id: createdTask.id,
            title: createdTask.title,
            completed: createdTask.completed,
            category: category
        };

        // Adiciona ao array local
        tasks.unshift(taskToAdd);

        // Limita a 10 tarefas para não poluir
        if (tasks.length > 10) {
            tasks.pop();
        }

        renderTasks();

        // Mostrar mensagem de sucesso
        showSuccess('Tarefa adicionada com sucesso!');

    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        showError('Não foi possível adicionar a tarefa. Tente novamente.');
    } finally {
        loading.style.display = 'none';
    }
}

// Função para deletar tarefa
async function deleteTask(id) {
    // Confirmação antes de deletar
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }

    try {
        loading.style.display = 'block';

        // Requisição DELETE
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Remove do array local
        tasks = tasks.filter(task => task.id !== id);

        renderTasks();

        // Mostrar mensagem de sucesso
        showSuccess('Tarefa removida com sucesso!');

    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        showError('Não foi possível deletar a tarefa. Tente novamente.');
    } finally {
        loading.style.display = 'none';
    }
}

// Função para mostrar mensagem de sucesso
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'api-status online';
    successDiv.textContent = `✅ ${message}`;
    successDiv.style.marginBottom = '20px';

    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.children[2]);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Event listener para o botão adicionar
document.getElementById('btnAddTask').addEventListener('click', async () => {
    const titleInput = document.getElementById('taskTitle');
    const categorySelect = document.getElementById('taskCategory');

    const title = titleInput.value.trim();
    const category = categorySelect.value;

    if (!title) {
        showError('Por favor, digite o título da tarefa!');
        return;
    }

    await addTask(title, category);

    // Limpar campo
    titleInput.value = '';
});

// Permitir adicionar com Enter
document.getElementById('taskTitle').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('btnAddTask').click();
    }
});

// Função para editar tarefa (PUT)
async function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newTitle = prompt('Editar tarefa:', task.title);
    if (!newTitle || !newTitle.trim()) {
        return;
    }
    
    const newCategory = prompt('Editar categoria (Pessoal/Estudos/Trabalho/Outros):', task.category);
    if (!newCategory) return;
    
    // Validar categoria
    const validCategories = ['Pessoal', 'Estudos', 'Trabalho', 'Outros'];
    const category = validCategories.includes(newCategory) ? newCategory : 'Outros';
    
    try {
        loading.style.display = 'block';
        
        // Dados atualizados
        const updatedTask = {
            id: id,
            title: newTitle,
            completed: task.completed,
            userId: 1
        };

        // Requisição PUT
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Atualizar no array local
        task.title = newTitle;
        task.category = category;
        
        renderTasks();
        
        showSuccess('Tarefa atualizada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        showError('Não foi possível atualizar a tarefa. Tente novamente.');
    } finally {
        loading.style.display = 'none';
    }
}

// Melhorar o handleCheckboxChange para fazer PUT
async function handleCheckboxChange(event) {
    const taskItem = event.target.closest('.task-item');
    const taskId = parseInt(taskItem.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    const newStatus = event.target.checked;
    const oldStatus = task.completed;
    
    // Atualizar localmente primeiro (otimismo)
    task.completed = newStatus;
    renderTasks();
    
    try {
        // Requisição PUT para atualizar status
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: taskId,
                title: task.title,
                completed: newStatus,
                userId: 1
            })
        });

        if (!response.ok) {
            // Se der erro, reverter
            task.completed = oldStatus;
            renderTasks();
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showError('Erro ao atualizar status. Tentando novamente...');
    }
}

// Adicionar função para recarregar da API
async function refreshTasks() {
    if (confirm('Recarregar tarefas da API? Todas as alterações locais serão perdidas.')) {
        await fetchTasks();
    }
}

// Adicionar botão de refresh no HTML via JavaScript
function addRefreshButton() {
    const filtersDiv = document.querySelector('.filters');
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'filter-btn';
    refreshBtn.innerHTML = '🔄 Recarregar';
    refreshBtn.onclick = refreshTasks;
    filtersDiv.appendChild(refreshBtn);
}

// Inicialização
async function init() {
    const isOnline = await checkApiStatus();
    if (isOnline) {
        await fetchTasks();
        addRefreshButton();
    }
}

// Iniciar app quando a página carregar
document.addEventListener('DOMContentLoaded', init);