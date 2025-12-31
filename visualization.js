/**
 * Advanced Canvas Visualization for Rectangle Cutting
 * Features: animations, interactions, smooth transitions
 */

class RectangleVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationId = null;
        this.currentCuts = [];
        this.animationSpeed = 1000; // ms per frame
        this.colors = {
            region1: '#6366f1',
            region2: '#8b5cf6',
            border: '#475569',
            highlight: '#06b6d4',
            background: '#1e293b'
        };
        
        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        // Make canvas responsive
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    /**
     * Render rectangle with cuts
     */
    render(matrix, options = {}) {
        const {
            cellSize = 40,
            padding = 40,
            animated = false,
            highlightRegion = null,
            showGrid = true,
            showLabels = true
        } = options;

        const rows = matrix.length;
        const cols = matrix[0].length;
        
        const width = cols * cellSize + 2 * padding;
        const height = rows * cellSize + 2 * padding;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid if enabled
        if (showGrid) {
            this.drawGrid(rows, cols, cellSize, padding);
        }

        // Draw cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = padding + j * cellSize;
                const y = padding + i * cellSize;
                const value = matrix[i][j];
                
                this.drawCell(x, y, cellSize, value, {
                    highlighted: highlightRegion === value,
                    animated: animated
                });
            }
        }

        // Draw labels if enabled
        if (showLabels) {
            this.drawLabels(rows, cols, cellSize, padding);
        }

        // Draw border
        this.drawBorder(padding, padding, cols * cellSize, rows * cellSize);
    }

    /**
     * Draw grid lines
     */
    drawGrid(rows, cols, cellSize, padding) {
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;

        // Vertical lines
        for (let j = 0; j <= cols; j++) {
            const x = padding + j * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, padding + rows * cellSize);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = padding + i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(padding + cols * cellSize, y);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw individual cell
     */
    drawCell(x, y, size, value, options = {}) {
        const { highlighted = false, animated = false } = options;
        
        // Cell color based on region
        const baseColor = value === 0 ? this.colors.region1 : this.colors.region2;
        
        if (highlighted) {
            this.ctx.fillStyle = this.colors.highlight;
        } else {
            this.ctx.fillStyle = baseColor;
        }

        // Add animation effect
        if (animated) {
            const time = Date.now() / 1000;
            const alpha = 0.8 + 0.2 * Math.sin(time * 3);
            this.ctx.globalAlpha = alpha;
        }

        // Draw cell with rounded corners
        const radius = 4;
        this.roundRect(x + 2, y + 2, size - 4, size - 4, radius);
        this.ctx.fill();

        // Reset alpha
        this.ctx.globalAlpha = 1;

        // Draw border
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /**
     * Draw rounded rectangle
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * Draw labels for rows and columns
     */
    drawLabels(rows, cols, cellSize, padding) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Column labels
        for (let j = 0; j < cols; j++) {
            const x = padding + j * cellSize + cellSize / 2;
            const y = padding - 20;
            this.ctx.fillText(j.toString(), x, y);
        }

        // Row labels
        for (let i = 0; i < rows; i++) {
            const x = padding - 20;
            const y = padding + i * cellSize + cellSize / 2;
            this.ctx.fillText(i.toString(), x, y);
        }
    }

    /**
     * Draw border around rectangle
     */
    drawBorder(x, y, width, height) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
    }

    /**
     * Animate through multiple solutions
     */
    animateSolutions(solutions, options = {}) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        const {
            duration = 3000,
            loop = true,
            easing = 'easeInOut'
        } = options;

        const startTime = Date.now();
        const frameCount = solutions.length;
        const frameDuration = duration / frameCount;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const currentFrame = Math.floor(elapsed / frameDuration) % frameCount;

            if (currentFrame < solutions.length) {
                this.render(solutions[currentFrame], {
                    animated: true,
                    showGrid: true
                });
            }

            if (loop || elapsed < duration) {
                this.animationId = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Stop animation
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Handle mouse move for hover effects
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate which cell is hovered
        const cellSize = 40;
        const padding = 40;
        
        const col = Math.floor((x - padding) / cellSize);
        const row = Math.floor((y - padding) / cellSize);

        // Update tooltip or highlight
        this.updateTooltip(row, col, x, y);
    }

    /**
     * Handle click events
     */
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Implement click logic here
        console.log(`Clicked at (${x}, ${y})`);
    }

    /**
     * Handle mouse leave
     */
    handleMouseLeave() {
        this.hideTooltip();
    }

    /**
     * Update tooltip position and content
     */
    updateTooltip(row, col, x, y) {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;

        if (row >= 0 && col >= 0) {
            tooltip.textContent = `Cell (${row}, ${col})`;
            tooltip.style.left = x + 10 + 'px';
            tooltip.style.top = y - 30 + 'px';
            tooltip.classList.add('show');
        } else {
            tooltip.classList.remove('show');
        }
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    /**
     * Create thumbnail of solution
     */
    createThumbnail(matrix, containerSize = 80) {
        const thumbnail = document.createElement('canvas');
        thumbnail.width = containerSize;
        thumbnail.height = containerSize;
        const ctx = thumbnail.getContext('2d');

        const rows = matrix.length;
        const cols = matrix[0].length;
        const cellSize = Math.min(containerSize / rows, containerSize / cols);
        const offsetX = (containerSize - cols * cellSize) / 2;
        const offsetY = (containerSize - rows * cellSize) / 2;

        // Background
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, containerSize, containerSize);

        // Draw cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = offsetX + j * cellSize;
                const y = offsetY + i * cellSize;
                const value = matrix[i][j];
                
                ctx.fillStyle = value === 0 ? this.colors.region1 : this.colors.region2;
                ctx.fillRect(x, y, cellSize, cellSize);
                
                ctx.strokeStyle = this.colors.border;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }

        return thumbnail;
    }

    /**
     * Export current visualization as image
     */
    exportAsImage(filename = 'rectangle-cut.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RectangleVisualizer;
}
