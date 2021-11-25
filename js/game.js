'use strict'

const MINE = '💥';
const PLAYER = '😀';
const WINNER = '😎';
const DEAD = '😫';
const CURIOUS = '😮';
const FLAG = '🚩';


var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2, 
    LIVES: 3   
}
var gGame;
var gFirstTurn;
var gBoardMemory;
var gBuilding = false;
var gCustom = false;


function initGame() {

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0 
    }

    gHint = false;
    gFirstTurn = false;
    gHintsCount = 3;
    gSafeClick = 3;
    gLevel.LIVES = 3;
    gBoardMemory = [];
    
    gBoard = buildBoard();
    renderBoard(gBoard, '.game-board');
    announceLives(gLevel.LIVES);
    resetTimer();
    showBestTime();
    // gBoardMemory.push(copyMat(gBoard));

    document.querySelector('.help-bar p').innerText = gSafeClick + ' Left';
    document.querySelector('.score-board button').innerText = PLAYER;
    document.querySelector('.hints').innerText = '💡💡💡';
    console.table(gBoard);
}


function buildBoard() {

    var size = gLevel.SIZE;
    var cell = { 
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    var board = createMat(size, cell);

    return board;
}


function setMinesNegsCount(board, rowIdx, colIdx) {

    var countNegs = 0;

    for(var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if(i < 0 || i > board.length - 1) continue;

        for(var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;

            var cell = board[i][j];

            if(cell.isMine) countNegs++;
        }

    }

    return countNegs;

}


function renderBoard(mat, selector) {

    var strHTML = '<table border="2"><tbody>';
    
    for (var i = 0; i < mat.length; i++) {
      
        strHTML += '<tr>';
      
        for (var j = 0; j < mat[0].length; j++) {
           
            var bgc = 'darkgray';

            if(mat[i][j].isSafe) {
                var cell = '';
                bgc = 'lightblue';
            }

            if(mat[i][j].isMine && mat[i][j].isShown) {
                var cell = MINE;
                bgc = 'red';
            } else if(mat[i][j].isShown) {
                var cell = (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount;
                bgc = 'lightgray';
            } else if(mat[i][j].isMarked) {
                var cell = FLAG;
            } else {
                var cell = '';
            }
           
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '" onclick="cellClicked(this, ' + 
                i + ', ' + j + ')" onauxclick="cellMarked(' +
                i + ', ' + j + ')" style="background-color:' + 
                bgc + ';"> ' + cell + ' </td>';
        }
      
      strHTML += '</tr>'
    }
    
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}


function cellClicked(elCell, i, j) {

    if(gBuilding) {
        gBoard[i][j].isMine = true;
        gLevel.MINES++;
        return;
    }

    if(!gFirstTurn) {

        gFirstTurn = true;

        var startTime = new Date().getTime();
        if(gLevel.SIZE === 4) {
            localStorage.setItem('new easy', startTime);
        } else if(gLevel.SIZE === 8) {
            localStorage.setItem('new normal', startTime);
        } else if(gLevel.SIZE === 12) {
            localStorage.setItem('new hard', startTime);
        }

        if(gIsSevenBOOM) {
            minesSevenBoom();
        } else {
            spawnMines(i, j);
        }
        
        stopTime = false;
        setTimer();
    }

    if(!gGame.isOn) return;
    if(gBoard[i][j].isMarked) return;
    if(gBoard[i][j].isShown) return;

    if(gHint) {
        gGame.isOn = false;
        expandShown(gBoard, i, j);
        setTimeout(() => {
            hideHints(gBoard, i, j);
        }, 1000);
        return;
    }

    if (gBoard[i][j].isMine) {
        elCell.innerText = MINE;
        elCell.style.background = 'red';
        gBoard[i][j].isShown = true;
        gLevel.LIVES--;
        gGame.markedCount++;
        announceLives(gLevel.LIVES);
        checkGameOver();
        gBoardMemory.push(copyMat(gBoard));
        return;
    }
        
    expandShown(gBoard, i, j);
    checkGameOver();
}


function cellMarked(i, j) {

    if(!gGame.isOn) return;
    if(gBoard[i][j].isShown) return;
    
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
    } else {
        gBoard[i][j].isMarked =true;
        gGame.markedCount++;
    }

    renderBoard(gBoard, '.game-board');
    checkGameOver();

    gBoardMemory.push(copyMat(gBoard));
}


function checkGameOver() {
    
    if(gLevel.LIVES === 0) {
        gameLost();
        return;
    }

    var mines = gLevel.MINES;
    var safeFields = (gLevel.SIZE ** 2) - mines;

    if(gGame.shownCount === safeFields && gGame.markedCount === mines) gameWon();
}
 

function expandShown(board, rowIdx, colIdx) {

    if(board[rowIdx][colIdx].minesAroundCount !== 0) {
        
        board[rowIdx][colIdx].isShown = true;
        
        if(!gHint) {
            board[rowIdx][colIdx].wasShown = true;
            gGame.shownCount++;
        }

        renderBoard(board, '.game-board');
        gBoardMemory.push(copyMat(gBoard));
        return;
    } 

    for(var i = rowIdx - 1; i <= rowIdx + 1; i++) {

        if(i < 0 || i > board.length - 1) continue;

        for(var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j > board[0].length - 1) continue;
            if(board[i][j].isMine) continue;
            if(board[i][j].isMarked) continue;
            if(board[i][j].isShown) continue;

            board[i][j].isShown = true;

            if(gHint) continue;

            board[i][j].wasShown = true;
            gGame.shownCount++;

            if(board[i][j].minesAroundCount === 0) expandShown(board, i, j);
        }
    }

    renderBoard(board, '.game-board');
    gBoardMemory.push(copyMat(gBoard));
}


function hideShown(board, rowIdx, colIdx) {

    for(var i = rowIdx - 1; i <= rowIdx + 1; i++) {

        if(i < 0 || i > board.length - 1) continue;

        for(var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j > board[0].length - 1) continue;
            if(board[i][j].isMarked) continue;
            if(board[i][j].isShown) continue;

            board[i][j].isShown = false;
        }
    }

    renderBoard(board, '.game-board');
}


function gameLost() {

    gGame.isOn = false;
    stopTime = true;
    document.querySelector('.score-board button').innerText = DEAD;
    revealMines();
}


function gameWon() {

    gGame.isOn = false;
    stopTime = true;
    findBestTime();
    document.querySelector('.score-board button').innerText = WINNER;
}


function changeDifficulty(elChoice) {

    gCustom = false;
    var size;
    var mines;

    if(elChoice === 0) {
        size = 4;
        mines = 2;
    } else if(elChoice === 1) {
        size = 8;
        mines = 12;
    } else {
        size = 12;
        mines = 30;
    }

    gLevel = {
        SIZE: size,
        MINES: mines,
        LIVES: 3   
    }
    
    initGame();
}


function spawnMines(clickedRow, clickedCol) {

    var size = gLevel.SIZE;
    var mines = gLevel.MINES;
    
    if(!gCustom) {
        for(var i = 0; i < mines; i++) {
            
            var row = getRandomInt(0, size);
            var col = getRandomInt(0, size);
    
            if(clickedRow === row && clickedCol === col) {
                mines++;
                continue;
            }
    
            // if mat indexes happen to repeat new ones will be chosen by increasing the loop by another run
            if(!gBoard[row][col].isMine && !gBoard[row][col].isShown) {
                gBoard[row][col].isMine = true;
            } else {
                mines++;
            }
        }
    }

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if(!gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j);
            }
        }
    }
}


function revealMines() {

    for(var i = 0; i < gLevel.SIZE; i++) {
        for(var j = 0; j < gLevel.SIZE; j++) {
            if(gBoard[i][j].isMine) gBoard[i][j].isShown = true;
        }
    }

    renderBoard(gBoard, '.game-board');
}


function undo() {

    if(!gGame.isOn) return;
    
    if(gBoardMemory.length === 0) return;
    gBoard = gBoardMemory.pop();
    console.log(gBoard);
    renderBoard(gBoard, '.game-board');
}


function restartGame() {

    if(gCustom) {
        gCustom = false;
        changeDifficulty(0);
    } else {
        initGame();
    }
}