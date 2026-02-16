import $ from "jquery"
import conversationSubscription from "../channels/private/conversation_channel"

$(document).on('turbo:load', function() {
    // --- Window Positioning Logic ---
    let chat_windows_count = $('.conversation-window').length;
    if (gon.last_visible_chat_window == null && chat_windows_count > 0) {
        gon.last_visible_chat_window = chat_windows_count;
    }
    if (gon.hidden_chats == null) {
        gon.hidden_chats = 0;
    }

    window.addEventListener('resize', hideShowChatWindow);
    positionChatWindows();
    hideShowChatWindow();

    // --- Message Handling Logic ---

    // Initial Scroll to bottom
    setTimeout(function() {
        $('.messages-list').scrollTop(10000);
    }, 100);

    // ONE handler for message submission
    // We use .off().on() to prevent duplicate listeners when Turbo reloads
    $(document).off('submit', '.send-private-message').on('submit', '.send-private-message', function(e) {
        e.preventDefault();
        var $form = $(this);
        var values = $form.serializeArray();

        // Use the imported subscription OR the window global (ensure they are the same)
        if (window.private_conversation) {
            window.private_conversation.send_message(values);
        } else {
            conversationSubscription.send_message(values);
        }

        $form.trigger('reset'); // Clear the textarea
    });

    // "Enter" Key to Send
    $(document).on('keydown', '.conversation-window, .conversation', function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            var $textarea = $(this).find('textarea');
            if ($textarea.val().trim().length > 0) {
                $(this).find('form').submit(); // This triggers the 'submit' handler above
                event.preventDefault();
            }
        }
    });

    calculateUnseenConversations();
});

// --- Keep your existing functions outside the turbo:load block ---

function positionChatWindows() {
    let chat_windows_count = $('.conversation-window').length;
    if (gon.hidden_chats + gon.last_visible_chat_window !== chat_windows_count) {
        if (gon.hidden_chats == 0) {
            gon.last_visible_chat_window = chat_windows_count;
        }
    }

    for (let i = 0; i < chat_windows_count; i++ ) {
        var right_position = i * 410;
        var chat_window = i + 1;
        $('.conversation-window:nth-of-type(' + chat_window + ')')
            .css('right', '' + right_position + 'px');
    }
}

function hideShowChatWindow() {
    // 1. Get the window element
    var $targetWindow = $('.conversation-window:nth-of-type(' + gon.last_visible_chat_window + ')');

    // 2. Safety Check: If the window doesn't exist, stop here
    if ($targetWindow.length === 0) return;

    var offset = $targetWindow.offset();

    // 3. Now it is safe to check offset.left
    if (offset.left < 50 && gon.last_visible_chat_window !== 1) {
        $targetWindow.css('display', 'none');
        gon.hidden_chats++;
        gon.last_visible_chat_window--;
    }

    if (offset.left > 550 && gon.hidden_chats !== 0) {
        gon.hidden_chats--;
        gon.last_visible_chat_window++;
        $('.conversation-window:nth-of-type(' + gon.last_visible_chat_window + ')').css('display', 'initial');
    }
}

window.calculateUnseenConversations = function() {
    var unseen_conv_length = $('#conversations-menu').find('.unseen-conv').length;
    var $counter = $('#unseen-conversations');

    if (unseen_conv_length > 0) {
        $counter.css('visibility', 'visible').text(unseen_conv_length);
    } else {
        $counter.css('visibility', 'hidden').text('');
    }
};

// 1. Use .off() to ensure we don't have multiple listeners stacking up
$(document).off('click', '.conversation-heading').on('click', '.conversation-heading', function(e) {
    e.preventDefault()
    // 2. Ignore clicks on the 'X' button or its icon
    if ($(e.target).closest('.close-conv').length > 0) return;

    var $panel = $(this).closest('.panel-default');
    var $panelBody = $panel.find('.panel-body');

    // 3. .stop(true, true) stops any current animation so it doesn't "bounce"
    $panelBody.stop(true, true).slideToggle(100, function() {
        // 4. Only trigger the load-more link if we just OPENED the window
        if ($panelBody.is(':visible')) {
            var $loadMore = $panelBody.find('.load-more-messages');
            if ($loadMore.length && $panelBody.find('ul li').length === 0) {
                $loadMore[0].click();
            }
        }
    });
});