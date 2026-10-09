# Project Architecture Rules

- Private integration credentials must be read only by server-side handlers from runtime secrets; browser code may use only key-free public endpoints or publishable keys, preventing credential extraction from the frontend bundle.