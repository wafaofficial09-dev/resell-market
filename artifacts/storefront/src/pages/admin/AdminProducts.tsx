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
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        <h1 className="text-3xl font-display font-bold">Products</h1>
        <ProductFormDialog categories={categories} />
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search products..." 
          className="pl-10 h-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-[300px] w-full rounded-xl" />)
        ) : products?.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col">
            <div className="aspect-square bg-muted relative">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 opacity-20" />
                </div>
              )}
              {!product.inStock && (
                <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">Out of Stock</div>
              )}
              {product.featured && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-md">Featured</div>
              )}
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-muted-foreground text-sm mb-2">{product.categoryName || 'Uncategorized'}</p>
              <div className="flex items-center gap-2 mb-4 mt-auto">
                <span className="font-bold text-lg">₹{product.offerPrice}</span>
                {product.price > product.offerPrice && (
                  <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                )}
              </div>
              <div className="flex gap-2 border-t pt-4">
                <ProductFormDialog productToEdit={product} categories={categories} />
                <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {products?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/30 rounded-xl border border-dashed">
            <p className="text-lg text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductFormDialog({ productToEdit, categories }: { productToEdit?: any, categories?: any[] }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!productToEdit;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: productToEdit?.name || "",
    price: productToEdit?.price || "",
    offerPrice: productToEdit?.offerPrice || "",
    description: productToEdit?.description || "",
    imageUrl: productToEdit?.images?.[0] || "",
    categoryId: productToEdit?.categoryId?.toString() || "",
    inStock: productToEdit !== undefined ? productToEdit.inStock : true,
    featured: productToEdit?.featured || false,
    stockCount: productToEdit?.stockCount || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      offerPrice: Number(formData.offerPrice),
      description: formData.description,
      images: formData.imageUrl ? [formData.imageUrl] : [],
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      inStock: formData.inStock,
      featured: formData.featured,
      stockCount: formData.stockCount ? Number(formData.stockCount) : null,
    };

    if (isEditing) {
      updateProduct.mutate({ id: productToEdit.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast.success("Product updated");
          setOpen(false);
        }
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast.success("Product created");
          setOpen(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm" className="flex-1"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId} onValueChange={val => setFormData({...formData, categoryId: val})}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label>Original Price (₹)</Label>
              <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Offer Price (₹)</Label>
              <Input type="number" required value={formData.offerPrice} onChange={e => setFormData({...formData, offerPrice: e.target.value})} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Image URL</Label>
              <Input placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              {formData.imageUrl && (
                <div className="mt-2 h-40 w-40 rounded-xl border overflow-hidden bg-muted">
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Stock Count</Label>
              <Input type="number" placeholder="Leave empty for infinite" value={formData.stockCount} onChange={e => setFormData({...formData, stockCount: e.target.value})} />
            </div>

            <div className="flex items-center gap-6 md:col-span-2 p-4 bg-muted/30 rounded-xl border">
              <div className="flex items-center space-x-2">
                <Switch id="in-stock" checked={formData.inStock} onCheckedChange={checked => setFormData({...formData, inStock: checked})} />
                <Label htmlFor="in-stock">In Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="featured" checked={formData.featured} onCheckedChange={checked => setFormData({...formData, featured: checked})} />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Product"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
