import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { shopAPI, ShopData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { LogOut, Plus, Trash2, Store, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
});

const shopSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

type ShopFormData = z.infer<typeof shopSchema>;

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shopName: '',
      location: '',
      products: [{ name: '', price: 0, category: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const onSubmit = async (data: ShopFormData) => {
    setIsLoading(true);
    try {
      await shopAPI.createShop(data as ShopData);
      toast.success('Shop created successfully!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create shop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Market Bloom</h1>
              <p className="text-sm text-muted-foreground">Grow your business</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <Badge className="text-xs bg-gradient-to-r from-secondary to-accent">Seller</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create Your Shop</h2>
          <p className="text-muted-foreground">Set up your store and add products to start selling</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-secondary" />
              Shop Details
            </CardTitle>
            <CardDescription>
              Fill in your shop information and product catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Shop Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    placeholder="e.g., Bloom's Garden Supplies"
                    {...register('shopName')}
                    disabled={isLoading}
                  />
                  {errors.shopName && (
                    <p className="text-sm text-destructive">{errors.shopName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Downtown Market Square"
                    {...register('location')}
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Products</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', price: 0, category: '' })}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </Button>
                </div>

                {errors.products && typeof errors.products.message === 'string' && (
                  <p className="text-sm text-destructive">{errors.products.message}</p>
                )}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Product {index + 1}
                            </span>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1 sm:col-span-1">
                              <Label htmlFor={`products.${index}.name`} className="text-xs">
                                Name
                              </Label>
                              <Input
                                id={`products.${index}.name`}
                                placeholder="Product name"
                                {...register(`products.${index}.name`)}
                                disabled={isLoading}
                              />
                              {errors.products?.[index]?.name && (
                                <p className="text-xs text-destructive">
                                  {errors.products[index]?.name?.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor={`products.${index}.price`} className="text-xs">
                                Price ($)
                              </Label>
                              <Input
                                id={`products.${index}.price`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register(`products.${index}.price`)}
                                disabled={isLoading}
                              />
                              {errors.products?.[index]?.price && (
                                <p className="text-xs text-destructive">
                                  {errors.products[index]?.price?.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor={`products.${index}.category`} className="text-xs">
                                Category
                              </Label>
                              <Input
                                id={`products.${index}.category`}
                                placeholder="e.g., Plants"
                                {...register(`products.${index}.category`)}
                                disabled={isLoading}
                              />
                              {errors.products?.[index]?.category && (
                                <p className="text-xs text-destructive">
                                  {errors.products[index]?.category?.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? 'Creating Shop...' : 'Create Shop'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SellerDashboard;
