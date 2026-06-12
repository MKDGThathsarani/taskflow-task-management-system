// ============= AUTHENTICATION MODULE =============

const Auth = {
    currentUser: null,

    // Demo users database
    USERS: {
        'admin@taskflow.com': { password: 'admin123', name: 'Admin User', role: 'ADMIN' },
        'member@taskflow.com': { password: 'member123', name: 'Team Member', role: 'MEMBER' },
        'mkgdthathsarani@gmail.com': { password: 'admin123', name: 'Thathsarani', role: 'ADMIN' }
    },

    init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
    },

    loadUserFromStorage() {
        const savedUser = localStorage.getItem('taskflow_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                if (typeof Tasks !== 'undefined') {
                    Tasks.init(this.currentUser);
                }
                this.showDashboard();
            } catch(e) {
                console.error('Error loading user:', e);
            }
        }
    },

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        const user = this.USERS[email];
        
        if (user && user.password === password) {
            this.currentUser = {
                email: email,
                name: user.name,
                role: user.role
            };
            
            localStorage.setItem('taskflow_user', JSON.stringify(this.currentUser));
            this.showNotification(`✅ Welcome ${user.name}!`, 'success');
            this.showDashboard();
        } else {
            this.showNotification('❌ Invalid email or password!', 'error');
        }
    },

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('taskflow_user');
        
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('dashboardPage').classList.remove('active');
        
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        this.showNotification('👋 Logged out successfully!', 'success');
    },

    showDashboard() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('dashboardPage').classList.add('active');
        
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role;
        
        const isAdmin = this.currentUser.role === 'ADMIN';
        const createTaskNav = document.getElementById('createTaskNav');
        if (createTaskNav) {
            createTaskNav.style.display = isAdmin ? 'flex' : 'none';
        }
        
        if (typeof Tasks !== 'undefined') {
            Tasks.loadAllData();
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

    getCurrentUser() {
        return this.currentUser;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});