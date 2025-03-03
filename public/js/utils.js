// Reverse page button function for Headers back button
function goPrevPage() {
  let from = new URL(window.location.href).searchParams.get('from')
  if (from && from === 'dashboard') {
    let lastVisitedNote = localStorage.getItem('lastVisitedNote')
    window.location.href = `/dashboard?scroll=${lastVisitedNote}`
  } else {
    history.back();
  }
};

const isMobile = window.innerWidth <= 768;

if (!isMobile) {
  tippy('[data-tippy-content]', {
    placement: 'top',
    arrow: false,
    theme: 'custom-modern',
    hideOnClick: false, // Ensures tooltip doesn't hide immediately on click
    onShow(instance) {
      setTimeout(() => {
        instance.hide(); // Hides tooltip after 2 seconds
      }, 1500);
    }
  });
}
