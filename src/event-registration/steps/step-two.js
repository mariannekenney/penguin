export function execute(x, y, z) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(document.querySelector('.eventRegistrationInfoEndDate .infoText').textContent.trim().split('-')[0]);
    eventDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

    let isEarlyBird;
    if (diffDays >= 10) {
        isEarlyBird = true;
    } else if (diffDays >= 1 && diffDays <= 9) {
        isEarlyBird = false;
    }

    const hasLTF = Array.from(document.querySelectorAll('strong.labelTitle.paymentTitle label'))
        .map(element => element.textContent.trim())
        .some(label => label.includes('LTF'));

    document.querySelectorAll('.eventRegistrationTypeRadioWrapper').forEach(item => {
        const label = item.querySelector('label').textContent.trim();

        if (isEarlyBird == undefined) {
            item.style.display = 'none';
        } else if (label !== 'Equipment Only') {
            if (hasLTF && !label.includes('LTF')) {
                item.style.display = 'none';
            }

            if ((label.includes('Early-Bird') && !isEarlyBird) || (!label.includes('Early-Bird') && isEarlyBird)) {
                item.style.display = 'none';
            }
        }
    });
}