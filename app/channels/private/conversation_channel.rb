class Private::ConversationChannel < ApplicationCable::Channel
  def subscribed
    if current_user
      stream_from "private_conversations_#{current_user.id}"
    else
      stream_from "private_conversations_guest"
    end
  end

  def unsubscribed
    stop_all_streams
  end

  # This method name MUST match the 'this.perform' or '.send_message' call in JS
  def send_message(data)
    message_params = data['message'].each_with_object({}) do |el, hash|
      hash[el['name']] = el['value']
    end

    message = Private::Message.new(message_params)
    if message.save
      # after_create_commit in Message.rb handles the broadcasting
    else
      puts message.errors.full_messages # Check your terminal if it fails to save
    end
  end
end
