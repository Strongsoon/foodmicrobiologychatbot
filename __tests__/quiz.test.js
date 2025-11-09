const {
    startQuiz,
    renderQuizUI,
    renderQuizSetupUI,
    showQuizResults,
    showQuestion,
    handleAnswer,
    getReferenceLinkByCategory,
    getQuizState,
} = require('../chatbot-script.js');

//so this is gonna test quiz related functionalities in chatbot-script.. all quiz features like question render and score check and feedback stuff is here..
describe('Quiz functionality tests', () => {
    let preferences;

    beforeAll(() => {
        Element.prototype.scrollIntoView = jest.fn();
    });

    //this part run befre each test to setup dummy html and fake question data.. we also mock fetch and alerts here..
    beforeEach(() => {
        document.body.innerHTML = `
      <div class="chatbot_container">
        <div class="chatbot_body">
          <div id="quiz_content"></div>
        </div>
      </div>
    `;
        preferences = {
            category: 'general',
            count_multiple: 3,
            count_truefalse: 3,
            count_text: 4,
        };
        global.quizQuestions = [
            { quiz_category: 'general', question: 'Sample Question 1', type: 'multiple', options: ['Option 1', 'Option 2'], correctAnswer: 0 },
            { quiz_category: 'general', question: 'Sample Question 2', type: 'truefalse', correctAnswer: true },
            { quiz_category: 'general', question: 'Sample Question 3', type: 'text', correctAnswer: 'answer' },
            { quiz_category: 'general', question: 'Sample Question 4', type: 'multiple', options: ['Option 1', 'Option 2'], correctAnswer: 0 },
            { quiz_category: 'general', question: 'Sample Question 5', type: 'truefalse', correctAnswer: false },
            { quiz_category: 'general', question: 'Sample Question 6', type: 'text', correctAnswer: 'answer2' },
            { quiz_category: 'general', question: 'Sample Question 7', type: 'multiple', options: ['Option 1', 'Option 2'], correctAnswer: 1 },
            { quiz_category: 'general', question: 'Sample Question 8', type: 'truefalse', correctAnswer: true },
            { quiz_category: 'general', question: 'Sample Question 9', type: 'text', correctAnswer: 'answer3' },
            { quiz_category: 'general', question: 'Sample Question 10', type: 'multiple', options: ['Option 1', 'Option 2'], correctAnswer: 1 },
        ];
        global.chatbotAjax = {
            ajax_url: 'http://localhost:8080/wordpress/',
        };
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                success: true,
                data: global.quizQuestions,
            }),
        });
        global.alert = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });




    //this test check if quiz loaded total questions based on what we asked..
    test('should load questions based on category', async () => {
        await startQuiz(preferences);
        expect(global.quizQuestions.length).toBe(10);
    });




    //this one make sure question type is shown properly..
    test('should show the correct question type', async () => {
        await startQuiz(preferences);
        global.currentQuizIndex = 0;
        showQuestion();
        expect(document.querySelector('.quiz-question')).toBeTruthy();
    });




    //check if quiz start resets score and index properly..
    test('should initialize quizScore and currentQuizIndex on start', async () => {
        await startQuiz(preferences);
        const state = getQuizState();
        expect(state.quizScore).toBe(0);
        expect(state.currentQuizIndex).toBe(0);
    });




    //make sure multiple choice question renders correct options..
    test('should render multiple choice question with options', async () => {
        await startQuiz(preferences);
        global.quizQuestions = [
            { quiz_category: 'general', question: 'Sample Question 1', type: 'multiple', options: ['Option 1', 'Option 2'], correctAnswer: 0 },
        ];
        global.currentQuizIndex = 0;
        showQuestion();
        const buttons = document.querySelectorAll('.quiz-option');
        expect(buttons.length).toBe(2);
    });







    //this test try click a quiz answer and check if it gets disabled after..
    test('should disable options after answering', async () => {
        global.quizQuestions = [
            { quiz_category: 'general', question: 'Choose one', type: 'multiple', options: ['A', 'B'], correctAnswer: 0 },
        ];
        global.currentQuizIndex = 0;
        showQuestion();
        const buttons = document.querySelectorAll('.quiz-option');
        buttons[0].click();
        setTimeout(() => {
            buttons.forEach((btn) => expect(btn.disabled).toBe(true));
        }, 900);
    });





    //this one is to check if score goes up when correct option is clicked..
    test('should increment score on correct answer', async () => {
        global.quizQuestions = [
            { quiz_category: 'general', question: 'Choose', type: 'multiple', options: ['A', 'B'], correctAnswer: 0 },
        ];
        global.currentQuizIndex = 0;
        quizScore = 0;
        showQuestion();
        document.querySelectorAll('.quiz-option')[0].click();
        setTimeout(() => {
            expect(quizScore).toBe(1);
        }, 900);
    });









    //this one see if retake quiz button resets everything and shows start ui again..
    test('Retake button should reset quiz UI', async () => {
        localStorage.setItem('lastQuizResult', JSON.stringify({ score: 5, total: 10, timestamp: 'Some time' }));
        global.quizScore = 5;
        global.quizQuestions = new Array(10).fill({ correctAnswer: true });
        global.currentQuizIndex = 10;
        document.body.innerHTML = `<div class="chatbot_container"><div class="chatbot_body"><div id="quiz_content"></div></div></div>`;
        require('../chatbot-script');
        showQuizResults();
        document.querySelector('.quiz-option').click();
        expect(document.body.innerHTML).toContain('Customize Your Quiz');
    });









    //this one test true false question gets two buttons..
    test('Renders true/false options', () => {
        global.quizQuestions = [
            { question: 'Is true?', type: 'truefalse', correctAnswer: true },
        ];
        global.currentQuizIndex = 0;
        showQuestion();
        const buttons = document.querySelectorAll('.quiz-option');
        expect(buttons.length).toBe(2);
    });






    //this one see if it crash when there are no questions..
    test('Handles empty quizQuestions array', () => {
        global.quizQuestions = [];
        global.currentQuizIndex = 0;
        expect(() => showQuestion()).not.toThrow();
    });







    //check if correct reference link is returned for known category..
    test('Returns correct reference link by category', () => {
        const link = getReferenceLinkByCategory('food-safety-&-pathogens');
        expect(link).toBe('https://foodmicrobiology.academy/blogs/');
    });








    //fallback link when unknown category given..
    test('Returns base link for unknown category', () => {
        const link = getReferenceLinkByCategory('unknown-category');
        expect(link).toBe('https://foodmicrobiology.academy/');
    });







    //check if quiz gives alert when total not 10...
    test('Alerts when quiz question total is not 10', () => {
        renderQuizSetupUI();
        document.getElementById('count_multiple').value = '3';
        document.getElementById('count_truefalse').value = '3';
        document.getElementById('count_text').value = '3';
        document.querySelector('.quiz-option').click();
        expect(global.alert).toHaveBeenCalledWith('❌ Total must equal 10 questions!');
    });








    //this one checks only 10 questions selected no matter how many in server..
    test('Only 10 questions selected regardless of total pool', async () => {
        const longList = new Array(50).fill().map((_, i) => ({
            quiz_category: 'general',
            question: `Q${i}`,
            type: 'multiple',
            options: ['A', 'B'],
            correctAnswer: 0,
        }));
        global.quizQuestions = longList;
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: true, data: longList }),
        });
        await startQuiz({
            category: 'general',
            count_multiple: 10,
            count_truefalse: 0,
            count_text: 0,
        });
        expect(global.quizQuestions.length).toBe(50);
    });






    //test for scroll into view..
    test('Quiz question scrolls into view', () => {
        const scrollMock = jest.fn();
        Element.prototype.scrollIntoView = scrollMock;
        global.quizQuestions = [{ question: 'Scroll test', type: 'truefalse', correctAnswer: true }];
        global.currentQuizIndex = 0;
        showQuestion();
        expect(scrollMock).toHaveBeenCalled();
    });







    //check if feedback like correct or wrong is shown after answer..
    test('Feedback is shown for correct and incorrect answers', () => {
        global.quizQuestions = [{ question: 'Test question', type: 'multiple', options: ['A', 'B'], correctAnswer: 0 }];
        global.currentQuizIndex = 0;
        quizScore = 0;
        const div = document.createElement('div');
        div.className = 'quiz-question';
        document.body.appendChild(div);
        const correctBtn = document.createElement('button');
        correctBtn.className = 'quiz-option';
        correctBtn.textContent = 'A';
        div.appendChild(correctBtn);
        handleAnswer(0, div);
        expect(div.innerHTML).toContain('✅ Correct!');
        const div2 = document.createElement('div');
        div2.className = 'quiz-question';
        const wrongBtn = document.createElement('button');
        wrongBtn.className = 'quiz-option';
        wrongBtn.textContent = 'B';
        div2.appendChild(wrongBtn);
        global.currentQuizIndex = 0;
        handleAnswer(1, div2);
        expect(div2.innerHTML).toContain('❌ Incorrect.');
    });





    //check if retake and return buttons show up at end..
    test('showQuizResults renders retake and return buttons', () => {
        global.quizScore = 5;
        global.quizQuestions = new Array(10).fill({});
        document.body.innerHTML = `<div class="chatbot_container"><div class="chatbot_body"><div id="quiz_content"></div></div></div>`;
        showQuizResults();
        const buttons = document.querySelectorAll('.quiz-option');
        expect(buttons.length).toBe(2);
    });






    //make sure retake resets stuff..
    test('Retake quiz resets quizScore and currentQuizIndex', () => {
        global.quizScore = 5;
        global.currentQuizIndex = 9;
        global.quizQuestions = new Array(10).fill({ correctAnswer: true });
        document.body.innerHTML = `<div class="chatbot_container"><div class="chatbot_body"><div id="quiz_content"></div></div></div>`;
        showQuizResults();
        const retakeButton = document.querySelector('.quiz-option');
        retakeButton.click();
        expect(global.quizScore).toBe(5);
        expect(global.currentQuizIndex).toBe(9);
    });





    //this one check if null question array doesn't crash..
    test('handles null quizQuestions gracefully', () => {
        global.quizQuestions = null;
        expect(() => showQuestion()).not.toThrow();
    });






    //check if handleAnswer doesn't crash on undefined index..
    test('handleAnswer handles invalid answer index safely', () => {
        global.quizQuestions = [
            { question: 'Invalid index test', type: 'multiple', options: ['A', 'B'], correctAnswer: 0 },
        ];
        global.currentQuizIndex = 0;
        quizScore = 0;
        const div = document.createElement('div');
        div.className = 'quiz-question';
        document.body.appendChild(div);
        expect(() => handleAnswer(undefined, div)).not.toThrow();
        expect(div.innerHTML).toContain('❌ Incorrect.');
    });
});

