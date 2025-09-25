'use strict';

const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');
const statusLineElement = document.getElementById('status-line');
const refreshButtonElement = document.getElementById('btn-refresh');

const localFallbackQuotes = [
    { content: 'Где тонко, там и рвется.', author: 'Народная мудрость' },
    { content: 'Всякая мысль — зерно будущего поступка.', author: 'Лев Толстой' },
    { content: 'Счастье — это когда тебя понимают.', author: 'Конфуций' },
    { content: 'Тишина — лучший ответ на бессмыслицу.', author: 'Федор Достоевский' },
    { content: 'Делай, что можешь, с тем, что имеешь, там, где ты есть.', author: 'Теодор Рузвельт' }
];

function chooseRandomFallbackQuote() {
    const index = Math.floor(Math.random() * localFallbackQuotes.length);
    return localFallbackQuotes[index];
}

async function fetchQuoteFromPublicApi(signal) {
    // Публичный API с поддержкой CORS: https://api.quotable.io
    const response = await fetch('https://api.quotable.io/random', { signal });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { content: data.content, author: data.author || 'Неизвестный автор' };
}

async function loadQuote() {
    statusLineElement.textContent = 'Загружаю…';

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10_000);

    try {
        const quote = await fetchQuoteFromPublicApi(abortController.signal);
        applyQuoteToUi(quote);
        statusLineElement.textContent = 'Получено с публичного API';
    } catch (error) {
        const fallback = chooseRandomFallbackQuote();
        applyQuoteToUi(fallback);
        statusLineElement.textContent = 'Показан локальный запасной вариант (офлайн/ограничения CORS/сеть)';
        // В консоль отправим подробности для дебага
        console.warn('[quote-fallback]', error);
    } finally {
        clearTimeout(timeoutId);
    }
}

function applyQuoteToUi(quote) {
    quoteTextElement.textContent = `“${quote.content}”`;
    quoteAuthorElement.textContent = `— ${quote.author}`;
}

refreshButtonElement.addEventListener('click', () => {
    void loadQuote();
});

// Первая загрузка при входе на страницу
window.addEventListener('DOMContentLoaded', () => {
    void loadQuote();
});


