class Private::Message < ApplicationRecord
  self.table_name = "private_messages"
  belongs_to :user
  belongs_to :conversation,
             class_name: 'Private::Conversation',
             foreign_key: :conversation_id

  after_create_commit do
    Private::MessageBroadcastJob.perform_later(self, previous_message)
  end

  def previous_message
    # Find the message created right before this one
    previous_message_index = self.conversation.messages.index(self)
    return nil if previous_message_index.nil? || previous_message_index == 0
    self.conversation.messages[previous_message_index - 1]
  end


end
