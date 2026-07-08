import image from "../assets/RajaPura.png"; 

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

export default function Logo({ 
  width = 40, 
  height = 40, 
  className, 
  alt = "Rajapura" 
}: LogoProps) {
  return (
    <img 
      src="/logo.png" 
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ 
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
}