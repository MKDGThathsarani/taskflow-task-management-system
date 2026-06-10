// Tasks Module
const Tasks = {
    tasks: [],
    teamMembers: [
        { id: 1, name: 'John Doe', email: 'john@taskflow.com', role: 'Developer' },
        { id: 2, name: 'Jane Smith', email: 'jane@taskflow.com', role: 'Designer' },
        { id: 3, name: 'Mike Johnson', email: 'mike@taskflow.com', role: 'Tester' }
    ],

    init: function() {
        this.loadTasksFromStorage();
        this.setupEventListeners();
    },

    loadTasksFromStorage: function() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        } else {
            // Sample tasks
            this.tasks = [
                {
                    id: 1,
                    title: 'Complete project documentation',
                    description: 'Write comprehensive documentation for the project',
                    assignedTo: 'John Doe',
                    priority: 'high',
                    status: 'in-progress',
                    dueDate: '2024-12-15',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Design database schema',
                    description: 'Create ER diagram and database schema',
                    assignedTo: 'Jane Smith',
                    priority: 'medium',
                    status: 'pending',
                    dueDate: '2024-12-20',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'Implement authentication',
                    description: 'Add login and registration functionality',
                    assignedTo: 'Mike Johnson',
                    priority: 'high',
                    status: 'completed',
                    dueDate: '2024-12-10',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveTasks();
        }
    },

    saveTasks: function() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    setupEventListeners: function() {
        const createTaskForm = document.getElementById('createTaskForm');
        if (createTaskForm) {
            createTaskForm.addEventListener('submit', (e) => this.createTask(e));
        }

        const taskFilterStatus = document.getElementById('taskFilterStatus');
        const taskFilterPriority = document.getElementById('taskFilterPriority');
        
        if (taskFilterStatus) {
            taskFilterStatus.addEventListener('change', () => this.renderTasksList());
        }
        if (taskFilterPriority) {
            taskFilterPriority.addEventListener('change', () => this.renderTasksList());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    },

    switchPage: function(page) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            tasks: 'My Tasks',
            'create-task': 'Create Task',
            team: 'Team',
            reports: 'Reports'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
        
        // Hide all content pages
        document.querySelectorAll('.content-page').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected content page
        const contentId = page === 'create-task' ? 'createTaskContent' :
                         page === 'tasks' ? 'tasksContent' :
                         page === 'team' ? 'teamContent' :
                         page === 'reports' ? 'reportsContent' : 'dashboardContent';
        
        document.getElementById(contentId).classList.add('active');
        
        // Load data based on page
        if (page === 'tasks') {
            this.renderTasksList();
        } else if (page === 'dashboard') {
            this.updateDashboardStats();
            this.loadRecentTasks();
        } else if (page === 'team' && Auth.currentUser?.role === 'ADMIN') {
            this.loadTeamMembers();
        } else if (page === 'reports') {
            this.loadReports();
        }
        
        // Load team members for create task form
        if (page === 'create-task') {
            this.loadTeamMembersForSelect();
        }
    },

    createTask: function(e) {
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
        
        this.tasks.push(newTask);
        this.saveTasks();
        
        // Reset form
        document.getElementById('createTaskForm').reset();
        
        Auth.showNotification('Task created successfully!', 'success');
        this.switchPage('dashboard');
        this.updateDashboardStats();
        this.loadRecentTasks();
    },

    renderTasksList: function() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;
        
        const statusFilter = document.getElementById('taskFilterStatus')?.value || 'all';
        const priorityFilter = document.getElementById('taskFilterPriority')?.value || 'all';
        const currentUser = Auth.currentUser;
        
        let filteredTasks = this.tasks;
        
        // Filter by user role
        if (currentUser.role !== 'ADMIN') {
            filteredTasks = filteredTasks.filter(task => task.assignedTo === currentUser.name);
        }
        
        // Filter by status
        if (statusFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }
        
        // Filter by priority
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<div class="text-center" style="padding: 40px;">No tasks found</div>';
            return;
        }
        
        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-card">
                <div class="task-info">
                    <h4>${this.escapeHtml(task.title)}</h4>
                    <p>${this.escapeHtml(task.description || 'No description')}</p>
                    <div class="task-meta">
                        <span><i class="fas fa-user"></i> ${task.assignedTo}</span>
                        <span><i class="fas fa-calendar"></i> Due: ${task.dueDate}</span>
                        <span><i class="fas fa-clock"></i> Created: ${new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span class="status-badge status-${task.status === 'in-progress' ? 'progress' : task.status}">${task.status}</span>
                    <button onclick="Tasks.editTask(${task.id})" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="Tasks.deleteTask(${task.id})" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    updateDashboardStats: function() {
        const currentUser = Auth.currentUser;
        let userTasks = this.tasks;
        
        if (currentUser.role !== 'ADMIN') {
            userTasks = userTasks.filter(task => task.assignedTo === currentUser.name);
        }
        
        const total = userTasks.length;
        const completed = userTasks.filter(t => t.status === 'completed').length;
        const inProgress = userTasks.filter(t => t.status === 'in-progress').length;
        const pending = userTasks.filter(t => t.status === 'pending').length;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('inProgressTasks').textContent = inProgress;
        document.getElementById('pendingTasks').textContent = pending;
    },

    loadRecentTasks: function() {
        const recentTasksList = document.getElementById('recentTasksList');
        if (!recentTasksList) return;
        
        const currentUser = Auth.currentUser;
        let recentTasks = [...this.tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        
        if (currentUser.role !== 'ADMIN') {
            recentTasks = recentTasks.filter(task => task.assignedTo === currentUser.name);
        }
        
        if (recentTasks.length === 0) {
            recentTasksList.innerHTML = '<tr><td colspan="6" class="text-center">No tasks found</td></tr>';
            return;
        }
        
        recentTasksList.innerHTML = recentTasks.map(task => `
            <tr>
                <td>${this.escapeHtml(task.title)}</td>
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

    loadTeamMembers: function() {
        const teamGrid = document.getElementById('teamGrid');
        if (!teamGrid) return;
        
        teamGrid.innerHTML = this.teamMembers.map(member => `
            <div class="team-card">
                <div class="team-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="team-info">
                    <h4>${member.name}</h4>
                    <p>${member.email}</p>
                    <span class="team-role">${member.role}</span>
                </div>
            </div>
        `).join('');
    },

    loadTeamMembersForSelect: function() {
        const assignedToSelect = document.getElementById('taskAssignedTo');
        if (assignedToSelect) {
            assignedToSelect.innerHTML = '<option value="">Select team member</option>' +
                this.teamMembers.map(member => `<option value="${member.name}">${member.name} (${member.role})</option>`).join('');
        }
    },

    editTask: function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newStatus = prompt('Update status (pending/in-progress/completed):', task.status);
        if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
            task.status = newStatus;
            this.saveTasks();
            this.updateDashboardStats();
            this.loadRecentTasks();
            this.renderTasksList();
            Auth.showNotification('Task updated successfully!', 'success');
        }
    },

    deleteTask: function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.updateDashboardStats();
            this.loadRecentTasks();
            this.renderTasksList();
            Auth.showNotification('Task deleted successfully!', 'success');
        }
    },

    loadReports: function() {
        if (typeof Chart !== 'undefined') {
            const completionCtx = document.getElementById('completionChart')?.getContext('2d');
            const priorityCtx = document.getElementById('priorityChart')?.getContext('2d');
            
            const completed = this.tasks.filter(t => t.status === 'completed').length;
            const inProgress = this.tasks.filter(t => t.status === 'in-progress').length;
            const pending = this.tasks.filter(t => t.status === 'pending').length;
            
            if (completionCtx) {
                new Chart(completionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completed', 'In Progress', 'Pending'],
                        datasets: [{
                            data: [completed, inProgress, pending],
                            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b']
                        }]
                    },
                    options: { responsive: true }
                });
            }
            
            const high = this.tasks.filter(t => t.priority === 'high').length;
            const medium = this.tasks.filter(t => t.priority === 'medium').length;
            const low = this.tasks.filter(t => t.priority === 'low').length;
            
            if (priorityCtx) {
                new Chart(priorityCtx, {
                    type: 'bar',
                    data: {
                        labels: ['High', 'Medium', 'Low'],
                        datasets: [{
                            label: 'Number of Tasks',
                            data: [high, medium, low],
                            backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
                        }]
                    },
                    options: { responsive: true }
                });
            }
        }
    },

    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize tasks when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Tasks.init();
});