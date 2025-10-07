import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { ShoppingBag, Store, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.userType === 'seller' ? '/seller' : '/buyer');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Market Bloom
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center py-16 md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Local Marketplace</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">
            Where Local Businesses{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Bloom
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            Connect with local sellers, discover unique products, and grow your business in a vibrant community marketplace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" onClick={() => navigate('/signup')} className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/home')}>
              Browse Shops
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
            <Card className="text-left hover:shadow-lg transition-shadow border-2 border-primary/10">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">For Buyers</h3>
                <p className="text-muted-foreground">
                  Discover unique products from local sellers. Browse shops, compare prices, and support your community.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left hover:shadow-lg transition-shadow border-2 border-secondary/10">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">For Sellers</h3>
                <p className="text-muted-foreground">
                  Set up your shop in minutes. Add products, manage inventory, and reach customers in your area.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
