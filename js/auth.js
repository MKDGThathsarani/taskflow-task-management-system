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
                console.log('📀 Loaded user:', this.currentUser.email);
                this.updateUIForLoggedInUser();
            } catch(e) {
                console.error('Error:', e);
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
        
        console.log('🔐 Login attempt:', email);
        
        // Users database - ඔයාගේ email එක add කරලා
        const users = {
            'admin@taskflow.com': { password: 'admin123', name: 'Admin User', role: 'ADMIN', department: 'Management' },
            'lead@taskflow.com': { password: 'lead123', name: 'Team Lead', role: 'TEAM_LEAD', department: 'Development' },
            'member@taskflow.com': { password: 'member123', name: 'Team Member', role: 'MEMBER', department: 'Development' },
            'mkdgthathsarani@gmail.com': { password: 'admin123', name: 'Thathsarani', role: 'ADMIN', department: 'Management' }
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
            console.log('✅ Login successful!');
            this.showNotification('✅ Login successful! Welcome ' + this.currentUser.name, 'success');
            this.updateUIForLoggedInUser();
            
            if (typeof Tasks !== 'undefined') {
                Tasks.loadTasks();
            }
        } else {
            console.log('❌ Login failed');
            this.showNotification('❌ Invalid email or password! Please use: mkgdthathsarani@gmail.com / admin123', 'error');
        }
    },

    handleLogout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('dashboardPage').classList.remove('active');
        
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        this.showNotification('👋 Logged out successfully!', 'success');
    },

    updateUIForLoggedInUser: function() {
        if (this.currentUser) {
            document.getElementById('loginPage').classList.remove('active');
            document.getElementById('dashboardPage').classList.add('active');
            
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) {
                userNameDisplay.textContent = `${this.currentUser.name} (${this.currentUser.role})`;
            }
        }
    },

    showNotification: function(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}