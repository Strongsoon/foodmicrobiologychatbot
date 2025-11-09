const { sendFeedback} = require('../chatbot-script');

//makin a tiny delay to wait for promises to flush in async tests..
const flushPromises = () => new Promise((resolve) => process.nextTick(resolve));

//testin the sendfeedback function directly to see if fetch gets called properly and logs stuff right..
describe('sendFeedback', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        global.console.log = jest.fn();
        global.console.error = jest.fn();
        global.chatbotAjax = {
            ajax_url: 'http://localhost:8080/wordpress/',
        };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });




    //checkin if it logs success when backend says ok..
    test('should send feedback and log success', async () => {
        const mockResponse = { success: true };
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse),
        });
        await sendFeedback('Yes', 'positive');
        await flushPromises();
        expect(console.log).toHaveBeenCalledWith('Feedback saved successfully');
    });




    //see if it logs error when backend rejects input..
    test('should log error when server responds with failure', async () => {
        const mockResponse = { success: false, message: 'Invalid input' };
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse),
        });
        await sendFeedback('No', 'negative');
        await flushPromises();
        expect(console.error).toHaveBeenCalledWith('Failed to save feedback:', 'Invalid input');
    });




    //testing if it catches network crash and logs it nicely..
    test('should catch and log network error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network down'));
        await sendFeedback('Maybe', 'neutral');
        await flushPromises();
        expect(console.error).toHaveBeenCalledWith('Error sending feedback:', expect.any(Error));
    });
});








//testin manual feedback button interactions without auto qna.. like if user clicks thumbs manually..
describe('Dynamic Feedback Buttons Interaction (without fetchQandA)', () => {
    let sendFeedbackSpy;
    let chatbotScript;
    beforeEach(() => {
        document.body.innerHTML = `<div class="chatbot_body"></div>`;
        chatbotScript = require('../chatbot-script.js');
        sendFeedbackSpy = jest.spyOn(chatbotScript, 'sendFeedback').mockImplementation(() => Promise.resolve());
        global.addMessageToChat = jest.fn();
        global.displayFollowUpMessage = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });


    //checking if thumbs up button works and sends correct flow..
    test('manually appends thumbs up and triggers correct feedback flow', async () => {
        const answer = 'Helpful content';
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'chatbot_button_container';
        const thumbsUp = document.createElement('button');
        thumbsUp.textContent = '👍';
        thumbsUp.id = 'thumbs_up';
        thumbsUp.classList.add('feedback-btn');
        const thumbsDown = document.createElement('button');
        thumbsDown.textContent = '👎';
        thumbsDown.id = 'thumbs_down';
        thumbsDown.classList.add('feedback-btn');
        buttonContainer.appendChild(thumbsUp);
        buttonContainer.appendChild(thumbsDown);
        document.querySelector('.chatbot_body').appendChild(buttonContainer);
        thumbsUp.addEventListener('click', () => {
            chatbotScript.sendFeedback(answer, 'helpful');
            addMessageToChat("Thank you for your feedback 😄", false);
            displayFollowUpMessage();
            buttonContainer.remove();
        });
        thumbsUp.click();
        expect(sendFeedbackSpy).toHaveBeenCalledWith(answer, 'helpful');
        expect(addMessageToChat).toHaveBeenCalledWith("Thank you for your feedback 😄", false);
        expect(displayFollowUpMessage).toHaveBeenCalled();
        expect(document.getElementById('chatbot_button_container')).toBeNull();
    });








    //checkin if thumbs down button works and triggers correct logic..
    test('manually appends thumbs down and triggers correct feedback flow', async () => {
        const answer = 'Confusing reply';
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'chatbot_button_container';
        const thumbsUp = document.createElement('button');
        thumbsUp.textContent = '👍';
        thumbsUp.id = 'thumbs_up';
        thumbsUp.classList.add('feedback-btn');
        const thumbsDown = document.createElement('button');
        thumbsDown.textContent = '👎';
        thumbsDown.id = 'thumbs_down';
        thumbsDown.classList.add('feedback-btn');
        buttonContainer.appendChild(thumbsUp);
        buttonContainer.appendChild(thumbsDown);
        document.querySelector('.chatbot_body').appendChild(buttonContainer);
        thumbsDown.addEventListener('click', () => {
            chatbotScript.sendFeedback(answer, 'not_helpful');
            addMessageToChat("Thank you for your feedback 😄", false);
            displayFollowUpMessage();
            buttonContainer.remove();
        });
        thumbsDown.click();
        expect(sendFeedbackSpy).toHaveBeenCalledWith(answer, 'not_helpful');
        expect(addMessageToChat).toHaveBeenCalledWith("Thank you for your feedback 😄", false);
        expect(displayFollowUpMessage).toHaveBeenCalled();
        expect(document.getElementById('chatbot_button_container')).toBeNull();
    });
});
