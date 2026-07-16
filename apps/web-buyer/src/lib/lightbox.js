import React from 'react';
import { createRoot } from 'react-dom/client';
import ImageLightbox from './ImageLightbox';

export function showImageLightbox(props) {
  const container = document.createElement('div');
  container.id = 'image-lightbox-container';
  document.body.appendChild(container);

  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
    if (props.onClose) {
      props.onClose();
    }
  };

  const lightboxProps = {
    ...props,
    isOpen: true,
    onClose: handleClose,
  };

  root.render(<ImageLightbox {...lightboxProps} />);
}
