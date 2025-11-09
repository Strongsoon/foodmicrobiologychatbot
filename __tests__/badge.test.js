const {
    typeWriterEffect,
    getBadge,
    getCurrentPhrase,
    getCharIndex,
    setGlobals
} = require('../chatbot-script.js');

//so this is the group of tests for the badge typing animation thing..
describe('Chatbot Badge Typing Animation', () => {
    let badge;
    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = `<div id="chatbot_badge"></div>`;
        badge = document.getElementById('chatbot_badge');
        const mockPhrases = [
            'Take a quiz..',
            'Contact us',
            'Ask us..',
            'Blog search',
            'Need help?'
        ];
        setGlobals(badge, mockPhrases);
    });
    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });




    //this one checks if it types a phrase letter by letter like 1 char per 100ms..
    test('should type one phrase character by character', () => {
        typeWriterEffect();
        for (let i = 0; i < 5; i++) {
            jest.advanceTimersByTime(100);
        }
        expect(getBadge().textContent.length).toBe(6);
        expect(getCurrentPhrase()).toBe(0);
    });





    //this one checks if it finishes typing and moves to next phrase after 2 secs..
    test('should reset and go to next phrase after full phrase is typed', () => {
        const phrase = 'Take a quiz..';
        typeWriterEffect();
        for (let i = 0; i < phrase.length; i++) {
            jest.advanceTimersByTime(100);
        }
        jest.advanceTimersByTime(2000);
        expect(getCurrentPhrase()).toBe(1);
        expect(getBadge().textContent).toBe('C');
    });
});
