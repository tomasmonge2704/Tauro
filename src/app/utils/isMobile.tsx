export const isMobile = () => {
  return window.innerWidth <= 576;
};

export const isTablet = () => {
  return window.innerWidth > 576 && window.innerWidth <= 768;
};

export const isDesktop = () => {
  return window.innerWidth > 768;
};


