// ui.js - Responsible for UI interactions

const UI = {
    // Properties
    tooltipTimer: null,
    tooltipDelay: 3000, // 3 seconds
    
    // Initialize UI elements
    initialize() {
        // Set up button listeners
        document.querySelector('#play-button').addEventListener('click', this.handlePlayButton);
        document.querySelector('#draw-button').addEventListener('click', this.handleDrawButton);
        document.querySelector('#back-to-home').addEventListener('click', this.handleBackToHomeButton);
        document.querySelector('#restart-game').addEventListener('click', this.handleRestartButton);
        
        // Show start screen
        this.showScreen('start-screen');
    },
    
    // Show a specific screen
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        document.querySelector(`#${screenId}`).classList.remove('hidden');
    },
    
    // Update game info display
    updateGameInfo(name, difficulty, timeLeft, score) {
        document.querySelector('#display-name').textContent = name;
        document.querySelector('#display-difficulty').textContent = difficulty;
        
        // Format time as MM:SS
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        document.querySelector('#display-time').textContent = `${minutes}:${seconds}`;
        
        // Format score with leading zeros
        document.querySelector('#display-score').textContent = score.toString().padStart(6, '0');
    },
    
    // Update scoring table
    updateScoringTable(evolutionChains, completedChains) {
        const scoringTable = document.querySelector('.scoring-table');
        scoringTable.innerHTML = '';
        
        // Group chains by difficulty
        const chains = {
            easy: [],
            medium: [],
            hard: []
        };
        
        // Filter and organize chains
        evolutionChains.forEach(chain => {
            chains[chain.difficulty].push({
                name: chain.name,
                completed: completedChains.includes(chain.name),
                points: chain.points
            });
        });
        
        // Create table structure
        const table = document.createElement('table');
        
        // Add table header
        const headerRow = document.createElement('tr');
        const categories = ['CHAIN', 'POINTS', 'COMPLETED'];
        categories.forEach(category => {
            const th = document.createElement('th');
            th.textContent = category;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Add chains by difficulty
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            chains[difficulty].forEach(chain => {
                const row = document.createElement('tr');
                
                // Chain name
                const nameCell = document.createElement('td');
                nameCell.textContent = chain.name;
                row.appendChild(nameCell);
                
                // Points
                const pointsCell = document.createElement('td');
                pointsCell.textContent = chain.points + 'P';
                row.appendChild(pointsCell);
                
                // Completed status
                const completedCell = document.createElement('td');
                completedCell.textContent = chain.completed ? '✓' : '';
                row.appendChild(completedCell);
                
                table.appendChild(row);
            });
        });
        
        scoringTable.appendChild(table);
    },
    
    // Update leaderboard
    updateLeaderboard(leaderboard) {
        const leaderboardContent = document.querySelector('#leaderboard-content');
        leaderboardContent.innerHTML = '';
        
        // Create sections for each difficulty
        ['hard', 'medium', 'easy'].forEach(difficulty => {
            const section = document.createElement('div');
            section.className = 'leaderboard-section';
            
            const title = document.createElement('h3');
            title.textContent = difficulty.toUpperCase();
            section.appendChild(title);
            
            const list = document.createElement('ul');
            
            // Add top 5 scores
            if (leaderboard[difficulty] && leaderboard[difficulty].length > 0) {
                leaderboard[difficulty].slice(0, 5).forEach(entry => {
                    const item = document.createElement('li');
                    item.textContent = `${entry.name}: ${entry.score.toString().padStart(6, '0')}`;
                    list.appendChild(item);
                });
            } else {
                // Add placeholder entries if no scores
                for (let i = 0; i < 5; i++) {
                    const item = document.createElement('li');
                    item.textContent = `------: 000000`;
                    list.appendChild(item);
                }
            }
            
            section.appendChild(list);
            leaderboardContent.appendChild(section);
        });
    },
    
    // Start tooltip timer
    startTooltipTimer(element, technology) {
        this.cancelTooltipTimer();
        
        this.tooltipTimer = setTimeout(() => {
            this.showTooltip(element, technology);
        }, this.tooltipDelay);
    },
    
    // Cancel tooltip timer
    cancelTooltipTimer() {
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
            this.tooltipTimer = null;
        }
        
        const tooltip = document.querySelector('#tooltip');
        tooltip.classList.add('hidden');
    },
    
    // Show tooltip with technology information
    showTooltip(element, technology) {
        const tooltip = document.querySelector('#tooltip');
        const tooltipName = document.querySelector('#tooltip-name');
        const tooltipDescription = document.querySelector('#tooltip-description');
        const tooltipChain = document.querySelector('#tooltip-chain');
        
        // Set tooltip content
        tooltipName.textContent = technology.name;
        tooltipDescription.textContent = technology.description;
        tooltipChain.src = `assets/tooltips/${technology.chain}.png`;
        
        // Position tooltip near the element
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
        
        // Show tooltip
        tooltip.classList.remove('hidden');
    },
    
    // Event Handlers
    handlePlayButton() {
        const playerName = document.querySelector('#player-name').value || 'PLAYER';
        const difficulty = document.querySelector('#difficulty').value;
        
        Game.startGame(playerName, difficulty);
        UI.showScreen('game-screen');
    },
    
    handleDrawButton() {
        Game.drawRandomTechnology();
    },
    
    handleBackToHomeButton() {
        UI.showScreen('start-screen');
    },
    
    handleRestartButton() {
        Game.restartGame();
        UI.showScreen('game-screen');
    }
};