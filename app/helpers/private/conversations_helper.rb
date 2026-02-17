module Private::ConversationsHelper
  include Shared::ConversationsHelper
  def private_conv_recipient(conversation)
    conversation.opposed_user(current_user)
  end

  def load_private_messages(conversation)
    if conversation.messages.count > 0
      "private/conversations/conversation/messages_list/link_to_previous_messages"
    else
      "shared/empty_partial"
    end
  end

  def private_conversations_windows
    @private_conversations_windows || []
  end

  def contacts_except_recipient(recipient)
    contacts = current_user.all_active_contacts
    # return all contacts, except the opposite user of the chat
    contacts.delete_if {|contact| contact.id == recipient.id }
  end

  def create_group_conv_partial_path(contact)
    if recipient_is_contact?
      'private/conversations/conversation/heading/create_group_conversation'
    else
      'shared/empty_partial'
    end
  end


end
