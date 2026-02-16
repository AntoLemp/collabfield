// app/javascript/channels/private/conversation_channel.js
import consumer from "../consumer"
// Define helper functions outside so they are only initialized once
const findConv = (conversation_id, type) => {
  // 1. Check if we are on a dedicated messenger page
  var messenger_conversation = $('body .conversation');
  if (messenger_conversation.length > 0) {
    return messenger_conversation;
  }

  // 2. Otherwise, find the chat window popup by its ID
  // Make sure your HTML uses: data-pconversation-id="57"
  return $('body').find("[data-" + type + "conversation-id='" + conversation_id + "']");
};

const isConvRendered = (conversation_id, type) => {
  if ($('body .conversation').length) return true;
  return $('body').find("[data-" + type + "conversation-id='" + conversation_id + "']").is(':visible');
};

const areMessagesVisible = (conversation) => {
  if ($('body .conversation').length) return true;
  return conversation.find('.panel-body').is(':visible');
};

window.private_conversation = consumer.subscriptions.create("Private::ConversationChannel", {
  connected() {
    console.log('Connected to private conversation channel');
  },

  received(data) {
    // Move menu link to top
    var $menuLink = $('#conversations-menu ul').find('#menu-pc' + data['conversation_id']);
    if ($menuLink.length) $menuLink.prependTo('#conversations-menu ul');

    var conversation = findConv(data['conversation_id'], 'p');
    var conversation_rendered = isConvRendered(data['conversation_id'], 'p');

    if (data['recipient'] === true) {
      $('#menu-pc' + data['conversation_id']).addClass('unseen-conv');
      if (typeof calculateUnseenConversations === 'function') {
        calculateUnseenConversations();
      }
    }

    // Append message if the window is open (for both sender and recipient)
    if (conversation_rendered && conversation.length) {
      var $list = conversation.find('.messages-list');
      var $ul = $list.find('ul');

      $ul.append(data['message']);

      // Smooth scroll to bottom after appending
      $list.stop().animate({ scrollTop: $list[0].scrollHeight }, 200);
    }
  },

  send_message: function(data) {
    return this.perform('send_message', { message: data });
  }
});

export default window.private_conversation;