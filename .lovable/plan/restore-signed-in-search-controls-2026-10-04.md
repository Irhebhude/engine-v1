# Restore signed-in search controls

## Changes
- Keep the search tool pills and Web/Images/Videos tabs visible for signed-in users, including accounts using Lite Mode.
- Keep Commodity Pulse visible after login while preserving premium analytics and existing search behavior.
- Verify the signed-in search screen on mobile and confirm there are no runtime errors or hidden controls.

## Technical detail
The affected sections are currently conditionally hidden by the account’s `lite_mode` profile setting. The fix removes that visibility condition only from the requested controls and Commodity Pulse; it does not change authentication, search, account data, or the rest of Lite Mode.
