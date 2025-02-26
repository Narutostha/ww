import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct, deleteProduct, uploadFile, getProducts } from "@/lib/api";
import { toast } from "sonner";
import { X, Plus, Edit, Trash, Image as ImageIcon, Package, Tag, Box, Upload, Loader2 } from "lucide-react";
import { formatNPR } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id?: string;
  name: string;
  description: string[] | string;
  price: number | string;
  main_image: string;
  featured_image: string;
  photos: string[];
  sizes: string[] | string;
  color: string[];
  stock: number | string;
}

interface ImageUploadProps {
  onUpload: (url: string) => void;
  defaultImage?: string;
  label: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, defaultImage, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultImage);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      onUpload(url);
      setPreview(url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="relative">
        {preview ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute bottom-2 right-2 bg-background/80"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="aspect-square w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8" />
                <span>Upload Image</span>
              </div>
            )}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

interface PhotoUploadProps {
  photos: string[];
  onUpload: (urls: string[]) => void;
  onRemove: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos = [], onUpload, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        files.map(file => uploadFile(file))
      );
      onUpload(uploadedUrls);
      toast.success('Photos uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo}
              alt={`Product photo ${index + 1}`}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Plus className="h-6 w-6 text-gray-400" />
          )}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductCRUD() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await fetchProducts(); // Refresh the products list after deletion
      toast.success("Product deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    fetchProducts();
    setSelectedProduct(null);
  };

  const openEditForm = (product: Product) => {
    setSelectedProduct(product);
    setFormDialogOpen(true);
  };

  const openCreateForm = () => {
    setSelectedProduct(null);
    setFormDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">Manage your store inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {selectedProduct 
                    ? "Update your product information below"
                    : "Fill in the details to add a new product to your inventory"}
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                product={selectedProduct || undefined} 
                onSuccess={handleFormSuccess} 
                onCancel={() => setFormDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/80" />
          <h3 className="mt-4 text-lg font-medium">No products yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first product</p>
          <Button onClick={openCreateForm} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.main_image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatNPR(Number(product.price))}</p>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => openEditForm(product)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the product "{product.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => product.id && handleDelete(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                        <img
                          src={product.main_image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(product.description) ? product.description[0] : product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatNPR(Number(product.price))}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditForm(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the product "{product.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => product.id && handleDelete(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || [],
    price: product?.price || "",
    main_image: product?.main_image || "",
    featured_image: product?.featured_image || "",
    photos: product?.photos || [],
    sizes: product?.sizes || [],
    color: product?.color || ['#000000'],
    stock: product?.stock || 0
  });

  const handlePhotoUpload = (newPhotos: string[]) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const handlePhotoRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        description: typeof formData.description === 'string' 
          ? formData.description.split('\n').filter(Boolean)
          : formData.description,
        sizes: typeof formData.sizes === 'string'
          ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
          : formData.sizes,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (product?.id) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={Array.isArray(formData.description) ? formData.description.join("\n") : formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (NPR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <ImageUpload
            label="Main Product Image"
            defaultImage={formData.main_image}
            onUpload={(url) => setFormData({ ...formData, main_image: url })}
          />

          <ImageUpload
            label="Featured Image"
            defaultImage={formData.featured_image}
            onUpload={(url) => setFormData({ ...formData, featured_image: url })}
          />

          <div>
            <Label>Additional Photos</Label>
            <PhotoUpload
              photos={formData.photos}
              onUpload={handlePhotoUpload}
              onRemove={handlePhotoRemove}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sizes">Sizes</Label>
            <Input
              id="sizes"
              value={Array.isArray(formData.sizes) ? formData.sizes.join(", ") : formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Colors</Label>
            <div className="space-y-2">
              {formData.color.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...formData.color];
                      newColors[index] = e.target.value;
                      setFormData({ ...formData, color: newColors });
                    }}
                    className="w-12 h-12 p-1 cursor-pointer"
                    disabled={loading}
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...formData.color];
                      newColors[index] = e.target.value;
                      setFormData({ ...formData, color: newColors });
                    }}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#000000"
                    className="flex-1 font-mono"
                    disabled={loading}
                  />
                  {formData.color.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newColors = formData.color.filter((_, i) => i !== index);
                        setFormData({ ...formData, color: newColors });
                      }}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    ...formData,
                    color: [...formData.color, '#000000']
                  });
                }}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (product ? "Update Product" : "Add Product")}
        </Button>
      </div>
    </form>
  );
}