const timerElement = document.querySelector('#timer');
const triesElement = document.querySelector('#tries');
const codeElement = document.querySelector('#code');

const restartElement = document.querySelector('#reset');
const resultElement = document.querySelector('#result');
const startElement = document.querySelector('#start-button');

const initialElements = document.querySelectorAll('.cell');

const startWrapper = document.querySelector('.start-wrapper');
const endWrapper = document.querySelector('.end-wrapper');
const wrapper = document.querySelector('.wrapper');
const bottomWrapper = document.querySelector('.bottom-wrapper');

const dialog = document.querySelector(".dialog");
const dialogTitle = document.querySelector(".dialog-title");
const dialogText = document.querySelector(".dialog-text");
const closeButton = document.querySelector(".dialog-close");

wrapper.style.display = 'none';
endWrapper.style.display = 'none';

const selectedColors = {};

let code = null;
let isFirstTurnCompleted = null;
let tries = null;
let timerValue = null;
let isColorMode = null;

let timer = null;

closeButton.addEventListener("click", () => {
    dialog.close();
});

bottomWrapper.addEventListener('click', (event) => {
    if (event.target && event.target.tagName !== 'BUTTON') return;

    rotate(event);
});

restartElement.addEventListener('click', () => {
    backToMenu();
});

startElement.addEventListener('click', startGame);

function startGame() {
    const isCorrectTries = checkTries();
    const isCorrectTimer = checkTimer();

    if (!(isCorrectTries && isCorrectTimer)) return;

    endWrapper.style.display = 'none';
    startWrapper.style.display = 'none';
    wrapper.style.display = '';
    timerElement.style.display = '';

    isFirstTurnCompleted = false;

    resetPositions();

    code = generateCode();

    moveRandom();
    setTimer();
    updateTries();

    setColors();
}

function generateCode() {
    const code = Math.random().toString(16).slice(2, 10).toUpperCase();
    const cells = document.querySelectorAll('.cell');

    codeElement.innerHTML = '';

    for (let i = 0; i < code.length; ++i) {
        codeElement.innerHTML += `<span>${code[i]}</span>`;
    }

    cells.forEach((cell, index) => {
        cell.textContent = code[index];
    });

    return code;
}

function moveRandom() {
    const pseudoButtons = [];

    for (let i = 0; i < tries; ++i) {
        const chance = Math.random();
        const pseudoButton = document.createElement('button');

        switch (true) {
            case (chance <= 0.333):
                pseudoButton.classList.add('left-button');
                break;
            case (chance <= 0.666):
                pseudoButton.classList.add('center-button');
                break;
            default:
                pseudoButton.classList.add('right-button');
                break;
        }

        if (chance >= 0.5) {
            pseudoButton.classList.add('clockwise');
        }

        pseudoButtons.push(pseudoButton);
    }

    tries *= 2;

    for (const pseudoButton of pseudoButtons) {
        rotate(pseudoButton);
    }

}

function rotate(event) {
    let buttonSide;
    let buttonDirection;

    if (event.target) {
        buttonSide = event.target.classList[1];
        buttonDirection = event.target.classList[2];

        isFirstTurnCompleted = true;
    } else {
        buttonSide = event.classList[0];
        buttonDirection = event.classList[1];
    }

    let indexMod;
    let indexOrd;

    switch (buttonSide) {
        case 'left-button':
            indexMod = -1;
            break;
        case 'center-button':
            indexMod = 0;
            break;
        case 'right-button':
            indexMod = 1;
            break;
    }

    switch (buttonDirection) {
        case 'clockwise':
            indexOrd = [1, 5, 6, 2];
            break;
        default:
            indexOrd = [5, 1, 2, 6];
            break;
    }

    let actCells = document.querySelectorAll('.panel .cell');

    actCells[indexOrd[0] + indexMod].before(actCells[indexOrd[1] + indexMod]);
    actCells[indexOrd[2] + indexMod].after(actCells[indexOrd[3] + indexMod]);

    --tries;
    updateTries();
}

function checkTries() {
    tries = document.querySelector('#actions-input').value;

    const isOutOfRange = tries > 100 || tries <= 0;

    if (isOutOfRange || isNaN(tries)) {
        showDialog('error', 'Количество действий должно быть в диапазоне [1:100]')
        return false;
    }

    return true;
}

function checkTimer() {
    timerValue = Number(document.querySelector('#timer-input').value);

    const isOutOfRange = timerValue > 60 || timerValue < 0;

    if (isOutOfRange || isNaN(timerValue)) {
        showDialog('error', 'Значение таймера должно быть в диапазоне [0:60] секунд')
        return false;
    }

    return true;
}

function setTimer() {
    if (timerValue === 0) {
        timerElement.style.display = 'none';
        return;
    }

    let secs = timerValue;
    timerElement.textContent = `Осталось ${secs}⏳️`;

    timer = setInterval(function () {
        timerElement.textContent = `Осталось ${secs}⏳️`;
        --secs;

        if (secs <= 0) {
            clearInterval(timer);
            tries = 0;
            checkResult();
        }
    }, 1000);
}

function setColors() {
    const colors = [
        '#606C38',
        '#FCC8B2',
        '#8E8DBE',
        '#D7FF9F',
        '#FFF689',
        '#6096BA',
        '#5D2A42',
        '#D4D2A5',
        '#D7FCD4',
        '#B68F40',
        '#F95738',
        '#F4D35E',
        '#F28F3B',
        '#69B578',
        '#995FA3',
        '#F2BEFC',
        '#456990',
        '#DC965A',
        '#ADA9B7',
        '#B7245C',
        '#49BEAA',
        '#7C3238',
        '#6457A6'
    ];

    isColorMode = document.querySelector('#color-input').checked;

    if (!isColorMode) return;

    for (let i = 0; i < initialElements.length + 1; ++i) {
        if (Object.keys(selectedColors).length !== i) --i;

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        selectedColors[randomColor] = null;
    }

    const colorsKeys = Object.keys(selectedColors);
    const codeSymbols = document.querySelectorAll('#code span');

    initialElements.forEach((element, index) => {
        element.style.backgroundImage = 'unset';
        element.style.background = `${colorsKeys[index]}`;
    });

    codeSymbols.forEach((codeSymbol, index) => {
        codeSymbol.style.color = `${colorsKeys[index]}`;
    });
}

function updateTries() {
    triesElement.textContent = `Осталось ${tries}🖱️`;

    checkResult();
}

function checkResult() {
    const cells = document.querySelectorAll('.cell');
    let result = '';

    cells.forEach(cell => {
        result += cell.textContent;
    });

    const isVictory = (result === code);

    if (isVictory && !isFirstTurnCompleted) {
        moveRandom();
        return;
    }

    if (isVictory || !tries) {
        wrapper.style.display = 'none';
        endWrapper.style.display = '';

        if (isVictory) {
            resultElement.textContent = 'Победа! 🥳';
        } else {
            resultElement.textContent = 'Поражение 💀';
        }

        clearInterval(timer);
    }
}

function resetPositions() {
    const actualElements = document.querySelectorAll('.cell');
    const panel = document.querySelector('.panel');

    actualElements.forEach(aElement => {
        aElement.remove();
    });

    initialElements.forEach(iElement => {
        panel.append(iElement);

        iElement.style.backgroundImage = 'linear-gradient(45deg, #e07a1e 0%, #e4c183 100%)';
    });
}

function backToMenu() {
    endWrapper.style.display = 'none';
    startWrapper.style.display = '';
}

function showDialog(type, text) {
    switch (type) {
        case 'error':
            dialogTitle.textContent = '❗️Ошибка';
            dialogTitle.style.background = 'rgba(255, 0, 0, 0.15)';
            break;
        case 'help':
            dialogTitle.textContent = '⭐️ Совет';
            dialogTitle.style.background = 'rgba(0, 128, 0, 0.15)';
            break;
    }

    dialogText.textContent = text;

    dialog.showModal();
}