
-- Add delete policy to allow administrative cleanup
create policy "Admins can delete questions"
  on question_bank for delete
  using (true);

-- Add update policy just in case
create policy "Admins can update questions"
  on question_bank for update
  using (true);
