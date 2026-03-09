-- Make cartilhas and ebooks buckets private (not public)
UPDATE storage.buckets SET public = false WHERE id IN ('cartilhas', 'ebooks');