import "@hotwired/turbo-rails"
import $ from "jquery"
import initPostStyling from "./posts/style"
import { initPostModal } from "./posts/modal"
import { initInfiniteScroll} from "./posts/infinite_scroll";
import Rails from "@rails/ujs"
Rails.start()
//= require toggle_window
//= require conversations
//= require message_scroll

// Globalize jQuery
window.jQuery = $
window.$ = $

// Execute the function
initPostStyling();
initPostModal();
initInfiniteScroll();
import "channels"
