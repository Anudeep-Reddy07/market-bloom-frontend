import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { shopAPI, reviewAPI, type Review } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { LogOut, Store, MapPin, Package, Search, Star, MapPinned, Send } from 'lucide-react';

interface Product {
  _id?: string;
  name: string;
  price: number;
  category: string;
}

interface Shop {
  _id: string;
  shopName: string;
  location: string;
  products: Product[];
  owner: string;
  averageRating?: number;
  reviewCount?: number;
}

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [locationQuery]);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const data = await shopAPI.getShops(locationQuery);
      setShops(data);
    } catch (error: any) {
      toast.error('Failed to fetch shops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success('Location detected! Showing nearby shops');
          fetchNearbyShops(position.coords.latitude, position.coords.longitude);
        },
        () => {
          toast.error('Unable to access your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const fetchNearbyShops = async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      const data = await shopAPI.getShops(undefined, lat, lng);
      setShops(data);
    } catch (error) {
      toast.error('Failed to fetch nearby shops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopClick = async (shop: Shop) => {
    setSelectedShop(shop);
    try {
      const reviewData = await reviewAPI.getReviews(shop._id);
      setReviews(reviewData);
    } catch (error) {
      setReviews([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!selectedShop || !user) return;

    if (reviewText.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewAPI.addReview({
        shopId: selectedShop._id,
        userId: user.id,
        userName: user.name,
        rating,
        comment: reviewText.trim(),
      });
      toast.success('Review submitted successfully!');
      setReviewText('');
      setRating(5);
      
      // Refresh reviews
      const reviewData = await reviewAPI.getReviews(selectedShop._id);
      setReviews(reviewData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const filteredShops = shops.filter((shop) => {
    const query = searchQuery.toLowerCase();
    return (
      shop.shopName.toLowerCase().includes(query) ||
      shop.location.toLowerCase().includes(query) ||
      shop.products.some(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Market Bloom</h1>
              <p className="text-sm text-muted-foreground">Discover local shops</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(user.userType === 'seller' ? '/seller' : '/buyer')}
                >
                  Dashboard
                </Button>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <Badge variant="outline" className="text-xs capitalize">{user.userType}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse Shops</h2>
              <p className="text-muted-foreground">Explore products from local sellers</p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
            </Badge>
          </div>
          
          {/* Search and Location */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search shops, products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter by location..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button variant="outline" onClick={handleUseMyLocation}>
                <MapPinned className="h-4 w-4 mr-2" />
                Nearby
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {shops.length === 0 ? 'No shops yet' : 'No matching shops found'}
              </h3>
              <p className="text-muted-foreground">
                {shops.length === 0
                  ? 'Check back soon for new shops and products!'
                  : 'Try adjusting your search terms'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <Dialog key={shop._id}>
                <DialogTrigger asChild>
                  <Card 
                    className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
                    onClick={() => handleShopClick(shop)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Store className="h-5 w-5 text-primary" />
                            {shop.shopName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {shop.location}
                          </CardDescription>
                          {shop.averageRating && (
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{shop.averageRating.toFixed(1)}</span>
                              {shop.reviewCount && (
                                <span className="text-xs text-muted-foreground">
                                  ({shop.reviewCount} reviews)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {shop.products.length} items
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>Products</span>
                        </div>
                        <div className="space-y-2">
                          {shop.products.slice(0, 3).map((product, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                            >
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.category}</p>
                              </div>
                              <Badge variant="outline">${product.price}</Badge>
                            </div>
                          ))}
                          {shop.products.length > 3 && (
                            <p className="text-xs text-center text-muted-foreground">
                              +{shop.products.length - 3} more products
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      <Store className="h-6 w-6 text-primary" />
                      {selectedShop?.shopName}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedShop?.location}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Products */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Products</h3>
                    <div className="grid gap-3">
                      {selectedShop?.products.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <Badge variant="outline" className="text-base">${product.price}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Reviews
                    </h3>
                    
                    {/* Add Review */}
                    {isAuthenticated && user?.userType === 'buyer' && (
                      <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Your Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 cursor-pointer transition-colors ${
                                  star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                                onClick={() => setRating(star)}
                              />
                            ))}
                          </div>
                        </div>
                        <Textarea
                          placeholder="Share your experience with this shop..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button 
                          onClick={handleSubmitReview} 
                          disabled={isSubmittingReview || reviewText.trim().length < 10}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Review
                        </Button>
                      </div>
                    )}

                    {/* Display Reviews */}
                    <div className="space-y-3">
                      {reviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No reviews yet. Be the first to review!
                        </p>
                      ) : (
                        reviews.map((review) => (
                          <div key={review._id} className="p-4 bg-muted/30 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{review.userName}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                            {review.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
