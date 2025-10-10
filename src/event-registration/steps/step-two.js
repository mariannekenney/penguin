export function execute(x, y, z) {
    // Remove options based on membership / pricing
    const labels = Array.from(document.querySelectorAll('strong.labelTitle.paymentTitle label'))
        .map(element => element.textContent.trim())
        .filter(label => label !== 'Equipment Only');

    const generalLabels = labels.filter(label => label.toLowerCase().includes('general'));

    if (labels.length > generalLabels.length) {
        document.querySelectorAll('.eventRegistrationTypeRadioWrapper').forEach(item => {
            const label = item.querySelector('label').textContent.trim();

            if (generalLabels.includes(label)) {
                item.style.display = 'none';
            }
        })
    }
}