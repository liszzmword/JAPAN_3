(function () {
  'use strict';

  const startScreen = document.getElementById('start-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('next-btn');
  const retryBtn = document.getElementById('retry-btn');
  const quizCountSelect = document.getElementById('quiz-count');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  const questionLabel = document.getElementById('question-label');
  const questionWord = document.getElementById('question-word');
  const choicesContainer = document.getElementById('choices');
  const resultScore = document.getElementById('result-score');
  const resultMessage = document.getElementById('result-message');
  const resultIcon = document.getElementById('result-icon');

  let state = {
    mode: 'ja-to-ko',
    total: 10,
    current: 0,
    correct: 0,
    quizItems: [],
    answered: false,
  };

  function showScreen(screenId) {
    [startScreen, quizScreen, resultScreen].forEach(function (el) {
      el.classList.toggle('active', el.id === screenId);
    });
  }

  function getRandomItems(arr, n) {
    const shuffled = arr.slice().sort(function () { return Math.random() - 0.5; });
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  function getWrongChoices(correctKo, count) {
    const others = VOCABULARY
      .map(function (v) { return v.ko; })
      .filter(function (ko) { return ko !== correctKo; });
    const shuffled = others.sort(function () { return Math.random() - 0.5; });
    return shuffled.slice(0, count);
  }

  function getWrongJapaneseChoices(correctJa, count) {
    const others = VOCABULARY
      .map(function (v) { return v.ja; })
      .filter(function (ja) { return ja !== correctJa; });
    const shuffled = others.sort(function () { return Math.random() - 0.5; });
    return shuffled.slice(0, count);
  }

  function buildQuizItems() {
    const total = Math.min(state.total, VOCABULARY.length);
    const selected = getRandomItems(VOCABULARY, total);
    state.quizItems = selected.map(function (item) {
      return {
        ja: item.ja,
        ko: item.ko,
      };
    });
    state.current = 0;
    state.correct = 0;
  }

  function renderProgress() {
    const total = state.quizItems.length;
    const current = state.current + (state.answered ? 1 : 0);
    progressText.textContent = current + ' / ' + total;
    progressFill.style.width = total ? (current / total) * 100 + '%' : '0%';
  }

  function showQuestion() {
    state.answered = false;
    nextBtn.classList.add('hidden');

    const item = state.quizItems[state.current];
    const isJaToKo = state.mode === 'ja-to-ko';

    questionLabel.textContent = isJaToKo ? '다음 단어의 뜻은?' : '다음 뜻의 일본어는?';
    questionWord.textContent = isJaToKo ? item.ja : item.ko;

    const correctAnswer = isJaToKo ? item.ko : item.ja;
    const wrongChoices = isJaToKo
      ? getWrongChoices(item.ko, 3)
      : getWrongJapaneseChoices(item.ja, 3);

    const choices = [correctAnswer].concat(getRandomItems(wrongChoices, 3));
    choices.sort(function () { return Math.random() - 0.5; });

    choicesContainer.innerHTML = '';
    choices.forEach(function (choice) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = choice;
      btn.addEventListener('click', function () {
        if (state.answered) return;
        state.answered = true;
        const isCorrect = choice === correctAnswer;
        if (isCorrect) state.correct += 1;

        document.querySelectorAll('.choice-btn').forEach(function (b) {
          b.disabled = true;
          if (b.textContent === correctAnswer) b.classList.add('correct');
          else if (b === btn && !isCorrect) b.classList.add('wrong');
        });
        nextBtn.classList.remove('hidden');
        renderProgress();
      });
      choicesContainer.appendChild(btn);
    });

    renderProgress();
  }

  function nextQuestion() {
    state.current += 1;
    if (state.current >= state.quizItems.length) {
      showResult();
      return;
    }
    showQuestion();
  }

  function showResult() {
    const total = state.quizItems.length;
    const correct = state.correct;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    resultScore.textContent = correct + ' / ' + total + ' (' + pct + '%)';
    if (pct >= 90) {
      resultMessage.textContent = '훌륭해요! 일본어 실력이 대단해요.';
      resultIcon.textContent = '🎉';
    } else if (pct >= 70) {
      resultMessage.textContent = '잘했어요! 조금만 더 연습해 보세요.';
      resultIcon.textContent = '👍';
    } else {
      resultMessage.textContent = '다시 도전해서 단어를 익혀 보세요!';
      resultIcon.textContent = '📚';
    }
    showScreen('result-screen');
  }

  function startQuiz() {
    state.mode = document.querySelector('input[name="mode"]:checked').value;
    state.total = parseInt(quizCountSelect.value, 10);
    buildQuizItems();
    if (state.quizItems.length === 0) {
      alert('단어가 부족합니다.');
      return;
    }
    showScreen('quiz-screen');
    showQuestion();
  }

  startBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', nextQuestion);
  retryBtn.addEventListener('click', function () {
    showScreen('start-screen');
  });

  /* 컨택 모달 */
  const contactBtn = document.getElementById('contact-btn');
  const contactModal = document.getElementById('contact-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalClose = document.getElementById('modal-close');
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  const contactSubmit = document.getElementById('contact-submit');

  function openContactModal() {
    contactModal.classList.add('is-open');
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeContactModal() {
    contactModal.classList.remove('is-open');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showFormMessage(text, isError) {
    formMessage.textContent = text;
    formMessage.classList.remove('hidden', 'success', 'error');
    formMessage.classList.add(isError ? 'error' : 'success');
  }

  function hideFormMessage() {
    formMessage.classList.add('hidden');
    formMessage.textContent = '';
  }

  contactBtn.addEventListener('click', openContactModal);
  modalClose.addEventListener('click', closeContactModal);
  modalBackdrop.addEventListener('click', closeContactModal);

  contactModal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeContactModal();
  });

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hideFormMessage();
    var nameInput = contactForm.querySelector('input[name="name"]');
    var phoneInput = contactForm.querySelector('input[name="phone"]');
    var emailInput = contactForm.querySelector('input[name="email"]');
    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();
    var email = emailInput.value.trim();
    if (!name || !phone || !email) {
      showFormMessage('이름, 전화번호, 이메일을 모두 입력해 주세요.', true);
      return;
    }
    contactSubmit.disabled = true;
    contactSubmit.textContent = '전송 중...';
    fetch('/api/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, email: email }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showFormMessage('제출되었습니다. 연락드리겠습니다.');
            contactForm.reset();
          } else {
            showFormMessage(data.error || '전송에 실패했습니다. 나중에 다시 시도해 주세요.', true);
          }
        });
      })
      .catch(function () {
        showFormMessage('네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.', true);
      })
      .finally(function () {
        contactSubmit.disabled = false;
        contactSubmit.textContent = '제출하기';
      });
  });
})();
