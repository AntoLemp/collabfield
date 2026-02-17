require 'rails_helper'

# Specs in this file have access to a helper object that includes
# the Group::ConversationsHelper. For example:
#
# describe Group::ConversationsHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe Group::ConversationsHelper, type: :helper do
  context '#group_conv_seen_status' do
    it 'returns unseen-conv status' do
      conversation = create(:group_conversation)
      create(:group_message, conversation_id: conversation.id)
      current_user = create(:user)
      view.stub(:current_user).and_return(current_user)
      expect(helper.group_conv_seen_status(conversation)).to eq(
                                                               'unseen-conv'
                                                             )
    end

    it 'returns an empty string' do
      user = create(:user)
      conversation = create(:group_conversation)
      create(:group_message, conversation_id: conversation.id, user_id: user.id)
      view.stub(:current_user).and_return(user)
      expect(helper.group_conv_seen_status(conversation)).to eq ''
    end

    it 'returns an empty string' do
      user = create(:user)
      conversation = create(:group_conversation)
      message = build(:group_message, conversation_id: conversation.id)
      message.seen_by << user.id
      message.save
      view.stub(:current_user).and_return(user)
      expect(helper.group_conv_seen_status(conversation)).to eq ''
    end
  end
  context '#add_people_to_group_conv_list' do
    let(:conversation) { create(:group_conversation) }
    let(:current_user) { create(:user) }
    let(:user) { create(:user) }
    before(:each) do
      create(:contact,
             user_id: current_user.id,
             contact_id: user.id,
             accepted: true)
    end

    it 'a user is not included in a list' do
      conversation.users << current_user
      conversation.users << user
      helper.stub(:current_user).and_return(current_user)
      expect(helper.add_people_to_group_conv_list(conversation)).not_to include user
    end

    it 'a user is included in a list' do
      conversation.users << current_user
      helper.stub(:current_user).and_return(current_user)
      expect(helper.add_people_to_group_conv_list(conversation)).to include user
    end
  end

  context '#load_group_messages_partial_path' do
    let(:conversation) { create(:group_conversation) }
    it "returns load_messages partial's path" do
      create_list(:group_message, 2, conversation_id: conversation.id)
      expect(helper.load_group_messages_partial_path(conversation)).to eq(
                                                                         'group/conversations/conversation/messages_list/link_to_previous_messages'
                                                                       )
    end

    it "returns an empty partial's path" do
      expect(helper.load_group_messages_partial_path(conversation)).to eq(
                                                                         'shared/empty_partial'
                                                                       )
    end
  end
  context '#group_message_seen_by' do
    let(:message) { create(:group_message) }
    it 'returns an array with users' do
      users = create_list(:user, 2)
      users.each do |user|
        message.seen_by << user.id
      end
      message.save
      users.map! { |user| user.name }
      expect(helper.group_message_seen_by(message)).to eq users
    end

    it 'returns an empty array' do
      users = []
      expect(helper.group_message_seen_by(message)).to eq users
    end
  end

  context '#message_content_partial_path' do
    let(:user) { create(:user) }
    let(:message) { create(:group_message) }
    let(:previous_message) { create(:group_message) }

    it "returns same_user_content partial's path" do
      previous_message.update(user_id: user.id)
      expect(helper.message_content_partial_path(user,
                                                 message,
                                                 previous_message)).to eq(
                                                                         'group/messages/message/same_user_content'
                                                                       )
    end

    it "returns different_user_content partial's path" do
      expect(helper.message_content_partial_path(user,
                                                 message,
                                                 previous_message)).to eq(
                                                                         'group/messages/message/different_user_content'
                                                                       )
    end

    it "returns different_user_content partial's path" do
      previous_message = nil
      expect(helper.message_content_partial_path(user,
                                                 message,
                                                 previous_message)).to eq(
                                                                         'group/messages/message/different_user_content'
                                                                       )
    end
  end

  context '#group_message_date_check_partial_path' do
    let(:new_message) { create(:group_message) }
    let(:previous_message) { create(:group_message) }

    it "returns a new_date partial's path" do
      new_message.update(created_at: 2.days.ago)
      expect(helper.group_message_date_check_partial_path(new_message,
                                                          previous_message)).to eq(
                                                                                  'group/messages/message/new_date'
                                                                                )
    end

    it "returns an empty partial's path" do
      expect(helper.group_message_date_check_partial_path(new_message,
                                                          previous_message)).to eq(
                                                                                  'shared/empty_partial'
                                                                                )
    end

    it "returns an empty partial's path" do
      previous_message = nil
      expect(helper.group_message_date_check_partial_path(new_message,
                                                          previous_message)).to eq(
                                                                                  'shared/empty_partial'
                                                                                )
    end
  end
end
