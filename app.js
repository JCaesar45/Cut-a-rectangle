/**
 * Main Application Controller
 * Orchestrates all components and handles user interactions
 */

class RectangleCuttingApp {
    constructor() {
        this.calculator = new RectangleCutting();
        this.visualizer = new RectangleVisualizer(document.getElementById('mainCanvas'));
        this.currentSolutions = [];
        this.isAnimating = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadInitialState();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.handleCalculate();
        });

        // Animate button
        document.getElementById('animateBtn').addEventListener('click', () => {
            this.handleAnimate();
        });

        // Dimension inputs
        document.getElementById('rows').addEventListener('change', () => {
            this.handleDimensionChange();
        });

        document.getElementById('cols').addEventListener('change', () => {
            this.handleDimensionChange();
        });

        // Test case buttons
        document.querySelectorAll('.test-case-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const m = parseInt(e.target.dataset.m);
                const n = parseInt(e.target.dataset.n);
                this.loadTestCase(m, n);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupThemeToggle() {
        // Add theme toggle button
        const themeBtn = document.createElement('button');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeBtn.className = 'theme-toggle';
        themeBtn.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(themeBtn);
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = document.querySelector('.theme-toggle i');
        icon.className = document.body.classList.contains('light-theme') ? 'fas fa-sun' : 'fas fa-moon';
    }

    handleKeyboardShortcuts(event) {
        switch(event.key) {
            case 'Enter':
                this.handleCalculate();
                break;
            case ' ':
                event.preventDefault();
                this.handleAnimate();
                break;
            case 'Escape':
                this.visualizer.stopAnimation();
                break;
        }
    }

    loadInitialState() {
        // Load default case
        this.loadTestCase(4, 3);
    }

    loadTestCase(m, n) {
        document.getElementById('rows').value = m;
        document.getElementById('cols').value = n;
        this.handleCalculate();
    }

    handleDimensionChange() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        
        // Update grid size display
        document.getElementById('gridSize').textContent = `${rows}×${cols}`;
        
        // Validate parity
        const parity = (rows % 2 === 1 && cols % 2 === 1) ? 'Invalid (both odd)' : 'Valid';
        document.getElementById('parity').textContent = parity;
        document.getElementById('parity').className = parity === 'Valid' ? 'result-value valid' : 'result-value invalid';
    }

    async handleCalculate() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        
        this.showLoading(true);
        
        try {
            // Calculate result
            const result = this.calculator.calculate(rows, cols);
            document.getElementById('totalWays').textContent = result.toLocaleString();
            
            // Generate solutions for visualization
            this.currentSolutions = this.calculator.generateAllCuts(rows, cols);
            
            // Update visualization
            if (this.currentSolutions.length > 0) {
                this.visualizer.render(this.currentSolutions[0]);
                this.updateSolutionGallery();
            }
            
            // Show success message
            this.showNotification(`Calculated ${result} valid cuts for ${rows}×${cols} rectangle`, 'success');
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showNotification('Error calculating cuts. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    handleAnimate() {
        if (this.isAnimating) {
            this.visualizer.stopAnimation();
            this.isAnimating = false;
            document.getElementById('animateBtn').innerHTML = '<i class="fas fa-play"></i> Animate Solution';
        } else if (this.currentSolutions.length > 0) {
            this.visualizer.animateSolutions(this.currentSolutions, {
                duration: 5000,
                loop: true
            });
            this.isAnimating = true;
            document.getElementById('animateBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Animation';
        }
    }

    updateSolutionGallery() {
        const container = document.getElementById('solutionContainer');
        container.innerHTML = '';
        
        this.currentSolutions.slice(0, 20).forEach((solution, index) => {
            const thumbnail = this.visualizer.createThumbnail(solution);
            thumbnail.addEventListener('click', () => {
                this.visualizer.render(solution);
                this.visualizer.stopAnimation();
                this.isAnimating = false;
                document.getElementById('animateBtn').innerHTML = '<i class="fas fa-play"></i> Animate Solution';
            });
            container.appendChild(thumbnail);
        });
        
        if (this.currentSolutions.length > 20) {
            const moreIndicator = document.createElement('div');
            moreIndicator.className = 'more-indicator';
            moreIndicator.textContent = `+${this.currentSolutions.length - 20} more`;
            container.appendChild(moreIndicator);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
            <span>${message}</span>
            <button class="close-btn">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Manual close
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    exportResults() {
        // Export current visualization
        this.visualizer.exportAsImage(`rectangle-cut-${Date.now()}.png`);
        
        // Export data as JSON
        const data = {
            dimensions: {
                rows: parseInt(document.getElementById('rows').value),
                cols: parseInt(document.getElementById('cols').value)
            },
            result: parseInt(document.getElementById('totalWays').textContent),
            solutions: this.currentSolutions,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rectangle-cutting-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RectangleCuttingApp();
    
    // Make app globally available for debugging
    window.rectangleCuttingApp = app;
    
    // Add export functionality
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Results';
    exportBtn.className = 'export-btn';
    exportBtn.addEventListener('click', () => app.exportResults());
    document.querySelector('.control-panel').appendChild(exportBtn);
});

// Add CSS for additional elements
const additionalStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 500;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideIn 0.3s ease-out;
}

.notification.success {
    background: var(--success-color);
}

.notification.error {
    background: var(--error-color);
}

.notification.info {
    background: var(--accent-color);
}

.notification .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: 1rem;
}

.theme-toggle, .export-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: fixed;
    z-index: 100;
}

.theme-toggle {
    top: 20px;
    right: 20px;
    background: var(--card-color);
    color: var(--text-primary);
}

.export-btn {
    background: var(--success-color);
    color: white;
}

.theme-toggle:hover, .export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.more-indicator {
    grid-column: 1 / -1;
    text-align: center;
    padding: 1rem;
    background: var(--card-color);
    border-radius: 0.5rem;
    color: var(--text-secondary);
    font-weight: 500;
}

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

.valid {
    color: var(--success-color) !important;
}

.invalid {
    color: var(--error-color) !important;
}

/* Light theme support */
.light-theme {
    --background-color: #f8fafc;
    --surface-color: #ffffff;
    --card-color: #f1f5f9;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
}

.light-theme .header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.light-theme .dimension-input,
.light-theme .result-card,
.light-theme .info-card,
.light-theme .canvas-container,
.light-theme .solution-gallery,
.light-theme .test-case-btn {
    background: var(--surface-color);
    color: var(--text-primary);
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
