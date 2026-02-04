import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Save, Image, FileText, HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/admin/_admin/content/')({
  component: RouteComponent,
});

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: 'hero' | 'middle' | 'footer';
  active: boolean;
  order: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
}

function RouteComponent() {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage website content, banners, and FAQ
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Sections</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Website Banners</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>

          {banners.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Banners Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first banner to display on the website
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Banner
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {banners.map((banner) => (
                <Card key={banner.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-gray-600">{banner.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {banner.position}
                        </span>
                        <span className="text-xs text-gray-500">
                          Order: {banner.order}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={banner.active} />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Homepage Sections Tab */}
        <TabsContent value="homepage" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Title</Label>
                <Input
                  id="heroTitle"
                  placeholder="Discover Bangladesh Like Never Before"
                  defaultValue="Discover Bangladesh Like Never Before"
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  placeholder="Book hotels, tours, and experiences..."
                  defaultValue="Book hotels, tours, and experiences with verified sellers"
                />
              </div>
              <div>
                <Label htmlFor="heroImage">Background Image URL</Label>
                <Input
                  id="heroImage"
                  placeholder="https://..."
                />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Hero Section
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Featured Categories</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Label>Show Featured Categories</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="categoriesTitle">Section Title</Label>
                <Input
                  id="categoriesTitle"
                  defaultValue="Browse by Category"
                />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Categories Section
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">How It Works Section</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Label>Show How It Works</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="howItWorksTitle">Section Title</Label>
                <Input
                  id="howItWorksTitle"
                  defaultValue="How DeshGhuri Works"
                />
              </div>
              <div>
                <Label htmlFor="howItWorksDesc">Description</Label>
                <Textarea
                  id="howItWorksDesc"
                  defaultValue="Book with confidence using our secure escrow system"
                  rows={3}
                />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save How It Works
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Section Visibility</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Flash Deals</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>New Arrivals</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Trending</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Most Booked</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Group Booking Spotlight</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Verified Sellers</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Testimonials</Label>
                <Switch defaultChecked />
              </div>
            </div>
            <Button className="mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save Visibility Settings
            </Button>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>

          {faqs.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No FAQ Items Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add frequently asked questions to help your users
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create FAQ
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => (
                <Card key={faq.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{faq.question}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Order: {faq.order}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={faq.active} />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
