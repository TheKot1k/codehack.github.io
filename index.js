const controlButtons = document.querySelectorAll('.buttons-block > button');
const triesElement = document.querySelector('#tries');
const codeElement = document.querySelector('#code');
const restartElement = document.querySelector('#reset');
const resultElement = document.querySelector('#result');
const startElement = document.querySelector('#start');

const initialElements = document.querySelectorAll('.cell');

const startWrapper = document.querySelector('.start-wrapper');
const endWrapper = document.querySelector('.end-wrapper');
const wrapper = document.querySelector('.wrapper');

wrapper.style.display = 'none';
endWrapper.style.display = 'none';

let code;
let isFirstTurnCompleted;
let tries;
let isRemoveColors;

controlButtons.forEach(button => {
    button.addEventListener('click', (button) => {
        rotate(button);
    });
});

restartElement.addEventListener('click', () => {
    backToMenu();
});

startElement.addEventListener('click', () => {
    startGame();
});

function startGame() {
    endWrapper.style.display = 'none';
    startWrapper.style.display = 'none';
    wrapper.style.display = 'block';

    isFirstTurnCompleted = false;

    resetPositions();

    code = generateCode();

    enterTries();

    moveRandom();
    checkTries();

    removeColors();
}

function generateCode() {
    const code = Math.random().toString(16).slice(2, 10).toUpperCase();
    const cells = document.querySelectorAll('.cell');

    codeElement.innerHTML = `${code.slice(0, -4)} <br> ${code.slice(4, 8)}`;

    cells.forEach((cell, id) => {
        cell.textContent = code[id];
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

function rotate(button) {
    let buttonSide;
    let buttonDirection;

    if (button.target) {
        buttonSide = button.target.classList[1];
        buttonDirection = button.target.classList[2];

        isFirstTurnCompleted = true;
    } else {
        buttonSide = button.classList[0];
        buttonDirection = button.classList[1];
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
    console.log(`Осталось ${tries}`);
    checkTries();
}

function enterTries() {
    tries = document.querySelector('#number-input').value;

    const isOutOfRange = tries > 100 || tries <= 0;

    if (isOutOfRange || isNaN(tries)) {
        tries = 3;
        alert('Некорректное значение! Установлено значение по умолчанию (3)');
    }

    console.log(`Установлено ${tries}`);
}

function removeColors() {
    isRemoveColors = !document.querySelector('#color-input').checked;

    if (!isRemoveColors) return;

    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        cell.style.background = 'linear-gradient(45deg, #e07a1e 0%, #e4c183 100%)';
    });
}

function checkTries() {
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
        endWrapper.style.display = 'flex';

        if (isVictory) {
            resultElement.textContent = 'Победа! 🥳';
        } else {
            resultElement.textContent = 'Неверно! 💀';
        }
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
    });
}

function backToMenu() {
    endWrapper.style.display = 'none';
    startWrapper.style.display = 'flex';
}