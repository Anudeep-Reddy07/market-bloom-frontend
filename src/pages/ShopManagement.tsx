import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { shopAPI, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { LogOut, Store, Plus, Trash2, Edit, Home, Package } from 'lucide-react';

interface ShopWithId {
  _id: string;
  shopName: string;
  location: string;
  products: (Product & { _id?: string })[];
  owner: string;
}

const ShopManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<ShopWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Shop form
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  
  // Product form
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<(Product & { _id?: string }) | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  useEffect(() => {
    fetchMyShop();
  }, []);

  const fetchMyShop = async () => {
    try {
      setIsLoading(true);
      const data = await shopAPI.getMyShop();
      setShop(data);
      if (data) {
        setShopName(data.shopName);
        setLocation(data.location);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch shop details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShop = async () => {
    if (!shopName.trim() || !location.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      await shopAPI.createShop({
        shopName: shopName.trim(),
        location: location.trim(),
        products: [],
      });
      toast.success('Shop created successfully!');
      await fetchMyShop();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create shop');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateShop = async () => {
    if (!shop || !shopName.trim() || !location.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await shopAPI.updateShop(shop._id, {
        shopName: shopName.trim(),
        location: location.trim(),
        products: shop.products,
      });
      toast.success('Shop updated successfully!');
      await fetchMyShop();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update shop');
    }
  };

  const handleAddProduct = async () => {
    if (!shop) return;

    if (!productName.trim() || !productPrice || !productCategory.trim()) {
      toast.error('Please fill in all product fields');
      return;
    }

    const price = parseFloat(productPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsAddingProduct(true);
      await shopAPI.addProduct(shop._id, {
        name: productName.trim(),
        price,
        category: productCategory.trim(),
      });
      toast.success('Product added successfully!');
      setProductName('');
      setProductPrice('');
      setProductCategory('');
      await fetchMyShop();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!shop || !editingProduct?._id) return;

    if (!productName.trim() || !productPrice || !productCategory.trim()) {
      toast.error('Please fill in all product fields');
      return;
    }

    const price = parseFloat(productPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await shopAPI.updateProduct(shop._id, editingProduct._id, {
        name: productName.trim(),
        price,
        category: productCategory.trim(),
      });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      setProductName('');
      setProductPrice('');
      setProductCategory('');
      await fetchMyShop();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!shop) return;

    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await shopAPI.deleteProduct(shop._id, productId);
      toast.success('Product deleted successfully!');
      await fetchMyShop();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const startEditingProduct = (product: Product & { _id?: string }) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductCategory(product.category);
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
              <p className="text-sm text-muted-foreground">Manage your shop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <span className="text-xs text-muted-foreground">Seller</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : !shop ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-6 w-6 text-primary" />
                Create Your Shop
              </CardTitle>
              <CardDescription>
                Set up your shop to start selling products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="My Amazing Shop"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateShop} disabled={isCreating} className="w-full">
                <Store className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Shop'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Shop Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-6 w-6 text-primary" />
                  Shop Details
                </CardTitle>
                <CardDescription>Update your shop information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdateShop} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Products Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-primary" />
                      Products
                    </CardTitle>
                    <CardDescription>Manage your product inventory</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                          Add a new product to your shop inventory
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName">Product Name</Label>
                          <Input
                            id="productName"
                            placeholder="Product name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productPrice">Price ($)</Label>
                          <Input
                            id="productPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productCategory">Category</Label>
                          <Input
                            id="productCategory"
                            placeholder="Electronics, Fashion, etc."
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleAddProduct} disabled={isAddingProduct} className="w-full">
                          {isAddingProduct ? 'Adding...' : 'Add Product'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {shop.products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No products yet. Add your first product!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shop.products.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="text-sm font-semibold mt-1">${product.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditingProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Update product details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editProductName">Product Name</Label>
                                  <Input
                                    id="editProductName"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editProductPrice">Price ($)</Label>
                                  <Input
                                    id="editProductPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={productPrice}
                                    onChange={(e) => setProductPrice(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editProductCategory">Category</Label>
                                  <Input
                                    id="editProductCategory"
                                    value={productCategory}
                                    onChange={(e) => setProductCategory(e.target.value)}
                                  />
                                </div>
                                <Button onClick={handleUpdateProduct} className="w-full">
                                  Update Product
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => product._id && handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopManagement;
