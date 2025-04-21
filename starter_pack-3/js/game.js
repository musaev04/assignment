// game.js - Main game logic

const Game = {
    // Game state
    playerName: '',
    difficulty: 'easy',
    score: 0,
    timeLeft: 0,
    timer: null,
    completedChains: [],
    
    // Initialize the game
    initialize() {
        // Initialize UI
        UI.initialize();
        
        // Initialize evolutions data
        this.processEvolutionsData();
    },
    
    // Process the evolutions data from evolutions.js
    processEvolutionsData() {
        // Assume evolutions is defined in evolutions.js
        // We need to transform it into a more usable format
        this.evolutionChains = [];
        this.evolutionSteps = {};
        
        evolutions.forEach(evolution => {
            // Add to evolution chains
            this.evolutionChains.push({
                name: evolution.name,
                tooltip: evolution.tooltip,
                points: evolution.points,
                difficulty: evolution.difficulty,
                description: evolution.description
            });
            
            // Process each step
            evolution.steps.forEach(step => {
                const chainName = evolution.name;
                const stepNum = step.step;
                
                if (!this.evolutionSteps[chainName]) {
                    this.evolutionSteps[chainName] = {};
                }
                
                this.evolutionSteps[chainName][stepNum] = {
                    name: step.name,
                    img: step.img,
                    description: step.description,
                    chain: chainName,
                    step: stepNum
                };
            });
        });
    },
    
    // Start a new game
    startGame(playerName, difficulty) {
        this.playerName = playerName;
        this.difficulty = difficulty;
        this.score = 0;
        this.completedChains = [];
        
        // Set up board size based on difficulty
        const difficultySettings = levels[difficulty];
        this.timeLeft = difficultySettings.time * 60; // Convert minutes to seconds
        
        // Initialize the board
        Board.initialize(difficultySettings.cols, difficultySettings.rows);
        
        // Place initial technologies
        const initialTechCount = difficultySettings.cols; // Same as cols (4, 6, or 8)
        Board.placeInitialTechnologies(initialTechCount);
        
        // Update UI
        UI.updateGameInfo(this.playerName, difficultySettings.name, this.timeLeft, this.score);
        UI.updateScoringTable(this.evolutionChains, this.completedChains);
        UI.updateLeaderboard(this.getLeaderboard());
        
        // Start the timer
        this.startTimer();
    },
    
    // Restart the game with same settings
    restartGame() {
        this.startGame(this.playerName, this.difficulty);
    },
    
    // Start the game timer
    startTimer() {
        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            UI.updateGameInfo(this.playerName, levels[this.difficulty].name, this.timeLeft, this.score);
            
            // Check if time's up
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },
    
    // End the game
    endGame() {
        // Stop the timer
        clearInterval(this.timer);
        this.timer = null;
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Show game over screen
        UI.showScreen('game-over-screen');

        Storage.clearGameState();
    
    // Show game over screen
        UI.showScreen('game-over-screen');
    },
    
    // Get a random technology of specific level
    getRandomTechnology(level) {
        // Get all technologies of the specified level
        const availableTechs = [];
        
        for (const chainName in this.evolutionSteps) {
            // Skip chains of higher difficulty than current game
            const chain = this.evolutionChains.find(c => c.name === chainName);
            if (this.getDifficultyLevel(chain.difficulty) > this.getDifficultyLevel(this.difficulty)) {
                continue;
            }
            
            if (this.evolutionSteps[chainName][level]) {
                availableTechs.push(this.evolutionSteps[chainName][level]);
            }
        }
        
        // Randomly select one
        if (availableTechs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableTechs.length);
            return availableTechs[randomIndex];
        }
        
        return null;
    },
    
    // Helper function to get difficulty level as number
    getDifficultyLevel(difficulty) {
        const levels = { 'easy': 1, 'medium': 2, 'hard': 3 };
        return levels[difficulty] || 0;
    },
    
    // Get the next step in an evolution chain
    getNextEvolutionStep(chainName, currentStep) {
        if (this.evolutionSteps[chainName] && this.evolutionSteps[chainName][currentStep + 1]) {
            return this.evolutionSteps[chainName][currentStep + 1];
        }
        return null;
    },
    
    // Complete an evolution chain
    completeEvolutionChain(chainName) {
        if (!this.completedChains.includes(chainName)) {
            this.completedChains.push(chainName);
            
            // Find chain info
            const chain = this.evolutionChains.find(c => c.name === chainName);
            if (chain) {
                // Add points
                this.score += chain.points;
                UI.updateGameInfo(this.playerName, levels[this.difficulty].name, this.timeLeft, this.score);
                UI.updateScoringTable(this.evolutionChains, this.completedChains);
            }
        }
    },
    
    // Draw a random technology (for the DRAW button)
    drawRandomTechnology() {
        // Find an empty cell
        const emptyCells = [];
        
        for (let row = 0; row < Board.size.rows; row++) {
            for (let col = 0; col < Board.size.cols; col++) {
                if (!Board.grid[row][col]) {
                    emptyCells.push([row, col]);
                }
            }
        }
        
        // Place a technology in a random empty cell
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const [row, col] = emptyCells[randomIndex];
            Board.placeRandomTechnology(row, col);
            Board.render();
        }
    },
    
    // Get the leaderboard data
    getLeaderboard() {
        // Try to get from localStorage
        const storedLeaderboard = localStorage.getItem('webprogEvolutionsLeaderboard');
        if (storedLeaderboard) {
            return JSON.parse(storedLeaderboard);
        }
        
        // Return empty leaderboard if none exists
        return {
            easy: [],
            medium: [],
            hard: []
        };
    },
    
    // Update the leaderboard with current score
    updateLeaderboard() {
        const leaderboard = this.getLeaderboard();
        
        // Add current score
        leaderboard[this.difficulty].push({
            name: this.playerName,
            score: this.score
        });
        
        // Sort by score (descending)
        leaderboard[this.difficulty].sort((a, b) => b.score - a.score);
        
        // Keep only top 5
        leaderboard[this.difficulty] = leaderboard[this.difficulty].slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('webprogEvolutionsLeaderboard', JSON.stringify(leaderboard));
        
        // Update the UI
        UI.updateLeaderboard(leaderboard);
    }
};

// Initialize game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Game.initialize();
});