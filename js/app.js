// ============= MAIN APPLICATION CONTROLLER =============

const App = {
    init() {
        console.log('🚀 TaskFlow Application Started');
        console.log('📅 Date:', new Date().toLocaleString());
        console.log('💾 Local Storage Available:', typeof localStorage !== 'undefined');
        
        this.setupDarkMode();
        this.checkExistingSession();
    },

    setupDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            // Check for saved dark mode preference
            const savedTheme = localStorage.getItem('taskflow_theme');
            if (savedTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
            }
            
            darkModeToggle.addEventListener('click', () => {
                const theme = document.body.getAttribute('data-theme');
                if (theme === 'dark') {
                    document.body.removeAttribute('data-theme');
                    localStorage.setItem('taskflow_theme', 'light');
                } else {
                    document.body.setAttribute('data-theme', 'dark');
                    localStorage.setItem('taskflow_theme', 'dark');
                }
            });
        }
    },

    checkExistingSession() {
        const savedUser = localStorage.getItem('taskflow_user');
        if (savedUser) {
            console.log('👤 Found existing user session');
        } else {
            console.log('👋 No saved session. Please login.');
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});