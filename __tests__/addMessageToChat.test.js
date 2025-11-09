const {
    appendMessage,
    addMessageToChat
} = require('../chatbot-script.js');

//so this group of tests is for appendMessage and addMessageToChat together..
describe('addMessageToChat and appendMessage', () => {
    //setting up fake html befre each test.. like resetting the chatbot dom..
    beforeEach(() => {
        document.body.innerHTML = `
      <div class="chatbot_container">
        <div class="chatbot_body"></div>
      </div>
      <div class="blog_search_container">
        <div class="search_message"></div>
      </div>
    `;//mocking saveMessageToLocalStorage so it dont actually try save anything..
        global.saveMessageToLocalStorage = jest.fn();
    });




    // this test is for search messages.. and it adds to .search_message box..
    test('appends search message directly', () => {
        addMessageToChat('Search result', true, true);
        const searchBox = document.querySelector('.search_message');
        expect(searchBox.textContent).toContain('Search result');
    });




    //this one checks if chatbot message appears with animation n all.. and runs callback after..
    test('appends chatbot message with typing animation and callback', (done) => {
        const callback = jest.fn(() => {
            expect(document.querySelector('.chatbot_body').textContent).toContain('Bot reply');
            expect(callback).toHaveBeenCalled();
            done();
        });
        addMessageToChat('Bot reply', false, false, false, callback);
    });





    //testing if image link shows actual image.. like <img> and src should be there..
    test('appends image when URL is present', () => {
        const container = document.querySelector('.chatbot_body');
        appendMessage('Here is an image: https://example.com/image.jpg', false, container);
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.src).toContain('https://example.com/image.jpg');
    });





    //this one tests if youtube links show video frame.. like an iframe..
    test('embeds YouTube video correctly', () => {
        const container = document.querySelector('.chatbot_body');
        appendMessage('Watch this: https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, container);
        const iframe = container.querySelector('iframe');
        expect(iframe).not.toBeNull();
        expect(iframe.src).toContain('youtube.com/embed');
    });




    //so this one is just for normal links.. like should be clickable anchor tag..
    test('renders normal link if URL is not a media file', () => {
        const container = document.querySelector('.chatbot_body');
        appendMessage('Visit: https://example.com/page', false, container);
        const anchor = container.querySelector('a');
        expect(anchor).not.toBeNull();
        expect(anchor.href).toBe('https://example.com/page');
    });




    //this last one is forplain  text.. no links no media just plain message..
    test('appends plain text with no URLs', () => {
        const container = document.querySelector('.chatbot_body');
        appendMessage('Just a plain message.', false, container);
        expect(container.textContent).toContain('Just a plain message.');
    });
});
