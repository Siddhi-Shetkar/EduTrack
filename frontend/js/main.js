const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// On Dashboard load
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        // Mock data loading for dashboard since we don't have a specific dashboard stats endpoint yet.
        // In a real app, you'd fetch this from the backend.
        document.getElementById('total-students').textContent = '120';
        document.getElementById('present-today').textContent = '105';
        document.getElementById('absent-today').textContent = '10';
        document.getElementById('late-today').textContent = '5';
        
        document.getElementById('recent-updates-container').innerHTML = `
            <div style="text-align: left;">
                <p><strong>B.Tech IT - 2nd Year</strong> - Attendance marked by Admin (Today)</p>
                <p><strong>B.Tech CSE - 2nd Year</strong> - Attendance marked by Admin (Today)</p>
            </div>
        `;
    });
}
