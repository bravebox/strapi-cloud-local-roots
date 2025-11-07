# Action Checklist

## Product visibility and calendars
- [ ] Investigate why products with monthly data don’t appear in the monthly overview
- [ ] Verify data model and relations powering monthly overview
- [ ] Add missing filters/population in the monthly overview query
- [ ] Add e2e test for a product that should appear in a given month

## Nutrients cleanup
- [ ] Migrate all Nutrient components with type “Sugar” to “Carbohydrates”
- [ ] Remove "Sugar" from `src/components/shared/nutrient.json`
- [ ] Rebuild and validate content editor for products with nutrients

## Search behavior
- [ ] Ensure case-insensitive search uses `$containsi` across relevant endpoints
- [ ] Audit custom controllers/services for any `$contains` usage and replace with `$containsi`
- [ ] Add a test query where “kohl” finds “Kohl”

## Localisation (German data transfer)
Enable transfer/sync for the following fields/blocks:
- [ ] storage
- [ ] season
- [ ] nutritional
- [ ] cooking
- [ ] cover
- [ ] carousel
- [ ] cooking_alt
- [ ] component_list
- [ ] color_theme
- [ ] Verify import/export flows for DE; add utility script if needed
- [ ] Add a smoke test to confirm DE data round-trips

## Content QA (German texts)
- [ ] Deduplicate repeated terms (e.g., “Gesundheit” appears twice)
- [ ] Translate remaining English content (e.g., ingredients)
- [ ] Spot-check 10 random entries in DE after fixes

## Recipes
- [ ] Fix “Ingredients cannot be opened” in the admin UI
- [ ] Define/link Recipe ↔ Product (bidirectional) relation and expose in API
- [ ] Define/link Recipe ↔ Region (bidirectional) relation and expose in API
- [ ] Fix importing German data for Recipes; ensure media (photos) transfer for EN and DE
- [ ] Add a sample recipe to validate the above behaviors

## Interlinking
- [ ] Define interlinks (e.g., link Regions like “Bavaria” vs “Baden-Württemberg”)
- [ ] Model interlink fields and surface them in UI and API
- [ ] Add example links and verify navigation

## Cooking metadata structure
Add structured fields to Recipes (or related CT) as needed:
- [ ] total_time
- [ ] total_time_unit
- [ ] cooking_time
- [ ] cooking_time_unit
- [ ] preparation_time
- [ ] preparation_time_unit
- [ ] cooking_temperature
- [ ] Migrate any existing free-text into structured fields (where feasible)
- [ ] Update UI forms and API responses

## Coordination
- [ ] Schedule a meeting to review issues and confirm priorities
- [ ] Agree on acceptance criteria for each item
- [ ] Plan rollout order and expected delivery dates