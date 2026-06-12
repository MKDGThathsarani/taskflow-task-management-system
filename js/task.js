// ============= TASKS MODULE =============

const Tasks = {
    allTasks: [],
    currentUser: null,
    completionChart: null,
    priorityChart: null,

    // Team members list
    teamMembers: [
        { name: "John Doe", role: "Developer" },
        { name: "Jane Smith", role: "Designer" },
        { name: "Mike Johnson", role: "Tester" },
        { name: "Sarah Williams", role: "Developer" },
        { name: "Thathsarani", role: "Admin" }
    ],

    // Sample tasks
    sampleTasks: [
        { id: 1, title: "Complete project documentation", description: "Write final documentation", assignedTo: "John Doe", priority: "high", status: "in-progress", dueDate: "2024-12-20" },
        { id: 2, title: "Design database schema", description: "Create ER diagram", assignedTo: "Jane Smith", priority: "medium", status: "pending", dueDate: "2024-12-25" },
        { id: 3, title: "Implement login system", description: "Add authentication", assignedTo: "Mike Johnson", priority: "high", status: "completed", dueDate: "2024-12-15" },
        { id: 4, title: "Create UI mockups", description: "Design wireframes", assignedTo: "Sarah Williams", priority: "low", status: "pending", dueDate: "2024-12-28" },
        { id: 5, title: "Write unit tests", description: "Test all modules", assignedTo: "Thathsarani", priority: "medium", status: "in-progress", dueDate: "2024-12-22" }
    ],

    init(user) {
        this.currentUser = user;
        this.loadTasksFromStorage();
        this.setupEventListeners();
        this.loadTeamMembersForSelect();
    },

    loadAllData() {
        this.updateDashboardStats();
        this.loadRecentTasks();
        this.updateCharts();
        this.loadMyTasks();
    },

    loadTasksFromStorage() {
        const saved = localStorage.getItem('taskflow_tasks');
        if (saved) {
            this.allTasks = JSON.parse(saved);
        } else {
            this.allTasks = this.sampleTasks;
            this.saveTasks();
        }
    },

    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.allTasks));
    },

    setupEventListeners() {
        const createTaskForm = document.getElementById('createTaskForm');
        if (createTaskForm) {
            createTaskForm.addEventListener('submit', (e) => this.createTask(e));
        }

        const filterStatus = document.getElementById('taskFilterStatus');
        const filterPriority = document.getElementById('taskFilterPriority');
        
        if (filterStatus) {
            filterStatus.addEventListener('change', () => this.loadMyTasks());
        }
        if (filterPriority) {
            filterPriority.addEventListener('change', () => this.loadMyTasks());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    },

    switchPage(page) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
        
        const titles = { dashboard: 'Dashboard', tasks: 'My Tasks', 'create-task': 'Create Task', reports: 'Reports' };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
        
        document.querySelectorAll('.content-page').forEach(c => c.classList.remove('active'));
        document.getElementById(`${page}Content`).classList.add('active');
        
        if (page === 'tasks') this.loadMyTasks();
        if (page === 'dashboard') { this.updateDashboardStats(); this.loadRecentTasks(); }
        if (page === 'reports') this.updateCharts();
        if (page === 'create-task') this.loadTeamMembersForSelect();
    },

    updateDashboardStats() {
        let userTasks = this.allTasks;
        if (this.currentUser && this.currentUser.role !== 'ADMIN') {
            userTasks = this.allTasks.filter(t => t.assignedTo === this.currentUser.name);
        }
        
        document.getElementById('totalTasks').textContent = userTasks.length;
        document.getElementById('completedTasks').textContent = userTasks.filter(t => t.status === 'completed').length;
        document.getElementById('inProgressTasks').textContent = userTasks.filter(t => t.status === 'in-progress').length;
        document.getElementById('pendingTasks').textContent = userTasks.filter(t => t.status === 'pending').length;
    },

    loadRecentTasks() {
        const tbody = document.getElementById('recentTasksList');
        let recentTasks = [...this.allTasks].slice(0, 5);
        
        if (this.currentUser && this.currentUser.role !== 'ADMIN') {
            recentTasks = recentTasks.filter(t => t.assignedTo === this.currentUser.name).slice(0, 5);
        }
        
        if (recentTasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No tasks found</td></tr>';
            return;
        }
        
        tbody.innerHTML = recentTasks.map(task => `
            <tr>
                <td><strong>${this.escapeHtml(task.title)}</strong></td>
                <td>${task.assignedTo}</td>
                <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
                <td><span class="status-badge status-${task.status === 'in-progress' ? 'progress' : task.status}">${task.status}</span></td>
                <td>${task.dueDate}</td>
                <td>
                    <button onclick="Tasks.editTaskStatus(${task.id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="Tasks.deleteTaskById(${task.id})" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    loadMyTasks() {
        const container = document.getElementById('tasksList');
        const statusFilter = document.getElementById('taskFilterStatus').value;
        const priorityFilter = document.getElementById('taskFilterPriority').value;
        
        let filtered = this.allTasks;
        if (this.currentUser && this.currentUser.role !== 'ADMIN') {
            filtered = filtered.filter(t => t.assignedTo === this.currentUser.name);
        }
        
        if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
        if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter);
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 40px;">No tasks found</div>';
            return;
        }
        
        container.innerHTML = filtered.map(task => `
            <div class="task-card">
                <div class="task-info">
                    <h4>${this.escapeHtml(task.title)}</h4>
                    <p>${this.escapeHtml(task.description) || 'No description'}</p>
                    <div class="task-meta">
                        <span><i class="fas fa-user"></i> ${task.assignedTo}</span>
                        <span><i class="fas fa-calendar"></i> Due: ${task.dueDate}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span class="status-badge status-${task.status === 'in-progress' ? 'progress' : task.status}">${task.status}</span>
                    <button onclick="Tasks.editTaskStatus(${task.id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="Tasks.deleteTaskById(${task.id})" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    },

    createTask(e) {
        e.preventDefault();
        
        const newTask = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            assignedTo: document.getElementById('taskAssignedTo').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value
        };
        
        this.allTasks.push(newTask);
        this.saveTasks();
        document.getElementById('createTaskForm').reset();
        
        if (typeof Auth !== 'undefined') {
            Auth.showNotification('✅ Task created successfully!', 'success');
        }
        
        this.switchPage('dashboard');
        this.updateDashboardStats();
        this.loadRecentTasks();
        this.loadMyTasks();
        this.updateCharts();
    },

    editTaskStatus(id) {
        const task = this.allTasks.find(t => t.id === id);
        if (!task) return;
        
        const newStatus = prompt('Update status (pending/in-progress/completed):', task.status);
        if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
            task.status = newStatus;
            this.saveTasks();
            this.updateDashboardStats();
            this.loadRecentTasks();
            this.loadMyTasks();
            this.updateCharts();
            if (typeof Auth !== 'undefined') {
                Auth.showNotification('✅ Task status updated!', 'success');
            }
        }
    },

    deleteTaskById(id) {
        if (confirm('Delete this task?')) {
            this.allTasks = this.allTasks.filter(t => t.id !== id);
            this.saveTasks();
            this.updateDashboardStats();
            this.loadRecentTasks();
            this.loadMyTasks();
            this.updateCharts();
            if (typeof Auth !== 'undefined') {
                Auth.showNotification('🗑️ Task deleted!', 'success');
            }
        }
    },

    loadTeamMembersForSelect() {
        const select = document.getElementById('taskAssignedTo');
        if (select) {
            select.innerHTML = '<option value="">Select team member</option>' + 
                this.teamMembers.map(m => `<option value="${m.name}">${m.name} (${m.role})</option>`).join('');
        }
    },

    updateCharts() {
        const completed = this.allTasks.filter(t => t.status === 'completed').length;
        const inProgress = this.allTasks.filter(t => t.status === 'in-progress').length;
        const pending = this.allTasks.filter(t => t.status === 'pending').length;
        const high = this.allTasks.filter(t => t.priority === 'high').length;
        const medium = this.allTasks.filter(t => t.priority === 'medium').length;
        const low = this.allTasks.filter(t => t.priority === 'low').length;
        
        const completionCtx = document.getElementById('completionChart')?.getContext('2d');
        const priorityCtx = document.getElementById('priorityChart')?.getContext('2d');
        
        if (completionCtx) {
            if (this.completionChart) this.completionChart.destroy();
            this.completionChart = new Chart(completionCtx, {
                type: 'doughnut',
                data: { labels: ['Completed', 'In Progress', 'Pending'], datasets: [{ data: [completed, inProgress, pending], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'] }] },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
            });
        }
        
        if (priorityCtx) {
            if (this.priorityChart) this.priorityChart.destroy();
            this.priorityChart = new Chart(priorityCtx, {
                type: 'bar',
                data: { labels: ['High', 'Medium', 'Low'], datasets: [{ label: 'Number of Tasks', data: [high, medium, low], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'] }] },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
            });
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Make functions globally accessible for onclick handlers
window.Tasks = Tasks;