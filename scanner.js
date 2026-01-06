class PortScanner {
    constructor() {
        this.isScanning = false;
        this.currentScan = null;
        this.commonPorts = {
            20: 'FTP Data',
            21: 'FTP Control',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            110: 'POP3',
            143: 'IMAP',
            443: 'HTTPS',
            445: 'SMB',
            993: 'IMAP SSL',
            995: 'POP3 SSL',
            1433: 'MSSQL',
            1521: 'Oracle DB',
            3306: 'MySQL',
            3389: 'RDP',
            5432: 'PostgreSQL',
            5900: 'VNC',
            8080: 'HTTP Proxy'
        };
        this.init();
    }

    init() {
        console.log("Port Scanner initialized");
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add enter key support for IP and port fields
        document.getElementById('target-ip')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.scanPorts();
        });
        
        document.getElementById('port-range')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.scanPorts();
        });
    }

    async scanPorts() {
        if (this.isScanning) return;
        
        const targetIP = document.getElementById('target-ip').value.trim();
        const portRange = document.getElementById('port-range').value.trim();
        
        if (!this.validateIP(targetIP)) {
            this.showNotification('Invalid IP address', 'error');
            return;
        }
        
        const [start, end] = this.parsePortRange(portRange);
        if (!start || !end || start > end || start < 1 || end > 65535) {
            this.showNotification('Invalid port range (use format: 1-1000)', 'error');
            return;
        }
        
        this.isScanning = true;
        this.showNotification(`Scanning ${targetIP}:${start}-${end}`, 'info');
        
        // Clear previous results
        document.getElementById('ports-table').querySelector('tbody').innerHTML = '';
        const progressBar = document.getElementById('port-scan-progress');
        const status = document.getElementById('port-scan-status');
        
        const totalPorts = end - start + 1;
        let scannedPorts = 0;
        let openPorts = [];
        
        try {
            for (let port = start; port <= end && this.isScanning; port++) {
                const result = await this.scanPort(targetIP, port);
                
                if (result.status === 'open') {
                    openPorts.push(result);
                    this.displayPortResult(result);
                }
                
                scannedPorts++;
                const progress = Math.floor((scannedPorts / totalPorts) * 100);
                progressBar.style.width = `${progress}%`;
                status.textContent = `Scanned ${scannedPorts}/${totalPorts} ports (${progress}%)`;
                
                // Small delay to prevent UI freeze
                await this.delay(10);
            }
            
            if (this.isScanning) {
                this.showNotification(`Scan complete! Found ${openPorts.length} open ports`, 'success');
                status.textContent = `Scan complete - ${openPorts.length} open ports found`;
            }
        } catch (error) {
            this.showNotification(`Scan error: ${error.message}`, 'error');
        } finally {
            this.isScanning = false;
        }
    }

    scanPort(ip, port) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate port scanning with realistic probabilities
                let isOpen = false;
                let service = this.commonPorts[port] || 'Unknown';
                let protocol = port <= 1024 ? 'TCP' : 'UDP';
                
                // Higher probability for common ports
                if (this.commonPorts[port]) {
                    isOpen = Math.random() > 0.7; // 30% chance for common ports
                } else {
                    isOpen = Math.random() > 0.95; // 5% chance for other ports
                }
                
                resolve({
                    port: port,
                    ip: ip,
                    status: isOpen ? 'open' : 'closed',
                    service: service,
                    protocol: protocol,
                    banner: isOpen ? this.getBanner(port) : null
                });
            }, Math.random() * 100); // Random delay for realism
        });
    }

    displayPortResult(result) {
        const tbody = document.getElementById('ports-table').querySelector('tbody');
        const row = document.createElement('tr');
        
        let security = 'info';
        let securityText = 'Info';
        
        if (result.status === 'open') {
            // Determine security level based on port
            if ([21, 23, 80, 143, 445, 3389].includes(result.port)) {
                security = 'warning';
                securityText = 'Warning';
            } else if ([22, 443, 993, 995].includes(result.port)) {
                security = 'success';
                securityText = 'Secure';
            } else if (result.port <= 1024) {
                security = 'fair';
                securityText = 'System';
            }
        }
        
        row.innerHTML = `
            <td><strong>${result.port}</strong></td>
            <td>${result.service}</td>
            <td class="port-${result.status}">${result.status.toUpperCase()}</td>
            <td>${result.protocol}</td>
            <td class="security-${security}">${securityText}</td>
        `;
        
        tbody.appendChild(row);
    }

    getBanner(port) {
        const banners = {
            22: 'SSH-2.0-OpenSSH_8.2p1',
            80: 'HTTP/1.1 200 OK\nServer: nginx/1.18.0',
            443: 'HTTP/1.1 200 OK\nServer: Apache/2.4.41',
            21: '220 FTP Server Ready',
            25: '220 smtp.example.com ESMTP',
            3389: 'Microsoft Terminal Services'
        };
        return banners[port] || 'Service banner not available';
    }

    validateIP(ip) {
        const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!pattern.test(ip)) return false;
        
        return ip.split('.').every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255;
        });
    }

    parsePortRange(range) {
        if (!range.includes('-')) {
            const port = parseInt(range);
            return [port, port];
        }
        
        const parts = range.split('-').map(p => parseInt(p.trim()));
        if (parts.length !== 2 || parts.some(isNaN)) {
            return [null, null];
        }
        
        return parts;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stopPortScan() {
        this.isScanning = false;
        this.showNotification('Port scan stopped', 'info');
        document.getElementById('port-scan-status').textContent = 'Scan stopped';
    }

    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            alert(`${type}: ${message}`);
        }
    }
}

// Initialize and make globally available
window.scanner = new PortScanner();

// Global functions
function scanPorts() {
    window.scanner.scanPorts();
}

function stopPortScan() {
    window.scanner.stopPortScan();
}