import $ from "jquery"
$(document).on('turbo:load', function() {

    // when conversation heading is clicked, toggle conversation
    $(document).off('click', '.conversation-heading')
        .on('click', '.conversation-heading', function(e) {

            var $header = $(this);
            var $panel = $header.parent();
            var $panel_body = $panel.find('.panel-body');
            var $selectUsersMenu = $header.find('.select-users-to-chat');

            // 1. Handle the '+' button click specifically
            if ($(e.target).closest('.add-people-to-chat').length > 0) {
                return
            }

            // 2. Prevent clicks on the dropdown or 'X' from collapsing the window
            if ($(e.target).closest('.select-users-to-chat, .close-conversation').length > 0) {
                return;
            }

            e.preventDefault();

            // 3. Toggle the panel body (Minimize/Expand)
            $panel_body.toggle(100, function() {
                var messages_visible = $('ul', this).has('li').length;

                // If window is now collapsed (hidden)
                if ($panel_body.css('display') == 'none') {
                    $selectUsersMenu.hide(); // Hide dropdown if we minimize the window
                    $header.css('width', '360px');
                    // Note: We no longer hide .add-people-to-chat here so it stays visible!
                }
                // If window is now expanded (visible)
                else {
                    $header.css('width', '320px');
                    $('form textarea', this).focus();

                    // Load first 10 messages if list is empty
                    if (!messages_visible && $('.load-more-messages', this).length) {
                        $('.load-more-messages', this)[0].click();
                    }
                }
            });
        });

    // when the link to open a conversation is clicked
    // and the conversation window already exists on the page
    // but it is collapsed, expand it
    $('#conversations-menu').on('click', 'li', function(e) {
        // get conversation window's id
        var conv_id = $(this).attr('data-id');
        // get conversation's type
        if ($(this).attr('data-type') == 'private') {
            var conv_type = '#pc';
        } else {
            var conv_type = '#gc';
        }
        var conversation_window = $(conv_type + conv_id);

        // if conversation window exists
        if (conversation_window.length) {
            // if window is collapsed, expand it
            if (conversation_window.find('.panel-body').css('display') == 'none') {
                conversation_window.find('.conversation-heading').click();
            }
            // mark as seen by clicking it and focus textarea
            conversation_window.find('form textarea').click().focus();
        }
    });
});


