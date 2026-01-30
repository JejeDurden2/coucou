-- Fix legacy provider names in scan results JSON
-- Uses COALESCE to handle empty arrays (jsonb_agg returns NULL for 0 rows)

UPDATE "Scan"
SET results = COALESCE(
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'provider' = 'OPENAI' THEN jsonb_set(elem, '{provider}', '"CHATGPT"')
        WHEN elem->>'provider' = 'ANTHROPIC' THEN jsonb_set(elem, '{provider}', '"CLAUDE"')
        ELSE elem
      END
    )
    FROM jsonb_array_elements(results::jsonb) AS elem
  ),
  '[]'::jsonb
)
WHERE results IS NOT NULL
  AND jsonb_typeof(results::jsonb) = 'array'
  AND (results::text LIKE '%"provider":"OPENAI"%'
       OR results::text LIKE '%"provider":"ANTHROPIC"%');
