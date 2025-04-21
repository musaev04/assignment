// board.js - Responsible for game board logic

const Board = {
    // Properties
    grid: [],
    size: { cols: 4, rows: 4 }, // Default to easy
    selectedCell: null,
    
    // Initialize the board with given dimensions
    initialize(cols, rows) {
        this.size = { cols, rows };
        this.grid = Array(rows).fill().map(() => Array(cols).fill(null));
        this.selectedCell = null;
        this.render();
    },
    
    // Render the board to HTML
    render() {
        const boardElement = document.querySelector('#game-board');
        boardElement.innerHTML = '';
        
        // Set grid dimensions based on board size
        boardElement.style.gridTemplateColumns = `repeat(${this.size.cols}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${this.size.rows}, 1fr)`;
        
        // Create cells
        for (let row = 0; row < this.size.rows; row++) {
            for (let col = 0; col < this.size.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (!this.grid[row][col]) {
                    cell.classList.add('empty');
                } else {
                    const technology = this.grid[row][col];
                    const img = document.createElement('img');
                    img.src = `assets/logos/${technology.img}`;
                    img.alt = technology.name;
                    cell.appendChild(img);
                    
                    // Add data attributes for technology info
                    cell.dataset.tech = JSON.stringify({
                        chain: technology.chain,
                        step: technology.step,
                        name: technology.name
                    });
                }
                
                // Add position data attributes
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add click event
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                
                // Add hover event for tooltip (will be implemented in UI.js)
                cell.addEventListener('mouseenter', () => {
                    if (this.grid[row][col]) {
                        UI.startTooltipTimer(cell, this.grid[row][col]);
                    }
                });
                
                cell.addEventListener('mouseleave', () => {
                    UI.cancelTooltipTimer();
                });
                
                boardElement.appendChild(cell);
            }
        }
    },
    
    // Handle cell click
    handleCellClick(row, col) {
        // If the cell is empty, place a new level 1 technology
        if (!this.grid[row][col]) {
            this.placeRandomTechnology(row, col);
            this.render();
            return;
        }
        
        // If a cell is already selected
        if (this.selectedCell) {
            const [selectedRow, selectedCol] = this.selectedCell;
            
            // If clicking on the same cell, deselect it
            if (selectedRow === row && selectedCol === col) {
                this.selectedCell = null;
                this.render();
                return;
            }
            
            // Check if the technologies can be merged
            const selectedTech = this.grid[selectedRow][selectedCol];
            const currentTech = this.grid[row][col];
            
            if (this.canMerge(selectedTech, currentTech)) {
                // Merge the technologies
                this.mergeTechnologies(selectedRow, selectedCol, row, col);
            } else {
                // Can't merge, select the new cell instead
                this.selectedCell = [row, col];
            }
        } else {
            // Select the cell
            this.selectedCell = [row, col];
        }
        
        this.render();
    },
    
    // Check if two technologies can be merged
    canMerge(tech1, tech2) {
        return tech1 && tech2 && 
               tech1.chain === tech2.chain && 
               tech1.step === tech2.step;
    },
    
    // Merge two technologies
    mergeTechnologies(row1, col1, row2, col2) {
        const tech = this.grid[row1][col1];
        
        // Find the next step in the evolution chain
        const nextStep = Game.getNextEvolutionStep(tech.chain, tech.step);
        
        if (nextStep) {
            // Place the merged technology
            this.grid[row2][col2] = nextStep;
            
            // Clear the source cell
            this.grid[row1][col1] = null;
            
            // Check if the chain is complete
            if (nextStep.step === 6) {  // Assuming level 6 is the highest
                Game.completeEvolutionChain(nextStep.chain);
            }
            
            // Place a new random technology in the empty cell
            this.placeRandomTechnology(row1, col1);
        }
        
        // Reset selection
        this.selectedCell = null;
    },
    
    // Place a random technology on the board
    placeRandomTechnology(row, col) {
        const randomTech = Game.getRandomTechnology(1); // Get a random level 1 technology
        if (randomTech) {
            this.grid[row][col] = randomTech;
        }
    },
    
    // Place initial technologies
    placeInitialTechnologies(count) {
        // Get all empty positions
        const emptyPositions = [];
        for (let row = 0; row < this.size.rows; row++) {
            for (let col = 0; col < this.size.cols; col++) {
                if (!this.grid[row][col]) {
                    emptyPositions.push([row, col]);
                }
            }
        }
        
        // Shuffle the positions
        for (let i = emptyPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [emptyPositions[i], emptyPositions[j]] = [emptyPositions[j], emptyPositions[i]];
        }
        
        // Place technologies in the first 'count' positions
        for (let i = 0; i < Math.min(count, emptyPositions.length); i++) {
            const [row, col] = emptyPositions[i];
            this.placeRandomTechnology(row, col);
        }
        
        this.render();
    }
};