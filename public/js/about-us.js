import {founders} from "/js/team-data.js";

const founderContainer = document.querySelector('.founders');
let founderCardsHtml = '';

founders.forEach((founder) => {
    let socialIconsHtml = '';

    // Check and add only existing social links
    if (founder.socialLinks.facebook) {
        socialIconsHtml += `<i onclick="window.location.href='${founder.socialLinks.facebook}'" class="fa-brands fa-facebook"></i>`;
    }
    if (founder.socialLinks.instagram) {
        socialIconsHtml += `<i onclick="window.location.href='${founder.socialLinks.instagram}'" class="fa-brands fa-square-instagram"></i>`;
    }
    if (founder.socialLinks.twitter) {
        socialIconsHtml += `<i onclick="window.location.href='${founder.socialLinks.twitter}'" class="fa-brands fa-square-x-twitter"></i>`;
    }
    if (founder.socialLinks.linkedin) {
        socialIconsHtml += `<i onclick="window.location.href='${founder.socialLinks.linkedin}'" class="fa-brands fa-linkedin"></i>`;
    }

    // Construct the founder card HTML
    founderCardsHtml += `
        <div class="founders-card">
            <img src="${founder.imgSrc}" alt="${founder.name} Caricature" class="founder-img">
            <p class="f-name">${founder.name}</p>
            <p class="f-clg">${founder.college}</p>
            <p class="f-role">${founder.role}</p>
            <p class="f-desc">${founder.description}</p>
            <div class="social-prfls">
                ${socialIconsHtml}
            </div>
        </div>
    `;
});

// Inject the constructed HTML into the container
founderContainer.innerHTML = founderCardsHtml;


