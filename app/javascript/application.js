import $ from "jquery"

// 1. Globalize jQuery IMMEDIATELY
window.jQuery = $
window.$ = $

import "@hotwired/turbo-rails"
import Rails from "@rails/ujs"
// 2. Start Rails UJS
if (!window._rails_loaded) {
    Rails.start()
}

// 3. Import Styles and Modals
import initPostStyling from "./posts/style"
import { initPostModal } from "./posts/modal"
import { initInfiniteScroll } from "./posts/infinite_scroll"
import conversationSubscription from "./channels/private/conversation_channel"
window.private_conversation = conversationSubscription;
// 4. Import your logic files (Converted from //= require)
// Ensure these files exist in app/javascript/ folder
import "./private/toggle_window"
import "./private/conversations"
import "./private/message_scroll"
import "./private/options"

// 5. Import Channels (This will trigger channels/index.js)
import "./channels"

// 6. Execute functions
initPostStyling();
initPostModal();
initInfiniteScroll();