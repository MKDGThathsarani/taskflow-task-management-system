// Tasks Module
const Tasks = {
    allTasks: [],
    teamMembers: [
        { name: "John Doe", role: "Developer" },
        { name: "Jane Smith", role: "Designer" },
        { name: "Mike Johnson", role: "Tester" },
        { name: "Sarah Williams", role: "Developer" },
        { name: "Thathsarani", role: "Admin" }
    ],
    currentUser: null,
    completionChart: null,
    priorityChart: null,
    recentCurrentPage: 1,
    recentItemsPerPage: 5,

    init() {
        this.loadTasksFromStorage();
        this.setupEventListeners();
    },

    loadTasksFromStorage() {
        const saved = localStorage.getItem('taskflow_tasks');
        if (saved) {
            this.allTasks = JSON.parse(saved);
        } else {
            this.loadSampleTasks();
        }
    },

    loadSampleTasks() {
        this.allTasks = [
            { id: 1, title: "Complete project documentation", description: "Write comprehensive documentation", assignedTo: "John Doe", priority: "high", status: "in-progress", dueDate: "2024-12-20", createdAt: new Date().toISOString() },
            { id: 2, title: "Design database schema", description: "Create ER diagram and schema", assignedTo: "Jane Smith", priority: "medium", status: "pending", dueDate: "2024-12-25", createdAt: new Date().toISOString() },
            { id: 3, title: "Implement login system", description: "Add authentication", assignedTo: "Mike Johnson", priority: "high", status: "completed", dueDate: "2024-12-15", createdAt: new Date().toISOString() },
            { id: 4, title: "Create UI mockups", description: "Design wireframes", assignedTo: "Sarah Williams", priority: "low", status: "pending", dueDate: "2024-12-28", createdAt: new Date().toISOString() },
            { id: 5, title: "Write unit tests", description: "Test all modules", assignedTo: "Thathsarani", priority: "medium", status: "in-progress", dueDate: "2024-12-22", createdAt: new Date().toISOString() },
            { id: 6, title: "Deploy to server", description: "Production deployment", assignedTo: "John Doe", priority: "high", status: "pending", dueDate: "2024-12-30", createdAt: new Date().toISOString() }
        ];
        this.saveTasks();
    },

    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.allTasks));
    },

    updateUIForUser(user) {
        this.currentUser = user;
        this.updateDashboardStats();
        this.loadRecentTasks();
        this.loadMyTasks();
        this.updateCharts();
        this.loadTeamMembersForSelect();
    },

    setupEventListeners() {
        // Create task form
        const createForm = document.getElementById('createTaskForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => this.createTask(e));
        }

        // Filters
        const statusFilter = document.getElementById('taskFilterStatus');
        const priorityFilter = document.getElementById('taskFilterPriority');
        const clearFilters = document.getElementById('clearFilters');
        const searchInput = document.getElementById('searchTasks');

        if (statusFilter) statusFilter.addEventListener('change', () => this.loadMyTasks());
        if (priorityFilter) priorityFilter.addEventListener('change', () => this.loadMyTasks());
        if (clearFilters) clearFilters.addEventListener('click', () => this.clearFilters());
        if (searchInput) searchInput.addEventListener('input', (e) => this.searchTasks(e.target.value));

        // Pagination
        const prevBtn = document.getElementById('prevRecentPage');
        const nextBtn = document.getElementById('nextRecentPage');
        if (prevBtn) prevBtn.addEventListener('click', () => this.changeRecentPage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changeRecentPage(1));

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });

        // Dark mode
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => this.toggleDarkMode());
        }
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
        if (!tbody) return;
        
        let userTasks = this.allTasks;
        if (this.currentUser && this.currentUser.role !== 'ADMIN') {
            userTasks = this.allTasks.filter(t => t.assignedTo === this.currentUser.name);
        }
        
        const start = (this.recentCurrentPage - 1) * this.recentItemsPerPage;
        const end = start + this.recentItemsPerPage;
        const paginatedTasks = userTasks.slice(start, end);
        const totalPages = Math.ceil(userTasks.length / this.recentItemsPerPage);
        
        document.getElementById('recentPageInfo').textContent = `Page ${this.recentCurrentPage} of ${totalPages || 1}`;
        document.getElementById('prevRecentPage').disabled = this.recentCurrentPage === 1;
        document.getElementById('nextRecentPage').disabled = this.recentCurrentPage === totalPages || totalPages === 0;
        
        if (paginatedTasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No tasks found</td></tr>';
            return;
        }
        
        tbody.innerHTML = paginatedTasks.map(task => `
            <tr>
                <td><strong>${this.escapeHtml(task.title)}</strong></td>
                <td>${task.assignedTo}</td>
                <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
                <td><span class="status-badge status-${task.status === 'in-progress' ? 'progress' : task.status}">${task.status}</span></td>
                <td>${task.dueDate}</td>
                <td>
                    <button onclick="Tasks.editTask(${task.id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="Tasks.deleteTask(${task.id})" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    changeRecentPage(delta) {
        let userTasks = this.allTasks;
        if (this.currentUser && this.currentUser.role !== 'ADMIN') {
            userTasks = this.allTasks.filter(t => t.assignedTo === this.currentUser.name);
        }
        const totalPages = Math.ceil(userTasks.length / this.recentItemsPerPage);
        const newPage = this.recentCurrentPage + delta;
        if (newPage >= 1 && newPage <= totalPages) {
            this.recentCurrentPage = newPage;
            this.loadRecentTasks();
        }
    },

    loadMyTasks() {
        const container = document.getElementById('tasksList');
        if (!container) return;
        
        const statusFilter = document.getElementById('taskFilterStatus')?.value || 'all';
        const priorityFilter = document.getElementById('taskFilterPriority')?.value || 'all';
        const searchTerm = document.getElementById('searchTasks')?.value.toLowerCase() || '';
        
        let filtered = this.allTasks;
        
        if (this.currentUser && this.currentUser.role !== 'ADMIN') {
            filtered = filtered.filter(t => t.assignedTo === this.currentUser.name);
        }
        
        if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
        if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter);
        if (searchTerm) filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm) || t.description.toLowerCase().includes(searchTerm));
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 40px;">📭 No tasks found</div>';
            return;
        }
        
        container.innerHTML = filtered.map(task => `
            <div class="task-card">
                <div class="task-info">
                    <h4>${this.escapeHtml(task.title)}</h4>
                    <p>${this.escapeHtml(task.description || 'No description')}</p>
                    <div class="task-meta">
                        <span><i class="fas fa-user"></i> ${task.assignedTo}</span>
                        <span><i class="fas fa-calendar"></i> Due: ${task.dueDate}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span class="status-badge status-${task.status === 'in-progress' ? 'progress' : task.status}">${task.status}</span>
                    <button onclick="Tasks.editTask(${task.id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="Tasks.deleteTask(${task.id})" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    },

    searchTasks(term) {
        this.loadMyTasks();
    },

    clearFilters() {
        const statusFilter = document.getElementById('taskFilterStatus');
        const priorityFilter = document.getElementById('taskFilterPriority');
        const searchInput = document.getElementById('searchTasks');
        
        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        
        this.loadMyTasks();
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
            dueDate: document.getElementById('taskDueDate').value,
            createdAt: new Date().toISOString()
        };
        
        this.allTasks.unshift(newTask);
        this.saveTasks();
        document.getElementById('createTaskForm').reset();
        document.getElementById('taskDueDate').valueAsDate = new Date();
        
        this.showNotification('✅ Task created successfully!', 'success');
        this.switchPage('dashboard');
        this.updateDashboardStats();
        this.loadRecentTasks();
        this.loadMyTasks();
        this.updateCharts();
    },

    editTask(id) {
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
            this.showNotification('✅ Task status updated!', 'success');
        }
    },

    deleteTask(id) {
        if (confirm('⚠️ Delete this task permanently?')) {
            this.allTasks = this.allTasks.filter(t => t.id !== id);
            this.saveTasks();
            this.updateDashboardStats();
            this.loadRecentTasks();
            this.loadMyTasks();
            this.updateCharts();
            this.showNotification('🗑️ Task deleted!', 'success');
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
        const total = this.allTasks.length;
        
        const completionStats = document.getElementById('completionStats');
        if (completionStats) {
            completionStats.innerHTML = `Completed: ${completed} (${total ? Math.round(completed/total*100) : 0}%) | In Progress: ${inProgress} | Pending: ${pending}`;
        }
        
        const priorityStats = document.getElementById('priorityStats');
        if (priorityStats) {
            priorityStats.innerHTML = `High: ${high} | Medium: ${medium} | Low: ${low}`;
        }
        
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
                data: { labels: ['High', 'Medium', 'Low'], datasets: [{ label: 'Number of Tasks', data: [high, medium, low], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'], borderRadius: 8 }] },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
            });
        }
    },

    toggleDarkMode() {
        const theme = document.body.getAttribute('data-theme');
        const icon = document.querySelector('#darkModeToggle i');
        if (theme === 'dark') {
            document.body.removeAttribute('data-theme');
            icon.className = 'fas fa-moon';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-sun';
        }
    },

    showNotification(message, type) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        notif.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Tasks.init());
} else {
    Tasks.init();
}