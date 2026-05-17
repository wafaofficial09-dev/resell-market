import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, getListBannersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SingleImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ImageIcon, Loader2, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBanners() {
  const { data: banners, isLoading } = useListBanners();
  const queryClient = useQueryClient();
  const deleteBanner = useDeleteBanner();
  const updateBanner = useUpdateBanner();

  const handleDelete = (id: number) => {
    if (confirm("Delete this banner?")) {
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
        toast.success(`Banner ${!currentActive ? "activated" : "deactivated"}`);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage homepage carousel banners</p>
        </div>
        <BannerFormDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
        ) : (
          <AnimatePresence>
            {banners?.map((banner, idx) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Card className="overflow-hidden flex flex-col glass-card border-white/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group">
                  <div className="aspect-[21/9] bg-muted relative overflow-hidden">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                        <ImageIcon className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`text-xs font-bold shadow-lg ${
                          banner.active
                            ? "bg-green-500/90 text-white border-none"
                            : "bg-black/40 text-white border-none"
                        }`}
                      >
                        {banner.active ? "● Active" : "○ Inactive"}
                      </Badge>
                    </div>
                    {banner.sortOrder !== undefined && (
                      <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3" />
                        Order: {banner.sortOrder}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-lg mb-0.5">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm text-muted-foreground mb-4">{banner.subtitle}</p>}
                    {banner.linkUrl && (
                      <p className="text-xs text-primary/70 truncate mb-3">↗ {banner.linkUrl}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={banner.active}
                          onCheckedChange={() => toggleActive(banner.id, banner.active)}
                        />
                        <Label className="text-sm text-muted-foreground cursor-pointer">
                          {banner.active ? "Visible" : "Hidden"}
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <BannerFormDialog bannerToEdit={banner} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!isLoading && banners?.length === 0 && (
          <div className="col-span-full py-24 text-center bg-muted/20 rounded-2xl border border-dashed">
            <ImageIcon className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No banners yet</p>
            <p className="text-muted-foreground text-sm">Add your first banner to feature on the homepage carousel.</p>
          </div>
        )}
      </div>
    </AdminLayout>
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
    sortOrder: bannerToEdit?.sortOrder?.toString() || "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error("Please upload a banner image");
      return;
    }
    const payload = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      imageUrl: formData.imageUrl,
      linkUrl: formData.linkUrl || null,
      active: formData.active,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
      setOpen(false);
    };

    if (isEditing) {
      updateBanner.mutate({ id: bannerToEdit.id, data: payload }, {
        onSuccess: () => { toast.success("Banner updated"); invalidate(); },
        onError: () => toast.error("Failed to update banner"),
      });
    } else {
      createBanner.mutate({ data: payload }, {
        onSuccess: () => { toast.success("Banner created"); invalidate(); },
        onError: () => toast.error("Failed to create banner"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm" className="rounded-xl">
            <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        ) : (
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Add Banner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{isEditing ? "Edit Banner" : "Add New Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Image Upload */}
          <SingleImageUpload
            label="Banner Image"
            value={formData.imageUrl}
            onChange={url => setFormData({ ...formData, imageUrl: url })}
            aspectClass="aspect-[21/9]"
            placeholder="Upload a wide banner image (recommended: 1920×600px)"
          />

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Summer Sale"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Subtitle</Label>
              <Input
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Up to 50% off selected items"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {/* Link & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Link URL</Label>
              <Input
                value={formData.linkUrl}
                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="/products?category=1"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Sort Order</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: e.target.value })}
                placeholder="0"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border">
            <div>
              <Label className="text-sm font-semibold">Show on homepage</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle to make this banner visible on the carousel</p>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={checked => setFormData({ ...formData, active: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl px-6" disabled={createBanner.isPending || updateBanner.isPending}>
              {(createBanner.isPending || updateBanner.isPending) ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                isEditing ? "Save Changes" : "Create Banner"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
