import $ from "jquery"
import consumer from "../consumer"

// Helper: Find conversation window (adapted to your findConv style)
const findGroupConv = (id) => {
  return $('body').find("[data-gconversation-id='" + id + "']");
};

const isGroupConvRendered = (id) => {
  return findGroupConv(id).is(':visible');
};
window.group_subscriptions = window.group_subscriptions || {};

const unsubscribeAllGroupConversationChannels = () => {
  if (!window.group_subscriptions) return;

  Object.keys(window.group_subscriptions).forEach((id) => {
    try {
      window.group_subscriptions[id].unsubscribe();
    } catch (e) {
      // ignore
    }
  });

  window.group_subscriptions = {};
};

// The Subscription Function
window.subToGroupConversationChannel = function(id) {
  // Prevent duplicate subscriptions
  if (window.group_subscriptions[id]) {
    try {
      window.group_subscriptions[id].unsubscribe();
    } catch (e) {
      // ignore
    }
    delete window.group_subscriptions[id];
  }
  window.group_subscriptions[id] = consumer.subscriptions.create(
      {
        channel: 'Group::ConversationChannel',
        id: id
      },
      {
        connected: function() { console.log("Connected to Group Chat " + id); },
        disconnected: function() {
          console.log("Disconnected from Group Chat " + id);
          delete window.group_subscriptions[id];
        },
        received: function(data) {
          // move conversation link to the top
          modifyConversationsMenuList(data['conversation_id']);

          var conversation = findGroupConv(data['conversation_id']);
          var conversation_rendered = isGroupConvRendered(data['conversation_id']);
          // Check visibility (simplified)
          var messages_visible = conversation.find('.panel-body').is(':visible');

          // mark as unseen if not from us
          MarkGroupConvAsUnseen(data['user_id'], data['conversation_id']);

          // append message
          var $message = $(data['message']);
          var senderId = data['user_id'];
          var currentUserId = $('body').attr('data-current-user-id'); // Make sure this exists in your layout!

          // If I didn't send this, swap the classes
          if (senderId != currentUserId) {
            $message.find('.row').removeClass('same-user-content').addClass('different-user-content');
            // You might also need to find the specific div that controls the alignment/color
          }

          // Now append the "corrected" message
          appendGroupMessage(conversation_rendered, messages_visible, conversation, $message);

          if (conversation_rendered) {
            var messages_list = conversation.find('.messages-list');
            messages_list.scrollTop(messages_list[0].scrollHeight);
          }
        },
        send_message: function(message) {
          return this.perform('send_message', { message: message });
        },
        set_as_seen: function(conv_id) {
          return this.perform('set_as_seen', { conv_id: conv_id });
        }
      }
  );
};

// Initialization Loop
$(document).on('turbo:load', function() {
  if (window.gon && gon.group_conversations) {
    for (var i = 0; i < gon.group_conversations.length; i++) {
      window.subToGroupConversationChannel(gon.group_conversations[i]);
    }
  }
});

// Important: Turbo can cache pages. Clear subscriptions before caching so we don't keep stale ones.
$(document).on('turbo:before-cache', function() {
  unsubscribeAllGroupConversationChannels();
});

// Event: Sending Message
$(document).on('submit', '.send-group-message', function(e) {
  e.preventDefault();
  var id = $(this).find('input[name=conversation_id]').val();
  var message_values = $(this).serializeArray();

  if (window.group_subscriptions && window.group_subscriptions[id]) {
    window.group_subscriptions[id].send_message(message_values);
    $(this).trigger('reset'); // Clear the textarea
  } else{
    window.subToGroupConversationChannel(id);
    console.warn("No active Group subscription for " + id + " (re-subscribing). Try sending again.");
  }
});

// Mark as Seen
$(document).on('click', '.conversation-window, .group-conversation', function(e) {
  var latest_message = $('.messages-list ul li:last .row', this);
  if (latest_message.hasClass('unseen')) {
    var conv_id = $(this).find('.panel').attr('data-gconversation-id');
    if (conv_id == null) {
      conv_id = $(this).find('.messages-list').attr('data-gconversation-id');
    }

    $('#menu-gc' + conv_id).removeClass('unseen-conv');
    latest_message.removeClass('unseen');
    if (typeof calculateUnseenConversations === 'function') calculateUnseenConversations();

    if (window.group_subscriptions && window.group_subscriptions[conv_id]) {
      window.group_subscriptions[conv_id].set_as_seen(conv_id);
    }
  }
});

function MarkGroupConvAsUnseen(message_user_id, conversation_id) {
  if (message_user_id !== gon.user_id) {
    newGroupConvMenuListLink(conversation_id);
    $('#menu-gc' + conversation_id).addClass('unseen-conv');
    if (typeof calculateUnseenConversations === 'function') calculateUnseenConversations();
  }
}

function modifyConversationsMenuList(conversation_id) {
  var conversation_menu_link = $('#conversations-menu ul').find('#menu-gc' + conversation_id);
  if (conversation_menu_link.length) {
    conversation_menu_link.prependTo('#conversations-menu ul');
  }
}

function appendGroupMessage(rendered, visible, group_conversation, message_html) {
  if (rendered) {
    var $message = $(message_html); // Turn the string into a jQuery object
    var sender_id = $message.find('.row').attr('data-sender-id'); // We'll add this attribute
    var current_user_id = $('body').attr('data-current-user-id'); // Or use gon.user_id

    // If I am NOT the sender, change the class so it flips to the other side
    if (sender_id != current_user_id) {
      $message.find('.row').removeClass('same-user-content').addClass('different-user-content');
    }

    group_conversation.find('.messages-list ul').append($message);
  }
}

function newGroupConvMenuListLink(conversation_id) {
  var id_attr = '#menu-gc' + conversation_id;
  var conversation_menu_link = $('#conversations-menu ul').find(id_attr);
  if (conversation_menu_link.length === 0) {
    var list_item = '<li class="conversation-window">' +
        '<a data-remote="true" rel="nofollow" data-method="post" ' +
        'href="/group/conversations/' + conversation_id + '/open">' + // FIXED ROUTE
        'group conversation</a></li>';
    $('#conversations-menu ul').prepend(list_item);
  }
}

export default window.group_subscriptions;