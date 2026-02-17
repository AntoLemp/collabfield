require 'rails_helper'

# Specs in this file have access to a helper object that includes
# the Private::ConversationsHelper. For example:
#
# describe Private::ConversationsHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe Private::ConversationsHelper, type: :helper do
  context '#load_private_messages' do
    let(:conversation) { create(:private_conversation) }

    it "returns load_messages partial's path" do
      create(:private_message, conversation_id: conversation.id)
      expect(helper.load_private_messages(conversation)).to eq('private/conversations/conversation/messages_list/link_to_previous_messages')
    end

    it "returns empty partial's path" do
      expect(helper.load_private_messages(conversation)).to eq('shared/empty_partial')
    end
  end
  context '#contacts_except_recipient' do
    it 'return all contacts, except the opposite user of the chat' do
      contacts = create_list(:contact,
                             5,
                             user_id: current_user.id,
                             accepted: true)

      contacts << create(:contact,
                         user_id: current_user.id,
                         contact_id: recipient.id,
                         accepted: true)
      helper.stub(:current_user).and_return(current_user)
      expect(helper.contacts_except_recipient(recipient)).not_to include recipient
    end
  end

  context '#create_group_conv_partial_path' do
    let(:contact) { create(:contact) }

    it "returns a create_group_conversation partial's path" do
      helper.stub(:recipient_is_contact?).and_return(true)
      expect(helper.create_group_conv_partial_path(contact)).to(
        eq 'private/conversations/conversation/heading/create_group_conversation'
      )
    end

    it "returns an empty partial's path" do
      helper.stub(:recipient_is_contact?).and_return(false)
      expect(helper.create_group_conv_partial_path(contact)).to(
        eq 'shared/empty_partial'
      )
    end
  end
end
