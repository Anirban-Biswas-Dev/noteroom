//A:The set thumbnail pop works in this way publish >> pop up >> discard or window to cancel
document.addEventListener('DOMContentLoaded', () => {
    let triggerThumbnailSetup = document.querySelector('.publish-note-btn');
    let thumbnailPopup = document.querySelector('.thumbnail-pop-up');
    let discardThumbnailSetup = document.querySelector('.discard-btn');

    triggerThumbnailSetup.addEventListener('click', function() {
        thumbnailPopup.style.display = 'flex'; 
    });

    discardThumbnailSetup.addEventListener('click', function() {
        thumbnailPopup.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === thumbnailPopup) {
            thumbnailPopup.style.display = 'none';
        }
    });
});


