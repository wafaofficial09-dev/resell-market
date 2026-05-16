import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, getListBannersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBanners() {
  const { data: banners, isLoading } = useListBanners();
  const queryClient = useQueryClient();
  const deleteBanner = useDeleteBanner();
  const updateBanner = useUpdateBanner();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteBanner.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          toast.success("Banner deleted");
        }
      });
    }
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateBanner.mutate({ id, data: { active: !currentActive } as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
        toast.success(`Banner ${!currentActive ? 'activated' : 'deactivated'}`);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Banners</h1>
        <BannerFormDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : banners?.map((banner) => (
          <Card key={banner.id} className="overflow-hidden flex flex-col">
            <div className="aspect-[21/9] bg-muted relative">
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 opacity-20" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={banner.active ? "default" : "secondary"}>
                  {banner.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-xl mb-1">{banner.title}</h3>
              {banner.subtitle && <p className="text-muted-foreground mb-4">{banner.subtitle}</p>}
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={banner.active} 
                    onCheckedChange={() => toggleActive(banner.id, banner.active)} 
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex gap-2">
                  <BannerFormDialog bannerToEdit={banner} />
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {banners?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/30 rounded-xl border border-dashed">
            <p className="text-lg text-muted-foreground">No banners found. Create one to show on the homepage.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Badge({ children, variant }: { children: React.ReactNode, variant: "default" | "secondary" }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold shadow-md ${variant === 'default' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
      {children}
    </span>
  );
}

function BannerFormDialog({ bannerToEdit }: { bannerToEdit?: any }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!bannerToEdit;
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: bannerToEdit?.title || "",
    subtitle: bannerToEdit?.subtitle || "",
    imageUrl: bannerToEdit?.imageUrl || "",
    linkUrl: bannerToEdit?.linkUrl || "",
    active: bannerToEdit !== undefined ? bannerToEdit.active : true,
    sortOrder: bannerToEdit?.sortOrder || "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      imageUrl: formData.imageUrl,
      linkUrl: formData.linkUrl || null,
      active: formData.active,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    if (isEditing) {
      updateBanner.mutate({ id: bannerToEdit.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          toast.success("Banner updated");
          setOpen(false);
        }
      });
    } else {
      createBanner.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          toast.success("Banner created");
          setOpen(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Banner" : "Add New Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle (Optional)</Label>
              <Input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Image URL</Label>
              <Input required placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              {formData.imageUrl && (
                <div className="mt-2 h-32 w-full rounded-xl border overflow-hidden bg-muted">
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link URL (Optional)</Label>
              <Input placeholder="/products?category=1" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2 p-4 bg-muted/30 rounded-xl border">
              <Switch id="banner-active" checked={formData.active} onCheckedChange={checked => setFormData({...formData, active: checked})} />
              <Label htmlFor="banner-active">Active (Visible on homepage)</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createBanner.isPending || updateBanner.isPending}>
              {isEditing ? "Save Changes" : "Create Banner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
