'use strict'


var gHint;
var gHintsCount;
var gSafeClick;
var gIsSevenBOOM = false;

var gameBoard = document.querySelector('.game-board');
gameBoard.oncontextmenu = function (ev) {
    return false;
}


function announceLives(lives) {

    var msg = document.querySelector('.score-board span');
    msg.innerText = 'LIVES LEFT: ' + lives;
}


function hints(elBtn) {
    
    if(gHintsCount === 0) return;
    gHintsCount--;
    elBtn.innerText = '';
    for(var i = 0; i < gHintsCount; i++) {
        elBtn.innerText += '💡';
    }
    if(elBtn.innerText === '') elBtn.innerText = '🙈🙉🙊';
    gHint = true;
}


function hideHints(board, rowIdx, colIdx) {

    gHint = false;
    gGame.isOn = true;
    
    for(var i = rowIdx - 1; i <= rowIdx + 1; i++) {

        if(i < 0 || i > board.length - 1) continue;

        for(var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j > board[0].length - 1) continue;
            if(board[i][j].isMarked) continue;
            if(board[i][j].isMine) continue;
            if(board[i][j].wasShown) continue;

            board[i][j].isShown = false;
        }
    }

    renderBoard(board, '.game-board');

}


function safeClick() {

    if(!gGame.isOn) return;
    if(gSafeClick === 0) return;

    gSafeClick--;

    document.querySelector('.help-bar p').innerText = gSafeClick + ' Left';

    var hiddenCell = false;

    while(!hiddenCell) {

        var i = getRandomInt(0, gLevel.SIZE);
        var j = getRandomInt(0, gLevel.SIZE);

        if(!gBoard[i][j].isShown && !gBoard[i][j].isMine) hiddenCell = true;
    }

    gBoard[i][j].isSafe = true;
    renderBoard(gBoard, '.game-board');
    gGame.isOn = false;

    setTimeout(() => {
        gBoard[i][j].isSafe = false;
        renderBoard(gBoard, '.game-board');
        gGame.isOn = true;
    }, 1000)
}


function sevenBoom() {

    gIsSevenBOOM = !gIsSevenBOOM;
    document.querySelector('.score-board p').innerText = (gIsSevenBOOM) ? '7 BOOM! is on' : '';
    initGame();
}


function minesSevenBoom() {

    var size = gLevel.SIZE;
    var sevenCount = 0;

    for(var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {

            sevenCount++;
            if(sevenCount === 10) sevenCount = 0;

            if (sevenCount === 8) {
                gBoard[i][j].isMine = true;
            } else if(((i * size) + j) % 7 === 0 && (i + j) !== 0) {
                gBoard[i][j].isMine = true;
            } else {
                gBoard[i][j].isMine = false;
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


function findBestTime() {

    var timeFinished = new Date().getTime();

    if(gLevel.SIZE === 4) {
        var totalTime = timeFinished - localStorage.getItem('new easy');
        if(localStorage.getItem('easy time') === null || totalTime < localStorage.getItem('easy time')) {
            localStorage.setItem('easy time', totalTime);
            document.querySelector('.easy').innerText = 'Easy: ' + 
                (localStorage.getItem('easy time') / 1000) + ' seconds';
        }
    } else if(gLevel.SIZE === 8) {
        var totalTime = timeFinished - localStorage.getItem('new normal');
        if(localStorage.getItem('normal time') === null || totalTime < localStorage.getItem('normal time')) {
            localStorage.setItem('normal time', totalTime);
            document.querySelector('.normal').innerText = 'Normal: ' + 
                (localStorage.getItem('normal time') / 1000) + ' seconds';
        }
    } else {
        var totalTime = timeFinished - localStorage.getItem('new hard');
        if(localStorage.getItem('hard time') === null || totalTime < localStorage.getItem('hard time')) {
            localStorage.setItem('hard time', totalTime);
            document.querySelector('.hard').innerText = 'hard: ' + 
                (localStorage.getItem('hard time') / 1000) + ' seconds';
        }
    }
}


function showBestTime() {

    if(localStorage.getItem('easy time') !== null) {
        document.querySelector('.easy').innerText = 'Easy: ' + 
            (localStorage.getItem('easy time') / 1000);
    }
    
    if(localStorage.getItem('normal time') !== null) {
        document.querySelector('.normal').innerText = 'Normal: ' + 
            (localStorage.getItem('normal time') / 1000);
    }
    
    if(localStorage.getItem('hard time') !== null) {
        document.querySelector('.hard').innerText = 'hard: ' + 
            (localStorage.getItem('hard time') / 1000);
    }    
}


function customField() {

    gBuilding = !gBuilding;

    if(!gBuilding) return;

    gLevel.LIVES = 3;
    gLevel.SIZE = +prompt('State field size:');
    gCustom = true;
    alert('Create mines by clicking on the cell you want them to be placed at. When you\'re done go back to the difficulty menu and click "Custom" again.');

    initGame();
}