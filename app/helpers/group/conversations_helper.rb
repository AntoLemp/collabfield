module Group::ConversationsHelper
  include Shared::MessagesHelper
  def group_conv_seen_status(conversation, current_user)
    # handle background service calls or missing users
    return "" if current_user.nil?

    # assign the last message to a variable
    last_msg = conversation.messages.last

    # if there are no messages, the conversation is effectively "seen"
    return "" if last_msg.nil?

    # check if the message was created by someone else AND not seen by current_user
    seen_by_list = last_msg.seen_by || []

    if seen_by_list.include?(current_user.id)
      ""
    else
      "unseen-conv"
    end
  end

  def add_people_to_group_conv_list(conversation)
    contacts = current_user.all_active_contacts
    users_in_conv = conversation.users
    add_people_to_conv_list = []
    contacts.each do |contact|
      # if the contact is already in the conversation, remove it from the list
      if !users_in_conv.include?(contact)
        add_people_to_conv_list << contact
      end
    end
    add_people_to_conv_list
  end

  def load_group_messages_partial_path(conversation)
    if conversation.messages.count > 0
      "group/conversations/conversation/messages_list/load_messages"
    else
      "shared/empty_partial"
    end
  end

  def group_message_date_check_partial_path(new_message, previous_message)
    # If no previous message exists, this is the first message! Show the date.
    if previous_message.blank?
      "group/messages/message/new_date"
    else
      # If a previous message exists, only show date if it's a different day
      if previous_message.created_at.to_date != new_message.created_at.to_date
        "group/messages/message/new_date"
      else
        "shared/empty_partial"
      end
    end
  end

  def group_message_seen_by(message)
    seen_by_names = []
    # If anyone has seen the message
    if message.seen_by.present?
      message.seen_by.each do |user_id|
        seen_by_names << User.find(user_id).name
      end
    end
    seen_by_names
  end

  def message_content_partial_path(user, message, previous_message)
    # if previous message exists
    if defined?(previous_message) && previous_message.present?
      # if new message is created by the same user as previous'
      if previous_message.user_id == user.id
        "group/messages/message/same_user_content"
      else
        "group/messages/message/different_user_content"
      end
    else
      "group/messages/message/different_user_content"
    end
  end

  def seen_by_user?
    @seen_by_user ? "" : "unseen"
  end


end
