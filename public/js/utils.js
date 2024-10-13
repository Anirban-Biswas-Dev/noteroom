// Reverse page button function for Headers back button
function goPrevPage() {
      history.back();
};
// ToolTip trigger
const isMobile = window.innerWidth <= 768;
tippy('[data-tippy-content]', {
    placement: isMobile ? 'bottom' : 'right', 
    animation: 'scale', 
    theme: 'light', 
  });