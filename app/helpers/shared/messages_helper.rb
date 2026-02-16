module Shared::MessagesHelper

  def append_previous_messages_partial_path
    'shared/load_more_messages/window/append_messages'
  end

  def remove_link_to_messages
    if @is_messenger == 'false'
      if @messages_to_display_offset != 0
        'shared/empty_partial'
      else
        'shared/load_more_messages/window/remove_more_messages_link'
      end
    else
      'shared/empty_partial'
    end
  end

  def sent_or_received(message, user)
    user.id == message.user_id ? 'message-sent' : 'message-received'
  end

  def seen_or_unseen(message)
    message.seen == false ? 'unseen' : ''
  end

  def replace_link_to_private_messages_partial_path
    'private/messages/load_more_messages/window/replace_link_to_messages'
  end
end
