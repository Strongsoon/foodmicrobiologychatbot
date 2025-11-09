<?php
/*
Plugin Name: Chatbot Plugin Enhanced 
Description: A chatbot plugin for WordPress with article recommendation, Q&A, feedback, chat download, and more.
Version: 10.0
Author: P000237SE-Blog Website Chatbot Project
*/

/**
 * Enqueue the necessary CSS and JavaScript files for the chatbot.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action('admin_menu', 'fm_chatbot_add_admin_pages');
function fm_chatbot_add_admin_pages() {
  // Q&A Reader
  add_menu_page(
    'Weisr',                 // page title
    'Weisr Editor',          // menu title
    'manage_options',
    'fm-qa-reader',
    'fm_render_qa_reader',
    'dashicons-editor-help',
    80
  );

  // Helpful Answers Viewer
  add_menu_page(
    'Helpful Answers Viewer',// page title
    'Helpful Answers',       // menu title
    'manage_options',
    'fm-helpful-answers-viewer',
    'fm_render_helpful_answers',
    'dashicons-thumbs-up',
    81
  );

  // ← New: Unanswered Questions Viewer
  add_menu_page(
    'Unanswered Questions',  // page title
    'Unanswered',            // menu title
    'manage_options',
    'fm-unanswered-questions',
    'fm_render_unanswered',
    'dashicons-editor-help',
    82
  );
}

function fm_render_qa_reader() {
  echo '<div class="wrap"><h1>Weisr Editor</h1></div>';
  include plugin_dir_path(__FILE__) . 'index.html';
}

function fm_render_helpful_answers() {
  echo '<div class="wrap"><h1>Helpful Answers Viewer</h1></div>';
  include plugin_dir_path(__FILE__) . 'helpful_answers.html';
}

function fm_render_unanswered() {
  echo '<div class="wrap"><h1>Unanswered Questions</h1></div>';
  include plugin_dir_path(__FILE__) . 'unanswered.html';
}

add_action('admin_enqueue_scripts', 'fm_enqueue_admin_assets');
function fm_enqueue_admin_assets( $hook_suffix ) {
  $plugin_url = plugin_dir_url( __FILE__ );

  // Q&A Reader
  if ( $hook_suffix === 'toplevel_page_fm-qa-reader' ) {
    wp_enqueue_style(
      'fm-chatbot-style',
      $plugin_url . 'style.css',
      [],
      filemtime( plugin_dir_path(__FILE__) . 'style.css' )
    );
    wp_enqueue_script(
      'fm-qa-reader',
      $plugin_url . 'script_editor.js',
      [],
      filemtime( plugin_dir_path(__FILE__) . 'script_editor.js' ),
      true
    );
    wp_localize_script(
      'fm-qa-reader',
      'fmChatbot',
      [
        'apiEndpoint' => $plugin_url . 'edit_json.php',
        'defaultFile' => 'Q&A.json',
      ]
    );
  }

  // Helpful Answers
  if ( $hook_suffix === 'toplevel_page_fm-helpful-answers-viewer' ) {
    wp_enqueue_style(
      'fm-helpful-style',
      $plugin_url . 'style.css',
      [],
      filemtime( plugin_dir_path(__FILE__) . 'style.css' )
    );
    wp_enqueue_script(
      'fm-helpful-viewer',
      $plugin_url . 'helpful_answers_script.js',
      [],
      filemtime( plugin_dir_path(__FILE__) . 'helpful_answers_script.js' ),
      true
    );
    wp_localize_script(
      'fm-helpful-viewer',
      'fmHelpful',
      [
        'apiEndpoint' => $plugin_url . 'edit_helpful_answers.php',
        'defaultFile' => 'helpful_answers.json',
      ]
    );
  }
// Unanswered
  if ( $hook_suffix === 'toplevel_page_fm-unanswered-questions' ) {
    wp_enqueue_style(
      'fm-unanswered-style',
      $plugin_url . 'style.css',
      [],
      filemtime( plugin_dir_path(__FILE__) . 'style.css' )
    );
    wp_enqueue_script(
      'fm-unanswered-viewer',
      $plugin_url . 'unanswered.js',
      [],
      filemtime( plugin_dir_path(__FILE__) . 'unanswered.js' ),
      true
    );
    wp_localize_script(
      'fm-unanswered-viewer',
      'fmUnanswered',
      [
        'apiEndpoint' => $plugin_url . 'unanswered.php',
        'defaultFile' => 'unanswered.json',
      ]
    );
  }
}

function chatbot_enqueue_assets() {
    wp_enqueue_style('chatbot-style', plugin_dir_url(__FILE__) . 'chatbot-style.css');
    wp_enqueue_script('chatbot-script', plugin_dir_url(__FILE__) . 'chatbot-script.js', array('jquery'), null, true);
    wp_enqueue_script('typo-js', plugin_dir_url(__FILE__) . 'typo.js', array(), null, true);

    wp_localize_script('typo-js', 'typo_vars', array(
        'dictionaryPath' => plugin_dir_url(__FILE__) . 'recourses/dictionaries'
    ));

    wp_localize_script('chatbot-script', 'chatbotAjax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'pluginDirUrl' => plugin_dir_url(__FILE__)
    ));
}
add_action('wp_enqueue_scripts', 'chatbot_enqueue_assets');

/**
 * Renders the HTML structure for the chatbot interface at the footer.
 */
function my_chatbot_render_html() {
    ?>
    <div id="chatbot_icon" title="Need help? Chat with us!">
        <img id="chatbot_img" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/bot_icon.png'; ?>" alt="Chat Icon">
        <video id="chatbot_video" width="100" autoplay muted loop playsinline style="display: none;">
            <source src="<?php echo plugin_dir_url(__FILE__) . 'recourses/weisr.mp4'; ?>" type="video/mp4">
        </video>
        <div class="chatbot_speech" id="chatbot_speech"></div>
        <span id="chatbot_badge"></span>
    </div>
    <div class="chatbot_container">
        <div class="chatbot_header">
            <img id="chatbot_logo" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/logo.png'; ?>" alt="Logo">
            <span class="header_title">Weisr</span>
            <img id="chatbot_close" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/close.svg'; ?>" alt="Close Icon">
        </div>
        <div class="chatbot_body">
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
                <!-- remove admin login -->
                <!-- <div class="question"><span id="admin_login" class="bodytitle">Admin Login</span></div> -->

            </div>
        </div>
        <div id="blog_search_container" class="blog_search_container">
            <div id="search_nav">
                <p>Search Blog</p>
                <img id="return" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/return.png'; ?>" alt="return">
            </div>
            <div id="search_message" class="search_message"></div>
        </div>
        <div class="chat_util_btn_container">
            <button id="clearChatBtn" class="chat_util_btn" title="Clear Chat">
                <img src="<?php echo plugin_dir_url(__FILE__) . 'recourses/clearChat.png'; ?>" alt="Clear Chat" />
            </button>
            <button id="Download_chat_btn" class="chat_util_btn" title="Download Chat">
                <img src="<?php echo plugin_dir_url(__FILE__) . 'recourses/download.png'; ?>" alt="Download Chat" />
            </button>
        </div>
        <div class="chatbot_footer">
            <input type="text" id="chatbot_input" placeholder="Please input your question..." />
            <button id="chatbot_send"></button>
        </div>
       <!-- <audio id="chatbot_audio" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/smile-ringtone.mp3'; ?>" preload="auto"></audio> -->
    </div>
    <?php
}
add_action('wp_footer', 'my_chatbot_render_html');

/**
 * Handles AJAX request to retrieve the latest posts.
 */
function my_get_latest_posts() {
    $recent_posts = wp_get_recent_posts(array(
        'numberposts' => 3,
        'post_status' => 'publish'
    ));
    $posts_data = array();
    foreach ($recent_posts as $post) {
        $posts_data[] = array(
            'title' => $post['post_title'],
            'link' => get_permalink($post['ID'])
        );
    }
    echo json_encode($posts_data);
    wp_die();
}
add_action('wp_ajax_my_get_latest_posts', 'my_get_latest_posts');
add_action('wp_ajax_nopriv_my_get_latest_posts', 'my_get_latest_posts');

/**
 * Searches blog posts based on keywords in the title and content.
 */
function my_search_blog_posts() {
    $keyword = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';
    if (empty($keyword)) {
        wp_send_json_error('No keyword provided');
        return;
    }
    global $wpdb;
    $keywords = explode(' ', $keyword);
    $keywords = array_filter($keywords);

    $search_patterns = [];
    $similarity_score = "0";
    $full_keyword = $wpdb->esc_like($keyword);
    $search_patterns[] = "(post_title LIKE '%$full_keyword%')";
    $similarity_score .= " + (CASE WHEN post_title LIKE '%$full_keyword%' THEN 5 ELSE 0 END)";
    if (count($keywords) > 1) {
        for ($i = 0; $i < count($keywords); $i++) {
            for ($j = count($keywords) - $i; $j >= 2; $j--) {
                $sub_phrase = implode(' ', array_slice($keywords, $i, $j));
                $sub_phrase = $wpdb->esc_like($sub_phrase);
                $search_patterns[] = "(post_title LIKE '%$sub_phrase%')";
                $similarity_score .= " + (CASE WHEN post_title LIKE '%$sub_phrase%' THEN 4 ELSE 0 END)";
            }
        }
        foreach ($keywords as $word) {
            $word = $wpdb->esc_like($word);
            $search_patterns[] = "(post_title LIKE '%$word%')";
            $similarity_score .= " + (CASE WHEN post_title LIKE '%$word%' THEN 3 ELSE 0 END)";
        }
    }
    $query = "
        SELECT *, (COALESCE($similarity_score, 0)) AS relevance_score
        FROM {$wpdb->posts}
        WHERE post_status = 'publish'
        AND post_type = 'post'
        AND (" . implode(' OR ', $search_patterns) . ")
        ORDER BY relevance_score DESC
        LIMIT 5
    ";
    $posts = $wpdb->get_results($query);
    if (!empty($posts)) {
        $posts_data = [];
        foreach ($posts as $post) {
            $posts_data[] = [
                'title' => $post->post_title,
                'link' => get_permalink($post->ID)
            ];
        }
        wp_send_json_success($posts_data);
    } else {
        wp_send_json_error('No posts found');
    }
    wp_die();
}
add_action('wp_ajax_nopriv_my_search_blog_posts', 'my_search_blog_posts');
add_action('wp_ajax_my_search_blog_posts', 'my_search_blog_posts');

/**
 * Finds relevant blog posts based on a keyword.
 * Uses SQL to match keyword patterns and returns up to three posts.
 * The function normalizes the keyword, splits it into sub-phrases, and calculates similarity scores.
 */
function chatbot_find_relevant_blogs($keyword, $limit = 3) {
    global $wpdb;

    // Normalize: lowercase, trim, remove punctuation
    $normalized = strtolower(trim(preg_replace('/[^\w\s]/', '', $keyword)));
    $keywords = explode(' ', $normalized);
    $keywords = array_filter($keywords);

    // Optional: stop-word filtering (disabled in final version)
    // $stopwords = ['what','is','the','a','an','in','on','of','to','for','and','or','with'];
    // $keywords  = array_diff($keywords, $stopwords);
    // If no meaningful terms remain, return an empty array
    if (empty($keywords)) {
        return [];
    }    

    // Prepare SQL search patterns and similarity score calculation
    $search_patterns = [];
    $similarity_score = "0";

    // Full keyword match after cleanup
    $full_keyword = $wpdb->esc_like($normalized);
    $search_patterns[] = "(post_title LIKE '%$full_keyword%')";
    $similarity_score .= " + (CASE WHEN post_title LIKE '%$full_keyword%' THEN 5 ELSE 0 END)";

    // Sub-phrases and individual word matches
    if (count($keywords) > 1) {
        for ($i = 0; $i < count($keywords); $i++) {
            for ($j = count($keywords) - $i; $j >= 2; $j--) {
                $sub_phrase = implode(' ', array_slice($keywords, $i, $j));
                $sub_phrase = $wpdb->esc_like($sub_phrase);
                $search_patterns[] = "(post_title LIKE '%$sub_phrase%')";
                $similarity_score .= " + (CASE WHEN post_title LIKE '%$sub_phrase%' THEN 4 ELSE 0 END)";
            }
        }

        // Individual word matches
        foreach ($keywords as $word) {
            $word = $wpdb->esc_like($word);
            $search_patterns[] = "(post_title LIKE '%$word%')";
            $similarity_score .= " + (CASE WHEN post_title LIKE '%$word%' THEN 3 ELSE 0 END)";
        }
    }

    // Query to find relevant blog posts
    $query = "
        SELECT ID, post_title, (COALESCE($similarity_score, 0)) AS relevance_score
        FROM {$wpdb->posts}
        WHERE post_status = 'publish'
        AND post_type = 'post'
        AND (" . implode(' OR ', $search_patterns) . ")
        ORDER BY relevance_score DESC
        LIMIT $limit
    ";

    // Execute the query and format results
    $results = $wpdb->get_results($query);
    $blogs = [];
    foreach ($results as $post) {
        $blogs[] = [
            'title' => $post->post_title,
            'link' => get_permalink($post->ID)
        ];
    }
    return $blogs;
}

/**
 * Responds to user questions by searching through a Q&A JSON file for matching questions..
 * Uses word similarity to identify the most relevant answer, returns it in JSON format.
 * Unanswered questions are saved to a separate JSON file and relevant blog posts are suggested.
    * If no match is found, a fallback message is provided with links to the blog and contact page. 
 */
function my_chatbot_get_answer() {
    // Load Q&A data
    $json_data = file_get_contents(plugin_dir_path(__FILE__) . 'Q&A.json');
    $qa_data = json_decode($json_data, true);

    // Sanitize the user’s question
    $question = isset($_POST['question']) ? sanitize_text_field($_POST['question']) : '';
    if (empty($question)) {
        wp_send_json_error('No question provided');
        return;
    }

    // Normalize and remove stopwords
    $normalized = strtolower(trim(preg_replace('/[^\w\s]/', '', $question)));
    $words      = array_filter(explode(' ', $normalized));
    $stopwords  = ['what','is','the','a','an','in','on','of','to','for','and','or','with'];
    $filtered   = array_diff($words, $stopwords);
    if (empty($filtered)) {
        wp_send_json_error('Please rephrase your question with more detail.');
        return;
    }    

    // Prepare question for matching
    $lower_question = strtolower($question);
    $question_words = explode(' ', $lower_question);
    $highest_similarity = 0;
    $best_match_question = null;
    $best_match_found = false;

    // Match against each stored question
    foreach ($qa_data as $key => $value) {
        $key_lower = strtolower($key);
        $key_words = explode(' ', $key_lower);
        $word_matches = 0;
        foreach ($question_words as $q_word) {
            if (in_array($q_word, $key_words)) {
                $word_matches++;
            }
        }

        // Calculate match percentage
        $match_percentage = $word_matches / count($question_words) * 100;

        // If this question is a better match, update the best match
        if ($match_percentage > $highest_similarity) {
            $highest_similarity = $match_percentage;
            $best_match_question = $key;
            $best_match_found = true;
        }
    }

    // If a strong enough match is found, return the answer
    if ($best_match_found && $highest_similarity > 90) {
        $answers = $qa_data[$best_match_question];
        $random_answer = is_array($answers) ? $answers[array_rand($answers)] : $answers;
        wp_send_json_success(['answer' => $random_answer]);
    } else {
        // Log unanswered question and send fallback
        $unanswered_path = plugin_dir_path(__FILE__) . 'unanswered.json';
        $unanswered_data = file_exists($unanswered_path)
            ? json_decode(file_get_contents($unanswered_path), true)
            : ["questions" => []];

        // Normalize + filter gibberish
        $normalized_question = strtolower(trim(preg_replace('/[^\w\s]/', '', $question)));
        $word_count = str_word_count($normalized_question);
        $alpha_ratio = preg_match_all('/[a-zA-Z]/', $normalized_question) / max(strlen($normalized_question), 1);

        // Word count and alpha ratio checks
        if ($word_count < 2 || $alpha_ratio < 0.6) {
            wp_send_json_success([
                'answer' => "Please enter a valid question. "
                    . "If you need further assistance, please contact us."
            ]);
            wp_die();
        }

        // Check for duplicates using normalized text
        $already_logged = false;
        foreach ($unanswered_data["questions"] as $entry) {
            if (isset($entry['question']) && strtolower($entry['question']) === $normalized_question) {
                $already_logged = true;
                break;
            }
        }

        // If not already logged, add the unanswered question
        if (!$already_logged) {
            $unanswered_data["questions"][] = [
                'question' => $normalized_question,
                'timestamp' => date('c')
            ];
            file_put_contents($unanswered_path, json_encode($unanswered_data, JSON_PRETTY_PRINT));
        }

        // Blog suggestions
        $related_blogs = chatbot_find_relevant_blogs($question);
        $blog_links_html = '';

        // If related blogs are found, format them as HTML links
        if (!empty($related_blogs)) {
            $blog_links_html = "<br><br>Here are some blog posts that might help:<ul>";
            foreach ($related_blogs as $blog) {
                $blog_links_html .= "<li><a href=\"{$blog['link']}\" target=\"_blank\">{$blog['title']}</a></li>";
            }
            $blog_links_html .= "</ul>";
        }

        // Fallback message with blog links
        $fallback_message = "Thanks for your question! I don’t have an answer for that yet — but we’re working on it. "
            . "In the meantime, you might find something useful in our <a href='https://foodmicrobiology.academy/blog' target='_blank'>blog</a> or <a href='https://foodmicrobiology.academy/contact/' target='_blank'>contact us</a>."
            . $blog_links_html;

        wp_send_json_success(['answer' => $fallback_message]);

    }

    wp_die();
}


add_action('wp_ajax_my_chatbot_get_answer', 'my_chatbot_get_answer');
add_action('wp_ajax_nopriv_my_chatbot_get_answer', 'my_chatbot_get_answer');

/**
 * Provides random food safety tips by loading from a Tips JSON file.
 */
function my_chatbot_get_tips(){
    $json_data = file_get_contents(plugin_dir_path(__FILE__) . 'Tips.json');
    $tips_data = json_decode($json_data, true);
    if (is_array($tips_data['tips'])) {
        shuffle($tips_data['tips']);
        $randomTips = array_slice($tips_data['tips'], 0, 3);
        wp_send_json_success(array('tips' => $randomTips));
    } else {
        wp_send_json_error('Sorry, system can not find the file.');
    }
    wp_die();
}
add_action('wp_ajax_my_chatbot_get_tips', 'my_chatbot_get_tips');
add_action('wp_ajax_nopriv_my_chatbot_get_tips', 'my_chatbot_get_tips');

/**
 * Food for Thought random message.
 */
add_action('wp_ajax_my_chatbot_get_food_for_thought', 'my_chatbot_get_food_for_thought');
add_action('wp_ajax_nopriv_my_chatbot_get_food_for_thought', 'my_chatbot_get_food_for_thought');
function my_chatbot_get_food_for_thought() {
    $file = plugin_dir_path(__FILE__) . 'thoughts.json';
    if (file_exists($file)) {
        $json = file_get_contents($file);
        $data = json_decode($json, true);
        if (isset($data['thoughts']) && is_array($data['thoughts'])) {
            $random = $data['thoughts'][array_rand($data['thoughts'])];
            wp_send_json_success(['thought' => $random]);
        }
    }
    wp_send_json_error('No thought available.');
}

/**
 * Saves feedback to the HelpfulStats.json file.
 */
function save_feedback() {
    $answer = isset($_POST['answer']) ? sanitize_text_field($_POST['answer']) : '';
    $feedback = isset($_POST['feedback']) ? sanitize_text_field($_POST['feedback']) : '';
    if (empty($answer) || empty($feedback)) {
        wp_send_json_error('Invalid data provided');
        return;
    }
    $file_path = plugin_dir_path(__FILE__) . 'HelpfulStats.json';
    $data = file_exists($file_path) ? json_decode(file_get_contents($file_path), true) : [];
    $found = false;
    foreach ($data as &$entry) {
        if ($entry['answer'] === $answer) {
            if ($feedback === 'helpful') {
                $entry['helpful'] = isset($entry['helpful']) ? $entry['helpful'] + 1 : 1;
            } elseif ($feedback === 'not_helpful') {
                $entry['not_helpful'] = isset($entry['not_helpful']) ? $entry['not_helpful'] + 1 : 1;
            }
            $found = true;
            break;
        }
    }
    if (!$found) {
        $data[] = [
            'answer' => $answer,
            'helpful' => $feedback === 'helpful' ? 1 : 0,
            'not_helpful' => $feedback === 'not_helpful' ? 1 : 0,
        ];
    }
    if (file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT))) {
        wp_send_json_success('Feedback saved successfully');
    } else {
        wp_send_json_error('Failed to save feedback');
    }
    wp_die();
}
add_action('wp_ajax_save_feedback', 'save_feedback');
add_action('wp_ajax_nopriv_save_feedback', 'save_feedback');


function my_chatbot_get_quiz() {
    $json_file = plugin_dir_path(__FILE__) . 'quiz.json';
    if (file_exists($json_file)) {
        $json_data = file_get_contents($json_file);
        $quiz_data = json_decode($json_data, true);
        wp_send_json_success($quiz_data);
    } else {
        wp_send_json_error("Quiz file not found.");
    }
    wp_die();
}

add_action('wp_ajax_my_chatbot_get_quiz', 'my_chatbot_get_quiz');
add_action('wp_ajax_nopriv_my_chatbot_get_quiz', 'my_chatbot_get_quiz');

/**
 * Handles the admin login functionality.
 * Validates the username and password against a JSON file.
 * Returns success or error message in JSON format.
 */
function my_chatbot_admin_login_handler() {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Load from your admin_users.json where login credentials are stored
    $users = json_decode(file_get_contents(plugin_dir_path(__FILE__) . 'admin_users.json'), true);
    $found = false;
    foreach ($users as $user) {
        // if ($user['username'] === $username && password_verify($password, $user['password'])) {
        // Just for testing, no password hashing
        if ($user['username'] === $username && $user['password'] === $password) {
            $found = true;
            break;
        }
    }
    if ($found) {
        wp_send_json_success(['message' => 'Login successful!']);
    } else {
        wp_send_json_error(['message' => 'Invalid username or password.']);
    }
    wp_die();
}

add_action('wp_ajax_my_chatbot_admin_login', 'my_chatbot_admin_login_handler');
add_action('wp_ajax_nopriv_my_chatbot_admin_login', 'my_chatbot_admin_login_handler');