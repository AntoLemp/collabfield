module Shared::ConversationsHelper

  def private_conv_seen_status(conversation)
    # if the latest message of a conversation is not created by a current_user
    # and it is unseen, return an unseen-conv value

    last_message = conversation.messages.last
    # If there are no messages yet, it can't be "unseen," so return nothing
    return "" if last_message.nil?

    # Now it's safe to check user_id because we know last_message exists
    if last_message.user_id != current_user.id && last_message.seen == false
      'unseen-conv'
    else
      ''
    end
    end
end
