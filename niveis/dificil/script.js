const app = document.getElementById("app");
const fullscreenButton = document.getElementById("fullscreen-button");
const soundButton = document.getElementById("sound-button");
const installButton = document.getElementById("install-button");

const audio = {
  theme: document.getElementById("theme-audio"),
  tick: document.getElementById("tick-audio"),
  correct: document.getElementById("correct-audio"),
  wrong: document.getElementById("wrong-audio"),
  timeout: document.getElementById("timeout-audio"),
  victory: document.getElementById("victory-audio"),
  defeat: document.getElementById("defeat-audio"),
};

audio.theme.volume = 0.22;
audio.tick.volume = 0.38;

const narrativeSlides = [
  {
    text: "Era uma noite quente de verão. Os amigos: Luísa, Bruno, Matheus e Isabela estavam jogando bola na rua.",
    image: "imagens/narrativa1.png",
  },
  {
    text: "De repente, a bola caiu em um casarão abandonado que ficava na esquina.",
    image: "imagens/narrativa2.png",
  },
  {
    text: "Mesmo com medo, os 4 amigos resolveram ir até lá para recuperar a bola.",
    image: "imagens/narrativa3.png",
  },
  {
    text: "Quando eles entraram no casarão, a porta se fechou sozinha.",
    image: "imagens/narrativa4.png",
  },
  {
    text: "As crianças tentaram abrir, mas não conseguiram.",
    image: "imagens/narrativa5.png",
  },
  {
    text: "Uma vela se acendeu e, debaixo dela, eles encontraram um bilhete: Luísa leu o bilhete em voz alta e ele dizia o seguinte:",
    image: "imagens/narrativa6.png",
  },
  {
    text: "Vocês entraram na minha casa sem ser convidados e agora estão presos. Só os deixarei sair, se resolverem os meus desafios de matemática.",
    image: "imagens/narrativa7.png",
  },
  {
    text: "Um segundo depois, outra vela se acendeu perto de algumas cartas de baralho.",
    image: "imagens/narrativa8.png",
  },
  {
    text: "Luísa escolheu uma delas, virou e encontrou um desafio.",
    image: "imagens/narrativa9.png",
  },
];

const levels = [
  {
    id: 1,
    name: "Nível 1",
    difficulty: "Fácil",
    clue: "UMA DAS LETRAS DA SENHA É A INICIAL DA PALAVRA PATO.",
    questions: [
      {
        statement: "3 centenas correspondem a 30 dezenas.",
        answer: true,
      },
      {
        statement: "23 dezenas correspondem a 200.",
        answer: false,
      },
      {
        statement: "3 unidades de milhar correspondem a 300 centenas.",
        answer: false,
      },
      {
        statement: "5 unidades de milhar correspondem a 50 centenas.",
        answer: true,
      },
      {
        statement: "40 centenas correspondem a 400 dezenas.",
        answer: true,
      },
    ],
  },
  {
    id: 2,
    name: "Nível 2",
    difficulty: "Médio",
    clue: "UMA DAS LETRAS DA SENHA É A 5ª LETRA DO ALFABETO.",
    questions: [
      {
        statement: "1.972 é o maior número que se pode formar com os algarismos 1, 2, 7 e 9.",
        answer: false,
      },
      {
        statement: "1.628 mais 20 centenas é igual a 1.848.",
        answer: false,
      },
      {
        statement: "2.004 menos 20 dezenas é igual a 1.804.",
        answer: true,
      },
      {
        statement: "2.004 menos 20 dezenas é igual a 1.904.",
        answer: false,
      },
      {
        statement: "3.000 é equivalente a 30 centenas e também a 300 dezenas.",
        answer: true,
      },
    ],
  },
  {
    id: 3,
    name: "Nível 3",
    difficulty: "Desafiador",
    clue: "É O NOME DE UMA FRUTA.",
    questions: [
      {
        statement: "Se retirarmos 10 dezenas do número 1.647, sobra 1.547.",
        answer: true,
      },
      {
        statement: "Se retirarmos 10 centenas do número 5.432, sobra 5.332.",
        answer: false,
      },
      {
        statement: "Se adicionarmos 100 unidades ao número 2.999, o resultado é 3.099.",
        answer: true,
      },
      {
        statement: "Se adicionarmos 10 dezenas ao número 2.999, o resultado é 3.009.",
        answer: false,
      },
      {
        statement: "Se adicionarmos 20 dezenas ao número 1.980, o resultado é 2.000.",
        answer: false,
      },
    ],
  },
];

const state = {
  screen: "landing",
  narrativeIndex: 0,
  currentLevel: 0,
  currentQuestion: null,
  timer: 60,
  timerId: null,
  answered: { 1: [], 2: [], 3: [] },
  cluesUnlocked: [],
  audioStarted: false,
  isMuted: false,
  installPrompt: null,
  feedbackType: null,
  finalStatus: null,
};

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

function updateInstallButton() {
  installButton.classList.toggle("hidden-action", !state.installPrompt);
}

function updateSoundButton() {
  soundButton.textContent = state.isMuted ? "Som: desligado" : "Som: ligado";
  soundButton.classList.toggle("is-muted", state.isMuted);
}

function setMuted(isMuted) {
  state.isMuted = isMuted;
  Object.values(audio).forEach((track) => {
    track.muted = isMuted;
    if (isMuted) {
      track.pause();
      if (track !== audio.theme) {
        track.currentTime = 0;
      }
    }
  });

  if (!isMuted && state.audioStarted) {
    audio.theme.play().catch(() => {});
  }

  updateSoundButton();
}

function ensureThemeAudio() {
  if (state.audioStarted || state.isMuted) {
    return;
  }
  state.audioStarted = true;
  audio.theme.play().catch(() => {
    state.audioStarted = false;
  });
}

function stopTick() {
  audio.tick.pause();
  audio.tick.currentTime = 0;
}

function playOneShot(trackName) {
  if (state.isMuted) {
    return;
  }
  stopTick();
  ["correct", "wrong", "timeout", "victory", "defeat"].forEach((name) => {
    audio[name].pause();
    audio[name].currentTime = 0;
  });
  audio[trackName].play().catch(() => {});
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  stopTick();
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remaining = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function countAnswered(levelId) {
  return state.answered[levelId].filter((answer) => typeof answer !== "undefined").length;
}

function resetLevel(levelId) {
  state.answered[levelId] = [];
  state.currentQuestion = null;
}

function restartGame() {
  clearTimer();
  state.screen = "landing";
  state.narrativeIndex = 0;
  state.currentLevel = 0;
  state.currentQuestion = null;
  state.feedbackType = null;
  state.answered = { 1: [], 2: [], 3: [] };
  state.cluesUnlocked = [];
  state.finalStatus = null;
}

function render() {
  clearTimer();

  if (state.screen === "landing") {
    renderLanding();
    return;
  }
  if (state.screen === "narrative") {
    renderNarrative();
    return;
  }
  if (state.screen === "level") {
    renderLevelSelection();
    return;
  }
  if (state.screen === "question") {
    renderQuestion();
    return;
  }
  if (state.screen === "feedback") {
    renderFeedback();
    return;
  }
  if (state.screen === "summary") {
    renderSummary();
    return;
  }
  if (state.screen === "final") {
    renderFinalChallenge();
  }
}

function renderLanding() {
  app.innerHTML = `
    <section class="screen landing-screen">
      <div class="panel landing-copy">
        <p class="eyebrow">Escape Room</p>
        <h1>A casa abandonada</h1>
        <p class="subtitle">Sistema de numeração decimal<br>3º ano do Ensino Fundamental</p>
        <p class="credits">Criado por Edneia Angélica Gomes<br></p>
        <p class="info-text">Entre no casarão, resolva 15 desafios e descubra a senha que abre a porta antes que seja tarde demais.</p>
        <div class="screen-actions">
          <button class="primary-button" id="start-game" type="button">JOGAR</button>
        </div>
      </div>
      <div class="image-panel">
        <img src="imagens/tela-inicial.png" alt="Entrada do casarão abandonado">
      </div>
    </section>
  `;

  document.getElementById("start-game").addEventListener("click", () => {
    ensureThemeAudio();
    state.screen = "narrative";
    state.narrativeIndex = 0;
    render();
  });
}

function renderNarrative() {
  const slide = narrativeSlides[state.narrativeIndex];
  const isLast = state.narrativeIndex === narrativeSlides.length - 1;

  app.innerHTML = `
    <section class="screen narrative-screen">
      <div class="panel narrative-copy">
        <p class="eyebrow">Narrativa ${state.narrativeIndex + 1}/9</p>
        ${state.narrativeIndex === 0 ? "<h2>A aventura começou</h2>" : ""}
        <p class="story-text">${slide.text}</p>
        <div class="screen-actions">
          <button class="primary-button" id="continue-story" type="button">${isLast ? "IR PARA O NÍVEL 1" : "CONTINUAR"}</button>
        </div>
      </div>
      <div class="image-panel">
        <img src="${slide.image}" alt="Cena da narrativa ${state.narrativeIndex + 1}">
      </div>
    </section>
  `;

  document.getElementById("continue-story").addEventListener("click", () => {
    ensureThemeAudio();
    if (isLast) {
      state.currentLevel = 0;
      state.screen = "level";
    } else {
      state.narrativeIndex += 1;
    }
    render();
  });
}

function renderLevelSelection() {
  const level = levels[state.currentLevel];
  const answered = state.answered[level.id];
  const answeredCount = countAnswered(level.id);

  app.innerHTML = `
    <section class="screen level-screen">
      <div class="level-header">
        <div>
          <p class="eyebrow">${level.name}</p>
          <h2>Escolha uma carta para revelar um desafio</h2>
        </div>
        <div class="badge-row">
          <span class="badge">${level.difficulty}</span>
          <span class="badge">${answeredCount}/5 respondidas</span>
        </div>
      </div>
      <div class="cards-panel">
        ${level.questions.map((question, index) => {
          const answerRecord = answered[index];
          const opened = typeof answerRecord !== "undefined";
          const statusLabel = opened ? (answerRecord === true ? "Acertou" : "Errou") : `Carta ${index + 1}`;
          return `
            <button class="card-button ${opened ? "locked" : ""}" type="button" data-question-index="${index}" ${opened ? "disabled" : ""}>
              <div class="card-face ${opened ? "card-open" : ""}">
                ${
                  opened
                    ? `<div>Questão ${index + 1}</div><div>${statusLabel}</div>`
                    : `<img src="imagens/carta-desafio.png" alt="Carta de desafio"><span class="card-label">${statusLabel}</span>`
                }
              </div>
            </button>
          `;
        }).join("")}
      </div>
      <div class="footer-actions">
        <button class="secondary-button" id="restart-level" type="button">Reiniciar nível</button>
      </div>
    </section>
  `;

  document.querySelectorAll(".card-button[data-question-index]").forEach((button) => {
    button.addEventListener("click", () => {
      ensureThemeAudio();
      state.currentQuestion = Number(button.dataset.questionIndex);
      state.screen = "question";
      render();
    });
  });

  document.getElementById("restart-level").addEventListener("click", () => {
    resetLevel(level.id);
    render();
  });
}

function renderQuestion() {
  const level = levels[state.currentLevel];
  const question = level.questions[state.currentQuestion];
  const answered = state.answered[level.id];

  app.innerHTML = `
    <section class="screen question-screen">
      <div class="question-header">
        <div>
          <p class="eyebrow">${level.name}</p>
          <h2>Questão ${state.currentQuestion + 1} de 5</h2>
        </div>
        <div class="badge-row">
          <span class="badge">${level.difficulty}</span>
          <span class="badge">Verdadeiro ou Falso</span>
        </div>
      </div>
      <div class="question-grid">
        <div class="question-panel">
          <div class="question-meta">
            <div class="timer-box" id="timer-box">Tempo: <span id="timer-value">01:00</span></div>
            <div class="progress-row">
              ${level.questions.map((item, index) => {
                const answerRecord = answered[index];
                const statusClass = answerRecord === true ? "correct" : answerRecord === false ? "wrong" : "";
                return `<span class="progress-dot ${statusClass}"></span>`;
              }).join("")}
            </div>
          </div>
          <div>
            <h3>${level.name} - ${level.difficulty}</h3>
            <p class="question-text">${question.statement}</p>
          </div>
          <div class="choices">
            <button class="choice-button" data-answer="true" type="button">VERDADEIRO</button>
            <button class="choice-button" data-answer="false" type="button">FALSO</button>
          </div>
        </div>
        <div class="image-panel question-image-panel">
          <img src="imagens/desafio.png" alt="Imagem do desafio" class="question-image">
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll(".choice-button").forEach((button) => {
    button.addEventListener("click", () => {
      const userAnswer = button.dataset.answer === "true";
      submitAnswer(userAnswer);
    });
  });

  startTimer();
}

function startTimer() {
  state.timer = 60;
  const timerValue = document.getElementById("timer-value");
  const timerBox = document.getElementById("timer-box");

  if (!state.isMuted) {
    audio.tick.currentTime = 0;
    audio.tick.play().catch(() => {});
  }

  state.timerId = setInterval(() => {
    state.timer -= 1;
    if (state.timer <= 10) {
      timerBox.classList.add("warning");
    }
    timerValue.textContent = formatTime(state.timer);

    if (state.timer <= 0) {
      clearTimer();
      handleTimeout();
    }
  }, 1000);
}

function submitAnswer(userAnswer) {
  const level = levels[state.currentLevel];
  const question = level.questions[state.currentQuestion];
  const isCorrect = userAnswer === question.answer;

  state.answered[level.id][state.currentQuestion] = isCorrect;
  state.feedbackType = isCorrect ? "correct" : "wrong";
  state.screen = "feedback";
  playOneShot(isCorrect ? "correct" : "wrong");
  render();
}

function handleTimeout() {
  const level = levels[state.currentLevel];
  state.answered[level.id][state.currentQuestion] = false;
  state.feedbackType = "timeout";
  state.screen = "feedback";
  playOneShot("timeout");
  render();
}

function renderFeedback() {
  const feedbackMap = {
    correct: {
      title: "Resposta certa!",
      text: "Muito bem! Esse desafio foi resolvido corretamente.",
      image: "imagens/acerto.png",
      alt: "Tela de acerto",
    },
    wrong: {
      title: "Resposta errada!",
      text: "Essa não era a resposta correta. Tente caprichar na próxima carta.",
      image: "imagens/erro.png",
      alt: "Tela de erro",
    },
    timeout: {
      title: "TEMPO ESGOTADO",
      text: "O minuto acabou antes da resposta. O casarão ficou ainda mais assustador.",
      image: "imagens/tempo-esgotado.png",
      alt: "Tela de tempo esgotado",
    },
  };

  const feedback = feedbackMap[state.feedbackType];

  app.innerHTML = `
    <section class="screen feedback-screen">
      <div class="panel feedback-copy">
        <p class="eyebrow">Resultado</p>
        <h2>${feedback.title}</h2>
        <p class="story-text">${feedback.text}</p>
        <div class="feedback-actions">
          <button class="primary-button" id="continue-after-feedback" type="button">CONTINUAR</button>
        </div>
      </div>
      <div class="image-panel">
        <img src="${feedback.image}" alt="${feedback.alt}">
      </div>
    </section>
  `;

  document.getElementById("continue-after-feedback").addEventListener("click", () => {
    const level = levels[state.currentLevel];
    const answeredCount = countAnswered(level.id);
    state.screen = answeredCount === level.questions.length ? "summary" : "level";
    render();
  });
}

function renderSummary() {
  const level = levels[state.currentLevel];
  const results = state.answered[level.id];
  const correctCount = results.filter(Boolean).length;
  const passed = correctCount >= 4;

  if (passed && !state.cluesUnlocked.includes(level.id)) {
    state.cluesUnlocked.push(level.id);
  }

  const clues = levels.filter((item) => state.cluesUnlocked.includes(item.id)).map((item) => item.clue);

  app.innerHTML = `
    <section class="screen summary-screen">
      <div class="summary-header">
        <div>
          <p class="eyebrow">${level.name} concluído</p>
          <h2>${passed ? "Pista liberada!" : "Nível incompleto"}</h2>
        </div>
        <div class="badge-row">
          <span class="badge">${correctCount} de 5 acertos</span>
          <span class="badge">${passed ? "Pode avançar" : "Precisa de 4 acertos"}</span>
        </div>
      </div>
      <div class="summary-main">
        <div class="panel">
          <p class="summary-text">
            ${
              passed
                ? "As crianças resolveram desafios suficientes para descobrir mais uma pista da senha."
                : "Você não desbloqueou a pista deste nível, porque acertou menos de 4 das 5 questões. Mesmo assim, pode tentar novamente ou seguir adiante sem a pista."
            }
          </p>
          <p class="summary-text muted">Acertos neste nível: ${correctCount}/5</p>
        </div>
        <aside class="hint-panel">
          <h3>Pistas liberadas</h3>
          ${clues.length ? `<ol class="hint-list">${clues.map((clue) => `<li>${clue}</li>`).join("")}</ol>` : `<p class="summary-text">Nenhuma pista foi liberada ainda.</p>`}
        </aside>
      </div>
      <div class="footer-actions">
        ${
          passed
            ? `<button class="primary-button" id="next-step" type="button">${state.currentLevel === levels.length - 1 ? "DESAFIO FINAL" : "IR PARA O PRÓXIMO NÍVEL"}</button>`
            : `
              <button class="primary-button" id="retry-level" type="button">TENTAR NOVAMENTE</button>
              <button class="secondary-button" id="skip-level" type="button">${state.currentLevel === levels.length - 1 ? "SEGUIR PARA O DESAFIO FINAL" : "SEGUIR ADIANTE"}</button>
            `
        }
      </div>
    </section>
  `;

  if (passed) {
    const actionButton = document.getElementById("next-step");
    actionButton.addEventListener("click", () => {
      if (state.currentLevel === levels.length - 1) {
        state.screen = "final";
      } else {
        state.currentLevel += 1;
        state.screen = "level";
      }
      render();
    });
    return;
  }

  document.getElementById("retry-level").addEventListener("click", () => {
    resetLevel(level.id);
    state.screen = "level";
    render();
  });

  document.getElementById("skip-level").addEventListener("click", () => {
    if (state.currentLevel === levels.length - 1) {
      state.screen = "final";
    } else {
      state.currentLevel += 1;
      state.screen = "level";
    }
    render();
  });
}

function renderFinalChallenge() {
  const clues = levels.filter((item) => state.cluesUnlocked.includes(item.id)).map((item) => item.clue);

  app.innerHTML = `
    <section class="screen final-screen">
      <div class="panel final-copy">
        <p class="eyebrow">Desafio final</p>
        <h2>Digite a senha que abre a porta</h2>
        <p class="password-help">Use as pistas conquistadas nos níveis para descobrir a palavra secreta.</p>
        <div class="password-boxes">
          <input type="text" maxlength="1" inputmode="text" aria-label="Letra 1" data-index="0">
          <input type="text" maxlength="1" inputmode="text" aria-label="Letra 2" data-index="1">
          <input type="text" maxlength="1" inputmode="text" aria-label="Letra 3" data-index="2">
          <input type="text" maxlength="1" inputmode="text" aria-label="Letra 4" data-index="3">
        </div>
        <p id="password-status" class="status-message"></p>
        <div class="password-actions">
          <button class="primary-button" id="check-password" type="button">ABRIR PORTA</button>
          <button class="secondary-button" id="restart-game" type="button">JOGAR NOVAMENTE</button>
        </div>
      </div>
      <div class="hint-panel">
        <h3>Pistas</h3>
        <ol class="hint-list">${clues.map((clue) => `<li>${clue}</li>`).join("")}</ol>
      </div>
    </section>
  `;

  const inputs = Array.from(document.querySelectorAll(".password-boxes input"));

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  document.getElementById("check-password").addEventListener("click", () => {
    const password = inputs.map((input) => input.value).join("");
    const status = document.getElementById("password-status");

    if (password.length < 4) {
      status.textContent = "Preencha as quatro letras da senha.";
      status.classList.add("error");
      return;
    }

    state.finalStatus = password === "PERA" ? "victory" : "defeat";
    playOneShot(state.finalStatus === "victory" ? "victory" : "defeat");
    renderFinalResult();
  });

  document.getElementById("restart-game").addEventListener("click", () => {
    restartGame();
    render();
  });
}

function renderFinalResult() {
  const result = state.finalStatus === "victory"
    ? {
        title: "PARABÉNS! Você conseguiu escapar da casa abandonada!",
        image: "imagens/vitoria.png",
        alt: "Tela de vitória",
      }
    : {
        title: "Você errou e nunca vai sair daqui!",
        image: "imagens/derrota.png",
        alt: "Tela de derrota",
      };

  app.innerHTML = `
    <section class="screen feedback-screen">
      <div class="panel feedback-copy">
        <p class="eyebrow">${state.finalStatus === "victory" ? "Vitória" : "Derrota"}</p>
        <h2>${result.title}</h2>
        <div class="feedback-actions">
          <button class="primary-button" id="play-again" type="button">JOGAR NOVAMENTE</button>
        </div>
      </div>
      <div class="image-panel">
        <img src="${result.image}" alt="${result.alt}">
      </div>
    </section>
  `;

  document.getElementById("play-again").addEventListener("click", () => {
    restartGame();
    render();
  });
}

fullscreenButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      fullscreenButton.textContent = "Sair da tela cheia";
    } else {
      await document.exitFullscreen();
      fullscreenButton.textContent = "Tela cheia";
    }
  } catch (_) {
    fullscreenButton.textContent = "Tela cheia";
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent = document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia";
});

soundButton.addEventListener("click", () => {
  setMuted(!state.isMuted);
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  updateInstallButton();
});

installButton.addEventListener("click", async () => {
  if (!state.installPrompt) {
    return;
  }

  state.installPrompt.prompt();
  await state.installPrompt.userChoice.catch(() => {});
  state.installPrompt = null;
  updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  state.installPrompt = null;
  updateInstallButton();
});

registerServiceWorker();
updateSoundButton();
updateInstallButton();
render();
