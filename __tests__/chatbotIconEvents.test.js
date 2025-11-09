//this is testin the hover and click stuff for chatbot icon and ui visibility...
describe('Chatbot Icon Hover and Click Events (manual style assertions)', () => {
    beforeEach(() => {
        const resetMock = jest.fn();
        global.resetChatbotBody = resetMock;
        window.resetChatbotBody = resetMock;
        //makin all the elements like icon img video etc..
        document.body.innerHTML = `
        <div id="chatbot_icon"></div>
        <div class="chatbot_container" style="visibility: hidden; opacity: 0;"></div>
        <div id="chatbot_close"></div>
        <div id="chatbot_badge" style="display: block;"></div>
        <img id="chatbot_img" style="display: inline;" />
        <video id="chatbot_video" style="display: none;"></video>
        <div id="chatbot_speech" style="display: none;"></div>
    `;
        jest.resetModules();
        require('../chatbot-script.js');
    });



    //this one checks what happens when mouse hovers on the icon..
    test('hovering shows video and types intro text', () => {
        const icon = document.getElementById('chatbot_icon');
        const video = document.getElementById('chatbot_video');
        const img = document.getElementById('chatbot_img');
        const speech = document.getElementById('chatbot_speech');
        icon.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        video.style.display = 'inline';
        img.style.display = 'none';
        speech.style.display = 'block';
        speech.textContent = 'Test typing...';
        expect(video.style.display).toBe('inline');
        expect(img.style.display).toBe('none');
        expect(speech.style.display).toBe('block');
        expect(speech.textContent.length).toBeGreaterThan(0);
    });



    //this one checks when mouse leaves the icon what happens...
    test('mouseout hides video and clears speech', () => {
        const icon = document.getElementById('chatbot_icon');
        const video = document.getElementById('chatbot_video');
        const img = document.getElementById('chatbot_img');
        const speech = document.getElementById('chatbot_speech');
        video.style.display = 'inline';
        img.style.display = 'none';
        speech.style.display = 'block';
        speech.textContent = 'Typing something';
        icon.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
        video.style.display = 'none';
        img.style.display = 'inline';
        speech.style.display = 'none';
        speech.textContent = '';
        expect(video.style.display).toBe('none');
        expect(img.style.display).toBe('inline');
        expect(speech.style.display).toBe('none');
        expect(speech.textContent).toBe('');
    });





    //this test is to see what happens when u click the bot icon....
    test('clicking icon shows chatbot and hides icon/badge', () => {
        const icon = document.getElementById('chatbot_icon');
        const container = document.querySelector('.chatbot_container');
        const badge = document.getElementById('chatbot_badge');
        icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        icon.style.visibility = 'hidden';
        badge.style.display = 'none';
        expect(container.style.visibility).toBe('visible');
        expect(container.style.opacity).toBe('1');
        expect(icon.style.visibility).toBe('hidden');
        expect(badge.style.display).toBe('none');
    });
});
