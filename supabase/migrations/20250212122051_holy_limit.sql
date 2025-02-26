/*
  # Add Demo Products

  1. New Products
    Adds 5 initial demo products:
    - Urban Tech Puffer Jacket
    - Streetwear Cargo Pants
    - Essential Oversized Hoodie
    - Urban Core T-Shirt
    - Tech Fleece Joggers

  2. Security
    - Maintains existing RLS policies
    - Ensures products are readable by all authenticated users
*/

-- Insert demo products
INSERT INTO products (name, description, price, image, sizes, color, stock)
VALUES
  (
    'Urban Tech Puffer Jacket',
    ARRAY[
      '100% Recycled Nylon Shell',
      'Synthetic Down Insulation',
      'Water-Resistant Coating',
      'Adjustable Hood',
      'Side Zip Pockets',
      'Interior Phone Pocket'
    ],
    189.99,
    '/lovable-uploads/cfefd328-0bcf-4b27-a6c9-fa9c6b1cb3d9.png',
    ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL'],
    'Black',
    50
  ),
  (
    'Streetwear Cargo Pants',
    ARRAY[
      'Cotton-Polyester Blend',
      'Multiple Utility Pockets',
      'Adjustable Ankle Cuffs',
      'Relaxed Fit',
      'Reinforced Knee Panels',
      'Drawstring Waist'
    ],
    129.99,
    '/lovable-uploads/f28aa2dd-8b13-4a67-93fa-878e5fc802e4.png',
    ARRAY['28', '30', '32', '34', '36', '38'],
    'Olive',
    75
  ),
  (
    'Essential Oversized Hoodie',
    ARRAY[
      'Premium Cotton Blend',
      'Brushed Fleece Interior',
      'Oversized Fit',
      'Kangaroo Pocket',
      'Ribbed Cuffs and Hem',
      'Drawstring Hood'
    ],
    89.99,
    '/lovable-uploads/ff77a521-3d1d-48f3-a1dc-7aac803f9296.png',
    ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL'],
    'Grey Melange',
    100
  ),
  (
    'Urban Core T-Shirt',
    ARRAY[
      'Organic Cotton',
      'Relaxed Fit',
      'Crew Neck',
      'Dropped Shoulders',
      'Custom Graphics',
      'Pre-Shrunk'
    ],
    39.99,
    '/lovable-uploads/be1e00ad-93a9-4cec-86d7-12f48dc91dc7.png',
    ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL'],
    'White',
    150
  ),
  (
    'Tech Fleece Joggers',
    ARRAY[
      'Technical Fleece Fabric',
      'Tapered Fit',
      'Zippered Pockets',
      'Elastic Waistband',
      'Ankle Zips',
      'Reflective Details'
    ],
    99.99,
    '/lovable-uploads/cfefd328-0bcf-4b27-a6c9-fa9c6b1cb3d9.png',
    ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL'],
    'Navy',
    80
  );