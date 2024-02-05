/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/elements.ts":
/*!*************************!*\
  !*** ./src/elements.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   board: () => (/* binding */ board),
/* harmony export */   cells: () => (/* binding */ cells),
/* harmony export */   getCell: () => (/* binding */ getCell),
/* harmony export */   getEmptyCells: () => (/* binding */ getEmptyCells),
/* harmony export */   getTriplets: () => (/* binding */ getTriplets),
/* harmony export */   opponentHand: () => (/* binding */ opponentHand),
/* harmony export */   playGameButton: () => (/* binding */ playGameButton),
/* harmony export */   playerHand: () => (/* binding */ playerHand),
/* harmony export */   screens: () => (/* binding */ screens),
/* harmony export */   showScreen: () => (/* binding */ showScreen)
/* harmony export */ });
const screens = (() => {
    const menuScreen = document.getElementById('game-menu');
    if (!menuScreen) {
        throw new Error('game menu not found');
    }
    const playAreaScreen = document.getElementById('game-play-area');
    if (!playAreaScreen) {
        throw new Error('game play area not found');
    }
    return {
        'game-menu': menuScreen,
        'game-play-area': playAreaScreen,
    };
})();
const showScreen = (screenName) => {
    for (const [name, screen] of Object.entries(screens)) {
        if (name == screenName) {
            screen.hidden = false;
        }
        else {
            screen.hidden = true;
        }
    }
};
const playGameButton = (() => {
    const playGameButton = document.getElementById('play-game-button');
    if (!playGameButton) {
        throw new Error('play game button not found');
    }
    return playGameButton;
})();
const board = (() => {
    const board = document.getElementById('board');
    if (!board) {
        throw new Error('board not found');
    }
    return board;
})();
const cells = (() => {
    const cells = [];
    for (const rowElement of board.children) {
        const row = [];
        for (const cell of rowElement.children) {
            row.push(cell);
        }
        cells.push(row);
    }
    return cells;
})();
const getCell = (r, c) => {
    const row = cells[r];
    if (row) {
        const cell = row[c];
        if (cell) {
            return cell;
        }
    }
};
const getEmptyCells = () => {
    const emptyCells = [];
    cells.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
            if (!cell.hasChildNodes()) {
                emptyCells.push([[rowIdx, colIdx], cell]);
            }
        });
    });
    return emptyCells;
};
const getTriplets = (owner) => {
    const triplets = [];
    for (let r = 0; r < cells.length; ++r) {
        const row = cells[r];
        for (let c = 0; c < row.length; ++c) {
            const cell = row[c];
            const piece = cell.children[0];
            if (!piece) {
                continue;
            }
            if (piece.classList.contains(`${owner}-piece`)) {
                const vectors = [[0, -1], [-1, -1], [-1, 0], [-1, 1]];
                for (const [dr, dc] of vectors) {
                    const neighborA = getCell(r + dr, c + dc);
                    const pieceA = neighborA === null || neighborA === void 0 ? void 0 : neighborA.children[0];
                    if (!neighborA || !pieceA) {
                        continue;
                    }
                    if (!pieceA.classList.contains(`${owner}-piece`)) {
                        continue;
                    }
                    const neighborB = getCell(r - dr, c - dc);
                    const pieceB = neighborB === null || neighborB === void 0 ? void 0 : neighborB.children[0];
                    if (!neighborB || !pieceB) {
                        continue;
                    }
                    if (!pieceB.classList.contains(`${owner}-piece`)) {
                        continue;
                    }
                    triplets.push([neighborA, cell, neighborB]);
                }
            }
        }
    }
    return triplets;
};
const playerHand = (() => {
    const playerHand = document.getElementById('player-hand');
    if (!playerHand) {
        throw new Error('player hand not found');
    }
    return playerHand;
})();
const opponentHand = (() => {
    const opponentHand = document.getElementById('opponent-hand');
    if (!opponentHand) {
        throw new Error('opponent hand not found');
    }
    return opponentHand;
})();


/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   init: () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _elements__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./elements */ "./src/elements.ts");

const onDragEnter = (ev) => {
    var _a;
    (_a = ev.target) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event('highlight'));
    ev.preventDefault();
};
const onDragLeave = (ev) => {
    var _a;
    (_a = ev.target) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event('unhighlight'));
    ev.preventDefault();
};
const onDragOver = (ev) => {
    if (ev.dataTransfer) {
        ev.dataTransfer.dropEffect = 'move';
    }
    ev.preventDefault();
};
const init = () => {
    console.log('init');
    (0,_elements__WEBPACK_IMPORTED_MODULE_0__.showScreen)('game-menu');
    _elements__WEBPACK_IMPORTED_MODULE_0__.playGameButton.addEventListener('click', startGame);
};
const startGame = () => {
    console.log('startGame');
    (0,_elements__WEBPACK_IMPORTED_MODULE_0__.showScreen)('game-play-area');
    for (const pieceElement of _elements__WEBPACK_IMPORTED_MODULE_0__.playerHand.children) {
        pieceElement.addEventListener('dragstart', (ev) => {
            if (ev.dataTransfer) {
                ev.dataTransfer.setData('application/boop', pieceElement.id);
                ev.dataTransfer.effectAllowed = 'move';
            }
        });
    }
    _elements__WEBPACK_IMPORTED_MODULE_0__.cells.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
            cell.addEventListener('highlight', () => cell.classList.add('cell-highlighted'));
            cell.addEventListener('unhighlight', () => cell.classList.remove('cell-highlighted'));
            cell.addEventListener('drop', (ev) => {
                if (ev.dataTransfer) {
                    const pieceId = ev.dataTransfer.getData('application/boop');
                    cell.appendChild(document.getElementById(pieceId));
                }
                cell.dispatchEvent(new Event('unhighlight'));
                setTimeout(() => playerPiecePlaced(rowIdx, colIdx));
                ev.preventDefault();
            });
        });
    });
    // TODO: For now, player always goes first
    setTimeout(playerTurn);
};
const playerTurn = () => {
    console.log('playerTurn');
    for (const element of _elements__WEBPACK_IMPORTED_MODULE_0__.playerHand.children) {
        element.setAttribute('draggable', 'true');
    }
    for (const [_, cell] of (0,_elements__WEBPACK_IMPORTED_MODULE_0__.getEmptyCells)()) {
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('dragenter', onDragEnter);
        cell.addEventListener('dragleave', onDragLeave);
    }
};
const opponentTurn = () => {
    console.log('opponentTurn');
    const emptyCells = (0,_elements__WEBPACK_IMPORTED_MODULE_0__.getEmptyCells)();
    const [[r, c], target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const piece = _elements__WEBPACK_IMPORTED_MODULE_0__.opponentHand.children[0];
    _elements__WEBPACK_IMPORTED_MODULE_0__.opponentHand.removeChild(piece);
    target.appendChild(piece);
    setTimeout(() => boop('opponent', r, c));
};
const playerPiecePlaced = (r, c) => {
    console.log('playerPiecePlaced');
    // Set player cells not draggable
    for (const element of document.getElementsByClassName('player-piece')) {
        element.setAttribute('draggable', 'false');
    }
    // Remove drop targets from board
    for (const row of _elements__WEBPACK_IMPORTED_MODULE_0__.cells) {
        for (const cell of row) {
            cell.removeEventListener('dragover', onDragOver);
            cell.removeEventListener('dragenter', onDragEnter);
            cell.removeEventListener('dragleave', onDragLeave);
        }
    }
    setTimeout(() => boop('player', r, c));
};
const boop = (turn, r, c) => {
    console.log('boop');
    const vectors = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];
    const animationPromises = [];
    const cell = (0,_elements__WEBPACK_IMPORTED_MODULE_0__.getCell)(r, c);
    const boopingPiece = cell.children[0];
    for (const [dr, dc] of vectors) {
        const neighbor = (0,_elements__WEBPACK_IMPORTED_MODULE_0__.getCell)(r + dr, c + dc);
        if (!(neighbor === null || neighbor === void 0 ? void 0 : neighbor.hasChildNodes())) {
            continue;
        }
        const { height, width } = neighbor.getBoundingClientRect();
        const piece = neighbor.children[0];
        if (boopingPiece.classList.contains('kitten') && piece.classList.contains('cat')) {
            continue;
        }
        const target = (0,_elements__WEBPACK_IMPORTED_MODULE_0__.getCell)(r + 2 * dr, c + 2 * dc);
        if (target) {
            if (!target.hasChildNodes()) {
                const animation = new Animation(new KeyframeEffect(piece, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc}px, ${height * dr}px)` }
                ], 500));
                animationPromises.push(animation.finished.then(() => {
                    neighbor.removeChild(piece);
                    target.appendChild(piece);
                }));
                animation.play();
            }
            else {
                const animation = new Animation(new KeyframeEffect(piece, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc / 2}px, ${height * dr / 2}px)` },
                    { transform: "translate(0px, 0px)" }
                ], 500));
                animationPromises.push(animation.finished);
                animation.play();
            }
        }
        else {
            const animation = new Animation(new KeyframeEffect(piece, [
                { transform: "translate(0px, 0px)" },
                { transform: `translate(${width * dc}px, ${height * dr}px)` }
            ], 500));
            animationPromises.push(animation.finished.then(() => {
                neighbor.removeChild(piece);
                if (piece.classList.contains('player-piece')) {
                    _elements__WEBPACK_IMPORTED_MODULE_0__.playerHand.appendChild(piece);
                }
                else {
                    _elements__WEBPACK_IMPORTED_MODULE_0__.opponentHand.appendChild(piece);
                }
            }));
            animation.play();
        }
    }
    Promise.all(animationPromises).then(() => { setTimeout(() => postBoop(turn)); });
};
const postBoop = (turn) => {
    console.log('postBoop');
    const triplets = (0,_elements__WEBPACK_IMPORTED_MODULE_0__.getTriplets)(turn);
    const winningTriplet = triplets.find((triplet) => triplet.every((cell) => {
        const piece = cell === null || cell === void 0 ? void 0 : cell.children[0];
        return piece === null || piece === void 0 ? void 0 : piece.classList.contains('cat');
    }));
    if (winningTriplet) {
        setTimeout(() => endGame(turn));
    }
    else {
        if (triplets.length == 1) {
            setTimeout(() => graduateTriplet(turn, triplets[0]));
        }
        else if (triplets.length > 1) {
            if (turn == 'player') {
                setTimeout(() => choosePlayerTripletToGraduate(triplets));
            }
            else {
                setTimeout(() => chooseOpponentTripletToGraduate(triplets));
            }
        }
        else {
            if (turn == 'player') {
                if (_elements__WEBPACK_IMPORTED_MODULE_0__.playerHand.childElementCount == 0) {
                    setTimeout(returnPlayerPieceToHand);
                }
                else {
                    setTimeout(opponentTurn, 500);
                }
            }
            else {
                if (_elements__WEBPACK_IMPORTED_MODULE_0__.opponentHand.childElementCount == 0) {
                    setTimeout(returnOpponentPieceToHand);
                }
                else {
                    setTimeout(playerTurn, 500);
                }
            }
        }
    }
};
const graduateTriplet = (turn, triplet) => {
    console.log('graduateTriplet');
    for (const cell of triplet) {
        const piece = cell.children[0];
        cell.removeChild(piece);
        if (piece.classList.contains('kitten')) {
            piece.classList.remove('kitten');
            piece.classList.add('cat');
        }
        if (turn == 'player') {
            _elements__WEBPACK_IMPORTED_MODULE_0__.playerHand.appendChild(piece);
        }
        else {
            _elements__WEBPACK_IMPORTED_MODULE_0__.opponentHand.appendChild(piece);
        }
    }
    if (turn == 'player') {
        setTimeout(opponentTurn, 500);
    }
    else {
        setTimeout(playerTurn, 500);
    }
};
const choosePlayerTripletToGraduate = (triplets) => {
    console.log('choosePlayerTripletToGraduate');
    for (const triplet of triplets) {
        for (const cell of triplet) {
            cell.dispatchEvent(new Event('highlight'));
        }
    }
    const removeOnClicks = [];
    for (const triplet of triplets) {
        for (const cell of triplet) {
            if (!triplets.some((tripletToCheck) => tripletToCheck != triplet && tripletToCheck.some((cellToCheck) => cellToCheck == cell))) {
                const onClick = () => {
                    for (const triplet of triplets) {
                        for (const cell of triplet) {
                            cell.dispatchEvent(new Event('unhighlight'));
                        }
                    }
                    removeOnClicks.forEach((callback) => callback());
                    setTimeout(() => graduateTriplet('player', triplet));
                };
                removeOnClicks.push(() => cell.removeEventListener('click', onClick));
                cell.addEventListener('click', onClick);
            }
        }
    }
};
const chooseOpponentTripletToGraduate = (triplets) => {
    console.log('chooseOpponentTripletToGraduate');
    const triplet = triplets[Math.floor(Math.random() * triplets.length)];
    setTimeout(() => graduateTriplet('opponent', triplet));
};
const returnPlayerPieceToHand = () => {
    console.log('returnPlayerPieceToHand');
    const removeOnClicks = [];
    for (const row of _elements__WEBPACK_IMPORTED_MODULE_0__.cells) {
        for (const cell of row) {
            const piece = cell.children[0];
            if (piece && piece.classList.contains('player-piece')) {
                cell.dispatchEvent(new Event('highlight'));
                const onClick = () => {
                    cell.removeChild(piece);
                    _elements__WEBPACK_IMPORTED_MODULE_0__.playerHand.appendChild(piece);
                    removeOnClicks.forEach((callback) => callback());
                    setTimeout(opponentTurn, 500);
                };
                removeOnClicks.push(() => {
                    cell.dispatchEvent(new Event('unhighlight'));
                    cell.removeEventListener('click', onClick);
                });
                cell.addEventListener('click', onClick);
            }
        }
    }
};
const returnOpponentPieceToHand = () => {
    console.log('returnOpponentPieceToHand');
    const opponentCells = [];
    for (const row of _elements__WEBPACK_IMPORTED_MODULE_0__.cells) {
        for (const cell of row) {
            const piece = cell.children[0];
            if (piece && piece.classList.contains('opponent-piece')) {
                opponentCells.push(cell);
            }
        }
    }
    const cell = opponentCells[Math.floor(Math.random() * opponentCells.length)];
    const piece = cell.children[0];
    cell.removeChild(piece);
    _elements__WEBPACK_IMPORTED_MODULE_0__.opponentHand.appendChild(piece);
    setTimeout(playerTurn, 500);
};
const endGame = (winner) => {
    console.log(`Winner: ${winner}`);
    // TODO
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/game.ts");

(0,_game__WEBPACK_IMPORTED_MODULE_0__.init)();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQTZCLEVBQUUsRUFBRTtJQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNqQyxPQUFPO0FBQ1gsQ0FBQzs7Ozs7OztVQ2hWRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTjhCO0FBRTlCLDJDQUFJLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9lbGVtZW50cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZ2FtZS50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHNjcmVlbnMgPSAoKCkgPT4ge1xuICAgIGNvbnN0IG1lbnVTY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZS1tZW51Jyk7XG4gICAgaWYgKCFtZW51U2NyZWVuKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2FtZSBtZW51IG5vdCBmb3VuZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXlBcmVhU2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtcGxheS1hcmVhJyk7XG4gICAgaWYgKCFwbGF5QXJlYVNjcmVlbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dhbWUgcGxheSBhcmVhIG5vdCBmb3VuZCcpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgICdnYW1lLW1lbnUnOiBtZW51U2NyZWVuLFxuICAgICAgICAnZ2FtZS1wbGF5LWFyZWEnOiBwbGF5QXJlYVNjcmVlbixcbiAgICB9O1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IHNob3dTY3JlZW4gPSAoc2NyZWVuTmFtZToga2V5b2YgdHlwZW9mIHNjcmVlbnMpID0+IHtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBzY3JlZW5dIG9mIE9iamVjdC5lbnRyaWVzKHNjcmVlbnMpKSB7XG4gICAgICAgIGlmIChuYW1lID09IHNjcmVlbk5hbWUpIHtcbiAgICAgICAgICAgIHNjcmVlbi5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjcmVlbi5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgcGxheUdhbWVCdXR0b24gPSAoKCkgPT4ge1xuICAgIGNvbnN0IHBsYXlHYW1lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXktZ2FtZS1idXR0b24nKTtcbiAgICBpZiAoIXBsYXlHYW1lQnV0dG9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigncGxheSBnYW1lIGJ1dHRvbiBub3QgZm91bmQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHBsYXlHYW1lQnV0dG9uO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGJvYXJkID0gKCgpID0+IHtcbiAgICBjb25zdCBib2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib2FyZCcpO1xuICAgIGlmICghYm9hcmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdib2FyZCBub3QgZm91bmQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGJvYXJkO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGNlbGxzID0gKCgpID0+IHtcbiAgICBjb25zdCBjZWxsczogRWxlbWVudFtdW10gPSBbXTtcblxuICAgIGZvciAoY29uc3Qgcm93RWxlbWVudCBvZiBib2FyZC5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCByb3c6IEVsZW1lbnRbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93RWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgICAgICAgcm93LnB1c2goY2VsbCk7XG4gICAgICAgIH1cbiAgICAgICAgY2VsbHMucHVzaChyb3cpO1xuICAgIH1cblxuICAgIHJldHVybiBjZWxscztcbn0pKCk7XG5cbmV4cG9ydCBjb25zdCBnZXRDZWxsID0gKHI6IG51bWJlciwgYzogbnVtYmVyKTogRWxlbWVudCB8IHVuZGVmaW5lZCA9PiB7XG4gICAgY29uc3Qgcm93ID0gY2VsbHNbcl07XG4gICAgaWYgKHJvdykge1xuICAgICAgICBjb25zdCBjZWxsID0gcm93W2NdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGNlbGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFbXB0eUNlbGxzID0gKCk6IFtbbnVtYmVyLCBudW1iZXJdLCBFbGVtZW50XVtdID0+IHtcbiAgICBjb25zdCBlbXB0eUNlbGxzOiBbW251bWJlciwgbnVtYmVyXSwgRWxlbWVudF1bXSA9IFtdO1xuXG4gICAgY2VsbHMuZm9yRWFjaCgocm93LCByb3dJZHgpID0+IHtcbiAgICAgICAgcm93LmZvckVhY2goKGNlbGwsIGNvbElkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjZWxsLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICAgICAgICAgIGVtcHR5Q2VsbHMucHVzaChbW3Jvd0lkeCwgY29sSWR4XSwgY2VsbF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBlbXB0eUNlbGxzO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0VHJpcGxldHMgPSAob3duZXI6ICdwbGF5ZXInIHwgJ29wcG9uZW50Jyk6IEVsZW1lbnRbXVtdID0+IHtcbiAgICBjb25zdCB0cmlwbGV0czogRWxlbWVudFtdW10gPSBbXTtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IGNlbGxzLmxlbmd0aDsgKytyKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IGNlbGxzW3JdO1xuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHJvdy5sZW5ndGg7ICsrYykge1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IHJvd1tjXTtcblxuICAgICAgICAgICAgY29uc3QgcGllY2UgPSBjZWxsLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgaWYgKCFwaWVjZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGllY2UuY2xhc3NMaXN0LmNvbnRhaW5zKGAke293bmVyfS1waWVjZWApKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmVjdG9yczogW251bWJlciwgbnVtYmVyXVtdID0gW1swLCAtMV0sIFstMSwgLTFdLCBbLTEsIDBdLCBbLTEsIDFdXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtkciwgZGNdIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmVpZ2hib3JBID0gZ2V0Q2VsbChyICsgZHIsIGMgKyBkYyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBpZWNlQSA9IG5laWdoYm9yQT8uY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgICAgIGlmICghbmVpZ2hib3JBIHx8ICFwaWVjZUEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaWVjZUEuY2xhc3NMaXN0LmNvbnRhaW5zKGAke293bmVyfS1waWVjZWApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5laWdoYm9yQiA9IGdldENlbGwociAtIGRyLCBjIC0gZGMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwaWVjZUIgPSBuZWlnaGJvckI/LmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5laWdoYm9yQiB8fCAhcGllY2VCKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGllY2VCLmNsYXNzTGlzdC5jb250YWlucyhgJHtvd25lcn0tcGllY2VgKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0cmlwbGV0cy5wdXNoKFtuZWlnaGJvckEsIGNlbGwsIG5laWdoYm9yQl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cmlwbGV0cztcbn07XG5cbmV4cG9ydCBjb25zdCBwbGF5ZXJIYW5kID0gKCgpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJIYW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllci1oYW5kJyk7XG4gICAgaWYgKCFwbGF5ZXJIYW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigncGxheWVyIGhhbmQgbm90IGZvdW5kJyk7XG4gICAgfVxuICAgIHJldHVybiBwbGF5ZXJIYW5kO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IG9wcG9uZW50SGFuZCA9ICgoKSA9PiB7XG4gICAgY29uc3Qgb3Bwb25lbnRIYW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wcG9uZW50LWhhbmQnKTtcbiAgICBpZiAoIW9wcG9uZW50SGFuZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ29wcG9uZW50IGhhbmQgbm90IGZvdW5kJyk7XG4gICAgfVxuICAgIHJldHVybiBvcHBvbmVudEhhbmQ7XG59KSgpO1xuIiwiaW1wb3J0IHsgY2VsbHMsIGdldENlbGwsIGdldEVtcHR5Q2VsbHMsIGdldFRyaXBsZXRzLCBvcHBvbmVudEhhbmQsIHBsYXlHYW1lQnV0dG9uLCBwbGF5ZXJIYW5kLCBzaG93U2NyZWVuIH0gZnJvbSBcIi4vZWxlbWVudHNcIlxuXG5jb25zdCBvbkRyYWdFbnRlciA9IChldjogRHJhZ0V2ZW50KSA9PiB7XG4gICAgZXYudGFyZ2V0Py5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaGlnaGxpZ2h0JykpO1xuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmNvbnN0IG9uRHJhZ0xlYXZlID0gKGV2OiBEcmFnRXZlbnQpID0+IHtcbiAgICBldi50YXJnZXQ/LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCd1bmhpZ2hsaWdodCcpKTtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5jb25zdCBvbkRyYWdPdmVyID0gKGV2OiBEcmFnRXZlbnQpID0+IHtcbiAgICBpZiAoZXYuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xuICAgIH1cbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnaW5pdCcpO1xuICAgIHNob3dTY3JlZW4oJ2dhbWUtbWVudScpO1xuICAgIHBsYXlHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3RhcnRHYW1lKTtcbn1cblxuY29uc3Qgc3RhcnRHYW1lID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdzdGFydEdhbWUnKTtcbiAgICBzaG93U2NyZWVuKCdnYW1lLXBsYXktYXJlYScpO1xuXG4gICAgZm9yIChjb25zdCBwaWVjZUVsZW1lbnQgb2YgcGxheWVySGFuZC5jaGlsZHJlbikge1xuICAgICAgICBwaWVjZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgKGV2OiBEcmFnRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldi5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgICAgICAgICBldi5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnYXBwbGljYXRpb24vYm9vcCcsIHBpZWNlRWxlbWVudC5pZCk7XG4gICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNlbGxzLmZvckVhY2goKHJvdywgcm93SWR4KSA9PiB7XG4gICAgICAgIHJvdy5mb3JFYWNoKChjZWxsLCBjb2xJZHgpID0+IHtcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignaGlnaGxpZ2h0JywgKCkgPT4gY2VsbC5jbGFzc0xpc3QuYWRkKCdjZWxsLWhpZ2hsaWdodGVkJykpO1xuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCd1bmhpZ2hsaWdodCcsICgpID0+IGNlbGwuY2xhc3NMaXN0LnJlbW92ZSgnY2VsbC1oaWdobGlnaHRlZCcpKTtcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChldjogRHJhZ0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGV2LmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwaWVjZUlkID0gZXYuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2FwcGxpY2F0aW9uL2Jvb3AnKTtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5hcHBlbmRDaGlsZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwaWVjZUlkKSEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNlbGwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3VuaGlnaGxpZ2h0JykpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gcGxheWVyUGllY2VQbGFjZWQocm93SWR4LCBjb2xJZHgpKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIFRPRE86IEZvciBub3csIHBsYXllciBhbHdheXMgZ29lcyBmaXJzdFxuICAgIHNldFRpbWVvdXQocGxheWVyVHVybik7XG59XG5cbmNvbnN0IHBsYXllclR1cm4gPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BsYXllclR1cm4nKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcGxheWVySGFuZC5jaGlsZHJlbikge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtfLCBjZWxsXSBvZiBnZXRFbXB0eUNlbGxzKCkpIHtcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIG9uRHJhZ092ZXIpO1xuICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIG9uRHJhZ0VudGVyKTtcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCBvbkRyYWdMZWF2ZSk7XG4gICAgfVxufVxuXG5jb25zdCBvcHBvbmVudFR1cm4gPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ29wcG9uZW50VHVybicpO1xuXG4gICAgY29uc3QgZW1wdHlDZWxscyA9IGdldEVtcHR5Q2VsbHMoKTtcblxuICAgIGNvbnN0IFtbciwgY10sIHRhcmdldF0gPSBlbXB0eUNlbGxzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGVtcHR5Q2VsbHMubGVuZ3RoKV07XG5cbiAgICBjb25zdCBwaWVjZSA9IG9wcG9uZW50SGFuZC5jaGlsZHJlblswXTtcbiAgICBvcHBvbmVudEhhbmQucmVtb3ZlQ2hpbGQocGllY2UpO1xuICAgIHRhcmdldC5hcHBlbmRDaGlsZChwaWVjZSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IGJvb3AoJ29wcG9uZW50JywgciwgYykpO1xufVxuXG5jb25zdCBwbGF5ZXJQaWVjZVBsYWNlZCA9IChyOiBudW1iZXIsIGM6IG51bWJlcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdwbGF5ZXJQaWVjZVBsYWNlZCcpO1xuICAgIC8vIFNldCBwbGF5ZXIgY2VsbHMgbm90IGRyYWdnYWJsZVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwbGF5ZXItcGllY2UnKSkge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgJ2ZhbHNlJyk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGRyb3AgdGFyZ2V0cyBmcm9tIGJvYXJkXG4gICAgZm9yIChjb25zdCByb3cgb2YgY2VsbHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdykge1xuICAgICAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIG9uRHJhZ092ZXIpO1xuICAgICAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCBvbkRyYWdFbnRlcik7XG4gICAgICAgICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIG9uRHJhZ0xlYXZlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4gYm9vcCgncGxheWVyJywgciwgYykpO1xufVxuXG5jb25zdCBib29wID0gKHR1cm46ICdwbGF5ZXInIHwgJ29wcG9uZW50JywgcjogbnVtYmVyLCBjOiBudW1iZXIpID0+IHtcbiAgICBjb25zb2xlLmxvZygnYm9vcCcpO1xuICAgIGNvbnN0IHZlY3RvcnM6IFtudW1iZXIsIG51bWJlcl1bXSA9IFtcbiAgICAgICAgWy0xLCAtMV0sIFstMSwgMF0sIFstMSwgMV0sXG4gICAgICAgIFswLCAtMV0sIFswLCAxXSxcbiAgICAgICAgWzEsIC0xXSwgWzEsIDBdLCBbMSwgMV0sXG4gICAgXTtcblxuICAgIGNvbnN0IGFuaW1hdGlvblByb21pc2VzOiBQcm9taXNlPHVua25vd24+W10gPSBbXTtcblxuICAgIGNvbnN0IGNlbGwgPSBnZXRDZWxsKHIsIGMpITtcbiAgICBjb25zdCBib29waW5nUGllY2UgPSBjZWxsLmNoaWxkcmVuWzBdO1xuXG4gICAgZm9yIChjb25zdCBbZHIsIGRjXSBvZiB2ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IG5laWdoYm9yID0gZ2V0Q2VsbChyICsgZHIsIGMgKyBkYyk7XG5cbiAgICAgICAgaWYgKCFuZWlnaGJvcj8uaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgaGVpZ2h0LCB3aWR0aCB9ID0gbmVpZ2hib3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgY29uc3QgcGllY2UgPSBuZWlnaGJvci5jaGlsZHJlblswXTtcblxuICAgICAgICBpZiAoYm9vcGluZ1BpZWNlLmNsYXNzTGlzdC5jb250YWlucygna2l0dGVuJykgJiYgcGllY2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdjYXQnKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRDZWxsKHIgKyAyICogZHIsIGMgKyAyICogZGMpO1xuXG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0Lmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24obmV3IEtleWZyYW1lRWZmZWN0KHBpZWNlLCBbXG4gICAgICAgICAgICAgICAgICAgIHsgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZSgwcHgsIDBweClcIiB9LFxuICAgICAgICAgICAgICAgICAgICB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3dpZHRoICogZGN9cHgsICR7aGVpZ2h0ICogZHJ9cHgpYCB9XG4gICAgICAgICAgICAgICAgXSwgNTAwKSk7XG5cbiAgICAgICAgICAgICAgICBhbmltYXRpb25Qcm9taXNlcy5wdXNoKGFuaW1hdGlvbi5maW5pc2hlZC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3IucmVtb3ZlQ2hpbGQocGllY2UpO1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocGllY2UpO1xuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5wbGF5KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24obmV3IEtleWZyYW1lRWZmZWN0KHBpZWNlLCBbXG4gICAgICAgICAgICAgICAgICAgIHsgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZSgwcHgsIDBweClcIiB9LFxuICAgICAgICAgICAgICAgICAgICB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3dpZHRoICogZGMgLyAyfXB4LCAke2hlaWdodCAqIGRyIC8gMn1weClgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZSgwcHgsIDBweClcIiB9XG4gICAgICAgICAgICAgICAgXSwgNTAwKSk7XG5cbiAgICAgICAgICAgICAgICBhbmltYXRpb25Qcm9taXNlcy5wdXNoKGFuaW1hdGlvbi5maW5pc2hlZCk7XG5cbiAgICAgICAgICAgICAgICBhbmltYXRpb24ucGxheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbihuZXcgS2V5ZnJhbWVFZmZlY3QocGllY2UsIFtcbiAgICAgICAgICAgICAgICB7IHRyYW5zZm9ybTogXCJ0cmFuc2xhdGUoMHB4LCAwcHgpXCIgfSxcbiAgICAgICAgICAgICAgICB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3dpZHRoICogZGN9cHgsICR7aGVpZ2h0ICogZHJ9cHgpYCB9XG4gICAgICAgICAgICBdLCA1MDApKTtcblxuICAgICAgICAgICAgYW5pbWF0aW9uUHJvbWlzZXMucHVzaChhbmltYXRpb24uZmluaXNoZWQudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbmVpZ2hib3IucmVtb3ZlQ2hpbGQocGllY2UpO1xuICAgICAgICAgICAgICAgIGlmIChwaWVjZS5jbGFzc0xpc3QuY29udGFpbnMoJ3BsYXllci1waWVjZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllckhhbmQuYXBwZW5kQ2hpbGQocGllY2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50SGFuZC5hcHBlbmRDaGlsZChwaWVjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBhbmltYXRpb24ucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgUHJvbWlzZS5hbGwoYW5pbWF0aW9uUHJvbWlzZXMpLnRoZW4oKCkgPT4geyBzZXRUaW1lb3V0KCgpID0+IHBvc3RCb29wKHR1cm4pKSB9KTtcbn1cblxuY29uc3QgcG9zdEJvb3AgPSAodHVybjogJ3BsYXllcicgfCAnb3Bwb25lbnQnKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ3Bvc3RCb29wJyk7XG5cbiAgICBjb25zdCB0cmlwbGV0cyA9IGdldFRyaXBsZXRzKHR1cm4pO1xuXG4gICAgY29uc3Qgd2lubmluZ1RyaXBsZXQgPSB0cmlwbGV0cy5maW5kKCh0cmlwbGV0KSA9PlxuICAgICAgICB0cmlwbGV0LmV2ZXJ5KChjZWxsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwaWVjZSA9IGNlbGw/LmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgcmV0dXJuIHBpZWNlPy5jbGFzc0xpc3QuY29udGFpbnMoJ2NhdCcpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBpZiAod2lubmluZ1RyaXBsZXQpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBlbmRHYW1lKHR1cm4pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHJpcGxldHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZ3JhZHVhdGVUcmlwbGV0KHR1cm4sIHRyaXBsZXRzWzBdKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHJpcGxldHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgaWYgKHR1cm4gPT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNob29zZVBsYXllclRyaXBsZXRUb0dyYWR1YXRlKHRyaXBsZXRzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2hvb3NlT3Bwb25lbnRUcmlwbGV0VG9HcmFkdWF0ZSh0cmlwbGV0cykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR1cm4gPT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBpZiAocGxheWVySGFuZC5jaGlsZEVsZW1lbnRDb3VudCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmV0dXJuUGxheWVyUGllY2VUb0hhbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQob3Bwb25lbnRUdXJuLCA1MDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50SGFuZC5jaGlsZEVsZW1lbnRDb3VudCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmV0dXJuT3Bwb25lbnRQaWVjZVRvSGFuZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuLCA1MDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuY29uc3QgZ3JhZHVhdGVUcmlwbGV0ID0gKHR1cm46ICdwbGF5ZXInIHwgJ29wcG9uZW50JywgdHJpcGxldDogRWxlbWVudFtdKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2dyYWR1YXRlVHJpcGxldCcpO1xuXG4gICAgZm9yIChjb25zdCBjZWxsIG9mIHRyaXBsZXQpIHtcbiAgICAgICAgY29uc3QgcGllY2UgPSBjZWxsLmNoaWxkcmVuWzBdO1xuICAgICAgICBjZWxsLnJlbW92ZUNoaWxkKHBpZWNlKTtcbiAgICAgICAgaWYgKHBpZWNlLmNsYXNzTGlzdC5jb250YWlucygna2l0dGVuJykpIHtcbiAgICAgICAgICAgIHBpZWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2tpdHRlbicpO1xuICAgICAgICAgICAgcGllY2UuY2xhc3NMaXN0LmFkZCgnY2F0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR1cm4gPT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgIHBsYXllckhhbmQuYXBwZW5kQ2hpbGQocGllY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3Bwb25lbnRIYW5kLmFwcGVuZENoaWxkKHBpZWNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0dXJuID09ICdwbGF5ZXInKSB7XG4gICAgICAgIHNldFRpbWVvdXQob3Bwb25lbnRUdXJuLCA1MDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQocGxheWVyVHVybiwgNTAwKTtcbiAgICB9XG59XG5cbmNvbnN0IGNob29zZVBsYXllclRyaXBsZXRUb0dyYWR1YXRlID0gKHRyaXBsZXRzOiBFbGVtZW50W11bXSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdjaG9vc2VQbGF5ZXJUcmlwbGV0VG9HcmFkdWF0ZScpO1xuXG4gICAgZm9yIChjb25zdCB0cmlwbGV0IG9mIHRyaXBsZXRzKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiB0cmlwbGV0KSB7XG4gICAgICAgICAgICBjZWxsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdoaWdobGlnaHQnKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZW1vdmVPbkNsaWNrczogKCgpID0+IHZvaWQpW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHRyaXBsZXQgb2YgdHJpcGxldHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHRyaXBsZXQpIHtcbiAgICAgICAgICAgIGlmICghdHJpcGxldHMuc29tZSgodHJpcGxldFRvQ2hlY2spID0+IHRyaXBsZXRUb0NoZWNrICE9IHRyaXBsZXQgJiYgdHJpcGxldFRvQ2hlY2suc29tZSgoY2VsbFRvQ2hlY2spID0+IGNlbGxUb0NoZWNrID09IGNlbGwpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHJpcGxldCBvZiB0cmlwbGV0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHRyaXBsZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCd1bmhpZ2hsaWdodCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZU9uQ2xpY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjaygpKTtcblxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGdyYWR1YXRlVHJpcGxldCgncGxheWVyJywgdHJpcGxldCkpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZW1vdmVPbkNsaWNrcy5wdXNoKCgpID0+IGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKSk7XG4gICAgICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5jb25zdCBjaG9vc2VPcHBvbmVudFRyaXBsZXRUb0dyYWR1YXRlID0gKHRyaXBsZXRzOiBFbGVtZW50W11bXSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdjaG9vc2VPcHBvbmVudFRyaXBsZXRUb0dyYWR1YXRlJyk7XG5cbiAgICBjb25zdCB0cmlwbGV0ID0gdHJpcGxldHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdHJpcGxldHMubGVuZ3RoKV07XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IGdyYWR1YXRlVHJpcGxldCgnb3Bwb25lbnQnLCB0cmlwbGV0KSk7XG59XG5cbmNvbnN0IHJldHVyblBsYXllclBpZWNlVG9IYW5kID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdyZXR1cm5QbGF5ZXJQaWVjZVRvSGFuZCcpO1xuXG4gICAgY29uc3QgcmVtb3ZlT25DbGlja3M6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gICAgZm9yIChjb25zdCByb3cgb2YgY2VsbHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdykge1xuICAgICAgICAgICAgY29uc3QgcGllY2UgPSBjZWxsLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgaWYgKHBpZWNlICYmIHBpZWNlLmNsYXNzTGlzdC5jb250YWlucygncGxheWVyLXBpZWNlJykpIHtcbiAgICAgICAgICAgICAgICBjZWxsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdoaWdobGlnaHQnKSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5yZW1vdmVDaGlsZChwaWVjZSk7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllckhhbmQuYXBwZW5kQ2hpbGQocGllY2UpO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVPbkNsaWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChvcHBvbmVudFR1cm4sIDUwMCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZW1vdmVPbkNsaWNrcy5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgndW5oaWdobGlnaHQnKSk7XG4gICAgICAgICAgICAgICAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNvbnN0IHJldHVybk9wcG9uZW50UGllY2VUb0hhbmQgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ3JldHVybk9wcG9uZW50UGllY2VUb0hhbmQnKTtcblxuICAgIGNvbnN0IG9wcG9uZW50Q2VsbHM6IEVsZW1lbnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgcm93IG9mIGNlbGxzKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiByb3cpIHtcbiAgICAgICAgICAgIGNvbnN0IHBpZWNlID0gY2VsbC5jaGlsZHJlblswXTtcbiAgICAgICAgICAgIGlmIChwaWVjZSAmJiBwaWVjZS5jbGFzc0xpc3QuY29udGFpbnMoJ29wcG9uZW50LXBpZWNlJykpIHtcbiAgICAgICAgICAgICAgICBvcHBvbmVudENlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjZWxsID0gb3Bwb25lbnRDZWxsc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHBvbmVudENlbGxzLmxlbmd0aCldO1xuICAgIGNvbnN0IHBpZWNlID0gY2VsbC5jaGlsZHJlblswXTtcbiAgICBjZWxsLnJlbW92ZUNoaWxkKHBpZWNlKTtcbiAgICBvcHBvbmVudEhhbmQuYXBwZW5kQ2hpbGQocGllY2UpO1xuXG4gICAgc2V0VGltZW91dChwbGF5ZXJUdXJuLCA1MDApO1xufVxuXG5jb25zdCBlbmRHYW1lID0gKHdpbm5lcjogJ3BsYXllcicgfCAnb3Bwb25lbnQnKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFdpbm5lcjogJHt3aW5uZXJ9YCk7XG4gICAgLy8gVE9ET1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnLi9nYW1lJztcblxuaW5pdCgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9