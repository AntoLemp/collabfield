import consumer from "channels/consumer"

consumer.subscriptions.create("Private::ConversationChannel", {
  connected() {
    // console.log('Connected to private conversation channel');
  },

  disconnected() {},

  received(data) {
    // 1. Find the conversation window in the DOM
    var conversation = $('body').find("[data-pconversation-id='" + data['conversation_id'] + "']");

    // 2. Decide if we are the sender or receiver
    if (data['recipient'] === true) {
      // If we are the receiver, mark as unseen or highlight styling
      var $menuLink = $('#menu-pc' + data['conversation_id']);
      if ($menuLink.length) {
        $menuLink.addClass('unseen-conv');
      }
      // Append the message
      conversation.find('.messages-list ul').append(data['message']);
    } else {
      // If we are the sender, just append the message
      conversation.find('.messages-list ul').append(data['message']);
    }

    // 3. Auto-scroll to the bottom
    if (conversation.length) {
      var messages_list = conversation.find('.messages-list');
      messages_list.scrollTop(messages_list[0].scrollHeight);
    }
  },

  send_message: function(data) {
    return this.perform('send_message', {
      message: data
    });
  }
});