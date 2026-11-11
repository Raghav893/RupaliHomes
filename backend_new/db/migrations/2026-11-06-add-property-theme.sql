-- Optional presentation theme. Existing fields and selections are untouched.
ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS theme_dark varchar(7) DEFAULT '#1c3a32',
    ADD COLUMN IF NOT EXISTS theme_darker varchar(7) DEFAULT '#12261f',
    ADD COLUMN IF NOT EXISTS theme_light varchar(7) DEFAULT '#f5f2e9',
    ADD COLUMN IF NOT EXISTS theme_name varchar(255);
