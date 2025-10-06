import logo from '@/assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  return (
    <img 
      src={logo} 
      alt="Market Bloom Logo" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
