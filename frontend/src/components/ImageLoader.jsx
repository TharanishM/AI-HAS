import React, { useState } from 'react';

export const ImageLoader = ({ src, alt, className, fallbackIcon: FallbackIcon }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          {FallbackIcon ? <FallbackIcon className="w-8 h-8 opacity-45" /> : null}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};
