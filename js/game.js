'use strict'

const BOMB = 9
var gIsVictory = true
var gGame
var gBoard
var gGameInterval
var gSmile
var gSafeClicks
var gIsHint
var gHints
var gElSmiley = document.querySelector('.smiley')
var gLevel = {
    SIZE: 8,
    MINES: 12
}

function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        liveCount: 3
    }
    clearInterval(gGameInterval)
    gBoard = buildBoard()
    renderBoard()
    document.querySelector('.lives-modal').innerText = 'Lives: ' + getLives(gGame.liveCount)
    document.querySelector('table').style.pointerEvents = 'all'
    document.querySelector('.game-modal').innerText = ''
    document.querySelector('.timer').innerText = ''
    gElSmiley.innerHTML = '&#128519;'
    gSafeClicks = 3
    gHints = 3
    gIsHint = false
    document.querySelector('.safe').innerText = 'safe click: ' + gSafeClicks
    document.querySelector('.hint').innerText = 'hint: ' + gHints
    document.querySelector('.hint').classList.remove('hint-on')

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

function locateMines(rowIdx, colIdx) {
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

function setMinesNegsCount() {
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
    if (gBoard[i][j].isMine) {
        document.querySelector(`[data-i='${i}'][data-j='${j}']`).innerHTML = `<img class="hidden" src="assets/${gBoard[i][j].minesAroundCount}.gif">`
    } else
        document.querySelector(`[data-i='${i}'][data-j='${j}']`).innerHTML = `<img class="hidden" src="assets/${gBoard[i][j].minesAroundCount}.png" >`
}

function cellClicked(elCell, rowIdx, colIdx, ev) {
    if (!gGame.isOn) {
        document.querySelector('.timer').innerText = ++gGame.secsPassed
        gGameInterval = setInterval(() => {
            document.querySelector('.timer').innerText = ++gGame.secsPassed
        }, 1000);
        gGame.isOn = true
        locateMines(rowIdx, colIdx)
        setMinesNegsCount()
    }
    if (gIsHint) {
        if (!gBoard[rowIdx][colIdx].isMarked && !gBoard[rowIdx][colIdx].isShown) {
            elCell.classList.add('clicked-cell')
            elCell.querySelector('img').classList.remove('hidden')
            elCell.classList.add('disable-cell')
            gIsHint = false
            setTimeout(() => {
                elCell.className = 'cell'
                elCell.querySelector('img').classList.add('hidden')
                elCell.classList.remove('disable-cell')
            }, 1500);
            for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
                if (i < 0 || i > gBoard.length - 1) continue
                for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                    if (j < 0 || j > gBoard[0].length - 1) continue
                    if (i === rowIdx && j === colIdx) continue
                    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
                    var curCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                    curCell.classList.add('clicked-cell')
                    curCell.querySelector('img').classList.remove('hidden')
                    curCell.classList.add('disable-cell')
                }
            }
            setTimeout(() => {
                for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
                    if (i < 0 || i > gBoard.length - 1) continue
                    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                        if (j < 0 || j > gBoard[0].length - 1) continue
                        if (i === rowIdx && j === colIdx) continue
                        if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
                        var curCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                        curCell.className = 'cell'
                        curCell.querySelector('img').classList.add('hidden')
                        curCell.classList.remove('disable-cell')
                        document.querySelector('.hint').classList.remove('hint-on')
                    }
                }
            }, 1500);
            return
        }
    }
    if (!gIsHint) {
        if (!gBoard[rowIdx][colIdx].isShown) {
            if (ev.button !== 2 && !gBoard[rowIdx][colIdx].isMarked && !gBoard[rowIdx][colIdx].isMine) {
                elCell.classList.add('clicked-cell')
                gBoard[rowIdx][colIdx].isShown = true
                gGame.shownCount++
                    if (gBoard[rowIdx][colIdx].minesAroundCount === 0) {
                        expandShown(gBoard, rowIdx, colIdx)
                    }
            }
            if (ev.button !== 2 && !gBoard[rowIdx][colIdx].isMarked && gBoard[rowIdx][colIdx].isMine) {
                var elCell = document.querySelector(`[data-i='${rowIdx}'][data-j='${colIdx}']`)
                gBoard[rowIdx][colIdx].isShown = true
                gGame.shownCount++
                    gBoard[rowIdx][colIdx].isMarked = true
                elCell.classList.add('clicked-mine')
                elCell.style.pointerEvents = 'none'
                gGame.liveCount--
                    var elLivesModal = document.querySelector('.lives-modal')
                elLivesModal.innerText = 'Lives: ' + getLives(gGame.liveCount)
                elLivesModal.innerText = 'Oh! You hit a mine!'
                setTimeout(() => {
                    elLivesModal.innerText = 'Lives: ' + getLives(gGame.liveCount)
                }, 1000)
            } else if (ev.button === 2 && !gBoard[rowIdx][colIdx].isMarked) {
                gBoard[rowIdx][colIdx].isMarked = true
                cellMarked(elCell)
            } else if (ev.button === 2 && gBoard[rowIdx][colIdx].isMarked) {
                gBoard[rowIdx][colIdx].isMarked = false
                cellUnmarked(rowIdx, colIdx)
            }
            if (gBoard[rowIdx][colIdx].isShown) elCell.querySelector('img').style.visibility = "visible"
        }
    }
    checkGameOver()
    changeSmiley()
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isMarked) {
                var elCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                if (!elCell.className.includes('clicked-mine'))
                    elCell.classList.add('clicked-cell')
                elCell.innerHTML = `<img src="assets/9.gif">`
            }
        }
    }
}

function cellMarked(elCell) {
    elCell.innerHTML = `<img src="assets/flag.gif">`
    gGame.markedCount++
}

function cellUnmarked(i, j) {
    renderCell(i, j)
    gGame.markedCount--
}

function checkGameOver() {
    var elGameModal = document.querySelector('.game-modal')
    if (gGame.liveCount === 0) {
        clearInterval(gGameInterval)
        gGame.isOn = false
        elGameModal.innerText = 'GAME OVER'
        document.querySelector('table').style.pointerEvents = 'none'
        showMines()
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if ((currCell.isMine && !currCell.isMarked) || (!currCell.isMine && !currCell.isShown)) {
                gIsVictory = false
                return
            } else gIsVictory = true
        }
    }
    if (gIsVictory) {
        clearInterval(gGameInterval)
        document.querySelector('.game-modal').innerText = 'WINNER'
        document.querySelector('table').style.pointerEvents = 'none'
        gGame.isOn = false
    }
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = board[i][j]
            if (!currCell.isMine && !currCell.isShown) {
                if (currCell.isMarked) {
                    gGame.markedCount--
                        gBoard[i][j].isMarked = false
                }
                var elCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                elCell.classList.add('clicked-cell')
                elCell.innerHTML = `<img src="assets/${gBoard[i][j].minesAroundCount}.png">`
                currCell.isShown = true
                gGame.shownCount++
                    gBoard[i][j].isShown = true
                if (currCell.minesAroundCount === 0) expandShown(board, i, j)
            }
        }
    }
}

function setSize(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    initGame()
}

function changeSmiley() {
    var elGameModal = document.querySelector('.game-modal')
    var elHitModal = document.querySelector('.lives-modal')
    if (elGameModal.innerText === 'WINNER') {
        clearTimeout(gSmile)
        gElSmiley.innerHTML = '&#129321;'
        return
    } else if (elGameModal.innerText === 'GAME OVER') {
        clearTimeout(gSmile)
        gElSmiley.innerHTML = '&#129327;'
        return
    } else if (elHitModal.innerText === 'Oh! You hit a mine!') {
        gElSmiley.innerHTML = '&#129327;'
        gSmile = setTimeout(() => {
            gElSmiley.innerHTML = '&#128519;'
        }, 1000);
    }
}

function getLives(livesCount) {
    var lives = ''
    for (var i = 0; i < livesCount; i++) {
        lives += '❤️'
    }
    return lives
}

function getSafeClick() {
    if (!gSafeClicks) return
    if (gGame.isOn) {
        var rndRowIdx = getRndIntExc(0, gBoard.length)
        var rndColIdx = getRndIntExc(0, gBoard[0].length)
        var rndCell = gBoard[rndRowIdx][rndColIdx]
        if (!rndCell.isMine && !rndCell.isShown && !rndCell.isMarked) {
            var elCell = document.querySelector([`[data-i='${rndRowIdx}'][data-j='${rndColIdx}']`])
            elCell.classList.add('clicked-cell')
            elCell.querySelector('img').classList.remove('hidden')
            elCell.classList.add('disable-cell')
            gSafeClicks--
            document.querySelector('.safe').innerText = 'safe click: ' + gSafeClicks
            setTimeout(() => {
                elCell.className = 'cell'
                elCell.querySelector('img').classList.add('hidden')
                elCell.classList.remove('disable-cell')
            }, 1500);
        } else getSafeClick()
    } else return
}

function getHint() {
    if (gGame.isOn) {
        if (gHints) {
            gIsHint = true
            gHints--
            document.querySelector('.hint').innerText = 'hint: ' + gHints
            document.querySelector('.hint').classList.add('hint-on')
        }
    }
}