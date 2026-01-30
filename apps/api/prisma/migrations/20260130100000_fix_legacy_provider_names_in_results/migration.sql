-- Fix legacy provider names in scan results JSON
-- This migration updates OPENAI → CHATGPT and ANTHROPIC → CLAUDE in the results JSON column

UPDATE "Scan"
SET results = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'provider' = 'OPENAI' THEN jsonb_set(elem, '{provider}', '"CHATGPT"')
      WHEN elem->>'provider' = 'ANTHROPIC' THEN jsonb_set(elem, '{provider}', '"CLAUDE"')
      ELSE elem
    END
  )
  FROM jsonb_array_elements(results::jsonb) AS elem
)
WHERE results::text LIKE '%"provider":"OPENAI"%'
   OR results::text LIKE '%"provider":"ANTHROPIC"%';
