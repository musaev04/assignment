// storage.js - Local storage handling

const Storage = {
    // Keys for localStorage
    GAME_STATE_KEY: 'webprogEvolutionsGameState',
    LEADERBOARD_KEY: 'webprogEvolutionsLeaderboard',
    
    // Save current game state
    saveGameState() {
        const gameState = {
            playerName: Game.playerName,
            difficulty: Game.difficulty,
            score: Game.score,
            timeLeft: Game.timeLeft,
            completedChains: Game.completedChains,
            grid: Board.grid
        };
        
        localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(gameState));
    },
    
    //
    // storage.js - Local storage handling (continued)

    // Load saved game state
    loadGameState() {
        const savedState = localStorage.getItem(this.GAME_STATE_KEY);
        
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                
                // Restore game properties
                Game.playerName = gameState.playerName;
                Game.difficulty = gameState.difficulty;
                Game.score = gameState.score;
                Game.timeLeft = gameState.timeLeft;
                Game.completedChains = gameState.completedChains;
                
                // Initialize board with saved dimensions
                const difficultySettings = levels[Game.difficulty];
                Board.initialize(difficultySettings.cols, difficultySettings.rows);
                
                // Restore grid
                Board.grid = gameState.grid;
                Board.render();
                
                // Update UI
                UI.updateGameInfo(Game.playerName, difficultySettings.name, Game.timeLeft, Game.score);
                UI.updateScoringTable(Game.evolutionChains, Game.completedChains);
                UI.updateLeaderboard(Game.getLeaderboard());
                
                // Start timer
                Game.startTimer();
                
                // Show game screen
                UI.showScreen('game-screen');
                
                return true;
            } catch (error) {
                console.error('Error loading saved game:', error);
                this.clearGameState();
                return false;
            }
        }
        
        return false;
    },
    
    // Clear saved game state
    clearGameState() {
        localStorage.removeItem(this.GAME_STATE_KEY);
    },
    
    // Save game state periodically
    startAutoSave(interval = 5000) {
        setInterval(() => {
            if (Game.timer) { // Only save if game is active
                this.saveGameState();
            }
        }, interval);
    }
};

// Add auto-save feature when game starts
document.addEventListener('DOMContentLoaded', () => {
    Storage.startAutoSave();
    
    // Try to load saved game on startup
    if (!Storage.loadGameState()) {
        // No saved game, show start screen
        UI.showScreen('start-screen');
    }
});