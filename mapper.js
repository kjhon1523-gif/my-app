class NetworkMapper {
    constructor() {
        this.devices = [];
        this.isDiscovering = false;
        this.deviceTemplates = {
            router: { icon: 'fas fa-wifi', color: '#667eea' },
            computer: { icon: 'fas fa-desktop', color: '#28a745' },
            phone: { icon: 'fas fa-mobile-alt', color: '#ffc107' },
            iot: { icon: 'fas fa-lightbulb', color: '#dc3545' },
            unknown: { icon: 'fas fa-question-circle', color: '#6c757d' }
        };
        this.init();
    }

    init() {
        console.log("Network Mapper initialized");
        // Load any previously discovered devices
        this.loadSavedDevices();
    }

    async discoverDevices() {
        if (this.isDiscovering) return;
        
        this.isDiscovering = true;
        this.showNotification("Discovering network devices...", "info");
        
        try {
            const devices = await this.simulateDiscovery();
            this.devices = devices;
            this.displayDevices(devices);
            this.saveDevices(devices);
            
            this.showNotification(`Found ${devices.length} devices on network`, "success");
        } catch (error) {
            this.showNotification("Discovery failed: " + error.message, "error");
        } finally {
            this.isDiscovering = false;
        }
    }

    simulateDiscovery() {
        return new Promise((resolve) => {
            // Simulate discovery delay
            setTimeout(() => {
                const devices = [
                    { 
                        ip: '192.168.1.1', 
                        mac: 'AA:BB:CC:DD:EE:FF', 
                        hostname: 'Router', 
                        type: 'router', 
                        vendor: 'TP-Link', 
                        os: 'OpenWRT', 
                        lastSeen: 'Now',
                        ports: [80, 443, 22]
                    },
                    { 
                        ip: '192.168.1.101', 
                        mac: '11:22:33:44:55:66', 
                        hostname: 'My-PC', 
                        type: 'computer', 
                        vendor: 'Dell', 
                        os: 'Windows 11', 
                        lastSeen: '5 mins ago',
                        ports: [445, 3389, 139]
                    },
                    { 
                        ip: '192.168.1.102', 
                        mac: '22:33:44:55:66:77', 
                        hostname: 'Android-Phone', 
                        type: 'phone', 
                        vendor: 'Samsung', 
                        os: 'Android 14', 
                        lastSeen: 'Now',
                        ports: []
                    },
                    { 
                        ip: '192.168.1.103', 
                        mac: '33:44:55:66:77:88', 
                        hostname: 'Smart-TV', 
                        type: 'iot', 
                        vendor: 'Sony', 
                        os: 'Android TV', 
                        lastSeen: '10 mins ago',
                        ports: [8008, 8009]
                    },
                    { 
                        ip: '192.168.1.104', 
                        mac: '44:55:66:77:88:99', 
                        hostname: 'NAS-Server', 
                        type: 'computer', 
                        vendor: 'Synology', 
                        os: 'DSM 7', 
                        lastSeen: '1 hour ago',
                        ports: [5000, 5001]
                    },
                    { 
                        ip: '192.168.1.105', 
                        mac: '55:66:77:88:99:00', 
                        hostname: 'Printer', 
                        type: 'iot', 
                        vendor: 'HP', 
                        os: 'Embedded', 
                        lastSeen: '2 days ago',
                        ports: [9100, 515]
                    }
                ];
                resolve(devices);
            }, 3000);
        });
    }

    displayDevices(devices) {
        const container = document.getElementById('devices-grid');
        container.innerHTML = '';
        
        devices.forEach(device => {
            const template = this.deviceTemplates[device.type] || this.deviceTemplates.unknown;
            
            const card = document.createElement('div');
            card.className = 'device-card';
            card.setAttribute('data-type', device.type);
            card.innerHTML = `
                <div class="device-header">
                    <i class="${template.icon}" style="color: ${template.color}; font-size: 24px;"></i>
                    <h3>${device.hostname}</h3>
                </div>
                <div class="device-info">
                    <p><strong>IP:</strong> ${device.ip}</p>
                    <p><strong>MAC:</strong> ${device.mac}</p>
                    <p><strong>Type:</strong> ${device.type.toUpperCase()}</p>
                    <p><strong>Vendor:</strong> ${device.vendor}</p>
                    <p><strong>OS:</strong> ${device.os}</p>
                    <p><strong>Last Seen:</strong> ${device.lastSeen}</p>
                    ${device.ports.length > 0 ? `<p><strong>Open Ports:</strong> ${device.ports.join(', ')}</p>` : ''}
                </div>
                <div class="device-actions">
                    <button onclick="mapper.scanDevice('${device.ip}')" class="btn-action btn-small">
                        <i class="fas fa-search"></i> Scan Ports
                    </button>
                    <button onclick="mapper.pingDevice('${device.ip}')" class="btn-action btn-small">
                        <i class="fas fa-bolt"></i> Ping
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    scanDevice(ip) {
        this.showNotification(`Scanning device ${ip}...`, "info");
        
        // Switch to port scanner page and set IP
        showPage('portscanner');
        setTimeout(() => {
            document.getElementById('target-ip').value = ip;
        }, 100);
    }

    pingDevice(ip) {
        this.showNotification(`Pinging ${ip}...`, "info");
        
        // Simulate ping
        setTimeout(() => {
            const latency = Math.floor(Math.random() * 100) + 10;
            this.showNotification(`Ping to ${ip}: ${latency}ms`, "success");
        }, 1000);
    }

    exportNetworkMap() {
        const data = {
            timestamp: new Date().toISOString(),
            devices: this.devices,
            summary: {
                total: this.devices.length,
                byType: this.devices.reduce((acc, device) => {
                    acc[device.type] = (acc[device.type] || 0) + 1;
                    return acc;
                }, {})
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-map-${Date.now()}.json`;
        a.click();
        
        this.showNotification('Network map exported!', "success");
    }

    saveDevices(devices) {
        localStorage.setItem('network_mapper_devices', JSON.stringify(devices));
    }

    loadSavedDevices() {
        try {
            const saved = localStorage.getItem('network_mapper_devices');
            if (saved) {
                const devices = JSON.parse(saved);
                this.displayDevices(devices);
            }
        } catch (e) {
            console.error("Failed to load saved devices:", e);
        }
    }

    showNotification(message, type = "info") {
        // Use the main app's notification system if available
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }
}

// Initialize and make globally available
window.mapper = new NetworkMapper();

// Global functions
function startDiscovery() {
    window.mapper.discoverDevices();
}

function exportNetworkMap() {
    window.mapper.exportNetworkMap();
}