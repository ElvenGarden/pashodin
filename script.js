'use strict';

// DOM
const questionsInput = document.getElementById('questions-input');
const peopleInput = document.getElementById('people-input');
const decideButton = document.getElementById('btn-decide');
const formStatus = document.getElementById('form-status');

const screenMain = document.getElementById('screen-main');
const screenAnswer = document.getElementById('screen-answer');
const answeredButton = document.getElementById('btn-answered');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const blessingTextEl = document.getElementById('blessing-text');
const questionEmphasisEl = document.getElementById('question-emphasis');
const readinessTextEl = document.getElementById('readiness-text');
const selfcareText = document.getElementById('selfcare-text');
const acceptButton = document.getElementById('btn-accept');
const declineButton = document.getElementById('btn-decline');
const runesCanvas = document.getElementById('runes-canvas');

// State
const STORAGE_KEYS = {
    questions: 'eg.questions.v1',
    people: 'eg.people.v1',
};

let currentQuestion = null;
let currentPerson = null;
let rng = Math.random; // will be replaced with seeded RNG during init

// Utils
function parseQuestions(text) {
    return text
        .split(/\r?\n/g)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function parsePeople(text) {
    return text
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function pickRandom(array) {
    const idx = Math.floor(rng() * array.length);
    return array[idx];
}

function computeValidationMessage() {
    const questionsCount = parseQuestions(questionsInput.value).length;
    const peopleCount = parsePeople(peopleInput.value).length;
    if (questionsCount === 0 && peopleCount === 0) return 'Добавьте вопросы и имена участников. И получите заряд энергии на решение.';
    if (questionsCount === 0) return 'Добавьте хотя бы один вопрос.';
    if (peopleCount === 0) return 'Добавьте хотя бы одно имя.';
    return '';
}

function updateDecideButtonState() {
    const hasQuestions = parseQuestions(questionsInput.value).length > 0;
    const hasPeople = parsePeople(peopleInput.value).length > 0;
    const enabled = hasQuestions && hasPeople;
    decideButton.disabled = !enabled;
    formStatus.textContent = enabled ? '' : computeValidationMessage();
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.questions, questionsInput.value);
        localStorage.setItem(STORAGE_KEYS.people, peopleInput.value);
    } catch (e) {
        // ignore storage errors
    }
}

function loadFromStorage() {
    try {
        const q = localStorage.getItem(STORAGE_KEYS.questions);
        const p = localStorage.getItem(STORAGE_KEYS.people);
        if (typeof q === 'string') questionsInput.value = q;
        if (typeof p === 'string') peopleInput.value = p;
    } catch (e) {
        // ignore
    }
}

function showModal() {
    modal.classList.remove('hidden');
    startRunesAnimation();
}

function hideModal() {
    modal.classList.add('hidden');
    selfcareText.textContent = '';
    stopRunesAnimation();
}

function showAnswerScreen() {
    screenMain.classList.add('hidden');
    screenAnswer.classList.remove('hidden');
}

function showMainScreen() {
    screenAnswer.classList.add('hidden');
    screenMain.classList.remove('hidden');
}

function buildContent(person, question) {
    const blessing = `${person}, ты благословлен Одином, сингулярностью черной дыры и садовой эльфийкой на решение вопроса:`;
    const readiness = `Ты готов ответить этот вопрос здесь и сейчас? Почет и хула за последствия решения будут на тебе.`;
    return { blessing, readiness };
}

function removeQuestionFromTextarea(question) {
    const lines = questionsInput.value.split(/\r?\n/g);
    const idx = lines.findIndex(line => line.trim() === question.trim());
    if (idx >= 0) {
        lines.splice(idx, 1);
        questionsInput.value = lines.join('\n');
    }
}

function onDecideClick() {
    const questions = parseQuestions(questionsInput.value);
    const people = parsePeople(peopleInput.value);

    if (questions.length === 0 || people.length === 0) {
        formStatus.textContent = 'Нужно добавить хотя бы один вопрос и одно имя.';
        updateDecideButtonState();
        return;
    }

    currentQuestion = pickRandom(questions);
    currentPerson = pickRandom(people);
    const { blessing, readiness } = buildContent(currentPerson, currentQuestion);
    modalTitle.textContent = currentPerson;
    blessingTextEl.textContent = blessing;
    questionEmphasisEl.textContent = currentQuestion;
    readinessTextEl.textContent = readiness;
    selfcareText.textContent = '';
    showModal();
}

function onAccept() {
    // «Отвечу!» — переходим на экран ответа и удаляем вопрос из списка
    removeQuestionFromTextarea(currentQuestion);
    saveToStorage();
    updateDecideButtonState();
    hideModal();
    showAnswerScreen();
}

function onDecline() {
    // «Нет!» — показываем фразу про заботу и выкидываем новую пару
    selfcareText.textContent = 'спасибо, что позаботился о себе';

    const questions = parseQuestions(questionsInput.value);
    const people = parsePeople(peopleInput.value);
    if (questions.length === 0 || people.length === 0) {
        // если внезапно список пуст — закрываем
        hideModal();
        return;
    }
    currentQuestion = pickRandom(questions);
    currentPerson = pickRandom(people);
    const { blessing, readiness } = buildContent(currentPerson, currentQuestion);
    modalTitle.textContent = currentPerson;
    blessingTextEl.textContent = blessing;
    questionEmphasisEl.textContent = currentQuestion;
    readinessTextEl.textContent = readiness;
}

function onAnswered() {
    // Возврат к основному экрану
    showMainScreen();
}

function attachEventListeners() {
    decideButton.addEventListener('click', onDecideClick);
    acceptButton.addEventListener('click', onAccept);
    declineButton.addEventListener('click', onDecline);
    answeredButton.addEventListener('click', onAnswered);

    // Закрытие по клику на подложку
    modal.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.hasAttribute && target.hasAttribute('data-close')) {
            hideModal();
        }
    });

    // Ввод и сохранение
    questionsInput.addEventListener('input', () => {
        saveToStorage();
        updateDecideButtonState();
        formStatus.textContent = '';
    });
    peopleInput.addEventListener('input', () => {
        saveToStorage();
        updateDecideButtonState();
        formStatus.textContent = '';
    });
}

function init() {
    initializeSeededRng();
    loadFromStorage();
    attachEventListeners();
    updateDecideButtonState();
}

window.addEventListener('DOMContentLoaded', init);

// Runes Matrix animation on modal backdrop
let runesAnimationId = null;
let runesCtx = null;
let runesColumns = [];
let runeSymbols = [];
let runesFrameCounter = 0;
const RUNES_SPEED_FACTOR = 3; // медленнее в 3 раза

function setupRunesCanvas() {
    if (!runesCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = runesCanvas.parentElement;
    runesCanvas.width = Math.floor(w * dpr);
    runesCanvas.height = Math.floor(h * dpr);
    runesCanvas.style.width = w + 'px';
    runesCanvas.style.height = h + 'px';
    runesCtx = runesCanvas.getContext('2d');
    runesCtx.scale(dpr, dpr);

    const fontSize = 16;
    const cols = Math.ceil(w / fontSize);
    runesColumns = Array(cols).fill(0);
    runesCtx.font = `${fontSize}px monospace`;
    runeSymbols = 'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎ'.split('');
}

function drawRunesFrame() {
    if (!runesCtx || !runesCanvas) return;
    const { clientWidth: w, clientHeight: h } = runesCanvas;
    // Пропуск кадров для замедления
    runesFrameCounter = (runesFrameCounter + 1) % RUNES_SPEED_FACTOR;
    if (runesFrameCounter !== 0) {
        runesAnimationId = requestAnimationFrame(drawRunesFrame);
        return;
    }
    // Semi-transparent black to create trail
    runesCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    runesCtx.fillRect(0, 0, runesCanvas.width, runesCanvas.height);

    runesCtx.fillStyle = 'rgba(34, 211, 238, 0.9)'; // cyan-ish
    runesCtx.shadowColor = 'rgba(34, 211, 238, 0.75)';
    runesCtx.shadowBlur = 8;

    const fontSize = 16;
    for (let i = 0; i < runesColumns.length; i++) {
        const text = runeSymbols[(rng() * runeSymbols.length) | 0];
        const x = i * fontSize;
        const y = (runesColumns[i] + 1) * fontSize;
        runesCtx.fillText(text, x, y);

        if (y > (runesCanvas.height / (window.devicePixelRatio || 1)) && rng() > 0.975) {
            runesColumns[i] = 0;
        } else {
            runesColumns[i]++;
        }
    }

    runesAnimationId = requestAnimationFrame(drawRunesFrame);
}

function startRunesAnimation() {
    setupRunesCanvas();
    if (runesAnimationId == null) {
        runesAnimationId = requestAnimationFrame(drawRunesFrame);
    }
}

function stopRunesAnimation() {
    if (runesAnimationId != null) {
        cancelAnimationFrame(runesAnimationId);
        runesAnimationId = null;
    }
    if (runesCtx && runesCanvas) {
        runesCtx.clearRect(0, 0, runesCanvas.width, runesCanvas.height);
    }
}

// Seeded RNG from string using xmur3 + sfc32
function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    };
}

function sfc32(a, b, c, d) {
    return function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0; t = (t + d) | 0; d = (d + 1) | 0;
        a = (b ^ (b << 9)) | 0;
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}

function initializeSeededRng() {
    const seedString = 'Odin, singularity, and garden elven ' + new Date().toISOString();
    const seedGen = xmur3(seedString);
    rng = sfc32(seedGen(), seedGen(), seedGen(), seedGen());
}


