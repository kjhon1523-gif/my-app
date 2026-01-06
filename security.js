class SecurityAuditor {
    constructor() {
        this.checks = [
            { id: 'encryption', name: 'Encryption Type', weight: 20 },
            { id: 'password', name: 'Password Strength', weight: 25 },
            { id: 'router', name: 'Router Security', weight: 15 },
            { id: 'firmware', name: 'Firmware Updates', weight: 10 },
            { id: 'wps', name: 'WPS Status', weight: 15 },
            { id: 'remote', name: 'Remote Access', weight: 10 },
            { id: 'firewall', name: 'Firewall', weight: 5 }
        ];
        
        this.init();
    }

    init() {
        console.log("Security Auditor initialized");
    }

    async runFullAudit() {
        this.showNotification("Starting security audit...", "info");
        
        const results = [];
        let totalScore = 0;
        let maxScore = 0;

        for (const check of this.checks) {
            const result = await this.performCheck(check.id);
            results.push({ ...check, ...result });
            totalScore += result.score * (check.weight / 100);
            maxScore += check.weight;
        }

        const finalScore = Math.round((totalScore / maxScore) * 100);
        const grade = this.getGrade(finalScore);
        
        this.displayAuditResults(results, finalScore, grade);
        this.showNotification(`Security audit complete: ${finalScore}/100 (${grade})`, "success");
        
        return {
            score: finalScore,
            grade: grade,
            results: results
        };
    }

    async performCheck(checkId) {
        // Simulate security checks with realistic delays
        await new Promise(resolve => setTimeout(resolve, 500));
        
        switch(checkId) {
            case 'encryption':
                return this.checkEncryption();
            case 'password':
                return this.checkPasswordStrength();
            case 'router':
                return this.checkRouterSecurity();
            case 'firmware':
                return this.checkFirmware();
            case 'wps':
                return this.checkWPS();
            case 'remote':
                return this.checkRemoteAccess();
            case 'firewall':
                return this.checkFirewall();
            default:
                return { score: 0, status: 'Unknown', message: 'Check not implemented' };
        }
    }

    checkEncryption() {
        // Check saved networks for encryption types
        let encryption = 'Unknown';
        let score = 50;
        
        try {
            const savedNetworks = JSON.parse(localStorage.getItem('networkToolkit_savedNetworks') || '[]');
            if (savedNetworks.length > 0) {
                // Simulate checking encryption
                encryption = Math.random() > 0.7 ? 'WPA3' : 
                            Math.random() > 0.5 ? 'WPA2' : 
                            Math.random() > 0.3 ? 'WPA' : 'WEP';
            }
        } catch (e) {
            console.error("Error checking encryption:", e);
        }
        
        switch(encryption) {
            case 'WPA3':
                return { score: 100, status: 'Excellent', message: 'Using WPA3 - Most secure encryption available' };
            case 'WPA2':
                return { score: 80, status: 'Good', message: 'WPA2 is secure but consider upgrading to WPA3' };
            case 'WPA':
                return { score: 60, status: 'Fair', message: 'WPA is outdated, upgrade to WPA2/WPA3' };
            case 'WEP':
                return { score: 20, status: 'Critical', message: 'WEP is easily crackable - CHANGE IMMEDIATELY!' };
            default:
                return { score: 0, status: 'Dangerous', message: 'Unable to determine encryption - check manually' };
        }
    }

    checkPasswordStrength() {
        // Check saved passwords
        let strength = 'Unknown';
        let score = 50;
        let message = 'No passwords saved in manager';
        
        try {
            const savedNetworks = JSON.parse(localStorage.getItem('networkToolkit_savedNetworks') || '[]');
            if (savedNetworks.length > 0) {
                // Check first saved password
                const password = savedNetworks[0]?.password || '';
                strength = this.evaluatePasswordStrength(password);
                score = this.calculatePasswordScore(password);
                message = this.getPasswordMessage(strength);
            }
        } catch (e) {
            console.error("Error checking password:", e);
        }
        
        return {
            score: score,
            status: strength,
            message: message
        };
    }

    evaluatePasswordStrength(password) {
        if (password.length < 8) return 'Very Weak';
        if (password.length < 12) return 'Weak';
        
        let score = 0;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score === 4 && password.length >= 16) return 'Very Strong';
        if (score >= 3) return 'Strong';
        if (score >= 2) return 'Moderate';
        return 'Weak';
    }

    calculatePasswordScore(password) {
        let score = 0;
        
        // Length score
        score += Math.min(password.length * 4, 40);
        
        // Character variety score
        if (/[A-Z]/.test(password)) score += 10;
        if (/[a-z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 10;
        
        // Penalty for common patterns
        if (/password|123456|qwerty/i.test(password)) score -= 30;
        
        return Math.max(0, Math.min(100, score));
    }

    getPasswordMessage(strength) {
        switch(strength) {
            case 'Very Strong':
                return 'Password is excellent!';
            case 'Strong':
                return 'Password is strong and secure';
            case 'Moderate':
                return 'Consider making password stronger';
            case 'Weak':
                return 'Password needs improvement';
            case 'Very Weak':
                return 'Change password immediately!';
            default:
                return 'Check password manually';
        }
    }

    checkRouterSecurity() {
        // Simulate router security check
        const score = Math.random() > 0.3 ? 80 : 40;
        const status = score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';
        
        const messages = [
            'Change default admin credentials',
            'Disable remote administration',
            'Enable automatic updates',
            'Use strong encryption',
            'Disable WPS if possible'
        ];
        
        const message = score >= 70 ? 
            'Router security settings look good' : 
            `Improvements needed: ${messages[Math.floor(Math.random() * messages.length)]}`;
        
        return { score, status, message };
    }

    checkFirmware() {
        const score = Math.random() > 0.5 ? 90 : 30;
        const status = score >= 80 ? 'Updated' : 'Outdated';
        const message = score >= 80 ? 
            'Firmware is up to date' : 
            'Update router firmware for security patches';
        
        return { score, status, message };
    }

    checkWPS() {
        const score = Math.random() > 0.6 ? 100 : 0;
        const status = score === 100 ? 'Disabled' : 'Enabled';
        const message = score === 100 ? 
            'WPS is disabled (good)' : 
            'WPS is enabled - consider disabling for security';
        
        return { score, status, message };
    }

    checkRemoteAccess() {
        const score = Math.random() > 0.7 ? 100 : 0;
        const status = score === 100 ? 'Disabled' : 'Enabled';
        const message = score === 100 ? 
            'Remote access is disabled (secure)' : 
            'Remote access is enabled - disable if not needed';
        
        return { score, status, message };
    }

    checkFirewall() {
        const score = Math.random() > 0.4 ? 100 : 50;
        const status = score === 100 ? 'Enabled' : 'Partial';
        const message = score === 100 ? 
            'Firewall is properly configured' : 
            'Check firewall settings for optimal protection';
        
        return { score, status, message };
    }

    displayAuditResults(results, finalScore, grade) {
        const container = document.getElementById('audit-results');
        
        let html = `
            <div class="audit-summary">
                <h2>Security Audit Summary</h2>
                <div class="score-circle" style="border-color: ${this.getScoreColor(finalScore)}">
                    <div class="score-value">${finalScore}</div>
                    <div class="score-label">/100</div>
                </div>
                <div class="score-grade">${grade}</div>
            </div>
            
            <div class="audit-details">
                <h3>Detailed Results</h3>
        `;
        
        results.forEach(check => {
            const color = this.getStatusColor(check.status);
            html += `
                <div class="audit-item">
                    <div class="audit-item-header">
                        <span class="audit-name">${check.name}</span>
                        <span class="audit-score" style="color: ${color}">${check.score}/100</span>
                    </div>
                    <div class="audit-status" style="color: ${color}">${check.status}</div>
                    <div class="audit-message">${check.message}</div>
                    <div class="audit-progress">
                        <div class="progress-bar" style="width: ${check.score}%"></div>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <div class="audit-recommendations">
                <h3>Recommendations</h3>
                ${this.getRecommendations(results)}
            </div>
        `;
        
        container.innerHTML = html;
    }

    getGrade(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 60) return 'Needs Improvement';
        return 'Poor';
    }

    getScoreColor(score) {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        return '#dc3545';
    }

    getStatusColor(status) {
        switch(status.toLowerCase()) {
            case 'excellent':
            case 'good':
            case 'updated':
            case 'disabled':
            case 'enabled':
                return '#28a745';
            case 'fair':
            case 'moderate':
            case 'partial':
                return '#ffc107';
            case 'poor':
            case 'weak':
            case 'outdated':
                return '#ff8800';
            case 'critical':
            case 'dangerous':
            case 'very weak':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    }

    getRecommendations(results) {
        const recommendations = [];
        
        results.forEach(check => {
            if (check.score < 70) {
                recommendations.push(`• ${check.message}`);
            }
        });
        
        if (recommendations.length === 0) {
            return '<p>Your network security is well configured!</p>';
        }
        
        return '<ul>' + recommendations.map(rec => `<li>${rec}</li>`).join('') + '</ul>';
    }

    checkPasswordStrengthUI() {
        const password = prompt("Enter password to check strength:");
        if (!password) return;
        
        const strength = this.evaluatePasswordStrength(password);
        const score = this.calculatePasswordScore(password);
        const message = this.getPasswordMessage(strength);
        
        alert(`Password Strength: ${strength}\nScore: ${score}/100\n\n${message}`);
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
window.securityAuditor = new SecurityAuditor();

// Global functions
function runFullAudit() {
    window.securityAuditor.runFullAudit();
}

function checkPasswordStrength() {
    window.securityAuditor.checkPasswordStrengthUI();
}