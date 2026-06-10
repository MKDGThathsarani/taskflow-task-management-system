// Tasks Module
const Tasks = {
    tasks: [],
    teamMembers: [
        { id: 1, name: 'John Doe', email: 'john@taskflow.com', role: 'Developer' },
        { id: 2, name: 'Jane Smith', email: 'jane@taskflow.com', role: 'Designer' },
        { id: 3, name: 'Mike Johnson', email: 'mike@taskflow.com', role: 'Tester' }
    ],

    init: function() {
        console.log('📋 Tasks module initialized');
        this.loadTasksFromStorage();
        this.setupEventListeners();
        this.loadTeamMembersForSelect();
    },

    loadTasksFromStorage: function() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            console.log('📦 Loaded tasks from storage:', this.tasks.length);
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
            console.log('📝 Created sample tasks');
        }
    },

    saveTasks: function() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    setupEventListeners: function() {
        const createTaskBtn = document.getElementById('createTaskBtn');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', () => this.showTaskModal());
        }

        const createTaskForm = document.getElementById('createTaskForm');
        if (createTaskForm) {
            createTaskForm.addEventListener('submit', (e) => this.createTask(e));
        }

        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideTaskModal());
        }

        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideTaskModal());
        }

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('taskModal');
            if (e.target === modal) {
                this.hideTaskModal();
            }
        });
    },

    loadTasks: function() {
        this.updateDashboardStats();
        this.loadRecentTasks();
    },

    showTaskModal: function() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('taskDueDate').valueAsDate = new Date();
        }
    },

    hideTaskModal: function() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('createTaskForm').reset();
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
        
        this.tasks.unshift(newTask);
        this.saveTasks();
        this.hideTaskModal();
        this.updateDashboardStats();
        this.loadRecentTasks();
        
        Auth.showNotification('✅ Task created successfully!', 'success');
    },

    updateDashboardStats: function() {
        const currentUser = Auth.currentUser;
        let userTasks = this.tasks;
        
        if (currentUser && currentUser.role !== 'ADMIN') {
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
        
        if (currentUser && currentUser.role !== 'ADMIN') {
            recentTasks = recentTasks.filter(task => task.assignedTo === currentUser.name);
        }
        
        if (recentTasks.length === 0) {
            recentTasksList.innerHTML = '<tr class="text-center"><td colspan="6">No tasks found. Create your first task!</td></tr>';
            return;
        }
        
        recentTasksList.innerHTML = recentTasks.map(task => `
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
            Auth.showNotification('✅ Task updated successfully!', 'success');
        }
    },

    deleteTask: function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.updateDashboardStats();
            this.loadRecentTasks();
            Auth.showNotification('🗑️ Task deleted successfully!', 'success');
        }
    },

    escapeHtml: function(text) {
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