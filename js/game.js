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
        // console.log(gBoard)
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
            console.log(gIsHint)
            elCell.className += ' clicked-cell'
            elCell.querySelector('img').classList.remove('hidden')
            elCell.style.pointerEvents = 'none'
            gIsHint = false
            setTimeout(() => {
                elCell.className = 'cell'
                elCell.querySelector('img').classList.add('hidden')
                elCell.style.pointerEvents = 'all'
            }, 1000);
            for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
                if (i < 0 || i > gBoard.length - 1) continue
                for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                    if (j < 0 || j > gBoard[0].length - 1) continue
                    if (i === rowIdx && j === colIdx) continue
                    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
                    var curCell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
                    curCell.className += ' clicked-cell'
                    curCell.querySelector('img').classList.remove('hidden')
                    curCell.style.pointerEvents = 'none'
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
                        curCell.style.pointerEvents = 'all'
                        document.querySelector('.hint').classList.remove('hint-on')

                    }
                }
            }, 1000);
            return
        }
    }
    if (!gIsHint) {
        // clearTimeout(isHint)
        if (!gBoard[rowIdx][colIdx].isShown) {
            if (ev.button !== 2 && !gBoard[rowIdx][colIdx].isMarked && !gBoard[rowIdx][colIdx].isMine) {
                elCell.className += ' clicked-cell'
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
                    changeSmiley()
                gBoard[rowIdx][colIdx].isMarked = true
                elCell.classList.add('clicked-mine')
                elCell.style.pointerEvents = 'none'
                gGame.liveCount--
                    var elLivesModal = document.querySelector('.lives-modal')
                elLivesModal.innerText = 'Lives: ' + getLives(gGame.liveCount)
                elLivesModal.innerText += ' Oh! You hit a mine!'
                setTimeout(() => {
                    elLivesModal.innerText = 'Lives: ' + getLives(gGame.liveCount)
                }, 2000)
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
        clearTimeout(gSmile)
        clearInterval(gGameInterval)
        gGame.isOn = false
        elGameModal.innerText = 'GAME OVER'
        document.querySelector('table').style.pointerEvents = 'none'
        showMines()
        gElSmiley.innerHTML = '&#129327;'
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
        clearTimeout(gSmile)
        gElSmiley.innerHTML = '&#129321;'
        clearInterval(gGameInterval)
        document.querySelector('.game-modal').innerText = 'WINNER'
        document.querySelector('table').style.pointerEvents = 'none'
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
    gElSmiley.innerHTML = '&#129327;'
    if (gGame.shownCount + gGame.markedCount !== gLevel.SIZE ** 2)
        gSmile = setTimeout(() => {
            gElSmiley.innerHTML = '&#128519;'
        }, 1200);
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
            console.log(elCell.className)
            elCell.className += ' clicked-cell'
            elCell.querySelector('img').classList.remove('hidden')
            elCell.style.pointerEvents = 'none'
            gSafeClicks--
            document.querySelector('.safe').innerText = 'safe click: ' + gSafeClicks
            setTimeout(() => {
                elCell.className = 'cell'
                elCell.querySelector('img').classList.add('hidden')
                elCell.style.pointerEvents = 'all'
            }, 1500);
        } else getSafeClick()
    }
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