module Group::ConversationsHelper
  def group_conv_seen_status(conversation, current_user)
    # if the current_user is nil, it means that the helper is called from the service
    # return an empty string
    if current_user == nil
      ''
    else
      # if the last message of the conversation is not created by this user
      # and is unseen, return an unseen-conv value
      not_created_by_user = conversation.messages.last.user_id != current_user.id
      seen_by_user = conversation.messages.last.seen_by.include? current_user.id
      not_created_by_user && seen_by_user == false ? 'unseen-conv' : ''
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
