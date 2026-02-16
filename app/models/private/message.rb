class Private::Message < ApplicationRecord
  self.table_name = "private_messages"
  belongs_to :user
  belongs_to :conversation,
             class_name: 'Private::Conversation',
             foreign_key: :conversation_id

  after_create_commit { Private::MessageBroadcastJob.perform_later(self) }

  def previous_message
    # Find the message created right before this one
    previous_message_index = self.conversation.messages.index(self)
    return nil if previous_message_index.nil? || previous_message_index == 0
    self.conversation.messages[previous_message_index - 1]
  end
  private

  def broadcast_to_users
    # 1. Broadcast to the Recipient
    ActionCable.server.broadcast(
      "private_conversations_#{self.recipient_id}",
      {
        message: render_message,
        conversation_id: self.conversation_id,
        recipient: true
      }
    )

    # 2. Broadcast to the Sender (You)
    ActionCable.server.broadcast(
      "private_conversations_#{self.user_id}",
      {
        message: render_message,
        conversation_id: self.conversation_id,
        recipient: false
      }
    )
  end

  def render_message
    ApplicationController.render(
      partial: 'private/messages/message',
      locals: { message: self }
    )
  end



end
