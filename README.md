# Penguin Road Racing School  
### Website Modifications

This repository contains custom frontend extensions for the Penguin Racing School website. The site runs on the Wild Apricot platform, and this codebase provides additional JavaScript, HTML, and CSS that extend the default functionality.

The goal of these enhancements is to improve layout, performance, and overall user experience while remaining fully compatible with Wild Apricot’s platform constraints.

&nbsp;
## Architecture

The custom code is loaded through a **Wild Apricot Custom HTML Gadget**, which injects the compiled files into the site. This approach allows for significant frontend customization while avoiding direct modifications to Wild Apricot’s underlying platform.

&nbsp;
## Project Structure

Custom frontend code is organized within the `src` directory:

- `manage-registrations/` — Logic and UI for **Registration Management**
- `event-details/` — Enhancements for **Event Details** pages
- `event-registration/` — Custom functionality for **Event Registration**
- `backend.js` — Shared utilities for executing API calls
- `style.css` — Global stylesheet for custom components and layout overrides

&nbsp;
### Developed by Marianne Kenney
