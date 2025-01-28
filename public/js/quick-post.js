const QuickPostEditor = {
    init() {
      this.cacheDOM();
      this.bindEvents();
      this.textAreaMaxLength = 1500; // Maximum character limit
      this.imageSelected = false;
    },
  
    cacheDOM() {
      this.overlay = document.querySelector('.quick-post-editor-overlay');
      this.container = document.querySelector('.quick-post-editor-container');
      this.closeIcon = document.querySelector('.qpec-close-icon');
      this.triggerBtn = document.querySelector('.quick-post__fr--msg-btn');
      this.imgIcon = document.querySelector('.quick-post__sr--img-icon');
      this.mentionIcon = document.querySelector('.quick-post__sr--mention-icon');
      this.textArea = document.querySelector('.qpec-textarea');
      this.postBtn = document.querySelector('.qpec-footer-btn');
      this.fileInput = document.querySelector('.qpec-add-img');
      this.imagePreviewWrapper = document.querySelector('.qpec-img-preview-wrapper');
      this.imagePreview = document.querySelector('.qpec-show-selected-img-preview');
      this.fileSelectIcon = document.querySelector('.qpec-open-file-select');
    },
  
    bindEvents() {
      // Trigger popup on main triggers
      [this.triggerBtn, this.imgIcon, this.mentionIcon].forEach((el) =>
        el.addEventListener('click', this.showPopup.bind(this))
      );
  
      // Popup interactions
      this.closeIcon.addEventListener('click', this.closePopup.bind(this));
      window.addEventListener('click', this.handleOutsideClick.bind(this));
  
      // Textarea input handling
      this.textArea.addEventListener('input', this.handleTextInput.bind(this));
  
      // File input handling
      this.fileSelectIcon.addEventListener('click', () => this.fileInput.click());
      this.fileInput.addEventListener('change', this.handleImageUpload.bind(this));
  
      // Post button handling
      this.postBtn.addEventListener('click', this.handlePost.bind(this));
    },
  
    showPopup() {
      this.overlay.style.display = 'flex'; // Make visible
      setTimeout(() => {
        this.overlay.style.visibility = 'visible';
        this.overlay.style.opacity = '1'; // Smooth fade-in
        this.container.style.transform = 'scale(1)';
      }, 10);
  
      // Ensure the post button is disabled initially
      this.updatePostButtonState(false);
    },
  
    closePopup() {
      this.overlay.style.opacity = '0'; // Fade-out
      this.container.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.overlay.style.display = 'none'; // Hide after fade-out
        this.overlay.style.visibility = 'hidden';
        this.resetPopup();
      }, 300); // Match CSS transition duration
    },
  
    handleOutsideClick(event) {
      if (event.target === this.overlay) {
        this.container.classList.add('shake-animation'); // Add shake animation class
        setTimeout(() => {
          this.container.classList.remove('shake-animation'); // Remove after animation ends
        }, 300);
      }
    },
  
    handleTextInput() {
      const textLength = this.textArea.value.length;
  
      // Prevent further input if max length is reached
      if (textLength > this.textAreaMaxLength) {
        this.textArea.value = this.textArea.value.slice(0, this.textAreaMaxLength);
      }
  
      // Dynamic resizing of textarea
      this.textArea.style.height = 'auto'; // Reset height
      this.textArea.style.height = `${this.textArea.scrollHeight}px`; // Adjust height to content
  
      // Visual feedback for reaching character limit
      if (textLength === this.textAreaMaxLength) {
        this.textArea.style.outline = '2px solid #ff2c2c'; // Highlight when limit is reached
      } else {
        this.textArea.style.outline = 'none'; // Remove red border if within limit
      }
  
      // Enable or disable the post button based on input
      this.updatePostButtonState(textLength > 0);
    },
  
    updatePostButtonState(isEnabled) {
      this.postBtn.disabled = !isEnabled;
    },
  
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview.src = reader.result;
          this.imagePreviewWrapper.style.display = 'block'; // Show preview wrapper
          this.imageSelected = true;
        };
        reader.readAsDataURL(file);
      }
    },
  
    resetPopup() {
      this.textArea.value = '';
      this.textArea.style.height = 'auto';
      this.textArea.style.outline = 'none';
      this.updatePostButtonState(false);
      this.fileInput.value = '';
      this.imagePreview.src = '';
      this.imagePreviewWrapper.style.display = 'none'; // Hide preview wrapper
      this.imageSelected = false;
    },
  
    handlePost() {
      const postData = {
        text: this.textArea.value,
        image: this.imageSelected ? this.imagePreview.src : null,
      };
      console.log('Post Data:', postData); // Simulate successful post
      this.closePopup();
    },
  };
  
  // Initialize the QuickPostEditor object
  QuickPostEditor.init();
  