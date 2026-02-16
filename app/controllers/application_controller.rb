class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  helper_method :private_conversations_windows
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :opened_conversations_windows
  private

  def opened_conversations_windows
    if user_signed_in?
      # opened conversations
      session[:private_conversations] ||= []
      @private_conversations_windows = Private::Conversation.includes(:recipient, :messages)
                                                            .find(session[:private_conversations])
      gon.last_visible_chat_window = @private_conversations_windows.size
      gon.hidden_chats = 0
    else
      @private_conversations_windows = []
    end
  end

  protected

  def configure_permitted_parameters
    # Allows :name to be saved during sign up
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    # Allows :name to be saved during profile updates
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  def redirect_if_not_signed_in
    redirect_to root_path if !user_signed_in?
  end

  def redirect_if_signed_in
    redirect_to root_path if user_signed_in?
  end

end
