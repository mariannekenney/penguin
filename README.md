# Penguin Road Racing School
### Website Modifications

This repository contains custom frontend work completed for the Penguin Racing School website. The original site was built using Wild Apricot, and this repo represents an overhaul focused on improving layout, performance, and user experience while preserving compatibility with Wild Apricot’s platform constraints.

&nbsp;
## Summary of Completed Features

### Event Registration

- **Visual Improvements**  
  - Hide standard ticket options for LTF members  
  - Hide the prompt to become an LTF member for existing LTF members  
  - Add a popup confirmation when the user selects “I agree" to the cancellation terms  
  - Display an alert to users who have never registered before, with helpful information  
  - Display an alert to users who are not logged in, prompting them to log in  

- **Conditional Logic**  
  - Restrict rain insurance selection based on the current date relative to the event  
  - Restrict selection of sold-out event fields based on values set in *Custom Settings*  
  - Add an option to email management to join a waitlist when a class is sold out  

### Event Details
- Hide standard ticket options for LTF members  

### Custom Settings (New Page)
- Added a new internal admin page to:  
  - View registration counts  
  - Set limits for:  
    - Class Attending  
    - Data Driven Coaching  
    - Motorcycle Rental  

&nbsp;
## How It Works

The custom frontend code is organized within a `src` folder, structured as follows:

- `custom-settings/` — Files related to *Custom Settings* 
- `event-details/` — Files related to *Event Details*
- `event-registration/` — Files related to *Event Registration*
- `style.css` — Main stylesheet

The custom code is injected via a *Custom HTML Gadget* within Wild Apricot, which loads the compiled files from this repository. This approach enables dynamic behavior and layout control without modifying Wild Apricot’s core platform.
