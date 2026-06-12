// Main Application Controller
const App = {
    init() {
        console.log('🚀 TaskFlow Application Started');
        console.log('📅 Date:', new Date().toLocaleString());
        console.log('💾 Local Storage Available:', typeof localStorage !== 'undefined');
        
        // Add notification styles
        this.addNotificationStyles();
        
        // Check for saved user session
        const savedUser = localStorage.getItem('taskflow_user');
        if (savedUser) {
            console.log('👤 Found saved user session');
        } else {
            console.log('👋 No saved session. Please login.');
        }
        
        console.log('✅ System ready! Login with: admin@taskflow.com / admin123');
    },

    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification { animation: slideIn 0.3s ease; }
        `;
        document.head.appendChild(style);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}