module Group::ConversationsHelper
  def group_conv_seen_status(conversation, current_user)
    # handle background service calls or missing users
    return '' if current_user.nil?

    # assign the last message to a variable
    last_msg = conversation.messages.last

    # if there are no messages, the conversation is effectively "seen"
    return '' if last_msg.nil?

    # check if the message was created by someone else AND not seen by current_user
    not_created_by_user = last_msg.user_id != current_user.id
    seen_by_user = last_msg.seen_by.include?(current_user.id)

    if not_created_by_user && !seen_by_user
      'unseen-conv'
    else
      ''
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
      'group/conversations/conversation/messages_list/load_messages'
    else
      'shared/empty_partial'
    end
  end

end
