'use strict'

const BOMB = 9
var gIsVictory = true
var gGame
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}

function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        liveCount: 3
    }
    gBoard = buildBoard()
    console.log(gBoard)
    renderBoard()
    document.querySelector('.lives-modal').innerText = 'Lives count: ' + gGame.liveCount
    document.querySelector('table').style.pointerEvents = 'all'
    document.querySelector('.game-modal').innerText = ''
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: '',
                isShown: true,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function locateMines(elCell, rowIdx, colIdx) {
    for (var k = 0; k < gLevel.MINES; k++) {
        var rndRowIdx = getRndIntExc(0, gBoard.length)
        var rndColIdx = getRndIntExc(0, gBoard[0].length)
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (i === rndRowIdx && j === rndColIdx) {
                    if (gBoard[i][j].isMine || (rndRowIdx === rowIdx && rndColIdx === colIdx)) {
                        k--
                        continue
                    }
                    gBoard[i][j].isMine = true
                    gBoard[i][j].minesAroundCount = 9
                    renderCell(i, j)
                }
            }
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine) {
                var minesAmount = countNegs(gBoard, i, j)
                gBoard[i][j].minesAroundCount = minesAmount
                renderCell(i, j)
            }
        }
    }
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].isShown = false
            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell" onmousedown="cellClicked(this, ${i}, ${j},event)"></td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHTML;
}

function renderCell(i, j) {
    document.querySelector(`[data-i='${i}'][data-j='${j}']`).innerHTML = `<img class="hidden" src="assets/${gBoard[i][j].minesAroundCount}.png">`
}

function cellClicked(elCell, rowIdx, colIdx, ev) {

    if (!gGame.isOn) {
        gGame.isOn = true
        locateMines(elCell, rowIdx, colIdx)
        setMinesNegsCount(gBoard)
    }
    if (!gBoard[rowIdx][colIdx].isShown) {
        if (ev.button !== 2 && !gBoard[rowIdx][colIdx].isMarked) {
            elCell.className += ' clicked-cell'
            gBoard[rowIdx][colIdx].isShown = true
            gGame.shownCount++
                if (gBoard[rowIdx][colIdx].minesAroundCount === 0) {
                    expandShown(gBoard, rowIdx, colIdx)
                }
            checkGameOver(rowIdx, colIdx)
        }
        if (ev.button === 2 && !gBoard[rowIdx][colIdx].isMarked) {
            gBoard[rowIdx][colIdx].isMarked = true
            cellMarked(elCell)
            return
        } else if (ev.button === 2 && gBoard[rowIdx][colIdx].isMarked) {
            gBoard[rowIdx][colIdx].isMarked = false
            cellUnmarked(elCell, rowIdx, colIdx)
            return
        }
        if (gBoard[rowIdx][colIdx].isShown) elCell.querySelector('img').style.visibility = "visible"
    }
    if (gIsVictory) {
        document.querySelector('.game-modal').innerText = 'WINNER'
        document.querySelector('table').style.pointerEvents = 'none'
    }
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                elCell.className += ' clicked-cell'
                elCell.querySelector('img').style.visibility = "visible"
            }
        }
    }
}

function cellMarked(elCell) {
    elCell.innerHTML = `<img src="assets/flag.png">`
    gGame.markedCount++
}

function cellUnmarked(elCell, i, j) {
    renderCell(i, j)
    gGame.markedCount--
}

function checkGameOver(rowIdx, colIdx) {
    var elLivesModal = document.querySelector('.lives-modal')
    var elGameModal = document.querySelector('.game-modal')
    if (gBoard[rowIdx][colIdx].isMine) {
        gGame.liveCount--
            elLivesModal.innerText = 'Lives count: ' + gGame.liveCount
        elLivesModal.innerText += ' Oh! You hit a mine!'
        setTimeout(() => {
            elLivesModal.innerText = 'Lives count: ' + gGame.liveCount
        }, 2000)
    }
    if (gGame.liveCount === 0) {
        elGameModal.innerText = 'GAME OVER'
        document.querySelector('table').style.pointerEvents = 'none'
        showMines()
        return
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine && currCell.isMarked || currCell.isMine && currCell.isShown || !currCell.isMine && currCell.isShown) {
                gIsVictory = true
            } else gIsVictory = false
        }
    }
    if (gGame.shownCount + gGame.markedCount !== gLevel.SIZE ** 2) gIsVictory = false
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = board[i][j]
            if (!currCell.isMine && !currCell.isMarked && !currCell.isShown) {
                var elCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                elCell.classList.add('clicked-cell')
                elCell.querySelector('.hidden').style.visibility = "visible"
                currCell.isShown = true
                gGame.shownCount++
            }
        }
    }
}

function setSize(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    initGame()
}