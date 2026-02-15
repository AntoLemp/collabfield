import "@hotwired/turbo-rails"
import $ from "jquery"
import initPostStyling from "./posts/style" // Import the function

// Globalize jQuery
window.jQuery = $
window.$ = $

// Execute the function
initPostStyling();