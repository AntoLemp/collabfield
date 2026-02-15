import "@hotwired/turbo-rails"
import $ from "jquery"
import initPostStyling from "./posts/style"
import { initPostModal } from "./posts/modal"

// Globalize jQuery
window.jQuery = $
window.$ = $

// Execute the function
initPostStyling();
initPostModal();