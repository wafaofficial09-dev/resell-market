import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, ImageIcon, Upload, X, Truck, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json();
}

async function uploadImageFile(file: File): Promise<string> {
  const { uploadURL, objectPath } = await requestUploadUrl(file);
  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Upload failed");
  return `/api/storage${objectPath}`;
}

function ImageUploadSection({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImageFile(files[i]);
        newUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Product Images</Label>

      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/3",
          uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        )}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
          disabled={uploading}
          data-testid="input-image-upload"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
            <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Tap to select images</p>
            <p className="text-xs text-muted-foreground mt-1">or drag and drop here</p>
            <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP • Multiple allowed</p>
          </>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border-2 border-transparent hover:border-primary/30 transition-all">
              <img
                src={img}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={e => (e.currentTarget.style.opacity = "0.3")}
              />
              {index === 0 && (
                <div className="absolute top-1 left-1">
                  <Badge className="text-[10px] px-1 py-0 bg-primary/90 text-white">Main</Badge>
                </div>
              )}
              <button
                type="button"
                className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          No images yet. Upload at least one image.
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useListProducts({ search: search || undefined });
  const { data: categories } = useListCategories();
  const queryClient = useQueryClient();
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast.success("Product deleted");
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display font-bold">Products</h1>
        <ProductFormDialog categories={categories} />
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10 h-11 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-products"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-[320px] w-full rounded-2xl" />)
        ) : products?.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col glass-card border-white/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group">
            <div className="aspect-square bg-muted relative overflow-hidden">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                  <ImageIcon className="h-12 w-12 opacity-20" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                {!product.inStock && (
                  <Badge variant="destructive" className="text-[10px] font-bold px-2">Out of Stock</Badge>
                )}
                {product.featured && (
                  <Badge className="text-[10px] bg-primary/90 text-white border-none px-2">Featured</Badge>
                )}
                {product.hasDeliveryCharge && (
                  <Badge variant="outline" className="text-[10px] px-2 bg-amber-50 text-amber-700 border-amber-300">
                    <Truck className="h-2.5 w-2.5 mr-1" />₹{product.deliveryCharge || 50} delivery
                  </Badge>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  +{product.images.length - 1} more
                </div>
              )}
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 leading-snug">{product.name}</h3>
              <p className="text-muted-foreground text-xs mb-3">{product.categoryName || "Uncategorized"}</p>
              <div className="flex items-center gap-2 mb-4 mt-auto">
                <span className="font-bold text-base text-primary">₹{product.offerPrice}</span>
                {product.price > product.offerPrice && (
                  <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
                )}
                {product.discountPercent && product.discountPercent > 0 ? (
                  <Badge className="text-[10px] bg-secondary/10 text-secondary border-none px-1.5">{product.discountPercent}% off</Badge>
                ) : null}
              </div>
              <div className="flex gap-2 border-t pt-3">
                <ProductFormDialog productToEdit={product} categories={categories} />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={() => handleDelete(product.id)}
                  data-testid={`button-delete-product-${product.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && products?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border border-dashed">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No products found. Add your first product!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductFormDialog({ productToEdit, categories }: { productToEdit?: any; categories?: any[] }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!productToEdit;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: productToEdit?.name || "",
    price: productToEdit?.price?.toString() || "",
    offerPrice: productToEdit?.offerPrice?.toString() || "",
    description: productToEdit?.description || "",
    images: productToEdit?.images || [] as string[],
    categoryId: productToEdit?.categoryId?.toString() || "",
    inStock: productToEdit !== undefined ? productToEdit.inStock : true,
    featured: productToEdit?.featured || false,
    stockCount: productToEdit?.stockCount?.toString() || "",
    hasDeliveryCharge: productToEdit?.hasDeliveryCharge || false,
    deliveryCharge: productToEdit?.deliveryCharge?.toString() || "50",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.price || Number(formData.price) <= 0) errs.price = "Valid price required";
    if (!formData.offerPrice || Number(formData.offerPrice) <= 0) errs.offerPrice = "Valid offer price required";
    if (Number(formData.offerPrice) > Number(formData.price)) errs.offerPrice = "Offer price must be less than original price";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      offerPrice: Number(formData.offerPrice),
      description: formData.description || null,
      images: formData.images,
      categoryId: formData.categoryId && formData.categoryId !== "none" ? Number(formData.categoryId) : null,
      inStock: formData.inStock,
      featured: formData.featured,
      stockCount: formData.stockCount ? Number(formData.stockCount) : null,
      hasDeliveryCharge: formData.hasDeliveryCharge,
      deliveryCharge: formData.hasDeliveryCharge ? Number(formData.deliveryCharge) : null,
    };

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setOpen(false);
    };

    if (isEditing) {
      updateProduct.mutate({ id: productToEdit.id, data: payload }, {
        onSuccess: () => { toast.success("Product updated successfully"); invalidate(); },
        onError: () => toast.error("Failed to update product"),
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => { toast.success("Product created successfully"); invalidate(); },
        onError: () => toast.error("Failed to create product"),
      });
    }
  };

  const discountPercent = formData.price && formData.offerPrice
    ? Math.round(((Number(formData.price) - Number(formData.offerPrice)) / Number(formData.price)) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm" className="flex-1 rounded-xl" data-testid={`button-edit-product-${productToEdit?.id}`}>
            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        ) : (
          <Button className="rounded-xl" data-testid="button-add-product">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">

          {/* Images */}
          <ImageUploadSection
            images={formData.images}
            onChange={(imgs) => setFormData({ ...formData, images: imgs })}
          />

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Product Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Wireless Earbuds Pro"
                className={cn("rounded-xl h-11", errors.name && "border-destructive")}
                data-testid="input-product-name"
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Category</Label>
              <Select value={formData.categoryId} onValueChange={val => setFormData({ ...formData, categoryId: val })}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Original Price (₹) *</Label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="2999"
                className={cn("rounded-xl h-11", errors.price && "border-destructive")}
              />
              {errors.price && <p className="text-destructive text-xs">{errors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Offer Price (₹) *</Label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.offerPrice}
                onChange={e => setFormData({ ...formData, offerPrice: e.target.value })}
                placeholder="1299"
                className={cn("rounded-xl h-11", errors.offerPrice && "border-destructive")}
              />
              {errors.offerPrice && <p className="text-destructive text-xs">{errors.offerPrice}</p>}
            </div>
          </div>

          {discountPercent > 0 && (
            <div className="flex items-center gap-2 -mt-2">
              <Badge className="bg-secondary/10 text-secondary border-none">{discountPercent}% discount</Badge>
              <span className="text-xs text-muted-foreground">Customer saves ₹{Number(formData.price) - Number(formData.offerPrice)}</span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Description</Label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the product features, specifications, and benefits..."
              className="rounded-xl resize-none"
            />
          </div>

          {/* Stock Count */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Stock Count</Label>
            <Input
              type="number"
              min="0"
              placeholder="Leave empty for unlimited stock"
              value={formData.stockCount}
              onChange={e => setFormData({ ...formData, stockCount: e.target.value })}
              className="rounded-xl h-11 max-w-[200px]"
            />
          </div>

          {/* Toggles */}
          <div className="p-4 bg-muted/30 rounded-2xl border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">In Stock</Label>
                <p className="text-xs text-muted-foreground">Toggle to mark as sold out</p>
              </div>
              <Switch
                checked={formData.inStock}
                onCheckedChange={checked => setFormData({ ...formData, inStock: checked })}
                data-testid="switch-in-stock"
              />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Featured Product</Label>
                <p className="text-xs text-muted-foreground">Show on homepage featured section</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={checked => setFormData({ ...formData, featured: checked })}
                data-testid="switch-featured"
              />
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-500" />
                    Delivery Charge
                  </Label>
                  <p className="text-xs text-muted-foreground">Add a delivery fee for this product</p>
                </div>
                <Switch
                  checked={formData.hasDeliveryCharge}
                  onCheckedChange={checked => setFormData({ ...formData, hasDeliveryCharge: checked })}
                  data-testid="switch-delivery-charge"
                />
              </div>
              {formData.hasDeliveryCharge && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Charge Amount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.deliveryCharge}
                    onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })}
                    className="rounded-xl h-9 max-w-[120px]"
                    placeholder="50"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-6"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {(createProduct.isPending || updateProduct.isPending) ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                isEditing ? "Save Changes" : "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
