// Main Application Controller
class NetworkToolkit {
    constructor() {
        this.networks = [];
        this.currentNetwork = null;
        this.isScanning = false;
        this.isMonitoring = false;
        this.savedNetworks = [];
        this.init();
    }

    init() {
        console.log("Initializing Network Toolkit...");
        this.setupNavigation();
        this.loadSavedData();
        this.setupEventListeners();
        this.startSignalMonitoring();
        this.showNotification("Network Toolkit Pro initialized!", "success");
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-links li');
        const pages = document.querySelectorAll('.page');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageName = item.dataset.page;
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Show selected page
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === pageName) {
                        page.classList.add('active');
                    }
                });
                
                // Save last viewed page
                localStorage.setItem('lastPage', pageName);
            });
        });
        
        // Restore last page
        const lastPage = localStorage.getItem('lastPage') || 'dashboard';
        document.querySelector(`[data-page="${lastPage}"]`).click();
    }

    setupEventListeners() {
        // Password manager modal
        document.getElementById('network-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.savePassword();
        });
        
        // Auto scan interval
        document.getElementById('scan-interval').addEventListener('change', (e) => {
            this.setAutoScanInterval(parseInt(e.target.value));
        });
        
        // Theme selector
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
    }

    async scanNetworks() {
        if (this.isScanning) return;
        
        this.isScanning = true;
        this.showNotification("Scanning for networks...", "info");
        
        try {
            const networks = await this.simulateNetworkScan();
            this.networks = networks;
            this.displayNetworks(networks);
            this.updateRecentScans(networks);
            
            this.showNotification(`Found ${networks.length} networks`, "success");
        } catch (error) {
            this.showNotification("Scan failed: " + error.message, "error");
        } finally {
            this.isScanning = false;
            document.getElementById('scan-progress-bar').style.width = '100%';
            document.getElementById('scan-status').textContent = 'Scan complete';
        }
    }

    simulateNetworkScan() {
        return new Promise((resolve) => {
            let progress = 0;
            const progressBar = document.getElementById('scan-progress-bar');
            const status = document.getElementById('scan-status');
            
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                status.textContent = `Scanning... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    const networks = [
                        { 
                            ssid: 'Home_WiFi', 
                            bssid: 'AA:BB:CC:DD:EE:FF', 
                            signal: -45, 
                            channel: 6, 
                            security: 'WPA2', 
                            encryption: 'AES',
                            frequency: '2.4 GHz'
                        },
                        { 
                            ssid: 'Neighbor_Network', 
                            bssid: '11:22:33:44:55:66', 
                            signal: -68, 
                            channel: 11, 
                            security: 'WPA2', 
                            encryption: 'TKIP',
                            frequency: '2.4 GHz'
                        },
                        { 
                            ssid: 'Guest_WiFi', 
                            bssid: 'FF:EE:DD:CC:BB:AA', 
                            signal: -72, 
                            channel: 1, 
                            security: 'WPA3', 
                            encryption: 'AES',
                            frequency: '5 GHz'
                        },
                        { 
                            ssid: 'IoT_Network', 
                            bssid: '55:66:77:88:99:00', 
                            signal: -55, 
                            channel: 36, 
                            security: 'WPA2', 
                            encryption: 'AES',
                            frequency: '5 GHz'
                        },
                        { 
                            ssid: 'Hidden_Network', 
                            bssid: '00:11:22:33:44:55', 
                            signal: -80, 
                            channel: 9, 
                            security: 'WEP', 
                            encryption: 'WEP',
                            frequency: '2.4 GHz'
                        }
                    ];
                    resolve(networks);
                }
            }, 200);
        });
    }

    displayNetworks(networks) {
        const container = document.getElementById('networks-list');
        container.innerHTML = '';
        
        networks.forEach(network => {
            const item = document.createElement('div');
            item.className = 'network-item';
            item.innerHTML = `
                <div>
                    <strong>${network.ssid}</strong>
                    <div class="network-info">
                        <span>Signal: ${network.signal} dBm</span>
                        <span>Channel: ${network.channel}</span>
                        <span>Security: ${network.security}</span>
                    </div>
                </div>
                <div>
                    <button onclick="showNetworkDetails('${network.ssid}')" class="btn-action btn-small">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    showNetworkDetails(ssid) {
        const network = this.networks.find(n => n.ssid === ssid);
        if (!network) return;
        
        const details = document.getElementById('details-content');
        details.innerHTML = `
            <div class="detail-item">
                <label>SSID:</label>
                <span>${network.ssid}</span>
            </div>
            <div class="detail-item">
                <label>BSSID:</label>
                <span>${network.bssid}</span>
            </div>
            <div class="detail-item">
                <label>Signal Strength:</label>
                <span>${network.signal} dBm (${this.getSignalQuality(network.signal)})</span>
            </div>
            <div class="detail-item">
                <label>Channel:</label>
                <span>${network.channel}</span>
            </div>
            <div class="detail-item">
                <label>Frequency:</label>
                <span>${network.frequency}</span>
            </div>
            <div class="detail-item">
                <label>Security:</label>
                <span class="security-badge ${this.getSecurityClass(network.security)}">
                    ${network.security} - ${network.encryption}
                </span>
            </div>
            <div class="detail-item">
                <label>Recommendation:</label>
                <span>${this.getRecommendation(network)}</span>
            </div>
        `;
    }

    getSignalQuality(signal) {
        if (signal >= -50) return 'Excellent';
        if (signal >= -60) return 'Good';
        if (signal >= -70) return 'Fair';
        if (signal >= -80) return 'Poor';
        return 'Very Poor';
    }

    getSecurityClass(security) {
        switch(security) {
            case 'WPA3': return 'security-excellent';
            case 'WPA2': return 'security-good';
            case 'WPA': return 'security-fair';
            case 'WEP': return 'security-poor';
            default: return 'security-unknown';
        }
    }

    getRecommendation(network) {
        if (network.security === 'WEP') {
            return '⚠️ Upgrade to WPA2/WPA3 immediately!';
        }
        if (network.signal < -70) {
            return '📡 Consider moving closer to router or using repeater';
        }
        if (network.encryption === 'TKIP') {
            return '🔒 Change encryption to AES for better security';
        }
        return '✅ Network configuration looks good';
    }

    async runSpeedTest() {
        this.showNotification("Starting speed test...", "info");
        
        const startTime = Date.now();
        const speed = await this.simulateSpeedTest();
        const duration = Date.now() - startTime;
        
        this.showNotification(`Speed test complete: ${speed.download} Mbps download`, "success");
        this.displaySpeedResults(speed);
    }

    simulateSpeedTest() {
        return new Promise((resolve) => {
            let progress = 0;
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.width = '0%';
            
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve({
                        download: Math.floor(Math.random() * 100) + 50,
                        upload: Math.floor(Math.random() * 30) + 10,
                        ping: Math.floor(Math.random() * 50) + 10,
                        jitter: Math.floor(Math.random() * 10) + 1
                    });
                }
            }, 100);
        });
    }

    displaySpeedResults(speed) {
        const dashboard = document.getElementById('dashboard');
        let speedDiv = document.querySelector('.speed-results');
        
        if (!speedDiv) {
            speedDiv = document.createElement('div');
            speedDiv.className = 'speed-results';
            dashboard.appendChild(speedDiv);
        }
        
        speedDiv.innerHTML = `
            <h3>Speed Test Results</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-download"></i>
                    <h4>Download</h4>
                    <p>${speed.download} Mbps</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-upload"></i>
                    <h4>Upload</h4>
                    <p>${speed.upload} Mbps</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tachometer-alt"></i>
                    <h4>Ping</h4>
                    <p>${speed.ping} ms</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-wave-square"></i>
                    <h4>Jitter</h4>
                    <p>${speed.jitter} ms</p>
                </div>
            </div>
        `;
    }

    startSignalMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        let signalValue = -45;
        
        this.monitorInterval = setInterval(() => {
            // Simulate signal fluctuation
            signalValue += (Math.random() - 0.5) * 10;
            signalValue = Math.max(-100, Math.min(-30, signalValue));
            
            // Update signal bar
            const percentage = ((signalValue + 100) * 100) / 70;
            const signalBar = document.getElementById('signal-level');
            const signalText = document.getElementById('signal-text');
            
            if (signalBar) {
                signalBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
                signalText.textContent = `${Math.round(signalValue)} dBm`;
            }
            
            // Update chart
            this.updateSignalChart(signalValue);
            
            // Update analyzer page
            document.getElementById('current-strength').textContent = `${Math.round(signalValue)} dBm`;
            document.getElementById('signal-quality').textContent = this.getSignalQuality(signalValue);
        }, 2000);
    }

    updateSignalChart(signal) {
        if (!window.signalChart) return;
        
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        window.signalChart.data.labels.push(time);
        window.signalChart.data.datasets[0].data.push(signal);
        
        // Keep only last 20 points
        if (window.signalChart.data.labels.length > 20) {
            window.signalChart.data.labels.shift();
            window.signalChart.data.datasets[0].data.shift();
        }
        
        window.signalChart.update();
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('networkToolkit_savedNetworks');
            if (saved) {
                this.savedNetworks = JSON.parse(saved);
                this.updateSavedNetworksDisplay();
            }
        } catch (e) {
            console.error("Failed to load saved data:", e);
        }
    }

    updateSavedNetworksDisplay() {
        const container = document.getElementById('saved-networks');
        if (!container) return;
        
        container.innerHTML = '<h3>Saved Networks</h3>';
        
        this.savedNetworks.forEach((network, index) => {
            const div = document.createElement('div');
            div.className = 'saved-network-item';
            div.innerHTML = `
                <strong>${network.ssid}</strong>
                <button onclick="app.deleteSavedNetwork(${index})" class="btn-action btn-small">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    }

    savePassword() {
        const ssid = document.getElementById('network-name').value;
        const password = document.getElementById('network-password').value;
        
        if (!ssid || !password) {
            this.showNotification("Please enter both network name and password", "error");
            return;
        }
        
        this.savedNetworks.push({ ssid, password, date: new Date().toISOString() });
        localStorage.setItem('networkToolkit_savedNetworks', JSON.stringify(this.savedNetworks));
        
        this.updateSavedNetworksDisplay();
        this.showNotification("Password saved successfully!", "success");
        
        // Clear inputs
        document.getElementById('network-name').value = '';
        document.getElementById('network-password').value = '';
    }

    deleteSavedNetwork(index) {
        this.savedNetworks.splice(index, 1);
        localStorage.setItem('networkToolkit_savedNetworks', JSON.stringify(this.savedNetworks));
        this.updateSavedNetworksDisplay();
        this.showNotification("Network deleted", "success");
    }

    updateRecentScans(networks) {
        const container = document.getElementById('recent-networks');
        if (!container) return;
        
        container.innerHTML = networks.slice(0, 3).map(network => `
            <div class="recent-network">
                <strong>${network.ssid}</strong>
                <span>${network.signal} dBm • ${network.security}</span>
            </div>
        `).join('');
    }

    setAutoScanInterval(interval) {
        if (this.autoScanInterval) {
            clearInterval(this.autoScanInterval);
        }
        
        if (interval > 0) {
            this.autoScanInterval = setInterval(() => {
                if (!this.isScanning) {
                    this.scanNetworks();
                }
            }, interval);
            this.showNotification(`Auto scan interval set to ${interval/1000} seconds`, "success");
        }
    }

    setTheme(theme) {
        document.body.className = theme;
        localStorage.setItem('appTheme', theme);
        this.showNotification(`Theme changed to ${theme}`, "success");
    }

    clearAllData() {
        if (confirm("Are you sure you want to clear all saved data?")) {
            localStorage.clear();
            this.savedNetworks = [];
            this.networks = [];
            this.showNotification("All data cleared", "success");
            location.reload();
        }
    }

    exportAllData() {
        const data = {
            savedNetworks: this.savedNetworks,
            scannedNetworks: this.networks,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-toolkit-export-${Date.now()}.json`;
        a.click();
        
        this.showNotification("Data exported successfully!", "success");
    }
}

// Global functions for button clicks
function startScan() {
    window.app.scanNetworks();
}

function stopScan() {
    window.app.isScanning = false;
    window.app.showNotification("Scan stopped", "info");
}

function showPage(pageName) {
    document.querySelector(`[data-page="${pageName}"]`).click();
}

function showNetworkDetails(ssid) {
    window.app.showNetworkDetails(ssid);
}

function showPasswordManager() {
    document.getElementById('password-modal').classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function savePassword() {
    window.app.savePassword();
}

function runSpeedTest() {
    window.app.runSpeedTest();
}

function startSignalMonitoring() {
    window.app.startSignalMonitoring();
}

function generateQRCode() {
    const ssid = prompt("Enter WiFi SSID:");
    if (!ssid) return;
    
    const password = prompt("Enter WiFi Password:");
    if (!password) return;
    
    const wifiString = `WIFI:S:${ssid};T:WPA;P:${password};;`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wifiString)}`;
    
    window.open(qrUrl, '_blank');
    window.app.showNotification("QR Code generated! Check new tab.", "success");
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NetworkToolkit();
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });
});

// Export app to window
if (typeof window !== 'undefined') {
    window.NetworkToolkit = NetworkToolkit;
}