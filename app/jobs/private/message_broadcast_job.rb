class Private::MessageBroadcastJob < ApplicationJob
  queue_as :default

  def perform(message)
    prev_msg = message.conversation.messages.where("created_at < ?", message.created_at).last
    recipient_id = message.conversation.opposed_user(message.user).id

    rendered_message = ApplicationController.render(
      partial: 'private/messages/message',
      locals: {
        message: message,
        previous_message: prev_msg,
        user: message.user
      }
    )


    [message.user_id, recipient_id].each do |id|
      ActionCable.server.broadcast(
        "private_conversations_#{id}",
        {
          message: rendered_message,
          conversation_id: message.conversation_id,
          recipient: (id == recipient_id)
        }
      )
    end
  end
end