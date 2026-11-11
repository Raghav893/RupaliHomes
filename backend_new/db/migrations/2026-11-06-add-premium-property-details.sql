-- Optional presentation data only. Existing image_url, image_gallery, brochure_url,
-- Featured selections, and Top Property selections remain unchanged.
ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS cover_image varchar(1000),
    ADD COLUMN IF NOT EXISTS tagline varchar(255),
    ADD COLUMN IF NOT EXISTS eyebrow varchar(255),
    ADD COLUMN IF NOT EXISTS developer_name varchar(255),
    ADD COLUMN IF NOT EXISTS developer_logo varchar(1000),
    ADD COLUMN IF NOT EXISTS project_status varchar(255),
    ADD COLUMN IF NOT EXISTS accent_color varchar(7) DEFAULT '#C9B458',
    ADD COLUMN IF NOT EXISTS gallery_images jsonb,
    ADD COLUMN IF NOT EXISTS floor_plans jsonb,
    ADD COLUMN IF NOT EXISTS brochure_file_size bigint,
    ADD COLUMN IF NOT EXISTS brochure_source_url varchar(1000),
    ADD COLUMN IF NOT EXISTS brochure_preview_image varchar(1000),
    ADD COLUMN IF NOT EXISTS rera_number varchar(255),
    ADD COLUMN IF NOT EXISTS registrations_text varchar(4000);
