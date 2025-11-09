<?php
// Including necessary files manually (you can use your own JS and CSS files)
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot</title>
    <link rel="stylesheet" href="chatbot-style.css">
    <script src="chatbot-script.js" defer></script>
    <script src="typo.js" defer></script>
</head>
<body>
<div id="chatbot_icon">
    <img src="recourses/bot_icon.svg" alt="Chat Icon">
</div>
<div class="chatbot_container">
    <div class="chatbot_header">
        <img id="chatbot_logo" src="recourses/logo.png" alt="Logo">
        <span class="header_title">Chatbot</span>
        <img id="chatbot_close" src="recourses/close.svg" alt="Close Icon">
    </div>
    <div class="chatbot_body">
        <div class="chatbot_message">
            <span class="message">Hi! Welcome to Food Microbiology Academy. How can I help you?</span>
        </div>
        <div id="hot_topic">
            <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/shop/" target="_blank" style="text-decoration: none; color: inherit;"><span class="bodytitle">View our shop</span></a></div>
            <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/contact-us-2/" target="_blank" style="text-decoration: none; color: inherit;"><span class="bodytitle">Contact Us</span></a></div>
            <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
            <div class="question"><span id="start_quiz" class="bodytitle">Start Quiz</span></div>
        </div>
    </div>
    <div id="blog_search_container" class="blog_search_container">
        <div id="search_nav">
            <p>Search Blog</p>
            <img id="return" src="recourses/return.svg" alt="return">
        </div>
        <div id="search_message" class="search_message"></div>
    </div>
    <div class="chatbot_footer">
        <input type="text" id="chatbot_input" placeholder="Please input your question..." />
        <button id="chatbot_send"></button>
    </div>
</div>
</body>
</html>
<?php
// Handling AJAX requests manually
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'my_get_latest_posts':
                // Replace this with actual logic to fetch latest posts manually
                $posts_data = [
                    ['title' => 'Post 1', 'link' => 'https://example.com/post1'],
                    ['title' => 'Post 2', 'link' => 'https://example.com/post2'],
                ];
                echo json_encode($posts_data);
                break;

            case 'my_search_blog_posts':
                // Example of searching posts manually
                $keyword = $_POST['query'] ?? '';
                $posts_data = [
                    ['title' => 'Post related to ' . $keyword, 'link' => 'https://example.com/post'],
                ];
                echo json_encode($posts_data);
                break;

            case 'my_chatbot_get_answer':
                // Simulate answering a question
                $question = $_POST['question'] ?? '';
                $answers = [
                    'What is food microbiology?' => 'Food microbiology is the study of microorganisms that inhabit, create, or contaminate food.',
                ];
                echo json_encode(['answer' => $answers[$question] ?? 'Sorry, I don’t understand the question.']);
                break;

            case 'my_chatbot_get_tips':
                // Example of getting tips
                $tips = ['Tip 1: Keep food at the correct temperature.', 'Tip 2: Wash your hands regularly.'];
                echo json_encode(['tips' => $tips]);
                break;

            default:
                echo json_encode(['error' => 'Unknown action']);
                break;
        }
    }
}
?>
