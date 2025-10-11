export async function execute() {
    styleSections();
    removeUnselected();
}

function styleSections() {
    document.querySelectorAll('.captionOuterContainer').forEach((section) => {
        const title = section.textContent.trim();
        section.innerHTML = `<div class="custom-section"><span>${title}</span></div>`;
    });
}

function removeUnselected() {
    document.querySelectorAll('.sectionOuterContainer').forEach((section) => {
        let hasContent = Array.from(section.querySelectorAll('.fieldBody span'))
            .filter((span) => span && span.textContent).length > 0;

        hasContent = hasContent || section.querySelectorAll('.fieldBody .checked').length > 0;

        if (!hasContent) {
            section.style.display = 'none';
            section.previousElementSibling.style.display = 'none';
        }
    });
}
