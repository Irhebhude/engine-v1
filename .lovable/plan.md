# SEARCH-POI Full Interface Redesign

## Goal
Rebuild the home experience as one long, premium intelligence workspace matching the supplied mobile references, while preserving every existing search, live-data, location, account, navigation, and subscription action.

## Implementation
- Replace the fixed legacy header and offline banner with a dark SEARCH-POI header plus a live-data status area showing sync, dynamic WAT timestamp, and GPS state.
- Keep the fixed cyan floating menu, but separate it from the top header and retain all current navigation, account, admin, history, and search-mode actions.
- Recompose the page in this scroll order: hero and search, financial rates, fintech and space intelligence, AI models and endpoint health, trending searches and live activity, large feature cards, premium/business actions, and the full POI Foundation footer.
- Scale cards, spacing, typography, borders, and subtle cyan glow to closely match the screenshots. Mobile will use tall stacked cards; desktop will use wider two-column compositions without shortening the page.
- Keep all current data sources and interactions. Remove only the visible offline/cached wording from the home header; offline fallback behavior remains available internally.
- Update shared home components where necessary so search, live data, trending activity, intelligence panels, and feature cards fit the new layout without overflow.

## Validation
- Compare mobile at 360×645 and desktop at 1280×1800 against the supplied references.
- Verify normal document scrolling, no horizontal overflow, usable search and menu controls, dynamic data states, responsive images, and footer stacking.
