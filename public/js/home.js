// Hero Section Animation
document.addEventListener("DOMContentLoaded", () => {
  // Select necessary elements
  const heroMask = document.querySelector(".hero-section--overlay");
  const heroPriBtn2 = document.querySelector(".hero-primary--top-layer");
  const corners = document.querySelectorAll(".hero__corner");

  // Enable visibility of the hero mask on mouse movement
  const handleMouseMove = (e) => {
    if (!heroMask.style.visibility || heroMask.style.visibility === "hidden") {
      heroMask.style.visibility = "visible";
    }

    const { clientX, clientY } = e; // Get mouse position
    const x = Math.round((clientX / window.innerWidth) * 100);
    const y = Math.round((clientY / window.innerHeight) * 100);

    // Animate hero mask position using GSAP
    gsap.to(heroMask, {
      "--x": `${x}%`,
      "--y": `${y}%`,
      duration: 0.3,
      ease: "sine.out",
    });
  };

  // Toggle the mask class on button click
  const handleButtonClick = () => {
    heroMask.classList.toggle("mask-unmasked");
  };

  // Attach event listeners
  window.addEventListener("mousemove", handleMouseMove);
  heroPriBtn2.addEventListener("click", handleButtonClick);

  // Generate random positions for elements
  const generateRandomPosition = (maxOffset) => {
    const offsetX = Math.random() * maxOffset - maxOffset / 2;
    const offsetY = Math.random() * maxOffset - maxOffset / 2;
    return { offsetX, offsetY };
  };

  // Update corner positions periodically
  const updateCornerPositions = () => {
    corners.forEach((corner) => {
      const { offsetX, offsetY } = generateRandomPosition(30); // ±30px range
      corner.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    // Schedule next update in 2 seconds
    setTimeout(updateCornerPositions, 2000);
  };

  // Initialize corner position updates
  updateCornerPositions();
});

const generateRandomOffset = (maxOffset) => {
  const offsetX = Math.random() * maxOffset - maxOffset / 2; // Random X offset within range
  const offsetY = Math.random() * maxOffset - maxOffset / 2; // Random Y offset within range
  return { offsetX, offsetY };
};

const updateCursorPositions = () => {
  // Select all elements with the class 'moving-cursor-icon'
  const cursorIcons = document.querySelectorAll('.moving-cursor-icon');

  cursorIcons.forEach((icon) => {
    // Generate random offsets with a subtle range (e.g., ±15px)
    const { offsetX, offsetY } = generateRandomOffset(15);

    // Apply the random offsets to the element's transform property
    icon.style.transform = `translate(calc(50% + ${offsetX}px), calc(-10% + ${offsetY}px))`;
  });

  // Schedule the next update in 1.5 seconds
  setTimeout(updateCursorPositions, 1000);
};

// Start updating cursor positions once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', updateCursorPositions);
