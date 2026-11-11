-- Independent selection for the Top Properties page. Existing Featured flags stay unchanged.
ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS top_property boolean NOT NULL DEFAULT false;
