# FoodMicrobiologyChatbot 2.0

<p>
  <img src="recourses/bot_icon.png" alt="Weisr Logo" width="200"/>
</p>


Welcome to Weisr, the Food Microbiology chatbot built to mke users wiser about food safety, microbiological practices, and emerging trends in the field. 
Weisr is a WordPress-integrated interactive assistant designed for the Food Microbiology Academy with a focus on education, engagement, and empowerment.

### Why "Wiser"?
"WEISR" stands for Women Empowerment in Scientific Research and this chatbot is here to make
everyone a little wiser about food microbiology!

### Release Notes V1
### Features
**Educational Modules**
* Latest Articles: Fetches and displays recent posts from the blog.
* Food Safety Tips: Offers tips on hygiene, storage, and pathogen prevention.
* Food for Thought: Provides microbiology facts.

**Search Capabilities**
* Blog Search: Enables users to search blog content using keywords, with a dedicated interface.

**Quiz Functionality**
* Customizable quiz with: 
   * Multiple choice 
   * True/False 
   * One-word questions
* Categories include:
   * General Microbiology 
   * Food Safety & Pathogens 
   * Fermentation 
   * Preservation Techniques 
   * Emerging Tech in Food Microbiology 
   * Careers & Diversity in STEM

**Chat History & Feedback**
* Persistent chat history via localStorage 
* Typing animations, speech bubbles, and user feedback with thumbs up/down 
* Chat download feature to save conversations

**Admin Panel**
* Admin login interface with credential verification

### Release Notes V2
"Based on usability testing feedback, we made minor improvements to the final product."
* Typing Speed: Increased the speed.
* Sound Indicator: Removed sound.


### Technologies Used
* JavaScript (Vanilla)   – Chatbot logic and UI interactions
* WordPress (PHP Plugin) – Backend integration and AJAX endpoints
* HTML/CSS               – Responsive, chat-like interface styling
* LocalStorage API       – Persistent session state
* AJAX + REST            – Dynamic content fetching
* Jest                   - Unit Testing

### Project Structure
* chatbot-script.js: Core logic for UI, chat flow, event handling, quiz, and search.
* chatbot-plugin.php: WordPress plugin handling AJAX actions for search, quiz, Q&A, admin login, etc,...
* Static assets: chatbot_img, chatbot_video, chatbot_audio: Media used for interactions.

### Installation Instructions
* Backend (WordPress): To get Wiser running on local WordPress setup, follow these steps:
   * Download and Install XAMPP
        * Visit https://www.apachefriends.org/index.html and install XAMPP for your OS. 
        * Launch Apache and MySQL services from the XAMPP Control Panel.
   * Set Up WordPress Locally 
        * Download WordPress from https://wordpress.org/download/. 
        * Extract WordPress into C:/xampp/htdocs/wordpress. 
        * Start the installation by navigating to http://localhost/wordpress in browser. 
        * Create a MySQL database via http://localhost/phpmyadmin and complete WordPress setup by connecting to this database.
   * Install the Chatbot Plugin 
        * Option 1: Via ZIP Upload 
           * From the WordPress Dashboard, go to: Plugins > Add New > Upload Plugin. 
           * Upload the chatbot plugin .zip file and activate it. 
        * Option 2: Manual Upload 
           * Unzip the chatbot plugin folder. 
           * Copy it to C:/xampp/htdocs/wordpress/wp-content/plugins/. 
           * Activate it from the WordPress Admin Panel under Plugins.
* Frontend
  * Ensure required elements(chatbot icon, container, buttons) exist in  HTML structure.
  * Media & Dictionary Setup
      * Place all media assets in the appropriate folder as referenced in the script:
         * recourses/dictionaries/en_US.aff
         * recourses/dictionaries/en_US.dic
         * recourses/bot_icon.png
         * recourses/clearChat.png
         * recourses/close.png
         * recourses/download.png
         * recourses/logo.png
         * recourses/return.png
         * recourses/send.png
         * recourses/smile-ringtone.mp3
         * recourses/weisr.mp4
* tests
  * All test files are located in the __tests__ directory at the root of the project. This folder includes unit tests covering functionalities such as:
      * Message handling 
      * Quiz logic and score tracking 
      * Blog search input handling 
      * UI interaction events
  * To run the test suite:
      * npm install -> npm run test


### Usage
* Click the chatbot icon to activate Weisr. 
* Hover to see Wiser’s mision message and video. 
* Ask questions, explore tips, or take a quiz based on your interest. 
* Use the download button to save your chat history. 
* Admins can log in to access admin dashboard where admin can manage all json files.


### Support & Contact
* Website: https://foodmicrobiology.academy/contact/
* Github link: https://github.com/Sruthy2020/FoodMicrobiologyChatbot
* Github project board: https://github.com/users/Sruthy2020/projects/2
* Teams channel link: https://teams.microsoft.com/l/team/19%3AYDp5jIeRR35z1v0ZkwCgUSeoJmTn6YO-vOxmIhlHdYM1%40thread.tacv2/conversations?groupId=1ac9018b-5726-4c40-baff-c8a17b38c4f4&tenantId=d1323671-cdbe-4417-b4d4-bdb24b51316b


### Contributers
* Angus McAvoy
* David Pham
* Lakshay Sachdeva
* Sruthy Ramesh
* Vincent Bethlehem


