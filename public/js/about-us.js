import {founders} from "/js/team-data.js";

const founderContainer = document.querySelector('.founders'); 
let founderCardsHtml = '';

founders.forEach((founder) => {
    founderCardsHtml += `
        <div class="founders-card">
            <img src="${founder.imgSrc}" alt="${founder.name} Caricature" class="founder-img">
            <p class="f-name">${founder.name}</p>
            <p class="f-clg">${founder.college}</p>
            <p class="f-role">${founder.role}</p>
            <p class="f-desc">${founder.description}</p>
            <div class="social-prfls">
                <i onclick="window.location.href='${founder.socialLinks.facebook || '#'}'" class="fa-brands fa-facebook"></i>
                <i onclick="window.location.href='${founder.socialLinks.instagram || '#'}'" class="fa-brands fa-square-instagram"></i>
                <i onclick="window.location.href='${founder.socialLinks.twitter || '#'}'" class="fa-brands fa-square-x-twitter"></i>
                <i onclick="window.location.href='${founder.socialLinks.linkedin || '#'}'" class="fa-brands fa-linkedin"></i>
            </div>
        </div>
    `;
});

founderContainer.innerHTML = founderCardsHtml;
