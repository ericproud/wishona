-- Set default on existing column (column already exists, may have nulls)
UPDATE public.lists SET is_public = false WHERE is_public IS NULL;
ALTER TABLE public.lists ALTER COLUMN is_public SET DEFAULT false;

-- Update lists SELECT policy to also allow public lists (unauthenticated included)
DROP POLICY IF EXISTS "Member read" ON public.lists;
CREATE POLICY "Member read" ON public.lists FOR SELECT
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.list_invites
      WHERE list_id = lists.id
        AND user_id = auth.uid()
        AND accepted_at IS NOT NULL
    )
    OR is_public = true
  );

-- Update items SELECT policy to also allow items on public lists
DROP POLICY IF EXISTS "Member read" ON public.items;
CREATE POLICY "Member read" ON public.items FOR SELECT
  USING (
    auth.uid() = (SELECT owner_id FROM public.lists WHERE id = list_id)
    OR EXISTS (
      SELECT 1 FROM public.list_invites
      WHERE list_id = items.list_id
        AND user_id = auth.uid()
        AND accepted_at IS NOT NULL
    )
    OR (SELECT is_public FROM public.lists WHERE id = items.list_id) = true
  );
