// Authentication Module
const Auth = {
    currentUser: null,

    init: function() {
        this.loadUserFromStorage();
        this.setupEventListeners();
    },

    loadUserFromStorage: function() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    },

    setupEventListeners: function() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },

    handleLogin: function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Demo users
        const users = {
            'admin@taskflow.com': { password: 'admin123', name: 'Admin User', role: 'ADMIN', department: 'Management' },
            'lead@taskflow.com': { password: 'lead123', name: 'Team Lead', role: 'TEAM_LEAD', department: 'Development' },
            'member@taskflow.com': { password: 'member123', name: 'Team Member', role: 'MEMBER', department: 'Development' }
        };
        
        if (users[email] && users[email].password === password) {
            this.currentUser = {
                email: email,
                name: users[email].name,
                role: users[email].role,
                department: users[email].department
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUIForLoggedInUser();
            
            // Show success message
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Invalid email or password!', 'error');
        }
    },

    handleLogout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('tasks');
        
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('dashboardPage').classList.remove('active');
        
        this.showNotification('Logged out successfully!', 'success');
    },

    updateUIForLoggedInUser: function() {
        if (this.currentUser) {
            document.getElementById('loginPage').classList.remove('active');
            document.getElementById('dashboardPage').classList.add('active');
            
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userRole').textContent = this.currentUser.role;
            
            // Show/hide admin features
            const isAdmin = this.currentUser.role === 'ADMIN';
            const createTaskNav = document.getElementById('createTaskNav');
            const teamNav = document.getElementById('teamNav');
            const addMemberBtn = document.getElementById('addMemberBtn');
            
            if (createTaskNav) createTaskNav.style.display = isAdmin ? 'flex' : 'none';
            if (teamNav) teamNav.style.display = isAdmin ? 'flex' : 'none';
            if (addMemberBtn) addMemberBtn.style.display = isAdmin ? 'flex' : 'none';
            
            // Load dashboard data
            if (typeof Tasks !== 'undefined') {
                Tasks.loadTasks();
                Tasks.updateDashboardStats();
                Tasks.loadRecentTasks();
                if (isAdmin) Tasks.loadTeamMembers();
            }
        }
    },

    showNotification: function(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.style.background = type === 'success' ? '#10b981' : '#ef4444';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});