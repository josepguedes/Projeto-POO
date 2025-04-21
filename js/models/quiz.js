class Quiz {
    constructor() {
        this.currentQuestion = 0;
        this.questions = [];
        this.userAnswers = [];
        this.finalScores = {};
        this.answersContainer = document.getElementById('answers-container');
        
        this.init();
    }

    async init() {
        try {
            const response = await fetch('../js/data/quiz.json');
            if (!response.ok) throw new Error('Ficheiro não encontrado');
            const data = await response.json();
            this.questions = data.questions;
            this.userAnswers = new Array(this.questions.length).fill(null);
            this.listarPergunta();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar o questionário');
        }
    }

    listarPergunta() {
        const pergunta = this.questions[this.currentQuestion];
        document.querySelector('.question-text').textContent = pergunta.text;
        this.listarAnswers(pergunta);
        this.updtProgressBar();
        this.toggleNavButtons();
    }

    listarAnswers(pergunta) {
        this.answersContainer.innerHTML = pergunta.answers.map((answer, index) => `
            <div class="col-md-6 mb-3">
                <button class="answer-btn btn btn-outline-danger w-100 py-3 
                    ${this.userAnswers[this.currentQuestion] === index ? 'selected' : ''}" 
                    data-index="${index}">
                    ${answer.text}
                </button>
            </div>
        `).join('');

        this.addAnswerListeners();
    }

    addAnswerListeners() {
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {

                this.answersContainer.querySelectorAll('.answer-btn').forEach(b => {
                    b.classList.remove('selected');
                });
                
                const selectedIndex = parseInt(e.currentTarget.dataset.index);
                e.currentTarget.classList.add('selected');
                this.userAnswers[this.currentQuestion] = selectedIndex;
            });
        });
    }

    calcularScore() {
        this.finalScores = {
            Balnear: 0,
            Cultural: 0,
            Religioso: 0,
            Gastronómico: 0,
            Rural: 0,
            Aventura: 0
        };

        this.userAnswers.forEach((answerIndex, questionIndex) => {
            if (answerIndex !== null) {
                const answer = this.questions[questionIndex].answers[answerIndex];
                Object.entries(answer.scores).forEach(([type, value]) => {
                    this.finalScores[type] += value;
                });
            }
        });
    }

    gerirNavegacao(direcao) {
        if (direcao === 'next') {
            if (this.userAnswers[this.currentQuestion] === null) {
                alert('Seleciona uma resposta antes de continuar.');
                return;
            }
            
            if (this.currentQuestion < this.questions.length - 1) {
                this.currentQuestion++;
                this.listarPergunta();
            } else {
                this.calcularScore();
                this.mostrarResultados();
            }
        } else {
            if (this.currentQuestion > 0) {
                this.currentQuestion--;
                this.listarPergunta();
            }
        }
    }

    updtProgressBar() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `Pergunta ${this.currentQuestion + 1} de ${this.questions.length}`;
    }

    toggleNavButtons() {
        document.getElementById('prev-btn').disabled = this.currentQuestion === 0;
        document.getElementById('next-btn').textContent = 
            this.currentQuestion === this.questions.length - 1 ? 'Ver Resultados' : 'Próximo';
    }

    mostrarResultados() {
        document.getElementById('quiz-container').classList.add('d-none');
        document.getElementById('results-container').classList.remove('d-none');
        
        const sortedScores = Object.entries(this.finalScores)
            .sort((a, b) => b[1] - a[1]);

        document.getElementById('scores-container').innerHTML = sortedScores
            .map(([type, score]) => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-danger">
                        <div class="card-body text-center">
                            <h5 class="card-title">${type}</h5>
                            <div class="display-4 text-danger">${score}</div>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    setupEventListeners() {
        document.getElementById('next-btn').addEventListener('click', () => this.gerirNavegacao('next'));
        document.getElementById('prev-btn').addEventListener('click', () => this.gerirNavegacao('prev'));
    }
}

document.addEventListener('DOMContentLoaded', () => new Quiz());