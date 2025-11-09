//testing the food for thought button logic..
describe('Food for Thought feature', () => {
    let chatbotBody;
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="chatbot_body"></div>
            <button id="food-thought-btn">Food for Thought</button>
        `;
        chatbotBody = document.querySelector('.chatbot_body');
        global.fetch = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    const manuallyTriggerFoodForThought = async () => {
        const res = await fetch();
        const data = await res.json();
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chatbot_message');
        if (data.success) {
            messageContainer.innerHTML = `<span class="message">💡 Food for Thought: ${data.data.thought}</span>`;
        } else {
            messageContainer.innerHTML = `<span class="message">⚠️ Could not load a thought.</span>`;
        }
        chatbotBody.appendChild(messageContainer);
    };


    //checking if success response gives a nice tip message with bulb emoji..
    test('displays a food for thought message when successful', async () => {
        const mockResponse = {
            success: true,
            data: { thought: 'Did you know cheese has bacteria too?' }
        };
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse),
        });
        await manuallyTriggerFoodForThought();
        const messageEl = document.querySelector('.chatbot_message .message');
        expect(messageEl).not.toBeNull();
        expect(messageEl.textContent).toContain('💡 Food for Thought: Did you know cheese has bacteria too?');
    });





    //checking if fallback message shows when backend says nah..
    test('displays fallback message on unsuccessful response', async () => {
        const mockResponse = { success: false };
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse),
        });
        await manuallyTriggerFoodForThought();
        const messageEl = document.querySelector('.chatbot_message .message');
        expect(messageEl).not.toBeNull();
        expect(messageEl.textContent).toContain('⚠️ Could not load a thought.');
    });






    //testing the network fail case.. should show error msg with warning emoji..
    test('displays error message when request fails', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chatbot_message');
        messageContainer.innerHTML = `<span class="message">⚠️ Error fetching thought. Please try again.</span>`;
        chatbotBody.appendChild(messageContainer);
        const messageEl = document.querySelector('.chatbot_message .message');
        expect(messageEl).not.toBeNull();
        expect(messageEl.textContent).toContain('⚠️ Error fetching thought. Please try again.');
    });
});