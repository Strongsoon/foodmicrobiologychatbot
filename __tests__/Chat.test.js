jest.mock('../chatbot-script', () => {
    const actual = jest.requireActual('../chatbot-script');
    return {
        ...actual,
        addMessageToChat: jest.fn(),
    };
});

//getting saveMessage and clearChat from script.. gonna test them here..
const {
    saveMessageToLocalStorage,
    clearChat,
} = require('../chatbot-script');




//group of tests for localstorage save and clear stuff..
describe('Chatbot Storage Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
    <div class="chatbot_container">
      <div class="chatbot_body"></div>
    </div>
    <div class="blog_search_container">
      <div class="search_message"></div>
    </div>
    <button id="clearChatBtn">Clear Chat</button>
  `;
        localStorage.clear();
        jest.clearAllMocks();
    });



    //test to see if saving user msg actually stores it..
    test('saveMessageToLocalStorage stores a user message correctly', () => {
        saveMessageToLocalStorage('Hi there!', true, false);
        const stored = JSON.parse(localStorage.getItem('chat_main_history'));
        expect(stored).toHaveLength(1);
        expect(stored[0].message).toBe('Hi there!');
        expect(stored[0].isUser).toBe(true);
    });




    //test to see if new messages get added not overwritten..
    test('saveMessageToLocalStorage appends messages to existing history', () => {
        saveMessageToLocalStorage('First message', true, false);
        saveMessageToLocalStorage('Second message', false, false);
        const stored = JSON.parse(localStorage.getItem('chat_main_history'));
        expect(stored).toHaveLength(2);
        expect(stored[0].message).toBe('First message');
        expect(stored[1].message).toBe('Second message');
    });




    //testing if it stores to the right place when it's a search msg..
    test('saveMessageToLocalStorage uses correct key for search message', () => {
        saveMessageToLocalStorage('Search result', false, true);
        const stored = JSON.parse(localStorage.getItem('chat_search_history'));
        expect(stored).toHaveLength(1);
        expect(stored[0].isSearch).toBe(true);
    });




    //checking if clearChat clears localStorage stuff and not crash..
    test('clearChat clears localStorage only', () => {
        const chatBody = document.querySelector('.chatbot_body');
        chatBody.innerHTML = '<div class="user_message">Old</div>';
        localStorage.setItem('chat_main_history', '[{"message":"Hi"}]');
        localStorage.setItem('chat_search_history', '[{"message":"Search"}]');
        clearChat();
        expect(localStorage.getItem('chat_main_history')).toBeNull();
        expect(localStorage.getItem('chat_search_history')).toBeNull();
    });




    //check if clearing empty chat div doesn't break things..
    test('clearChat does not throw error if chat body is already empty', () => {
        const chatBody = document.querySelector('.chatbot_body');
        chatBody.innerHTML = '';
        expect(() => clearChat()).not.toThrow();
        expect(localStorage.getItem('chat_main_history')).toBeNull();
        expect(localStorage.getItem('chat_search_history')).toBeNull();
    });





    //making sure we get a timestamp on each saved msg...
    test('saveMessageToLocalStorage adds a timestamp', () => {
        saveMessageToLocalStorage('Check timestamp', true, false);
        const stored = JSON.parse(localStorage.getItem('chat_main_history'));
        expect(stored[0]).toHaveProperty('timestamp');
        expect(typeof stored[0].timestamp).toBe('number');
    });
});
