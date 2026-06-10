// Main Application Controller
const App = {
    init: function() {
        console.log('🚀 TaskFlow Application Started');
        console.log('📅 Date:', new Date().toLocaleString());
        console.log('💾 Local Storage Available:', typeof localStorage !== 'undefined');
        console.log('🎨 System ready for login');
        
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            console.log('👤 Found saved user session');
        } else {
            console.log('👋 No saved session. Please login.');
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}