import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SingleImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Loader2, Save, Store, Megaphone, Globe, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    storeName: "",
    storeTagline: "",
    whatsappNumber: "",
    logoUrl: "",
    announcementText: "",
    announcementEnabled: false,
    offerBadgeText: "",
    heroTitle: "",
    heroSubtitle: "",
    footerText: "",
    socialInstagram: "",
    socialFacebook: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        storeTagline: settings.storeTagline || "",
        whatsappNumber: settings.whatsappNumber || "",
        logoUrl: settings.logoUrl || "",
        announcementText: settings.announcementText || "",
        announcementEnabled: settings.announcementEnabled || false,
        offerBadgeText: settings.offerBadgeText || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        footerText: settings.footerText || "",
        socialInstagram: settings.socialInstagram || "",
        socialFacebook: settings.socialFacebook || "",
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateSettings.mutate({
      data: {
        ...formData,
        storeTagline: formData.storeTagline || null,
        logoUrl: formData.logoUrl || null,
        offerBadgeText: formData.offerBadgeText || null,
        heroTitle: formData.heroTitle || null,
        heroSubtitle: formData.heroSubtitle || null,
        footerText: formData.footerText || null,
        socialInstagram: formData.socialInstagram || null,
        socialFacebook: formData.socialFacebook || null,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast.success("Settings saved successfully");
        setSaving(false);
      },
      onError: () => {
        toast.error("Failed to save settings");
        setSaving(false);
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <h1 className="text-2xl font-display font-bold mb-8">Store Settings</h1>
        <div className="space-y-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Store Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your store appearance and content</p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving || updateSettings.isPending}
          size="lg"
          className="rounded-full px-8 shadow-lg shadow-primary/20"
        >
          {saving || updateSettings.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save Changes</>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        {/* General */}
        <Card className="glass-card border-white/30 shadow-xl shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 bg-primary/10 rounded-xl"><Store className="h-4 w-4 text-primary" /></div>
              General Information
            </CardTitle>
            <CardDescription>Basic details about your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-sm font-semibold">Store Name *</Label>
                <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsappNumber" className="text-sm font-semibold">WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  placeholder="919876543210"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Include country code, no + or spaces</p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="storeTagline" className="text-sm font-semibold">Store Tagline</Label>
                <Input
                  id="storeTagline"
                  name="storeTagline"
                  placeholder="e.g. Premium products at the best prices"
                  value={formData.storeTagline}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Logo upload */}
            <div className="pt-2">
              <SingleImageUpload
                label="Store Logo"
                value={formData.logoUrl}
                onChange={url => setFormData(prev => ({ ...prev, logoUrl: url }))}
                aspectClass="aspect-[4/1] max-w-sm"
                placeholder="Upload your store logo"
              />
              <p className="text-xs text-muted-foreground mt-2">Recommended: transparent PNG, at least 300×80px</p>
            </div>
          </CardContent>
        </Card>

        {/* Homepage Content */}
        <Card className="glass-card border-white/30 shadow-xl shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 bg-secondary/10 rounded-xl"><Megaphone className="h-4 w-4 text-secondary" /></div>
              Homepage Content
            </CardTitle>
            <CardDescription>Configure what visitors see on the main page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Announcement */}
            <div className="p-4 bg-muted/30 rounded-2xl border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Announcement Bar</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Shown at the very top of every page</p>
                </div>
                <Switch
                  checked={formData.announcementEnabled}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, announcementEnabled: checked }))}
                />
              </div>
              <Input
                name="announcementText"
                value={formData.announcementText}
                onChange={handleChange}
                placeholder="e.g. Free shipping on orders above ₹499!"
                disabled={!formData.announcementEnabled}
                className="h-11 rounded-xl disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="heroTitle" className="text-sm font-semibold">Hero Title</Label>
                <Input
                  id="heroTitle"
                  name="heroTitle"
                  value={formData.heroTitle}
                  onChange={handleChange}
                  placeholder="e.g. Shop Smart, Shop Easy"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heroSubtitle" className="text-sm font-semibold">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={handleChange}
                  placeholder="e.g. Discover premium products"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="offerBadgeText" className="text-sm font-semibold">Offer Badge Text</Label>
                <Input
                  id="offerBadgeText"
                  name="offerBadgeText"
                  value={formData.offerBadgeText}
                  onChange={handleChange}
                  placeholder="e.g. Use code FIRST10 for 10% off"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer & Social */}
        <Card className="glass-card border-white/30 shadow-xl shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl"><Globe className="h-4 w-4 text-blue-500" /></div>
              Footer & Social Links
            </CardTitle>
            <CardDescription>Links and text at the bottom of the page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="socialInstagram" className="text-sm font-semibold">Instagram URL</Label>
                <Input
                  id="socialInstagram"
                  name="socialInstagram"
                  placeholder="https://instagram.com/yourstore"
                  value={formData.socialInstagram}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="socialFacebook" className="text-sm font-semibold">Facebook URL</Label>
                <Input
                  id="socialFacebook"
                  name="socialFacebook"
                  placeholder="https://facebook.com/yourstore"
                  value={formData.socialFacebook}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="footerText" className="text-sm font-semibold">Footer Copyright Text</Label>
                <Input
                  id="footerText"
                  name="footerText"
                  value={formData.footerText}
                  onChange={handleChange}
                  placeholder="© 2025 ShopEasy. All rights reserved."
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button at bottom for mobile convenience */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving || updateSettings.isPending}
            size="lg"
            className="rounded-full px-10 shadow-xl shadow-primary/20"
          >
            {saving || updateSettings.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
