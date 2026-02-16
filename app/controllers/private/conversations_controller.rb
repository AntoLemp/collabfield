class Private::ConversationsController < ApplicationController
  def create
    recipient_id = Post.find(params[:post_id]).user_id
    @conversation = Private::Conversation.new(
      sender_id: current_user.id,
      recipient_id: recipient_id
    )

    if @conversation.save
      add_to_conversations unless already_added?# Saves the ID to your session

      Private::Message.create(
        user_id: current_user.id,
        conversation_id: @conversation.id,
        body: params[:message_body]
      )

      respond_to do |format|
        format.turbo_stream do
          # If you haven't created create.turbo_stream.erb yet, fall back to rendering
          # the same JS partial as plain HTML isn't ideal; better to add a turbo_stream view.
          render partial: "private/conversations/open", formats: [:js]
        end

        format.js do
          # Renders app/views/private/conversations/_open.js.erb
          render partial: "private/conversations/open"
        end

        format.html do
          # Non-JS fallback: send the user back to where they came from.
          redirect_back fallback_location: root_path, notice: "Conversation opened."
        end

        format.any { head :not_acceptable }
      end
    else
      respond_to do |format|
        format.turbo_stream { head :unprocessable_entity }
        format.js { render js: "alert('Error creating conversation');" }
        format.html do
          redirect_back fallback_location: root_path, alert: "Error creating conversation."
        end
        format.any { head :not_acceptable }
      end
    end
  end

  def close
    @conversation_id = params[:id].to_i
    session[:private_conversations].delete(@conversation_id)

    respond_to do |format|
      format.js
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
