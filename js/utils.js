'use strict'

// returns a random numbers between two inputs (excluding the maximum)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
}


// returns the time in the form of hh:mm:ss
function getTime() {
    return new Date().toString().split(' ')[4];
}


// returns a random color value for CSS objects
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// creates a new matrix according to a size array (rows at index 0, columns at index 1), and fills it with an input
function createMat(size, input) {

    var mat = [];

    for(var i = 0; i < size; i++) {
        mat[i] = [];
        for(var j = 0; j < size; j++) {
            var cell = Object.assign({}, input);
            mat[i][j] = cell;
        }
    }

    return mat;
}


// returns a copy of the provided matrix
function copyMat(mat) {
    
    var newMat = [];
    for(var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for(var j = 0; j < mat.length; j++) {
            var cell = Object.assign({}, mat[i][j]);
            newMat[i][j] = cell;
        }
    }

    return newMat;
}


// returns a random number taken out of the array
function drawNum(array) {
    shuffle(array);
    return array.pop();
}


// shuffles the array, changes the global array!
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}

// counts the neighboring cells holding a specified symbol and returns it
function countNegs(mat, rowIdx, colIdx, symbol) {

    var countNegs = 0;

    for(var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if(i < 0 || i > mat.length - 1) continue;

        for(var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j > mat[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;

            var cell = mat[i][j];

            if(cell.symbol) countNegs++;
        }

    }

    return countNegs;
}


// prints to the dom a timer in the form of mm:ss:ms(miliseconds), runs until the user sets stop time to true
var stopTime = true;
var min = 0;
var sec = 0;
var miliSec = 0;

function setTimer() {
    if (!stopTime) {
        min = parseInt(min);
        sec = parseInt(sec);
        miliSec = parseInt(miliSec);

        miliSec += 1;
        if (miliSec === 60) {
            sec += 1;
            miliSec = 0;
        }
        if (sec === 60) {
            min += 1;
            sec = 0;
            miliSec = 0;
        }

        if (miliSec < 10 ) {
            miliSec = '0' + miliSec;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        if (min < 10) {
            min = '0' + min;
        }

        document.querySelector('.stop-watch').innerText = 'Current Time: ' + min + ':' + sec + ':' + miliSec;

        setTimeout('setTimer()', 10);
    }
}


// resets the final time as recorded on the dom by the setTimer function
function resetTimer() {
    document.querySelector('.stop-watch').innerText = 'Current Time: 00:00:00';
    stopTime = true;
    min = 0;
    sec = 0;
    miliSec = 0;
}
  

  // location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}