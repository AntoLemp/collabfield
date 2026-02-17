class Group::ConversationChannel < ApplicationCable::Channel
  def subscribed
    if current_user && belongs_to_conversation(params[:id])
      stream_from "group_conversation_#{params[:id]}"
    else
      reject
    end
  end

  def unsubscribed
    stop_all_streams
  end

  def set_as_seen(data)
    conversation = Group::Conversation.find(data['conv_id'])
    last_message = conversation.messages.last

    # Using &. ensures that if last_message is nil, it just returns nil instead of crashing
    return if last_message.nil?

    # Ensure we have an array, then add the user
    current_seen_by = last_message.seen_by || []

    unless current_seen_by.include?(current_user.id)
      current_seen_by << current_user.id
      last_message.update(seen_by: current_seen_by) # .update is safer than .save for serializations
    end
  end

  def send_message(data)
    message_params = data['message'].each_with_object({}) do |el, hash|
      hash[el['name']] = el['value']
    end
    message = Group::Message.new(message_params)
    if message.save
      previous_message = message.previous_message
      Group::MessageBroadcastJob.perform_later(message, previous_message, current_user)
    end
  end

  private

  # checks if a user belongs to a conversation
  def belongs_to_conversation(id)
    current_user&.group_conversations&.ids&.include?(id.to_i)
  end

end
