export async function execute() {
    styleSections();
    removeUnselected();
}

function styleSections() {
    document.querySelectorAll('.captionOuterContainer').forEach((section) => {
        const title = section.textContent.trim();
        section.innerHTML = `
            <div style="
                display: flex;
                justify-content: space-between;
                padding: 10px;
                border-top: 2px solid #008bae;
                background-color: rgba(0, 139, 174, 0.1);
                font-weight: bold;
                font-size: 18px;
                cursor: pointer;
            ">
                <span>${title}</span>
            </div>`;
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

    const isEquipmentOnly = Array.from(document.querySelectorAll('.infoColumn'))
        .some(value => value.textContent.includes('Equipment Only'))

    if (isEquipmentOnly) {
        Array.from(document.getElementsByClassName('captionOuterContainer'))
            .forEach((container) => {
                if (container.textContent.trim().includes('General')) {
                    container.style.display = 'none';
                    container.nextElementSibling.style.display = 'none';
                }
            });
    }
}
