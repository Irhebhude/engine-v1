# Secure Search Interface and Web Results

## Goal
Close the exposed developer-key path without placing any private key in frontend code, then update the existing search controls and Web Results presentation without rebuilding SEARCH-POI Engine v1.

## Implementation
1. **Close and rotate the leak**
   - Generate a new private internal proxy secret in Lovable Secrets.
   - Replace the hardcoded key in all three server-only `poi`/`search` handlers with fail-closed environment reads.
   - Teach the existing POI API to recognize that internal server secret while preserving normal user-generated API keys and credit behavior.
   - Deactivate the exposed developer key in the database, then scan the repository to confirm its value no longer exists.

2. **Upgrade the search controls in place**
   - Keep the existing AI Search, Deep Research, and Code mode tabs and the current search bar/value.
   - Arrange the requested tool filters into four responsive rows directly below the search bar.
   - Keep Web, Images, and Videos as the bottom result tabs, with Web visibly active in teal.
   - Preserve every existing tool action and search mode; News remains available as a filter action.

3. **Clean and restyle Web Results**
   - Normalize incoming titles/snippets before rendering: strip HTML, Markdown, pagination spam, list noise, separators, and malformed link text.
   - Render at most 10 clean Google-style rows with favicon/domain breadcrumb, teal title, two-line gray snippet, and AI Summary action.
   - Use the fallback “No description - click AI Summary” whenever cleaning leaves no useful description.
   - Preserve business badges, contact actions, and AI summaries without adding result cards or borders.

4. **Validate and publish**
   - Check the build diagnostics and run focused tests for the text cleaner.
   - Exercise search, Web/Images/Videos tabs, tool pills, and AI Summary in desktop and mobile browser views.
   - Re-scan for the leaked value, verify the old key is inactive, and publish to `engine-v1.lovable.app`.

## Technical details
- Private credentials remain server-side environment variables only; no `VITE_` variable or frontend bundle will contain them.
- Existing `/functions/v1/poi-api` developer integrations remain compatible; only the compromised key is revoked.
- Existing search fetching, AI answers, offline fallback, and backend data logic remain unchanged outside the focused security and presentation updates.