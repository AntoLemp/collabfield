$(document).on('turbo:load', function() {
    let chat_windows_count = $('.conversation-window').length;
    // if the last visible chat window is not set and conversation windows exist
    // set the last_visible_chat_window variable
    if (gon.last_visible_chat_window == null && chat_windows_count > 0) {
        gon.last_visible_chat_window = chat_windows_count;
    }
    // if gon.hidden_chats doesn't exist, set its value
    if (gon.hidden_chats == null) {
        gon.hidden_chats = 0;
    }
    window.addEventListener('resize', hideShowChatWindow);

    positionChatWindows();
    hideShowChatWindow();
});

function positionChatWindows() {
    let chat_windows_count = $('.conversation-window').length;
    // if a new conversation window was added,
    // set it as the last visible conversation window
    // so the hideShowChatWindow function can hide or show it,
    // depending on the viewport's width
    if (gon.hidden_chats + gon.last_visible_chat_window !== chat_windows_count) {
        if (gon.hidden_chats == 0) {
            gon.last_visible_chat_window = chat_windows_count;
        }
    }

    // when a new chat window is added, position it to the most left of the list
    for (let i = 0; i < chat_windows_count; i++ ) {
        var right_position = i * 410;
        var chat_window = i + 1;
        $('.conversation-window:nth-of-type(' + chat_window + ')')
            .css('right', '' + right_position + 'px');
    }
}

// Hides last conversation window whenever it is close to viewport's left side
function hideShowChatWindow() {
    // if there are no conversation windows, stop the function
    if ($('.conversation-window').length < 1) {
        return;
    }
    // get an offsset of the most left conversation window
    var offset = $('.conversation-window:nth-of-type(' + gon.last_visible_chat_window + ')').offset();
    // if the left offset of the conversation window is less than 50,
    // hide this conversation window
    if (offset.left < 50 && gon.last_visible_chat_window !== 1) {
        $('.conversation-window:nth-of-type(' + gon.last_visible_chat_window + ')')
            .css('display', 'none');
        gon.hidden_chats++;
        gon.last_visible_chat_window--;
    }
    // if the offset of the most left conversation window is more than 550
    // and there is a hidden conversation, show the hidden conversation
    if (offset.left > 550 && gon.hidden_chats !== 0) {
        gon.hidden_chats--;
        gon.last_visible_chat_window++;
        $('.conversation-window:nth-of-type(' + gon.last_visible_chat_window + ')')
            .css('display', 'initial');
    }
}

import conversationSubscription from "channels/private/conversation_channel"

$(document).on('turbo:load', function() {
    $(document).off('submit', '.send-private-message').on('submit', '.send-private-message', function(e) {
        e.preventDefault();

        // Serialize the form data into an object
        var values = $(this).serializeArray();

        // Call the method on our modern subscription
        conversationSubscription.send_message(values);

        // Clear the textarea
        $(this).trigger('reset');
    });
});

$(document).on('turbo:load', function() {

    // 1. Initial Scroll: Set scrollbar to bottom to see latest messages
    // Use a slight timeout to ensure content is fully rendered
    setTimeout(function() {
        $('.messages-list').scrollTop(10000);
    }, 100);

    // 2. "Enter" Key to Send
    // We use delegation on $(document) so it works for newly opened windows
    $(document).on('keydown', '.conversation-window, .conversation', function(event) {
        // 13 is the Enter key
        if (event.keyCode === 13 && !event.shiftKey) {
            var $textarea = $(this).find('textarea');

            // If textarea is not just whitespace
            if ($.trim($textarea.val())) {
                // Trigger the 'submit' event on the form
                $(this).find('form').submit();

                // Clear the field and prevent the default newline
                event.preventDefault();
                $textarea.val("");
            }
        }
    });

    // Run the unseen counter on page load
    calculateUnseenConversations();
});

// 3. Unseen Conversations Counter
// Define this globally so it can be called from your Action Cable 'received' hook
window.calculateUnseenConversations = function() {
    var $menu = $('#conversations-menu');
    var unseen_conv_length = $menu.find('.unseen-conv').length;
    var $counter = $('#unseen-conversations');

    if (unseen_conv_length > 0) {
        $counter.css('visibility', 'visible');
        $counter.text(unseen_conv_length);
    } else {
        $counter.css('visibility', 'hidden');
        $counter.text('');
    }
};
