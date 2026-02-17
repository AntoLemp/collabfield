class Private::ConversationsController < ApplicationController
  def create
    recipient_id = Post.find(params[:post_id]).user_id

    @conversation = Private::Conversation.between_users(current_user.id, recipient_id).first_or_create do |c|
      c.sender_id = current_user.id
      c.recipient_id = recipient_id
    end

    if params[:message_body].present?
      Private::Message.create(
        user_id: current_user.id,
        conversation_id: @conversation.id,
        body: params[:message_body]
      )
    end

    add_to_conversations unless already_added?

    @messages = @conversation.messages.order(created_at: :asc).limit(10)
    @messages = @messages

    @user = current_user

    respond_to do |format|
      format.js { render partial: "private/conversations/open" }
    end
  end

  def close
    @conversation_id = params[:id].to_i
    session[:private_conversations].delete(@conversation_id)

    respond_to do |format|
      format.js
      format.turbo_stream { render turbo_stream: turbo_stream.remove("pc#{@conversation.id}") }
      format.html { redirect_back(fallback_location: root_path) }
    end
  end

  def open
    @conversation = Private::Conversation.find(params[:id])
    @user = current_user
    @messages = @conversation.messages.order(created_at: :asc).limit(10)
    add_to_conversations unless already_added?
    respond_to do |format|
      format.js { render partial: 'private/conversations/open' }
    end
  end

  private

  def add_to_conversations
    session[:private_conversations] ||= []
    session[:private_conversations] << @conversation.id
  end

  def already_added?

    session[:private_conversations] ||= []
    session[:private_conversations].include?(@conversation.id)
  end




end
