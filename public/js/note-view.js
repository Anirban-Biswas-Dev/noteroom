const slides = document.querySelectorAll(".carousel-slide");
const nextButton = document.querySelector(".next");
const prevButton = document.querySelector(".prev");
let currentIndex = 0;

function showSlide(index) {
  const offset = -index * 100;
  document.querySelector(
    ".carousel-wrapper"
  ).style.transform = `translateX(${offset}%)`;
}

nextButton.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
});

prevButton.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
});

// Initially show the first slide
showSlide(currentIndex);
