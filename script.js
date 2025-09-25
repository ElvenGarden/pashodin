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
const assignmentText = document.getElementById('assignment-text');
const selfcareText = document.getElementById('selfcare-text');
const acceptButton = document.getElementById('btn-accept');
const declineButton = document.getElementById('btn-decline');

// State
const STORAGE_KEYS = {
    questions: 'eg.questions.v1',
    people: 'eg.people.v1',
};

let currentQuestion = null;
let currentPerson = null;

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
    const idx = Math.floor(Math.random() * array.length);
    return array[idx];
}

function updateDecideButtonState() {
    const hasQuestions = parseQuestions(questionsInput.value).length > 0;
    const hasPeople = parsePeople(peopleInput.value).length > 0;
    decideButton.disabled = !(hasQuestions && hasPeople);
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
}

function hideModal() {
    modal.classList.add('hidden');
    selfcareText.textContent = '';
}

function showAnswerScreen() {
    screenMain.classList.add('hidden');
    screenAnswer.classList.remove('hidden');
}

function showMainScreen() {
    screenAnswer.classList.add('hidden');
    screenMain.classList.remove('hidden');
}

function buildAssignmentText(person, question) {
    return `${person}, ты благословлен Одином, сингулярностью черной дыры и садовой эльфийкой на решение вопроса ${question}! Ты готов ответить этот вопрос здесь и сейчас? Почет и хула за последствия решения будут на тебе.`;
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
    assignmentText.textContent = buildAssignmentText(currentPerson, currentQuestion);
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
    assignmentText.textContent = buildAssignmentText(currentPerson, currentQuestion);
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
    loadFromStorage();
    attachEventListeners();
    updateDecideButtonState();
}

window.addEventListener('DOMContentLoaded', init);


