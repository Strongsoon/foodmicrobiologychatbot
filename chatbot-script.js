/**
 * Save a message to localStorage for either chat history or search histry...
 *
 * @param {string} message - The message content to save.
 * @param {boolean} isUser - True if the message was sent by the user.
 * @param {boolean} isSearch - True if the message is from the search history.
 */
function saveMessageToLocalStorage(message, isUser, isSearch) {
  const historyKey = isSearch ? 'chat_search_history' : 'chat_main_history';
  const existingMessages = JSON.parse(localStorage.getItem(historyKey)) || [];
  const newMessage = {
    message,
    isUser,
    isSearch,
    timestamp: Date.now()
  };
  existingMessages.push(newMessage);
  localStorage.setItem(historyKey, JSON.stringify(existingMessages));
  console.log(`Saved to ${historyKey}:`, newMessage);
}



/**
 * Loads and rendrs the full chat history(main+search) from localStorage,
 * sorted chronologically by timestamp.
 */
function loadChatHistory() {
  const mainHistory = JSON.parse(localStorage.getItem('chat_main_history')) || [];
  const searchHistory = JSON.parse(localStorage.getItem('chat_search_history')) || [];

  // Combine both histories
  const combinedHistory = [...mainHistory, ...searchHistory];

  // Sort by timestamp to maintain chronological order
  combinedHistory.sort((a, b) => a.timestamp - b.timestamp);

  // Render each message in correct order
  combinedHistory.forEach(entry => {
    addMessageToChat(entry.message, entry.isUser, entry.isSearch, true); // skipTyping = true
  });
}



/**
 * Clears the chatbot UI and removes all stored chat history from localStorage.
 * Then resets the chatbot to its default welcome state.
 */
function clearChat() {
  // Clears the chat UI
  const chatBody = document.querySelector('.chatbot_body');
  chatBody.innerHTML = ''; // This clears all chat messages in the chat body

  // Clears chat history from localStorage
  localStorage.removeItem('chat_main_history');
  localStorage.removeItem('chat_search_history');
  console.log("Local storage cleared");

  // Reset the chat to the default state with welcome message and options
  resetChatbotBody();
}



/**
 * Displays the typing indicator in the chat UI.
 */
function showTypingIndicator() {
  document.getElementById('typing-indicator').style.display = 'flex';
}




/**
 * Hides the typing indicator from the chat UI.
 */
function hideTypingIndicator() {
  document.getElementById('typing-indicator').style.display = 'none';
}



/**
 * Initializes chatbot behavior when the page finishes loading.
 * - Sets up icon interactions (hover/click).
 * - Loads previous chat history from localStorage.
 * - Handles clicks on predefined chatbot action buttons.
 */
// This event runs after the page is fully loaded.
document.addEventListener('DOMContentLoaded', function() {
    setupChatbotIconEvents();
    // Select the main container for the chatbot messages.
    const chatbot_message_Body = document.querySelector('.chatbot_body');
    loadChatHistory();

    // Listens for clicks within the chatbot message body
     chatbot_message_Body.addEventListener('click', function(event) {
      // Checks if the clicked element is a child of an element with class 'question' and a span element.
      if (event.target.closest('.question span')) {
        // Retrieves the ID of the parent element that includes the title.
          const targetId = event.target.closest('.question').querySelector('.bodytitle').id;
          // Handles different functionalities based on the ID of the clicked element
          switch(targetId) {
              case 'latest_articles':
                  fetchLatestArticles();
                  break;
              case 'tips':
                  displayFoodSafetyTips();
                  break;
              case 'blog_search':
                  initiateBlogSearch();
                  break;
              case 'start_quiz':
                  renderQuizSetupUI();
                  break;
            //   case 'admin_login':
            //       renderAdminLoginUI();
            //       break;
              default:
                  console.log('Clicked on:', event.target.innerText);
                  break;
          }
      }
  });



    /**
     * Adds a click event listener to the 'Food for Thought' button.
     *
     * On click, it sends an AJAX POST request to the WordPress backend
     * to fetch a motivational or insightful microbiology thought. The response is then displayed
     * as a chatbot message inside the chat interface.
     *
     * If the request fails or returns an unsuccessful response, a fallback error message is shown.
     */
   document.getElementById('food-thought-btn').addEventListener('click', function () {
    fetch(chatbotAjax.ajax_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=my_chatbot_get_food_for_thought'
    })
    .then(response => response.json())
    .then(data => {
        const chatbotBody = document.querySelector('.chatbot_body');

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chatbot_message');

        if (data.success) {
            messageContainer.innerHTML = `<span class="message">💡 Food for Thought: ${data.data.thought}</span>`;
        } else {
            messageContainer.innerHTML = `<span class="message">⚠️ Could not load a thought.</span>`;
        }

        chatbotBody.appendChild(messageContainer);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);

        const chatbotBody = document.querySelector('.chatbot_body');
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chatbot_message');
        messageContainer.innerHTML = `<span class="message">⚠️ Error fetching thought. Please try again.</span>`;
        chatbotBody.appendChild(messageContainer);
    });
});



    /**
     * Initializes the chatbot dialog by hiding it and setting up the interaction logic.
     * When the chatbot icon is clicked:
     * - The chatbot interface becomes visible.
     * - The chatbot icon is hidden.
     * - A notification badge (if present)  is hidden.
     * - A greeting audio is played (if available).
     */
    // Initially sets the chatbot dialog to be invisible, ensuring it doesn't obstruct the webpage before interaction
    document.querySelector('.chatbot_container').style.visibility = 'hidden';
    document.querySelector('.chatbot_container').style.opacity = '0';
    document.getElementById('blog_search_container').style.display = 'none';
  
    // Click on the icon to show the dialog box and hide the icon at the same time

 document.getElementById('chatbot_icon').addEventListener('click', function() {
    console.log("🔔 Chatbot icon clicked.");

    userInteracted = true;
    console.log("✅ userInteracted set to true");

    // Show chatbot and hide icon
    document.querySelector('.chatbot_container').style.visibility = 'visible';
    document.querySelector('.chatbot_container').style.opacity = '1';
    document.querySelector('.chatbot_container').classList.add('show');
    document.getElementById('chatbot_icon').style.visibility = 'hidden';
    document.getElementById('chatbot_icon').style.opacity = '0';
    const badge = document.getElementById('chatbot_badge');
        if (badge) badge.style.display = 'none';
    console.log("💬 Chatbot UI shown, icon hidden");

    // Attempt to play audio
    const audio = document.getElementById('chatbot_audio');
    if (audio) {
        console.log("🔊 Audio element found, attempting to play...");
        audio.pause(); // Just in case it's still playing
        audio.currentTime = 0;
        audio.play()
          .then(() => console.log("✅ Audio played successfully"))
          .catch(e => console.error("❌ Audio playback failed:", e));
    } else {
        console.warn("⚠️ chatbot_audio element not found");
    }
});



    /**
     * Handles chatbot closing behavior when the "Close" (X) button is clicked.
     *
     * - Hides the chatbot dialog container.
     * - Re-displays the chatbot icon on the screen.
     * - Restores the notification badge if it exists.
     * - Resets the chatbot body to its initial welcome state.
     */
    // Click the Close button to hide the dialog box and redisplay the icons
    document.getElementById('chatbot_close').addEventListener('click', function() {
        document.querySelector('.chatbot_container').style.visibility = 'hidden';
        document.querySelector('.chatbot_container').style.opacity = '0';
        document.getElementById('chatbot_icon').style.visibility = 'visible';
        document.getElementById('chatbot_icon').style.opacity = '1';

        const badge = document.getElementById('chatbot_badge');
        if (badge) badge.style.display = 'block';
        // Reset chatbot content to the initial state
        resetChatbotBody();
    });



    /**
     * Initializes all interactive behaviors related to the chatbot icon, video, and close button.
     *
     * - Displays a video and animated intro text on hover.
     * - Hides video and shows image again when hover ends.
     * - Opens the chatbot on icon click and hides the icon.
     * - Closes the chatbot on close button click and resets the UI.
     */
    //setup for video and speech effects for the chatbot icon over hovering..
    function setupChatbotIconEvents() {
        const chatbotIcon = document.getElementById('chatbot_icon');
        const chatbotContainer = document.querySelector('.chatbot_container');
        const chatbotClose = document.getElementById('chatbot_close');
        const badge = document.getElementById('chatbot_badge');

        //text shown when user hovers over the chatbot icon..
        const chatbotText = `Hey there! I'm Weisr.\nMy name stands for Women Empowerment in Scientific Research.\nJust call me Wiser... I’m here to make you wiser in food microbiology!`;

        let typingTimeout = null;

        //displays the video and types the chatbot intro when hovered
        function showChatbotVideo() {
            const img = document.getElementById('chatbot_img');
            const video = document.getElementById('chatbot_video');
            const speech = document.getElementById('chatbot_speech');

            if (img && video) {
                img.style.display = 'none';
                video.style.display = 'inline';
            }

            if (speech) {
                speech.style.display = 'block';
                speech.textContent = '';
                clearTimeout(typingTimeout);  //clear any existing animation, so that always when we hover it starts from the beginning...
                typeWriterSpeech(chatbotText, speech); //animate intro text
            }
        }

        //hide the video when we are not hovering..
        function hideChatbotVideo() {
            const img = document.getElementById('chatbot_img');
            const video = document.getElementById('chatbot_video');
            const speech = document.getElementById('chatbot_speech');

            if (video && img) {
                video.style.display = 'none';
                img.style.display = 'inline';
            }

            if (speech) {
                speech.style.display = 'none';
                speech.textContent = '';
                clearTimeout(typingTimeout);
            }
        }

        //types chatbotText one character at a time inside the speech bubble...
        function typeWriterSpeech(text, element) {
            let i = 0;
            const speed = 35;  //typing speed in ms..
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    typingTimeout = setTimeout(type, speed);
                }
            }
            type();
        }

        //so when the chatbot icon exists, bind hover and click events..
        if (chatbotIcon) {
            //on hover: show video and intro text..
            chatbotIcon.addEventListener("mouseover", showChatbotVideo);
            //on hover out: revert to icon and hide speech..
            chatbotIcon.addEventListener("mouseout", hideChatbotVideo);
            //on click: open chatbot window and hide the icon...
            chatbotIcon.addEventListener("click", function () {
                chatbotContainer.style.visibility = 'visible';
                chatbotContainer.style.opacity = '1';
                chatbotContainer.classList.add('show');
                chatbotIcon.style.visibility = 'hidden';
                chatbotIcon.style.opacity = '0';
                if (badge) badge.style.display = 'none';
            });
        }

        //when the close button exists, bind closing behavior..
        if (chatbotClose) {
            //on click: close chatbot, show icon again, reset content..
            chatbotClose.addEventListener("click", function () {
                chatbotContainer.style.visibility = 'hidden';
                chatbotContainer.style.opacity = '0';
                chatbotIcon.style.visibility = 'visible';
                chatbotIcon.style.opacity = '1';
                if (badge) badge.style.display = 'block';
                resetChatbotBody();   //resetting to initial state...
            });
        }
    }



    /**
     * Handles the "Return" button click to switch from blog search mode
     * back to the main chat interface.
     *
     * - Hides the blog search container.
     * - Shows the main chatbot conversation area.
     * - Resets the blog search input field and clears previous results.
     */
    // Switch back to chat mode from blog search mode
    document.getElementById('return').addEventListener('click', function() {
      document.getElementById('blog_search_container').style.display = 'none';
      document.querySelector('.chatbot_container .chatbot_body').style.display = 'flex';
      // Resets the blog search input and results
      resetSearchFunction(); 
    });



    /**
     * Binds a keydown event to the chatbot input field to handle Enter key presses.
     *
     * - When the Enter key is pressed:
     *   - Prevents the defalt newline behavior.
     *   - Triggers a click on the chatbot send button to simulate message sending.
     */
    // Handle the Enter key press event to trigger the send button
    document.getElementById('chatbot_input').addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
         // Prevent the default action of Enter key
          event.preventDefault();
          // Trigger the send button click event
          document.getElementById('chatbot_send').click(); 
      }
  });



    /**
     * Handles the chatbot send button click event.
     *
     * - Removes any existing gap spacers from the chat UI.
     * - Retrieves and processes the user input.
     * - Detects whether the blog search view is currently visible.
     * - If the input is not empty, clears the input field and routes
     *   the message for handling based on current UI state.
     */
  // Function to handle the send button click event
  document.getElementById('chatbot_send').addEventListener('click', function() {
    // Remove the gap spacer if it exists
    document.querySelectorAll('.chatbot-gap-spacer').forEach(el => el.remove());

    const input = document.getElementById('chatbot_input');
    const originalMessage = input.value.trim();  
    const message = originalMessage.toLowerCase();
  
    // Splits the message into individual words to facilitate further analysis
    const words = originalMessage.split(/\s+/);
    
    // Determines if the blog search section of the interface is visible or not
    const blogSearchContainer = document.querySelector('.blog_search_container');
    const isBlogSearchHidden = window.getComputedStyle(blogSearchContainer).display === 'none';
  
    // Checks if the message is not empty before proceeding
    if (originalMessage) {
        input.value = ''; 
  
        // Directs the input to different handling logic depending on whether the blog search is hidden
        handleInput(words, originalMessage, message, isBlogSearchHidden);
    }
  });



  /* function playNotificationSound() {
    const audio = document.getElementById('chatbot_audio');
    audio.play().catch(function(error) {
        console.error("Audio playback failed:", error);
    });
  } */



    /**
   * Fetches and displays the latest articles from the server.
   * 
   * Sends an AJAX request to retrieve recent articles and appends them
   * to the chatbot's message body, allowing the user to see the latest content.
   */
    function fetchLatestArticles() {
      // Sends a request to the server to get the latest articles
      fetch(chatbotAjax.ajax_url + '?action=my_get_latest_posts')
      .then(response => response.json()) 
      .then(posts => {
        // Creates a container in the UI to display articles
        const articlesContainer = document.createElement('div');
        articlesContainer.className = 'rec_articles'; 
        const divtitle=document.createElement('div');
        divtitle.className = 'divtitle';
        const titlespan=document.createElement('span');
        titlespan.className = 'titlespan';
        titlespan.textContent = 'Latest Articles'; 
        
        // Builds the article container structure
        divtitle.appendChild(titlespan);
        articlesContainer.appendChild(divtitle);
        
        // Add each fetched article to the container
        posts.forEach(post => {
          showLatestArticles(post.title, post.link,articlesContainer);
        });
  
        // Appends the complete articles container to the chatbot's body and scrolls to show the newly added content
          const chatBody = document.querySelector('.chatbot_container .chatbot_body');
          chatBody.appendChild(articlesContainer);
          chatBody.scrollTop = chatBody.scrollHeight;
      })
      .catch(error => console.error('Error fetching articles:', error)); 
    }
  
   
  
    /**
   * Retrieves and displays food safety tips from the server.
   * 
   * Initiates an AJAX request to fetch tips and displays them in the chatbot UI.
   */
    function displayFoodSafetyTips() {
      // Initiates an AJAX request to the server endpoint specified to fetch food safety tips
      fetch(chatbotAjax.ajax_url + '?action=my_chatbot_get_tips')
        .then(response => response.json())
        .then(data => {
             // Invokes another function to display these tips in the user interface
            showTips(data.data.tips); 
        })
        .catch(error => console.error('Error fetching tips:', error)); 
    }
  
  
  
  /**
   * Initiates and prepares the blog search feature.
   * 
   * Displays the blog search container, hides the regular chat body,
   * and prompts the user to enter a search keyword.
   */
  function initiateBlogSearch() {
    // Displays the blog search container by setting its display style to 'flex'
    document.getElementById('blog_search_container').style.display = 'flex'; 
  
    // Hides the regular chat body to make space for the blog search interface.
    document.querySelector('.chatbot_container .chatbot_body').style.display = 'none'; 
  
    // Resets the search functionality to clear previous results and messages
    resetSearchFunction(); 
  
    // Informs the user to start a blog search
    addMessageToChat("Please enter a keyword to search for blog articles.", false, true); 
  }
  });



    /**
   * Displays a message in the chat, either from the user or the chatbot.
   * 
   * @param {string} message - The message text to be displayed.
   * @param {boolean} [isUser=true] - Indicates if the message is from the user; defaults to true.
   * @param {boolean} [isSearch=false] - Indicates if the message is part of a blog search result; defaults to false.
   * @param {boolean} [skipTyping=false] - Indicates if typing indicator should be skipped; defaults to false.
   * @param {function|null} [afterMessageCallback=null] - Optional callback to execute after the message is displayed.
   */
function addMessageToChat(message, isUser = true, isSearch = false, skipTyping = false, afterMessageCallback = null) {
  const chatBody = !isSearch
    ? document.querySelector('.chatbot_container .chatbot_body')
    : document.querySelector('.blog_search_container .search_message');

  if (isUser || isSearch || skipTyping) {
    appendMessage(message, isUser, chatBody);
    saveMessageToLocalStorage(message, isUser, isSearch);
    if (afterMessageCallback) afterMessageCallback();
  } else {
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot_message typing-indicator';
    typingIndicator.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    chatBody.appendChild(typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        typingIndicator.remove();
        const messageContainer = document.createElement('div');
        messageContainer.className = 'chatbot_message';
        const messageElement = document.createElement('span');
        messageElement.className = 'message';
        messageContainer.appendChild(messageElement);
        chatBody.appendChild(messageContainer);
        let i = 0;
        const speed = 10;
        const plainText = message.replace(/<[^>]*>/g, '');
        function typeWriter() {
            if (i < plainText.length) {
                messageElement.textContent += plainText.charAt(i);
                i++;
                chatBody.scrollTop = chatBody.scrollHeight;
                setTimeout(typeWriter, speed);
            } else {
                messageElement.textContent = '';
                appendMessage(message, false, chatBody, messageElement);
                saveMessageToLocalStorage(message, false, false);
                chatBody.scrollTop = chatBody.scrollHeight;
                const audio = document.getElementById('chatbot_audio');
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio playback failed:", e));
                }
                if (afterMessageCallback) afterMessageCallback();
            }
        }
        typeWriter();
        }, 1500);
  }
}



/**
 * Appends a message to the chatbot UI with support for media and rich content.
 *
 * @param {string} message - The message content (may include plain text, HTML, or URLs).
 * @param {boolean} isUser - Whether the message is from the user (true) or the chatbot (false).
 * @param {HTMLElement} container - The parent container where the message will be appended.
 * @param {HTMLElement|null} targetElement - (Optional) If provided, appends content to this element instead of creating a new one.
 */
function appendMessage(message, isUser, container, targetElement = null) {
    const messageElement = targetElement || document.createElement('span');
    messageElement.className = 'message';
    if (!isUser && /<\/?[a-z][\s\S]*>/i.test(message)) {
        messageElement.innerHTML = message;
    } else {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = message.split(urlRegex);
        let hasMedia = false;

        parts.forEach(part => {
            if (part.match(urlRegex)) {
                hasMedia = true;

                if (part.match(/\.(jpeg|jpg|gif|png)$/i)) {
                    const img = document.createElement('img');
                    img.src = part;
                    img.alt = "Chatbot Image";
                    img.style.maxWidth = "100%";
                    img.style.borderRadius = "8px";
                    img.style.marginTop = "10px";
                    messageElement.appendChild(img);
                } else if (part.match(/\.(mp4|webm|ogg)$/i)) {
                    const video = document.createElement('video');
                    video.src = part;
                    video.controls = true;
                    video.style.maxWidth = "100%";
                    video.style.borderRadius = "8px";
                    video.style.marginTop = "10px";
                    messageElement.appendChild(video);
                } else if (part.includes("youtube.com") || part.includes("youtu.be")) {
                    const videoId = extractYouTubeID(part);
                    if (videoId) {
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${videoId}`;
                        iframe.width = "100%";
                        iframe.height = "200";
                        iframe.frameBorder = "0";
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;
                        iframe.style.marginTop = "10px";
                        messageElement.appendChild(iframe);
                    }
                } else {
                    const link = document.createElement('a');
                    link.href = part;
                    link.textContent = part;
                    link.target = "_blank";
                    messageElement.appendChild(link);
                }
            } else {
                messageElement.appendChild(document.createTextNode(part));
            }
        });
    }

    if (!targetElement) {
        const messageContainer = document.createElement('div');
        messageContainer.className = isUser ? 'user_message' : 'chatbot_message';
        messageContainer.appendChild(messageElement);
        container.appendChild(messageContainer);
    }

    container.scrollTop = container.scrollHeight;
}



/**
 * Extracts the YouTube video ID from a given URL.
 *
 * Supports common YouTube URL formats, including:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 *
 * @param {string} url - The full YouTube URL to parse.
 * @returns {string|null} - The 11-character YouTube video ID, or null if not found.
 */
// Utility to extract YouTube video ID
function extractYouTubeID(url) {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}



/**
 * Displays a follow-up message in the chatbot.
 * Adds a gap that stays until user sends a new message.
 */
function displayFollowUpMessage() {
    const followUpMessages = [
        "Is there anything else I can help you with?",
        "Do you have any other questions for me?",
        "How else can I assist you today?",
        "Let me know if there's something else you'd like to know!"
    ];
    const randomMessage = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
    addMessageToChat(randomMessage, false, false, false, function () {
        // Add a gap that stays until user sends a new message
        const chatBody = document.querySelector('.chatbot_body');
        const gapDiv = document.createElement('div');
        gapDiv.style.height = '32px';
        gapDiv.className = 'chatbot-gap-spacer';
        chatBody.appendChild(gapDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    });
}

   
  
  /**
   * Processes user input and directs it to the appropriate handler.
   * Determines whether the input should be treated as a blog search or a standard chatbot query.
   *
   * @param {Array<string>} words - Array of individual words from the user's input.
   * @param {string} originalMessage - The original message input from the user.
   * @param {string} message - The lowercase version of the original message.
   * @param {boolean} isBlogSearchHidden - Indicates if the blog search mode is currently hidden.
   */
  function handleInput(words, originalMessage, message, isBlogSearchHidden) {
    // Checks if the blog search is active and if the input consists of 50 words or fewer
    if (!isBlogSearchHidden && words.length <= 50) {  
      // If in blog search mode and the input is concise, perform a search
      addMessageToChat(originalMessage, true, true);
      performBlogSearch(message);
    } else if (words.length <= 50) {
      // If not in search mode, check spelling and handle as a query
      performSpellingCheck(words, originalMessage);
    } else {
      // Handle input with more than 50 words
      handleLongInput(originalMessage, isBlogSearchHidden);
    }
    }



/**
 * Performs a spelling check on the user's input message using Typo.js and optionally auto-corrects it.
 *
 * - Initializes a Typo.js dictionary (US English).
 * - Checks each word in the input for spelling errors.
 * - If incorrect words are found, it attempts to correct them using the first suggestion.
 * - Calls a handler function (`continueWithCorrectedInput`) to proceed with the corrected or original message.
 *
 * @param {string[]} words - An array of individual words from the user's original message.
 * @param {string} originalMessage - The raw input message as entered by the user.
 */
    // Function to check and correct spelling errors in user input using the Typo.js dictionary
    function performSpellingCheck(words, originalMessage) {
      // Initializes the Typo.js dictionary with settings for US English
    var dictionary = new Typo("en_US", null, null, {
       // Path to dictionary files, configured in WordPress settings
      dictionaryPath: typo_vars.dictionaryPath,
      asyncLoad: true,
      loadedCallback: function () {
          var incorrectWords = [];
          var correctedWords = [...words];
  
          // Iterate over each word in the input to check spelling
          words.forEach(function(word, index) {
              if (!dictionary.check(word)) { 
                  // Retrieves spelling suggestions for any incorrect word
                  let suggestions = dictionary.suggest(word);
                  if (suggestions.length > 0) {
                      // If suggestions are available, replace the incorrect word with the first suggestion
                      correctedWords[index] = suggestions[0];
                  }
                  incorrectWords.push(word);
              }
          });
          
          // After processing all words, check if there were any spelling errors
          if (incorrectWords.length > 0) {
              // Joins the corrected words into a single string
              let correctedMessage = correctedWords.join(' ');
              // If errors were corrected, proceed to handle the corrected input
              continueWithCorrectedInput(originalMessage,originalMessage);
          } else {
              // If no spelling errors, continue with the original input
              continueWithCorrectedInput(originalMessage,originalMessage);
          }
      }
    });
    }


    
    /**
   * Checks and corrects spelling errors in user input using Typo.js.
   * 
   * Loads the Typo.js dictionary asynchronously and provides corrections for any misspelled words.
   *
   * 
   * @param {string} originalMessage - The original message text from the user.
   * @param {string} message - The text is processed by the system
   */
    function continueWithCorrectedInput(originalMessage,message) {
      addMessageToChat(originalMessage);
      // Sends the processed message to the server to get a response to the user's query or command
      fetchQandA(message);
    }



    /**
   * Fetches a response from the server's Q&A API based on the user's question.
   * 
   * Sends an HTTP POST request to retrieve an answer for the user's question, and
   * handles the response by displaying the answer or a fallback message.
   *
   * @param {string} question - The question entered by the user.
   */
    function fetchQandA(question) {
      fetch(chatbotAjax.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'my_chatbot_get_answer',
          question: question
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Pass a callback to add feedback buttons after typing indicator
          addMessageToChat(data.data.answer, false, false, false, function () {
            // --- Feedback Buttons ---
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'chatbot_button_container';
            buttonContainer.style.display = 'flex';

            // Thumbs Up
            const thumbsUp = document.createElement('button');
            thumbsUp.textContent = '👍';
            thumbsUp.id = 'thumbs_up';
            thumbsUp.classList.add('feedback-btn');

            // Thumbs Down
            const thumbsDown = document.createElement('button');
            thumbsDown.textContent = '👎';
            thumbsDown.id = 'thumbs_down';
            thumbsDown.classList.add('feedback-btn');

            buttonContainer.appendChild(thumbsUp);
            buttonContainer.appendChild(thumbsDown);

            const chatbotBody = document.querySelector('.chatbot_body');
            if (chatbotBody) {
              chatbotBody.appendChild(buttonContainer);
            }

            // Feedback click events
            thumbsUp.addEventListener('click', function () {
              sendFeedback(data.data.answer, 'helpful');
              addMessageToChat("Thank you for your feedback 😄", false);
              displayFollowUpMessage();
              buttonContainer.remove();
              chatbotBody.scrollTop = chatbotBody.scrollHeight;
            });

            thumbsDown.addEventListener('click', function () {
              sendFeedback(data.data.answer, 'not_helpful');
              addMessageToChat("Thank you for your feedback 😄", false);
              displayFollowUpMessage();
              buttonContainer.remove();
              chatbotBody.scrollTop = chatbotBody.scrollHeight;
            });

            chatbotBody.scrollTop = chatbotBody.scrollHeight;
          });
        } else {
          addMessageToChat("I’m sorry, I didn’t quite understand that. If you need further assistance, please contact us.", false);
          showHotTopic();
        }
      })
      .catch(error => {
        console.error('Error fetching answer:', error);
        addMessageToChat("An error occurred. Please try again later.", false);
      });
    }
    


    /**
   * Displays the main menu (hot topic) options in the chat interface.
   * 
   * Inserts HTML for clickable options, providing the user with direct access
   * to key functionalities such as articles, safety tips, and contact options.
   */
    function showHotTopic(){
      // Defines the HTML structure of the hot topic menu, which includes clickable options for different topics
      const hotTopicHTML = `
          <div id="hot_topic">
              <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
              <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">View our shop</span></a></div>
              <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
              <div class="question"><a href="https://foodmicrobiology.academy/contact/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">Contact Us</span></a></div>
              <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
              <div class="question"><span id="start_quiz" class="bodytitle">Start Quiz</span></div>
              <div class="question"><span id="food-thought-btn" class="bodytitle" style="cursor: pointer;">Food for Thought</span></div>
          </div>
      `;
  
      // Selects the chatbot's body element where messages and menus are displayed
      const chatbotBody = document.querySelector('.chatbot_body');
      // Inserts the hot topic HTML into the chatbot body, adding it just before the end of the element's content
      chatbotBody.insertAdjacentHTML('beforeend', hotTopicHTML);
      // Automatically scrolls the chatbot body to the bottom to ensure the new content is visible
      chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }
    


    /**
   * Manages user input that exceeds 50 words.
   * 
   * Displays the user's input and provides feedback requesting the user
   * to shorten their input for easier processing.
   *
   * @param {string} originalMessage - The complete message entered by the user.
   * @param {boolean} isBlogSearchHidden - Indicates if the input is part of a blog search.
   */
    function handleLongInput(originalMessage, isBlogSearchHidden) {
    if (isBlogSearchHidden) {
      // Displays the user's message in the main chat area because it's not specific to the blog search
      addMessageToChat(originalMessage, true);
      // Provides feedback to the user, requesting them to shorten their input for better handling
      addMessageToChat("Enter more than 100 words, please re-enter", false);
    } else {
      // Shows user's input in the chat
      addMessageToChat(originalMessage, true, true); 
      // Similarly, prompts the user within the blog search area to shorten their message
      addMessageToChat("Enter more than 100 words, please re-enter", false, true);
    }
    }



    /**
   * Displays an individual article with its title and link in a specified container.
   *
   * @param {string} title - The title of the article to display.
   * @param {string} link - The URL link to the article.
   * @param {HTMLElement} container - The container element where the article will be appended.
   */
     function showLatestArticles(title, link, container) {
      const articleContainer = document.createElement('div');
      articleContainer.className = 'articles';
  
      const articleElement = document.createElement('span');
      articleElement.className='bodytitle';
      const linkElement = document.createElement('a');
      linkElement.href = link;
      linkElement.textContent = title;
      linkElement.target = '_blank'; // Ensures that the link opens in a new tab
  
      articleElement.appendChild(linkElement);
      articleContainer.appendChild(articleElement);
      container.appendChild(articleContainer); // Appends the complete article element to the specified container
    }



      /**
   * Displays selected food safety tips in the chatbot interface.
   *
   * @param {Array<string>} selectedTips - An array of food safety tips to display.
   */
      function showTips(selectedTips){
        console.log(selectedTips); // Logs tips data for debugging purposes
          const container=document.createElement('div');
          container.id="recommend_Tips";
          const divtitle=document.createElement('div');
              divtitle.className = 'divtitle';
              const titlespan=document.createElement('span');
              titlespan.className = 'titlespan';
              titlespan.textContent = 'Food Safety Tips'; // Label for the tips section
              
              divtitle.appendChild(titlespan);
              container.appendChild(divtitle);
          selectedTips.forEach((tip) => {
         // If it doesn't exist, create a new one
         const tipsContainer = document.createElement('div');
         tipsContainer.className = 'tips';
      
         const tipElement = document.createElement('span');
         tipElement.className="bodytitle"
         tipElement.textContent = tip;
        
         tipsContainer.appendChild(tipElement);
         container.appendChild(tipsContainer);
        });
      
        const chatBody = document.querySelector('.chatbot_container .chatbot_body');
        chatBody.appendChild(container);

        chatBody.scrollTop = chatBody.scrollHeight; // Scrolls to make the tips visible
        }
  
        
      
  /**
   * Conducts a blog search using a user-supplied keyword.
   *
   * Sends a POST request to the server with the search keyword and
   * displays the resulting articles in the chatbot's search results area.
   *
   * @param {string} keyword - The search keyword entered by the user.
   */
    function performBlogSearch(keyword) {
      // Initiates a POST request to the server with the search keyword
      fetch(chatbotAjax.ajax_url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded', // Sets the content type of the request
          },
          body: new URLSearchParams({
              action: 'my_search_blog_posts', // Specifies the action to perform on the server
              query: keyword // Sends the user's search keyword as part of the request
          })
      })
      .then(response => response.json()) // Parses the JSON response from the server
      .then(data => {
          // Checks if the server response was successful and contains blog post data
          if (data.success && Array.isArray(data.data)) {
            // Creates a new container for displaying search results
            const articlesContainer = document.createElement('div');
            articlesContainer.className = 'search_articles_result';
             // Adds a title to the search results container
            const divtitle=document.createElement('div');
            divtitle.className = 'divtitle';
            const titlespan=document.createElement('span');
            titlespan.className = 'titlespan';
            titlespan.textContent = 'Search Results'; // Title for the search results section
            // Assembles the title and the container
            divtitle.appendChild(titlespan);
            articlesContainer.appendChild(divtitle);
              // Iterates through each search result and adds it to the results container
              data.data.forEach(post => {
                  if (post.title && post.link) {
                    // Displays each article using a helper function that formats and appends it to the container
                      showLatestArticles(post.title, post.link,articlesContainer); 
                  } else {
                      console.error('Post missing title or link:', post); // Logs an error for incomplete data
                  }
              });
            // Adds the populated search results container to the chat interface
            const chatBody = document.querySelector('.chatbot_container .search_message');
            chatBody.appendChild(articlesContainer);
            chatBody.scrollTop = chatBody.scrollHeight; // Scrolls to make the newly added content visible
          } else {
            // Displays an error message if no valid data was found or returned
              addMessageToChat("No articles found or the data format is incorrect.", false,true);
          }
      })
      .catch(error => {
          console.error('Error fetching blog posts:', error);
          // If no articles are found, display an error message
          addMessageToChat("An error occurred while searching. Please try again later.", false);
      });
  }
  
  

  /**
   * Resets the content of the chatbot body to the default welcome message and menu options.
   * 
   * Updates the main chat area with a welcome message and menu of options, giving users
   * access to key functionalities such as articles, training information, tips, and search.
   */
  function resetChatbotBody() {
    console.log("Resetting Chatbot Body");
    // Selects the main chat area within the chatbot interface
    const chatBody = document.querySelector('.chatbot_body');
    // Updates the HTML content of the chat body to include a welcome message and a menu of options
    chatBody.innerHTML = `
        <div class="chatbot_message">
            <span class="message">Hi! Welcome to Food Microbiology Academy. How can I help you?</span>
        </div>
        <div id="hot_topic">
            <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">View our shop</span></a></div>
            <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/contact/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">Contact Us</span></a></div>
            <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
            <div class="question"><span id="start_quiz" class="bodytitle">Start Quiz</span></div> 
            <div class="question"><span id="food-thought-btn" class="bodytitle" style="cursor: pointer;">Food for Thought</span></div>
            <!-- <div class="question"><span id="admin_login" class="bodytitle">Admin Login</span></div> -->

        </div>
    `;
    const foodThoughtBtn = document.getElementById('food-thought-btn');
    if (foodThoughtBtn) {
        foodThoughtBtn.addEventListener('click', function () {
            fetch(chatbotAjax.ajax_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=my_chatbot_get_food_for_thought'
            })
            .then(response => response.json())
            .then(data => {
                const chatbotBody = document.querySelector('.chatbot_body');
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('chatbot_message');

                if (data.success) {
                    messageContainer.innerHTML = `<span class="message">💡 Food for Thought: ${data.data.thought}</span>`;
                } else {
                    messageContainer.innerHTML = `<span class="message">⚠️ Could not load a thought.</span>`;
                }

                chatbotBody.appendChild(messageContainer);
                chatbotBody.scrollTop = chatbotBody.scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error);

                const chatbotBody = document.querySelector('.chatbot_body');
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('chatbot_message');
                messageContainer.innerHTML = `<span class="message">⚠️ Error fetching thought. Please try again.</span>`;
                chatbotBody.appendChild(messageContainer);
            });
        });
    }
     console.log("Chatbot Body reset complete");
    // Add an event listener to the "Clear Chat" button to reset chat
  const clearButton = document.getElementById('clearChatBtn');
  clearButton.addEventListener('click', clearChat);
}



/**
 * Waits for the DOM to be fully loaded before assigning event listeners.
 *
 * - Binds a click handler to the "Clear Chat" button (if it exists).
 * - When clicked, the chat history is cleared and UI is reset via `clearChat()`.
 */
  // Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get the Clear Chat button
  const clearChatBtn = document.getElementById('clearChatBtn');

  // Add click event listener to the Clear Chat button
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', clearChat);
  }
});



  /**
   * Resets the blog search section to its initial state, ready for new searches.
   * 
   * Clears the current search content and sets up the initial search navigation with a clean message area.
   */
  function resetSearchFunction(){
    // Selects the container specifically used for blog searches
    const searchBody=document.querySelector('.blog_search_container');
    // Clears the existing content and sets up the initial search navigation and message area
      searchBody.innerHTML = `
    <div class="quiz_nav">
      <span class="quiz_title">Search Blog</span>
      <img id="return" src="${chatbotAjax.pluginDirUrl}recourses/return.png" alt="Return" style="cursor:pointer;" />
    </div>
    <div id="search_message" class="search_message"></div>
    `;
  
    // Calls a function to rebind necessary events for the search functionality
    rebindSearchEvents(); 
  }



  /**
   * Rebinds events within the blog search interface, particularly for the 'return' button.
   * 
   * Adds an event listener to the 'return' button, allowing users to return to the main chat view.
   */
  function rebindSearchEvents(){
    // Adds an event listener to the 'return' button to handle user clicks, allowing users to exit the search view
    document.getElementById('return').addEventListener('click', function() {
      // Hides the blog search container
      document.getElementById('blog_search_container').style.display = 'none';
      // Displays the regular chat body, returning the user to the main chat interface
      document.querySelector('.chatbot_container .chatbot_body').style.display = 'flex';
    });
  }



/**
 * Sends user feedback about a chatbot answer to the backend via AJAX.
 *
 * - Uses a WordPress-compatible AJAX POST request (admin-ajax.php).
 * - Sends the answer text and feedback type (e.g., "positive" or "negative").
 * - Handles the server response and logs the outcome.
 *
 * @param {string} answer - The chatbot answer text the user is providing feedback on.
 * @param {string} feedbackType - The type of feedback (e.g., "positive", "negative").
 */
function sendFeedback(answer, feedbackType) {
  fetch(chatbotAjax.ajax_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'save_feedback',
      answer: answer,
      feedback: feedbackType,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log('Feedback saved successfully');
      } else {
        console.error('Failed to save feedback:', data.message);
      }
    })
    .catch((error) => console.error('Error sending feedback:', error));
}



/**
 * Converts an HTML string to plain text with human-readable formatting.
 *
 * - Converts <a> tags to "Title: URL" format.
 * - Replaces <li> tags with newline-prefixed bullet points.
 * - Strips remaining HTML and collapses excess line breaks.
 *
 * @param {string} html - The HTML string to be converted.
 * @returns {string} - Cleaned and formatted plain text version.
 */
function parseHtmlToText(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Convert <a> tags to "• Title: URL"
    tempDiv.querySelectorAll("a").forEach(link => {
        const linkText = link.textContent;
        const linkHref = link.href;
        const replacement = `${linkText}: ${linkHref}`;
        link.replaceWith(document.createTextNode(replacement));
    });

    // Replace <li> with newlines for readability
    tempDiv.querySelectorAll("li").forEach(li => {
        li.replaceWith('\n- ' + li.textContent.trim());
    });

    // Convert multiple line breaks to single
    let text = tempDiv.textContent || tempDiv.innerText || "";
    return text.replace(/\n{2,}/g, '\n').trim();
}

// Download Chat Button Functionality
const downloadBtn = document.getElementById('Download_chat_btn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
        // Gather both main and search chat histories from localStorage
        const mainHistory = JSON.parse(localStorage.getItem('chat_main_history')) || [];
        const searchHistory = JSON.parse(localStorage.getItem('chat_search_history')) || [];
        // Combine and sort by timestamp
        const combinedHistory = [...mainHistory, ...searchHistory].sort((a, b) => a.timestamp - b.timestamp);

        // Format chat content using parseHtmlToText for cleaner plain text
        let chatContent = combinedHistory.map(entry => {
            const plainMessage = parseHtmlToText(entry.message);
            if (entry.isUser) {
                return `User: ${plainMessage}\n`;
            } else {
                return `Chatbot: ${plainMessage}\n`;
            }
        }).join('\n');

        // Create a Blob and trigger download
        const blob = new Blob([chatContent], {type: 'text/plain'});
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'chat_history.txt';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}




//storing quiz questions, current question indexuser's score, and selected category for the quiz...
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizCategory = '';



/**
 * Renders the quiz setup interface inside the chatbot window.
 *
 * - Allows users to select a quiz category.
 * - Lets users choose the number of questions per type (MCQ, T/F, One-word).
 * - Validates total question count (must equal 10).
 * - Triggers quiz start on confirmation.
 */
//renders the quiz setup interface for category & question type selection...
function renderQuizSetupUI() {
    const chatBody = document.querySelector('.chatbot_container .chatbot_body');
    chatBody.innerHTML = ''; //clear previous content...

    const quizNav = document.createElement('div');
    quizNav.className = 'quiz_nav';

    const title = document.createElement('span');
    title.className = 'quiz_title';
    title.textContent = 'Customize Your Quiz';

    const backBtn = document.createElement('button');
    backBtn.id = 'quiz_back';
    backBtn.textContent = 'Back';
    backBtn.className = 'quiz-back-button';
    backBtn.addEventListener('click', () => {
        resetChatbotBody();
    });

    quizNav.appendChild(title);
    quizNav.appendChild(backBtn);

    chatBody.appendChild(quizNav);

    //quiz customization form..
    const setupDiv = document.createElement('div');
    setupDiv.className = 'quiz-setup';

    // Category selection
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = "Select Category:";
    setupDiv.appendChild(categoryLabel);

    const categorySelect = document.createElement('select');
    categorySelect.id = 'quiz_category';
    //populating category options...
    ['General',
        'Food Safety & Pathogens',
        'Fermentation & Beneficial Microbes',
        'Food Preservation Techniques',
        'Emerging Tech in Food Microbiology',
        'Career & Diversity in STEM'
    ].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.toLowerCase().replace(/\s+/g, '-');
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
    setupDiv.appendChild(categorySelect);
    //add inputs for number of questions per type...
    setupDiv.innerHTML += `
        <p class="quiz-subtext">Enter how many of each type you'd like (must total <strong>10</strong> questions):</p>
        <div class="quiz-input-row">
        <label>Multiple Choice</label>
        <input type="number" id="count_multiple" value='6' min="0" max="10" />
        </div>
        <div class="quiz-input-row">
        <label>True / False</label>
        <input type="number" id="count_truefalse" value='3' min="0" max="10" />
        </div>
        <div class="quiz-input-row">
        <label>One-word</label>
        <input type="number" id="count_text" value='1' min="0" max="10" />
    `;

    //start Quiz button with validation..
    const startBtn = document.createElement('button');
    startBtn.className = 'quiz-option';
    startBtn.textContent = 'Start Quiz';
    startBtn.addEventListener('click', () => {
        const total =
            Number(document.getElementById('count_multiple').value) +
            Number(document.getElementById('count_truefalse').value) +
            Number(document.getElementById('count_text').value);

        if (total !== 10) {
            alert("❌ Total must equal 10 questions!");
            return;
        }

        const preferences = {
            category: document.getElementById('quiz_category').value,
            count_multiple: Number(document.getElementById('count_multiple').value),
            count_truefalse: Number(document.getElementById('count_truefalse').value),
            count_text: Number(document.getElementById('count_text').value),
        };

        startQuiz(preferences);
    });

    setupDiv.appendChild(startBtn);
    chatBody.appendChild(setupDiv);
}



/**
 * Starts the quiz by fetching questions from the server and filtering them
 * based on the user's selected category and preferred question type counts.
 *
 * - Fetches quiz data via a WordPress AJAX GET request.
 * - Filters questions by selected category (or defaults to 'general').
 * - Randomly selects the desired number of each question type.
 * - Initializes quiz state and launches the quiz interface.
 *
 * @param {Object} preferences - User-defined quiz settings.
 * @param {string} preferences.category - The selected quiz category.
 * @param {number} preferences.count_multiple - Number of multiple choice questions.
 * @param {number} preferences.count_truefalse - Number of true/false questions.
 * @param {number} preferences.count_text - Number of one-word questions.
 */
//fetches quiz questions from server and filters them based on preferences...
function startQuiz(preferences) {
    fetch(chatbotAjax.ajax_url + '?action=my_chatbot_get_quiz')
        .then(response => response.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                let allQuestions = data.data;
                quizCategory = preferences.category;

                //filter questions by selected category..
                if (preferences.category !== 'general') {
                    allQuestions = allQuestions.filter(q =>
                        q.quiz_category && q.quiz_category.toLowerCase().replace(/\s+/g, '-') === preferences.category
                    );
                } else {
                    allQuestions = allQuestions.filter(q => q.quiz_category === 'general');
                }

                //split questions by type...
                const multiple = allQuestions.filter(q => q.type === 'multiple');
                const trueFalse = allQuestions.filter(q => q.type === 'truefalse');
                const text = allQuestions.filter(q => q.type === 'text');

                //shuffle and pick random items..
                function pickRandom(arr, count) {
                    return arr.sort(() => 0.5 - Math.random()).slice(0, count);
                }

                //finalize quiz question list..
                quizQuestions = [
                    ...pickRandom(multiple, preferences.count_multiple),
                    ...pickRandom(trueFalse, preferences.count_truefalse),
                    ...pickRandom(text, preferences.count_text),
                ];

                currentQuizIndex = 0;
                quizScore = 0;
                renderQuizUI();   //show quiz interface...
            } else {
                console.error("Invalid quiz format:", data);
                alert("Could not load quiz questions. Please try again later.");
            }
        })
        .catch(err => {
            console.error("Quiz fetch failed:", err);
            alert("Unable to start quiz. Please check your connection or try again later.");
        });
}



/**
 * Renders the quiz interface inside the chatbot window.
 *
 * - Clears previous chatbot content.
 * - Adds a quiz navigation bar with a title and "Back" button.
 * - Creates a container to display quiz questions.
 * - Initiates the first question display.
 */
//making the quiz UI layout: header and question container..
function renderQuizUI() {
    const chatBody = document.querySelector('.chatbot_container .chatbot_body');
    chatBody.innerHTML = ''; //clear previous content..

    //create navigation bar with title and back button..
    const quizNav = document.createElement('div');
    quizNav.className = 'quiz_nav';

    const title = document.createElement('span');
    title.className = 'quiz_title';
    title.textContent = 'Quiz';

    const backBtn = document.createElement('button');
    backBtn.id = 'quiz_back';
    backBtn.textContent = 'Back';
    backBtn.className = 'quiz-back-button';
    backBtn.addEventListener('click', () => {
        resetChatbotBody(); //return to main menu..
    });

    quizNav.appendChild(title);
    quizNav.appendChild(backBtn);

    //quiz content container for questions....
    const quizContent = document.createElement('div');
    quizContent.id = 'quiz_content';
    quizContent.style.display = 'flex';
    quizContent.style.flexDirection = 'column';
    quizContent.style.gap = '10px';

    chatBody.appendChild(quizNav);
    chatBody.appendChild(quizContent);

    showQuestion(); //show the first question..
}



/**
 * Renders the current quiz question and its corresponding input options.
 *
 * - Displays the question text.
 * - Handles rendering of different input types based on the question type:
 *   - Multiple Choice: renders buttons for each option.
 *   - True/False: renders two fixed buttons.
 *   - Text: renders an input field and a submit button.
 * - Scrolls to the question block after rendering.
 */
//displays a single question and its input options...
function showQuestion() {
    const quizContent = document.getElementById('quiz_content');
    const questionData = quizQuestions[currentQuizIndex];

    const quizDiv = document.createElement('div');
    quizDiv.className = 'quiz-question';

    const questionEl = document.createElement('p');
    questionEl.className = 'message';
    questionEl.textContent = `Q${currentQuizIndex + 1}. ${questionData.question}`;
    quizDiv.appendChild(questionEl);

    //handle multiple choice questions..
    if (questionData.type === 'multiple') {
        questionData.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = option;
            optionBtn.className = 'quiz-option';
            optionBtn.addEventListener('click', () => handleAnswer(index, quizDiv));
            quizDiv.appendChild(optionBtn);
        });
    }
    //handle true/false questions..
    else if (questionData.type === 'truefalse') {
        ['True', 'False'].forEach((val) => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = val;
            optionBtn.className = 'quiz-option';
            optionBtn.addEventListener('click', () => handleAnswer(val.toLowerCase() === 'true', quizDiv));
            quizDiv.appendChild(optionBtn);
        });
    }
    //handle text-based short answers..
    else if (questionData.type === 'text') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your answer';
        input.className = 'quiz-text-input';
        quizDiv.appendChild(input);

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.className = 'quiz-option';
        submitBtn.addEventListener('click', () => {
            handleAnswer(input.value.trim().toLowerCase(), quizDiv);
        });
        quizDiv.appendChild(submitBtn);
    }

    quizContent.appendChild(quizDiv);
    quizDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}



/**
 * Handles the user's answer submission and determines if it is correct.
 *
 * - Disables all input options once a selection is made.
 * - Checks the correctness of the answer based on question type.
 * - Displays immediate feedback ("Correct!" or "Incorrect.").
 * - Updates the quiz score if the answer is correct.
 * - Proceeds to the next question or shows final results after a brief delay.
 *
 * @param {string|number|boolean} selected - The user's selected answer.
 * @param {HTMLElement} parentDiv - The container element of the current question.
 */
//handles user's answer and moves to the next question or shows results...
function handleAnswer(selected, parentDiv) {
    const questionData = quizQuestions[currentQuizIndex];
    let isCorrect = false;

    //disable all options once one is selected...
    const buttons = parentDiv.querySelectorAll('.quiz-option');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });

    //check answer correctness..
    if (questionData.type === 'multiple') {
        isCorrect = selected === questionData.correctAnswer;
    } else if (questionData.type === 'truefalse') {
        isCorrect = selected === questionData.correctAnswer;
    } else if (questionData.type === 'text') {
        const correctText = questionData.correctAnswer.trim().toLowerCase();
        isCorrect = selected === correctText;
    }

    //show feedback..
    const feedback = document.createElement('p');
    feedback.className = 'message';
    feedback.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect.';
    parentDiv.appendChild(feedback);

    //update score..
    quizScore += isCorrect ? 1 : 0;
    currentQuizIndex++;

    //show next question or results after short delay..
    setTimeout(() => {
        if (currentQuizIndex < quizQuestions.length) {
            showQuestion();
            setTimeout(() => {
                document.getElementById('quiz_content').scrollTop = document.getElementById('quiz_content').scrollHeight;
            }, 100);
        } else {
            showQuizResults();
        }
    }, 800);
}



/**
 * Returns a URL to the appropriate blog or article based on the quiz category slug.
 *
 * - Maps each category slug to a corresponding blog path.
 * - Defaults to the general blog homepage if the category is not explicitly listed.
 *
 * @param {string} categorySlug - The normalized slug of the quiz category.
 * @returns {string} - The full URL to the reference blog for the category.
 */
//returns the URL to the category reference blog..
function getReferenceLinkByCategory(categorySlug) {
    const base = "https://foodmicrobiology.academy/";

    const categoryMap = {
        "food-safety-&-pathogens": "blogs/",
        "fermentation-&-beneficial-microbes": "blogs/",
        "food-preservation-techniques": "blogs/",
        "emerging-tech-in-food-microbiology": "blockchain-or-bust-a-business-and-science-revolution-for-food-microbiology/",
        "career-&-diversity-in-stem": "blogs/",
        "general": "blogs/"
    };

    return base + (categoryMap[categorySlug] || "");
}



/**
 * Displays the final quiz result to the user and stores it in localStorage.
 *
 * - Optionally shows the last quiz result (if stored).
 * - Displays the current quiz score.
 * - Provides a reference blog link based on the selected quiz category.
 * - Offers options to retake the quiz or return to the main chatbot menu.
 */
//displays the final quiz result and stores it in localStorage..
function showQuizResults() {
    const quizContent = document.getElementById('quiz_content');
    quizContent.innerHTML = ''; //clear previous content..

    //show previous result if exists..from localStorage...
    const lastResult = localStorage.getItem('lastQuizResult');
    if (lastResult) {
        const { score, total, timestamp } = JSON.parse(lastResult);

        const previousBlock = document.createElement('div');
        previousBlock.className = 'quiz-previous';

        const prevTitle = document.createElement('p');
        prevTitle.className = 'message';
        prevTitle.textContent = `📊 Previous Quiz Result (${timestamp})`;
        previousBlock.appendChild(prevTitle);

        const prevScore = document.createElement('p');
        prevScore.className = 'message';
        prevScore.textContent = `Score: ${score}/${total}`;
        previousBlock.appendChild(prevScore);

        quizContent.appendChild(previousBlock);
    }

    //display current result..
    const resultBlock = document.createElement('div');
    resultBlock.className = 'quiz-result';

    const congrats = document.createElement('p');
    congrats.className = 'message';
    congrats.textContent = '🎉 Quiz Completed!';
    resultBlock.appendChild(congrats);

    const scoreText = `Your score: ${quizScore}/${quizQuestions.length}`;
    const score = document.createElement('p');
    score.className = 'message';
    score.textContent = scoreText;
    resultBlock.appendChild(score);

    //show resource link based on category...
    const categoryLink = getReferenceLinkByCategory(quizCategory);

    if (categoryLink && categoryLink !== "https://foodmicrobiology.academy/") {
        const refParagraph = document.createElement('p');
        refParagraph.className = 'message';

        const link = document.createElement('a');
        link.href = categoryLink;
        link.target = '_blank';
        link.className = 'quiz-reference-link';
        link.textContent = '🔗 Click here to learn more';

        refParagraph.appendChild(link);
        resultBlock.appendChild(refParagraph);
    }

    //save result to localStorage...
    const quizResult = {
        score: quizScore,
        total: quizQuestions.length,
        timestamp: new Date().toLocaleString()
    };
    localStorage.setItem('lastQuizResult', JSON.stringify(quizResult));

    //retake and back buttons..
    const retryBtn = document.createElement('button');
    retryBtn.className = 'quiz-option';
    retryBtn.textContent = 'Retake Quiz';
    retryBtn.addEventListener('click', () => {
        renderQuizSetupUI();
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'quiz-option';
    backBtn.textContent = 'Return to Menu';
    backBtn.addEventListener('click', () => {
        resetChatbotBody();
    });

    resultBlock.appendChild(retryBtn);
    resultBlock.appendChild(backBtn);

    quizContent.appendChild(resultBlock);
    quizContent.scrollTop = quizContent.scrollHeight;
}



/**
 * Returns the current state of the quiz.
 *
 * @returns {Object} An object containing:
 *   - quizScore {number}: The current score accumulated by the user.
 *   - currentQuizIndex {number}: The index of the current question in the quiz.
 *
 * For test
 */
//utility to expose score and progress externally if needed..
function getQuizState() {
    return { quizScore, currentQuizIndex };
}



//this is for chatbot badge.. So you can see what chabot container got from the chatbot icon..
//phrases to display inside the chatbot badge, rotated one by one..
/**
 * Array of rotating phrases to display inside the chatbot badge.
 * Used to cycle through attention-grabbing messages.
 */
const phrases = [
    'Take a quiz..',
    'Contact us',
    'Ask us..',
    'Blog search',
    'Need help?'
];
let badge = document.getElementById('chatbot_badge');  //reference to the badge element..
let currentPhrase = 0;
let charIndex = 0;



/**
 * Initiates a looping typewriter animation that displays one phrase at a time
 * from the `phrases` array in the chatbot badge. After fully typing a phrase,
 * it waits 2 seconds before starting the next one.
 */
//function to type one character at a time from the current phrase//
function typeWriterEffect() {
    if (!badge) return;  //if badge is not found, exit..

    const phrase = phrases[currentPhrase]; //get the current phrase....
    if (charIndex < phrase.length) {
        //add the next character to the badge's text content..
        badge.textContent += phrase.charAt(charIndex);
        charIndex++;
        //call this function again after a short delay to type next character...
        setTimeout(typeWriterEffect, 100);
    } else {
        //once the phrase is fully typed, wait 2 seconds and reset to the next one..
        setTimeout(() => {
            badge.textContent = '';                //clear current text..
            charIndex = 0;                         //resetting character index..
            currentPhrase = (currentPhrase + 1) % phrases.length;   //go to next phrase..
            typeWriterEffect();                    //start typing the new phrase...
        }, 2000);
    }
}
//start the typing effect as soon as the script loads...
typeWriterEffect();




//this is for test.. for calling in test folder..
module.exports = {
    startQuiz,
    renderQuizUI,
    renderQuizSetupUI,
    saveMessageToLocalStorage,
    clearChat,
    addMessageToChat,
    showQuizResults,
    showQuestion,
    handleAnswer,
    getReferenceLinkByCategory,
    getQuizState,sendFeedback,
    appendMessage, addMessageToChat,
    typeWriterEffect,
    getBadge: () => badge,
    getCurrentPhrase: () => currentPhrase,
    getCharIndex: () => charIndex,
    setGlobals: (customBadge, customPhrases) => {
        badge = customBadge;
        phrases.length = 0;
        phrases.push(...customPhrases);
        currentPhrase = 0;
        charIndex = 0;
    }
};



// // Render Admin Login UI
// function renderAdminLoginUI() {
//     const chatBody = document.querySelector('.chatbot_container .chatbot_body');
//     chatBody.innerHTML = '';

//     // Container for login fields
//     const formDiv = document.createElement('div');
//     formDiv.className = 'admin-login-setup';
//     formDiv.innerHTML = `
//         <label for="admin_username">Username</label>
//         <input type="text" id="admin_username" autocomplete="username" placeholder="Enter your username">
//         <label for="admin_password">Password</label>
//         <input type="password" id="admin_password" autocomplete="current-password" placeholder="Enter your password">
//         <button type="submit">Login</button>
//         <div id="admin-login-error" style="color:#FF6B6B;margin-top:12px;min-height:18px;"></div>
//     `;

//     chatBody.appendChild(formDiv);

//     // Autofocus username field
//     formDiv.querySelector('input#admin_username').focus();    

//     // Top nav bar for Admin Login, with Back button on right
//     const navDiv = document.createElement('div');
//     navDiv.className = 'quiz_nav';
//     navDiv.innerHTML = `
//         <span class="quiz_title">Admin Login</span>
//         <button id="admin-back-btn" class="quiz-back-button" style="margin-left:auto;">Back</button>
//     `;
//     navDiv.querySelector('#admin-back-btn').onclick = resetChatbotBody;
//     chatBody.insertBefore(navDiv, formDiv);

//     // Handle login submit
//     formDiv.querySelector('button[type="submit"]').onclick = function (e) {
//         e.preventDefault();

//         const username = formDiv.querySelector('#admin_username').value.trim();
//         const password = formDiv.querySelector('#admin_password').value;

//         const errorDiv = formDiv.querySelector('#admin-login-error');
//         errorDiv.textContent = "";

//         if (!username || !password) {
//             errorDiv.textContent = "Username and password required.";
//             return;
//         }

//         // Show loading
//         errorDiv.style.color = "#ccc";
//         errorDiv.textContent = "Logging in...";

//         // AJAX request to server
//         fetch(chatbotAjax.ajax_url, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//             body: new URLSearchParams({
//                 action: 'my_chatbot_admin_login',
//                 username: username,
//                 password: password
//             })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 errorDiv.style.color = "#17c618";
//                 errorDiv.textContent = "Login successful! Loading admin panel…";
//                 // Store session flag
//                 localStorage.setItem('isAdmin', 'true');  
//                 // Make sure to check for the flag in renderadmindashboardUI              
//                 // TODO: Redirect to Vincent's dashboard
//                 // Render admin dashboard UI
//             } else {
//                 errorDiv.style.color = "#FF6B6B";
//                 errorDiv.textContent = data.message || "Login failed. Check your credentials.";
//             }
//         })
//         .catch(() => {
//             errorDiv.style.color = "#FF6B6B";
//             errorDiv.textContent = "Error contacting server. Please try again.";
//         });
//     };
// }

