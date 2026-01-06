class PacketSniffer {
    constructor() {
        this.packets = [];
        this.isSniffing = false;
        this.packetCount = 0;
        this.protocolCounts = { http: 0, dns: 0, tcp: 0, udp: 0, other: 0 };
        this.startTime = null;
        this.dataSize = 0;
        this.snifferInterval = null;
        this.statsInterval = null;
        
        this.protocolColors = {
            http: '#007bff',
            dns: '#28a745',
            tcp: '#ffc107',
            udp: '#dc3545',
            other: '#6c757d'
        };
        
        this.init();
    }

    init() {
        console.log("Packet Sniffer initialized");
        this.setupEventListeners();
        this.updateStatsDisplay();
    }

    setupEventListeners() {
        // Filter protocol changes
        document.getElementById('filter-protocol')?.addEventListener('change', (e) => {
            this.filterPackets(e.target.value);
        });
    }

    startSniffing() {
        if (this.isSniffing) return;
        
        this.isSniffing = true;
        this.startTime = Date.now();
        this.showNotification("Educational packet sniffing started", "info");
        
        // Start generating simulated packets
        this.snifferInterval = setInterval(() => {
            this.generatePacket();
        }, 500); // Generate packet every 500ms
        
        // Update stats every second
        this.statsInterval = setInterval(() => {
            this.updateStatsDisplay();
        }, 1000);
    }

    stopSniffing() {
        if (!this.isSniffing) return;
        
        this.isSniffing = false;
        clearInterval(this.snifferInterval);
        clearInterval(this.statsInterval);
        this.showNotification("Packet sniffing stopped", "info");
    }

    generatePacket() {
        const protocols = ['http', 'dns', 'tcp', 'udp', 'other'];
        const protocol = protocols[Math.floor(Math.random() * protocols.length)];
        
        // Generate realistic source and destination IPs
        const sourceIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
        const destIP = Math.random() > 0.5 ? 
            `192.168.1.${Math.floor(Math.random() * 254) + 1}` :
            `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        
        const packet = {
            id: ++this.packetCount,
            timestamp: new Date().toLocaleTimeString(),
            source: sourceIP,
            destination: destIP,
            protocol: protocol,
            size: Math.floor(Math.random() * 1500) + 64,
            summary: this.getPacketSummary(protocol, sourceIP, destIP),
            hexData: this.generateHexData()
        };
        
        this.packets.push(packet);
        this.protocolCounts[protocol]++;
        this.dataSize += packet.size;
        
        this.displayPacket(packet);
        this.updatePacketCount();
    }

    getPacketSummary(protocol, source, dest) {
        const summaries = {
            http: `GET /index.html HTTP/1.1 (${source} → ${dest})`,
            dns: `Query: google.com → 8.8.8.8 (${source} → ${dest})`,
            tcp: `[SYN] Seq=${Math.floor(Math.random() * 1000000)} (${source} → ${dest})`,
            udp: `DNS Query port 53 (${source} → ${dest})`,
            other: `ICMP Echo Request (${source} → ${dest})`
        };
        return summaries[protocol] || `Unknown packet (${source} → ${dest})`;
    }

    displayPacket(packet) {
        const container = document.getElementById('packet-list');
        
        const packetElement = document.createElement('div');
        packetElement.className = 'packet-item';
        packetElement.setAttribute('data-protocol', packet.protocol);
        packetElement.setAttribute('data-id', packet.id);
        packetElement.innerHTML = `
            <div class="packet-header">
                <span class="packet-time">${packet.timestamp}</span>
                <span class="packet-direction">${packet.source} → ${packet.destination}</span>
            </div>
            <div class="packet-summary">
                [${packet.protocol.toUpperCase()}] ${packet.summary}
            </div>
            <div class="packet-info">
                Size: ${packet.size} bytes | ID: ${packet.id}
            </div>
        `;
        
        // Add click handler to show details
        packetElement.addEventListener('click', (e) => {
            this.showPacketDetails(packet.id);
            
            // Highlight selected packet
            document.querySelectorAll('.packet-item').forEach(item => {
                item.classList.remove('selected');
            });
            packetElement.classList.add('selected');
        });
        
        container.appendChild(packetElement);
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    showPacketDetails(packetId) {
        const packet = this.packets.find(p => p.id === packetId);
        if (!packet) return;
        
        const details = document.getElementById('packet-details');
        const packetStructure = this.getPacketStructure(packet);
        details.textContent = packetStructure;
    }

    getPacketStructure(packet) {
        const now = new Date().toISOString();
        return `Packet #${packet.id} Analysis
================================================================
Timestamp: ${now}
Source:      ${packet.source}
Destination: ${packet.destination}
Protocol:    ${packet.protocol.toUpperCase()}
Size:        ${packet.size} bytes

ETHERNET HEADER:
├── Destination MAC: ${this.generateMAC()}
├── Source MAC:      ${this.generateMAC()}
└── EtherType:       0x0800 (IPv4)

IP HEADER:
├── Version:         4
├── Header Length:   20 bytes
├── TTL:             64
├── Protocol:        ${packet.protocol === 'tcp' ? '6 (TCP)' : 
                       packet.protocol === 'udp' ? '17 (UDP)' : 
                       packet.protocol === 'icmp' ? '1 (ICMP)' : 'varies'}
├── Source IP:       ${packet.source}
├── Destination IP:  ${packet.destination}
└── Checksum:        0x${Math.random().toString(16).substr(2, 4)}

${packet.protocol.toUpperCase()} HEADER:
${this.getProtocolDetails(packet)}

PAYLOAD DATA (${packet.size - 54} bytes):
${packet.hexData}
================================================================`;
    }

    getProtocolDetails(packet) {
        switch(packet.protocol) {
            case 'http':
                return `├── Method: GET
├── URI: /index.html
├── Version: HTTP/1.1
├── Headers: 
│   ├── Host: example.com
│   ├── User-Agent: Mozilla/5.0
│   └── Accept: text/html
└── Content-Length: ${Math.floor(Math.random() * 5000)}`;
            case 'dns':
                return `├── Query ID: 0x${Math.random().toString(16).substr(2, 4)}
├── Type: A (Host Address)
├── Class: IN (0x0001)
├── Question: google.com
└── Recursion Desired: Yes`;
            case 'tcp':
                return `├── Source Port: ${Math.floor(Math.random() * 65535)}
├── Dest Port: ${Math.floor(Math.random() * 65535)}
├── Sequence: ${Math.floor(Math.random() * 1000000)}
├── Ack Number: 0
├── Window Size: 64240
└── Flags: SYN`;
            case 'udp':
                return `├── Source Port: ${Math.floor(Math.random() * 65535)}
├── Dest Port: ${Math.floor(Math.random() * 65535)}
├── Length: ${packet.size}
└── Checksum: 0x${Math.random().toString(16).substr(2, 4)}`;
            default:
                return '├── Protocol-specific data not available\n└── Raw data follows';
        }
    }

    generateHexData() {
        // Generate realistic hex dump
        let hexDump = '';
        const rows = 4;
        
        for (let i = 0; i < rows; i++) {
            const offset = i * 16;
            const hex = Array.from({length: 16}, () => 
                Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join(' ');
            
            const ascii = Array.from({length: 16}, () => {
                const charCode = Math.floor(Math.random() * 94) + 32;
                return charCode >= 32 && charCode <= 126 ? 
                    String.fromCharCode(charCode) : '.';
            }).join('');
            
            hexDump += `0x${offset.toString(16).padStart(4, '0')}:  ${hex}  ${ascii}\n`;
        }
        
        return hexDump;
    }

    updateStatsDisplay() {
        document.getElementById('packet-count').textContent = this.packetCount;
        document.getElementById('http-count').textContent = this.protocolCounts.http;
        document.getElementById('dns-count').textContent = this.protocolCounts.dns;
        
        if (this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const rate = elapsed > 0 ? this.dataSize / elapsed / 1024 : 0;
            document.getElementById('data-rate').textContent = `${rate.toFixed(2)} KB/s`;
        }
    }

    updatePacketCount() {
        document.getElementById('packet-count').textContent = this.packetCount;
    }

    clearPackets() {
        if (!confirm("Clear all captured packets?")) return;
        
        this.packets = [];
        this.packetCount = 0;
        this.protocolCounts = { http: 0, dns: 0, tcp: 0, udp: 0, other: 0 };
        this.dataSize = 0;
        this.startTime = null;
        
        document.getElementById('packet-list').innerHTML = '';
        document.getElementById('packet-details').innerHTML = '';
        this.updateStatsDisplay();
        
        this.showNotification('Packet list cleared', 'info');
    }

    filterPackets(filter) {
        const packets = document.querySelectorAll('.packet-item');
        
        packets.forEach(packet => {
            if (filter === 'all' || packet.dataset.protocol === filter) {
                packet.style.display = 'block';
            } else {
                packet.style.display = 'none';
            }
        });
    }

    generateMAC() {
        return Array.from({length: 6}, () => 
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join(':').toUpperCase();
    }

    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize and make globally available
window.sniffer = new PacketSniffer();

// Global functions
function startSniffing() {
    window.sniffer.startSniffing();
}

function stopSniffing() {
    window.sniffer.stopSniffing();
}

function clearPackets() {
    window.sniffer.clearPackets();
}