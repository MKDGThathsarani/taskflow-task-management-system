// Authentication Module
const Auth = {
    currentUser: null,

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
                    Tasks.init();
                    Tasks.updateUIForUser(this.currentUser);
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
        
        // Demo users database
        const USERS = {
            'admin@taskflow.com': { password: 'admin123', name: 'Admin User', role: 'ADMIN' },
            'member@taskflow.com': { password: 'member123', name: 'Team Member', role: 'MEMBER' },
            'mkdgthathsarani@gmail.com': { password: 'githmi123', name: 'Thathsarani', role: 'ADMIN' }
        };
        
        const user = USERS[email];
        
        if (user && user.password === password) {
            this.currentUser = {
                email: email,
                name: user.name,
                role: user.role
            };
            
            localStorage.setItem('taskflow_user', JSON.stringify(this.currentUser));
            this.showNotification('✅ Login successful! Welcome ' + user.name, 'success');
            this.showDashboard();
            
            if (typeof Tasks !== 'undefined') {
                Tasks.init();
                Tasks.updateUIForUser(this.currentUser);
            }
        } else {
            this.showNotification('❌ Invalid email or password! Use: admin@taskflow.com / admin123', 'error');
        }
    },

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('taskflow_user');
        
        document.getElementById('dashboardPage').classList.remove('active');
        document.getElementById('loginPage').classList.add('active');
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        this.showNotification('👋 Logged out successfully!', 'success');
    },

    showDashboard() {
        if (this.currentUser) {
            document.getElementById('loginPage').classList.remove('active');
            document.getElementById('dashboardPage').classList.add('active');
            
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userRole').textContent = this.currentUser.role;
            
            const isAdmin = this.currentUser.role === 'ADMIN';
            const createTaskNav = document.getElementById('createTaskNav');
            if (createTaskNav) {
                createTaskNav.style.display = isAdmin ? 'flex' : 'none';
            }
        }
    },

    showNotification(message, type) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        notif.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}