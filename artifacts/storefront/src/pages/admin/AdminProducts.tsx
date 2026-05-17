import { useState } from "react";
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
import { MultiImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, ImageIcon, Truck, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
          <MultiImageUpload
            label="Product Images"
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
