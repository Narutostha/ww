import { supabase } from './supabase';
import { toast } from 'sonner';

// Types
export type Product = {
  id: string;
  name: string;
  description: string[];
  price: number;
  main_image: string;
  featured_image: string;
  photos: string[];
  sizes: string[];
  color: string[];
  stock: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  size: string;
  selected_color: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  products?: Product;
}

// Authentication functions
export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
}

// Product functions
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data as Product;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    toast.error('Error creating product: ' + error.message);
    throw error;
  }

  toast.success('Product created successfully');
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    toast.error('Error updating product: ' + error.message);
    throw error;
  }

  toast.success('Product updated successfully');
  return data as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    toast.error('Error deleting product: ' + error.message);
    throw error;
  }

  toast.success('Product deleted successfully');
}

// File Upload function
export async function uploadFile(file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
}

export type Order = {
  id: string;
  user_id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  shipping_info: any;
  payment_info: any;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

// Order functions
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        id,
        product_id,
        size,
        selected_color,
        quantity,
        price,
        products:products(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data as Order[];
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error('Error updating order status: ' + error.message);
    throw error;
  }

  toast.success('Order status updated successfully');
  return data as Order;
}

// Shipping types
export type ShippingInfo = {
  id: string;
  region: string;
  delivery_time: string;
  cost: number;
  free_shipping_threshold: number;
  created_at: string;
  updated_at: string;
}

// Shipping functions
export async function getShippingInfo() {
  const { data, error } = await supabase
    .from('shipping_info')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shipping info:', error);
    return [];
  }
  return data as ShippingInfo[];
}

export async function updateShippingInfo(id: string, updates: Partial<ShippingInfo>) {
  const { data, error } = await supabase
    .from('shipping_info')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error('Error updating shipping info: ' + error.message);
    throw error;
  }

  toast.success('Shipping information updated successfully');
  return data as ShippingInfo;
}

export async function createShippingInfo(info: Omit<ShippingInfo, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('shipping_info')
    .insert([{
      ...info,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    toast.error('Error creating shipping info: ' + error.message);
    throw error;
  }

  toast.success('Shipping information created successfully');
  return data as ShippingInfo;
}

// Return Policy types
export type ReturnPolicy = {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  conditions: string[];
  created_at: string;
  updated_at: string;
}

// Return Policy functions
export async function getReturnPolicy() {
  const { data, error } = await supabase
    .from('return_policy')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching return policy:', error);
    return [];
  }
  return data as ReturnPolicy[];
}

export async function updateReturnPolicy(id: string, updates: Partial<ReturnPolicy>) {
  const { data, error } = await supabase
    .from('return_policy')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error('Error updating return policy: ' + error.message);
    throw error;
  }

  toast.success('Return policy updated successfully');
  return data as ReturnPolicy;
}

export async function createReturnPolicy(policy: Omit<ReturnPolicy, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('return_policy')
    .insert([{
      ...policy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    toast.error('Error creating return policy: ' + error.message);
    throw error;
  }

  toast.success('Return policy created successfully');
  return data as ReturnPolicy;
}