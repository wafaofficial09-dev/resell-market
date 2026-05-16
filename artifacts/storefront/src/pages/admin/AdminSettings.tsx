import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      },
      onError: () => {
        toast.error("Failed to save settings");
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <h1 className="text-3xl font-display font-bold mb-8">Store Settings</h1>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Store Settings</h1>
        <Button onClick={handleSubmit} disabled={updateSettings.isPending} size="lg" className="rounded-full px-8">
          {updateSettings.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic details about your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number (with country code)</Label>
                <Input id="whatsappNumber" name="whatsappNumber" placeholder="919876543210" value={formData.whatsappNumber} onChange={handleChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="storeTagline">Store Tagline</Label>
                <Input id="storeTagline" name="storeTagline" value={formData.storeTagline} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Content</CardTitle>
            <CardDescription>Configure what users see on the main page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="announcementText">Announcement Bar</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="announcementEnabled" 
                      checked={formData.announcementEnabled} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, announcementEnabled: checked }))} 
                    />
                    <Label htmlFor="announcementEnabled" className="text-xs font-normal">Enable</Label>
                  </div>
                </div>
                <Input id="announcementText" name="announcementText" value={formData.announcementText} onChange={handleChange} disabled={!formData.announcementEnabled} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input id="heroTitle" name="heroTitle" value={formData.heroTitle} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input id="heroSubtitle" name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer & Social</CardTitle>
            <CardDescription>Links and text at the bottom of the page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="socialInstagram">Instagram URL</Label>
                <Input id="socialInstagram" name="socialInstagram" placeholder="https://instagram.com/..." value={formData.socialInstagram} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialFacebook">Facebook URL</Label>
                <Input id="socialFacebook" name="socialFacebook" placeholder="https://facebook.com/..." value={formData.socialFacebook} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="footerText">Footer Copyright Text</Label>
                <Input id="footerText" name="footerText" value={formData.footerText} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}
