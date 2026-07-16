import { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.jpg',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let observer;
    if (imageRef && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }
    return () => {
      if (observer && observer.unobserve) {
        observer.disconnect();
      }
    };
  }, [imageRef, imageSrc, placeholder, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
