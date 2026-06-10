// Authentication Module
const Auth = {
    currentUser: null,

    init: function() {
        console.log('✅ Auth module initialized');
        this.loadUserFromStorage();
        this.setupEventListeners();
    },

    loadUserFromStorage: function() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('📀 Loaded user from storage:', this.currentUser.email);
                this.updateUIForLoggedInUser();
            } catch(e) {
                console.error('Error parsing user:', e);
            }
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
        
        console.log('🔐 Login attempt with:', email);
        
        // Users database
        const users = {
            'admin@taskflow.com': { password: 'admin123', name: 'Admin User', role: 'ADMIN', department: 'Management' },
            'lead@taskflow.com': { password: 'lead123', name: 'Team Lead', role: 'TEAM_LEAD', department: 'Development' },
            'member@taskflow.com': { password: 'member123', name: 'Team Member', role: 'MEMBER', department: 'Development' },
            'mkgdthathsarani@gmail.com': { password: 'admin123', name: 'Thathsarani', role: 'ADMIN', department: 'Management' }
        };
        
        // Check credentials
        if (users[email] && users[email].password === password) {
            this.currentUser = {
                email: email,
                name: users[email].name,
                role: users[email].role,
                department: users[email].department
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            console.log('✅ Login successful! User:', this.currentUser.name);
            this.showNotification('✅ Login successful! Welcome ' + this.currentUser.name, 'success');
            this.updateUIForLoggedInUser();
            
            // Load tasks after login
            if (typeof Tasks !== 'undefined') {
                Tasks.loadTasks();
            }
        } else {
            console.log('❌ Login failed. Available emails:', Object.keys(users));
            this.showNotification('❌ Invalid email or password! Please check your credentials.', 'error');
        }
    },

    handleLogout: function() {
        console.log('🚪 Logging out...');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        const loginPage = document.getElementById('loginPage');
        const dashboardPage = document.getElementById('dashboardPage');
        
        if (loginPage) loginPage.classList.add('active');
        if (dashboardPage) dashboardPage.classList.remove('active');
        
        // Clear form
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        this.showNotification('👋 Logged out successfully!', 'success');
    },

    updateUIForLoggedInUser: function() {
        if (this.currentUser) {
            const loginPage = document.getElementById('loginPage');
            const dashboardPage = document.getElementById('dashboardPage');
            
            if (loginPage) loginPage.classList.remove('active');
            if (dashboardPage) dashboardPage.classList.add('active');
            
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) {
                userNameDisplay.textContent = `${this.currentUser.name} (${this.currentUser.role})`;
            }
            
            console.log('🎨 UI updated for user:', this.currentUser.name);
        }
    },

    showNotification: function(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}