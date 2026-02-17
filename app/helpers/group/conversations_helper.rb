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

end
