class TypingTest {
  constructor() {
    // Core properties
    this.words = [];
    this.currentWordIndex = 0;
    this.currentInput = "";
    this.isActive = false;
    this.timeLeft = 30;
    this.initialTime = 30; // Store initial time setting
    this.correctChars = 0;
    this.totalChars = 0;
    this.mode = "motivational"; // Default mode
    this.canEditPrevious = true;
    this.currentText = "";

    // Data storage
    this.data = {
      islamic_quotes: [], // Your Islamic quotes will go here
      programming_practice: [], // Your programming exercises will go here
      motivational_quotes: [], // Your motivational quotes will go here
    };

    // Initialize
    this.initElements();
    this.loadData();
    this.bindEvents();
  }

  async loadData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json();

      data.forEach((collection) => {
        switch (collection.database) {
          case "islamic_quotes":
            this.data.islamic_quotes = collection.documents;
            break;
          case "programming_practice":
            this.data.programming_practice = collection.documents;
            break;
          case "motivational_quotes":
            this.data.motivational_quotes = collection.documents;
            break;
        }
      });

      this.initWords();
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  initElements() {
    this.wordsElement = document.getElementById("words");
    this.wordsElement.setAttribute('inputmode', 'text');
    this.wordsElement.setAttribute('contenteditable', 'true');
    // Add these lines for auto-focus
    this.wordsElement.focus();
    document.addEventListener('click', () => this.wordsElement.focus());
    
    this.wpmElement = document.getElementById("wpm");
    this.accuracyElement = document.getElementById("accuracy");
    this.timerElement = document.getElementById("timer");
    this.restartButton = document.getElementById("restart");
    this.resultModal = document.getElementById("resultModal");
    this.overlay = document.getElementById("overlay");
  }


  initWords() {
    let content;
    switch (this.mode) {
      case "islamic":
        const randomHadith = this.getRandomItem(this.data.islamic_quotes);
        content = randomHadith?.hadith || "";
        break;
      case "programming":
        const randomExercise = this.getRandomItem(
          this.data.programming_practice
        );
        content = randomExercise?.text || "";
        break;
      case "motivational":
        const randomQuote = this.getRandomItem(this.data.motivational_quotes);
        content = randomQuote?.quote || "";
        break;
    }

    this.currentText = content;
    this.words = content.split(" ");
    this.renderWords();
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  renderWords() {
    this.wordsElement.innerHTML = "";
    this.words.forEach((word, wordIndex) => {
      const wordElement = document.createElement("div");
      wordElement.className = `word ${
        wordIndex === this.currentWordIndex ? "active" : ""
      }`;

      if (wordIndex < this.currentWordIndex) {
        wordElement.classList.add("completed");
        if (this.canEditPrevious) {
          wordElement.classList.add("editable");
        }
      }

      [...word].forEach((letter, letterIndex) => {
        const letterElement = document.createElement("span");
        letterElement.className = "letter";
        letterElement.textContent = letter;

        if (wordIndex === this.currentWordIndex) {
          if (letterIndex < this.currentInput.length) {
            const inputLetter = this.currentInput[letterIndex] || "";
            const isCorrect = letter === inputLetter;
            letterElement.classList.add(isCorrect ? "correct" : "incorrect");
          }
          if (letterIndex === this.currentInput.length) {
            letterElement.classList.add("current");
          }
        }

        wordElement.appendChild(letterElement);
      });

      // Add extra incorrect characters if input is longer than word
      if (
        wordIndex === this.currentWordIndex &&
        this.currentInput.length > word.length
      ) {
        for (let i = word.length; i < this.currentInput.length; i++) {
          const extraElement = document.createElement("span");
          extraElement.className = "letter incorrect";
          extraElement.textContent = this.currentInput[i];
          wordElement.appendChild(extraElement);
        }
      }

      this.wordsElement.appendChild(wordElement);
    });

    // Scroll into view if needed
    const activeWord = this.wordsElement.children[this.currentWordIndex];
    if (activeWord) {
      const container = this.wordsElement;
      const scrollAmount = activeWord.offsetTop - container.scrollTop;
      if (scrollAmount < 0 || scrollAmount > container.clientHeight - 50) {
        container.scrollTop = activeWord.offsetTop - 50;
      }
    }
  }

  handleInput(key) {
    if (!this.isActive) {
      this.startTest();
    }

    const currentWord = this.words[this.currentWordIndex];

    // Handle single quote specially
    if (key === "'") {
      this.currentInput += key;
      this.renderWords();
      this.updateStats();
      return;
    }

    if (key === " ") {
      // If current word is completed correctly
      if (this.currentInput === currentWord) {
        this.checkWord();
      } else {
        // Only add one space and prevent multiple spaces
        if (!this.currentInput.endsWith(" ")) {
          this.currentInput += " ";
          this.renderWords();
        }
      }
    } else if (key === "Backspace") {
      if (
        this.currentInput.length === 0 &&
        this.currentWordIndex > 0 &&
        this.canEditPrevious
      ) {
        this.currentWordIndex--;
        this.currentInput = this.words[this.currentWordIndex];
        this.correctChars -= this.currentInput.length;
        this.totalChars -= this.currentInput.length;
      } else {
        this.currentInput = this.currentInput.slice(0, -1);
      }
      this.renderWords();
    } else if (key.length === 1) {
      this.currentInput += key;

      // Auto-progress to next word if current word is completed correctly
      if (this.currentInput === currentWord + " ") {
        this.checkWord();
        return;
      }
      this.renderWords();
    }

    this.updateStats();
  }

  checkWord() {
    const currentWord = this.words[this.currentWordIndex];
    const trimmedInput = this.currentInput.trim();

    if (trimmedInput === currentWord) {
      this.correctChars += currentWord.length;
    }
    this.totalChars += currentWord.length;

    this.currentWordIndex++;
    this.currentInput = "";

    if (this.currentWordIndex >= this.words.length) {
      this.endTest();
    }

    this.renderWords();
    this.updateStats();
  }

  updateStats() {
    const timeElapsed = (this.initialTime - this.timeLeft) / 60; // Convert to minutes
    const wpm = Math.round(this.correctChars / 5 / timeElapsed) || 0;
    const accuracy =
      Math.round((this.correctChars / this.totalChars) * 100) || 100;

    this.wpmElement.textContent = wpm;
    this.accuracyElement.textContent = accuracy;
  }

  startTest() {
    this.isActive = true;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.timerElement.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.endTest();
      }
    }, 1000);
  }

  endTest() {
    clearInterval(this.timerInterval);
    this.isActive = false;
    this.showResults();
  }

  showResults() {
    document.getElementById("finalWpm").textContent =
      this.wpmElement.textContent;
    document.getElementById("finalAccuracy").textContent =
      this.accuracyElement.textContent + "%";
    document.getElementById("finalChars").textContent = this.correctChars;
    document.getElementById("finalTime").textContent = this.initialTime + "s";

    this.resultModal.classList.add("active");
    this.overlay.classList.add("active");
  }

  setMode(mode) {
    this.mode = mode;
    document.getElementById("modeSelect").textContent = `Mode: ${
      mode.charAt(0).toUpperCase() + mode.slice(1)
    }`;
    this.restart();
  }

  restart() {
    this.currentWordIndex = 0;
    this.currentInput = "";
    this.isActive = false;
    this.timeLeft = this.initialTime; // Use stored initial time
    this.correctChars = 0;
    this.totalChars = 0;

    clearInterval(this.timerInterval);
    this.timerElement.textContent = this.timeLeft;
    this.wpmElement.textContent = "0";
    this.accuracyElement.textContent = "100";

    this.resultModal.classList.remove("active");
    this.overlay.classList.remove("active");

    this.initWords();
  }

  bindEvents() {
    document.addEventListener("keydown", (e) => {
        // Add Enter key handler for reset
        if (e.key === "Enter" && this.resultModal.classList.contains("active")) {
            this.restart();
            return;
        }

        // Existing keydown logic
        if (e.ctrlKey || e.altKey) return;
        if (e.key === " ") e.preventDefault();
        if (this.timeLeft > 0) {
            this.handleInput(e.key);
        }
    });

    this.restartButton.addEventListener("click", () => this.restart());

    // Theme handling
    document.querySelectorAll(".theme-option").forEach((option) => {
        option.addEventListener("click", (e) => {
            const theme = e.target.dataset.theme;
            document.body.className = `theme-${theme}`;
        });
    });

    // Mode selection handling
    document.querySelectorAll(".mode-option").forEach((option) => {
        option.addEventListener("click", (e) => {
            const mode = e.target.dataset.mode;
            this.setMode(mode);
        });
    });

    // Time selection
    document.getElementById("timeSelect").addEventListener("click", () => {
        const times = [30, 60, 120];
        const currentIndex = times.indexOf(this.timeLeft);
        this.timeLeft = times[(currentIndex + 1) % times.length];
        this.initialTime = this.timeLeft; // Update initial time
        this.timerElement.textContent = this.timeLeft;
        document.getElementById(
            "timeSelect"
        ).textContent = `Time: ${this.timeLeft}s`;
    });
  }
}

// Initialize the typing test
const typingTest = new TypingTest();
