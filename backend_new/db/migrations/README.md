# Manual database migrations

Before starting the backend with schema validation, apply
`2026-11-06-add-top-property.sql` to its PostgreSQL database using an authenticated
database client. The statement is idempotent and safe to rerun.

All existing rows receive `top_property = false`. Their `featured` values remain
unchanged: landing-page Featured selection and Top Properties selection are
independent. Set Top property explicitly in the admin form to populate the new page.

This directory is a manual migration history; the application does not execute it
automatically.

## Optional premium details

Apply `2026-11-06-add-premium-property-details.sql` before running the premium-details
backend with schema validation. It adds only missing nullable presentation columns
and uses `#C9B458` as the default accent. It never overwrites existing property data
or the original image/gallery/brochure fields.

The API's optional `galleryImages` and `floorPlans` arrays use typed JSON objects and
are stored as JSONB. Array order and the optional `order` field are retained. On
update, omitting/nulling a premium field preserves its value; an explicit empty
array clears a collection and an empty string clears optional text/media.

Apply `2026-11-06-add-property-theme.sql` before starting a backend that includes
the optional theme fields. It adds only missing nullable columns, with defaults
`themeDark = #1c3a32`, `themeDarker = #12261f`, and `themeLight = #f5f2e9`.
`themeName` is optional. Omitted/null update fields preserve stored values.
