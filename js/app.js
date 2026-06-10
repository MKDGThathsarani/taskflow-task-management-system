// Main Application Controller
const App = {
    init: function() {
        console.log('TaskFlow Application Started');
        
        // Add notification styles if not present
        this.addNotificationStyles();
        
        // Check if user is already logged in
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            if (Auth.currentUser) {
                Auth.updateUIForLoggedInUser();
            }
        }
    },

    addNotificationStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification {
                animation: slideIn 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});