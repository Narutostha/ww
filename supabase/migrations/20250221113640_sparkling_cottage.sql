-- Create storage bucket for product images
DO $$
BEGIN
  -- Create the bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create policy to allow authenticated users to upload files
  CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

  -- Create policy to allow public access to files
  CREATE POLICY "Allow public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

  -- Create policy to allow authenticated users to update their own files
  CREATE POLICY "Allow authenticated updates"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() = owner);

  -- Create policy to allow authenticated users to delete their own files
  CREATE POLICY "Allow authenticated deletes"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() = owner);

END $$;