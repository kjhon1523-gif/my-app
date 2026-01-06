class NetworkTools {
    constructor() {
        this.init();
    }

    init() {
        console.log("Network Tools initialized");
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Password generator inputs
        document.getElementById('uppercase')?.addEventListener('change', () => this.updatePasswordPreview());
        document.getElementById('lowercase')?.addEventListener('change', () => this.updatePasswordPreview());
        document.getElementById('numbers')?.addEventListener('change', () => this.updatePasswordPreview());
        document.getElementById('symbols')?.addEventListener('change', () => this.updatePasswordPreview());
        document.getElementById('length-slider')?.addEventListener('input', (e) => {
            document.getElementById('length-value').textContent = `${e.target.value} characters`;
            this.updatePasswordPreview();
        });
    }

    openPasswordGenerator() {
        document.getElementById('password-gen-modal').classList.add('active');
        this.generateNewPassword();
    }

    generateNewPassword() {
        const uppercase = document.getElementById('uppercase').checked;
        const lowercase = document.getElementById('lowercase').checked;
        const numbers = document.getElementById('numbers').checked;
        const symbols = document.getElementById('symbols').checked;
        const length = parseInt(document.getElementById('length-slider').value);
        
        let charset = '';
        if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers) charset += '0123456789';
        if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (charset === '') {
            document.getElementById('generated-password').value = 'Select at least one character type';
            return;
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        document.getElementById('generated-password').value = password;
    }

    updatePasswordPreview() {
        this.generateNewPassword();
    }

    copyPassword() {
        const passwordField = document.getElementById('generated-password');
        passwordField.select();
        document.execCommand('copy');
        
        this.showNotification("Password copied to clipboard!", "success");
    }

    openQRGenerator() {
        const ssid = prompt("Enter WiFi SSID:");
        if (!ssid) return;
        
        const password = prompt("Enter WiFi Password:");
        if (!password) return;
        
        const encryption = prompt("Encryption type (WPA/WEP/nopass):", "WPA");
        
        const wifiString = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(wifiString)}`;
        
        const win = window.open(qrUrl, '_blank');
        if (win) {
            win.focus();
            this.showNotification("QR Code generated in new tab!", "success");
        }
    }

    openSubnetCalculator() {
        const ip = prompt("Enter IP address (e.g., 192.168.1.1):", "192.168.1.1");
        if (!ip) return;
        
        const cidr = prompt("Enter CIDR (e.g., 24):", "24");
        if (!cidr) return;
        
        const result = this.calculateSubnet(ip, parseInt(cidr));
        alert(`Subnet Information for ${ip}/${cidr}:\n\n` +
              `Network Address: ${result.network}\n` +
              `Broadcast Address: ${result.broadcast}\n` +
              `Usable Host Range: ${result.firstHost} - ${result.lastHost}\n` +
              `Total Hosts: ${result.totalHosts}\n` +
              `Usable Hosts: ${result.usableHosts}\n` +
              `Subnet Mask: ${result.subnetMask}`);
    }

    calculateSubnet(ip, cidr) {
        const ipParts = ip.split('.').map(Number);
        const ipBinary = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const mask = 0xffffffff << (32 - cidr);
        
        const network = ipBinary & mask;
        const broadcast = network | (~mask);
        
        const firstHost = network + 1;
        const lastHost = broadcast - 1;
        
        const totalHosts = Math.pow(2, 32 - cidr);
        const usableHosts = Math.max(0, totalHosts - 2);
        
        return {
            network: this.binaryToIP(network),
            broadcast: this.binaryToIP(broadcast),
            firstHost: this.binaryToIP(firstHost),
            lastHost: this.binaryToIP(lastHost),
            totalHosts: totalHosts,
            usableHosts: usableHosts,
            subnetMask: this.binaryToIP(mask)
        };
    }

    binaryToIP(binary) {
        return [
            (binary >>> 24) & 0xff,
            (binary >>> 16) & 0xff,
            (binary >>> 8) & 0xff,
            binary & 0xff
        ].join('.');
    }

    openMACLookup() {
        const mac = prompt("Enter MAC address (e.g., AA:BB:CC:DD:EE:FF):", "AA:BB:CC:DD:EE:FF");
        if (!mac) return;
        
        // Simplified vendor lookup (in real app, use API)
        const vendors = {
            'AA:BB:CC': 'Example Corp',
            '00:0C:29': 'VMware',
            '00:50:56': 'VMware',
            '00:1A:11': 'Google',
            '00:1E:65': 'Google',
            '00:25:9C': 'Cisco',
            '00:26:0B': 'Apple',
            '00:03:93': 'Apple',
            '00:0D:93': 'Apple',
            '00:05:02': 'Apple',
            '00:0A:95': 'Apple',
            '00:1B:63': 'Apple',
            '00:1D:4F': 'Apple',
            '00:1E:52': 'Apple',
            '00:1E:C2': 'Apple',
            '00:22:41': 'Apple',
            '00:23:32': 'Apple',
            '00:23:6C': 'Apple',
            '00:23:DF': 'Apple',
            '00:24:36': 'Apple',
            '00:25:00': 'Apple',
            '00:25:4B': 'Apple',
            '00:25:BC': 'Apple'
        };
        
        const prefix = mac.replace(/[^A-F0-9]/gi, '').substr(0, 6).toUpperCase();
        const prefixFormatted = prefix.match(/.{2}/g)?.join(':');
        
        const vendor = vendors[prefixFormatted] || 'Unknown Vendor';
        
        alert(`MAC Address: ${mac}\n` +
              `OUI Prefix: ${prefixFormatted || prefix}\n` +
              `Vendor: ${vendor}\n\n` +
              `Note: This is a limited offline database. For accurate results, use online MAC lookup services.`);
    }

    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize and make globally available
window.networkTools = new NetworkTools();

// Global functions
function openPasswordGenerator() {
    window.networkTools.openPasswordGenerator();
}

function openQRGenerator() {
    window.networkTools.openQRGenerator();
}

function openSubnetCalculator() {
    window.networkTools.openSubnetCalculator();
}

function openMACLookup() {
    window.networkTools.openMACLookup();
}

function generateNewPassword() {
    window.networkTools.generateNewPassword();
}

function copyPassword() {
    window.networkTools.copyPassword();
}