//testin the download button thing for chatbot.. gonna check if the blob gets made and the link gets clicked..
describe('Download Chat Button Functionality', () => {
    let clickSpy;
    let appendSpy;
    let removeSpy;
    let createObjectURLSpy;
    let revokeSpy;
    beforeEach(() => {
        document.body.innerHTML = `<button id="Download_chat_btn">Download</button>`;
        const mainHistory = [
            { message: '<p>Hello!</p>', isUser: true, timestamp: 1 }
        ];
        const searchHistory = [
            { message: '<b>Hi there!</b>', isUser: false, timestamp: 2 }
        ];
        localStorage.setItem('chat_main_history', JSON.stringify(mainHistory));
        localStorage.setItem('chat_search_history', JSON.stringify(searchHistory));
        global.parseHtmlToText = (html) => html.replace(/<[^>]*>/g, '');
        createObjectURLSpy = jest.fn(() => 'blob:fake-url');
        revokeSpy = jest.fn();
        global.URL.createObjectURL = createObjectURLSpy;
        global.URL.revokeObjectURL = revokeSpy;
        clickSpy = jest.fn();
        appendSpy = jest.spyOn(document.body, 'appendChild');
        removeSpy = jest.spyOn(document.body, 'removeChild');
        // fixin infinite loop by gettin original before mocking..
        const realCreateElement = Document.prototype.createElement;
        jest.spyOn(document, 'createElement').mockImplementation(function (tag) {
            if (tag === 'a') {
                const anchor = realCreateElement.call(this, 'a');
                anchor.click = clickSpy;
                return anchor;
            }
            return realCreateElement.call(this, tag);
        });
        require('../chatbot-script.js');
    });
    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        jest.resetModules();
    });


    //check if blob gets created + anchor clicked + link removed after download...
    test('should create blob and trigger download..', () => {
        const button = document.getElementById('Download_chat_btn');
        button.click();
        expect(createObjectURLSpy).toHaveBeenCalled();
        const blobArg = createObjectURLSpy.mock.calls[0][0];
        expect(blobArg instanceof Blob).toBe(true);
        expect(clickSpy).toHaveBeenCalled();
        expect(appendSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
    });




    //check filename assigned correctly for downloaded file...
    test('should set correct download filename..', () => {
        const button = document.getElementById('Download_chat_btn');
        button.click();
        const anchor = appendSpy.mock.calls.find(([el]) => el.tagName === 'A')?.[0];
        expect(anchor?.download).toBe('chat_history.txt');
    });




    //make sure empty chat doesn't crash blob creation...
    test('should handle empty chat histories gracefully..', () => {
        localStorage.clear();
        const button = document.getElementById('Download_chat_btn');
        button.click();
        expect(createObjectURLSpy).toHaveBeenCalled();
        const blobArg = createObjectURLSpy.mock.calls[0][0];
        expect(blobArg instanceof Blob).toBe(true);
    });

});
