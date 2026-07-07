export function execute() {
    filter();
    sort();
}

function filter() {
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

    const options = Array.from(document.querySelectorAll('.eventRegistrationTypeRadioWrapper'));
    const labels = options.map(item => item.querySelector('label').textContent.trim());

    // Base type with the price and "Early-Bird" stripped out, so we can tell whether a
    // label has a same-type Early-Bird/non-Early-Bird sibling (e.g. "General Registration
    // (LTF)" vs "General Registration (LTF Early-Bird)"). Labels with no sibling (e.g.
    // "Upgrade to School (LTF Practice)") aren't part of an Early-Bird pair and shouldn't
    // be filtered based on Early-Bird status at all.
    const getBaseType = (label) => label.split('–')[0].replace(/Early-Bird/gi, '').replace(/[\s()]+/g, ' ').trim();

    const baseTypeCounts = labels.reduce((counts, label) => {
        const baseType = getBaseType(label);
        counts[baseType] = (counts[baseType] || 0) + 1;
        return counts;
    }, {});

    options.forEach(item => {
        const label = item.querySelector('label').textContent.trim();
        const isLTFLabel = label.includes('LTF');
        const hasEarlyBirdPair = baseTypeCounts[getBaseType(label)] > 1;

        if (isEarlyBird == undefined) {
            item.style.display = 'none';
        } else if (label !== 'Equipment Only') {
            if (hasLTF && !isLTFLabel) {
                item.style.display = 'none';
            }

            if (hasEarlyBirdPair && ((label.includes('Early-Bird') && !isEarlyBird) || (!label.includes('Early-Bird') && isEarlyBird))) {
                item.style.display = 'none';
            }
        }
    });
}

function sort() {
    const container = document.querySelector('#idRadioGroup');
    const items = Array.from(container.querySelectorAll('.fieldItem'));

    const order = [
        'Wednesday - General',
        'Thursday - General',
        'Wednesday & Thursday - General',
        'Wednesday - Racer',
        'Thursday - Racer',
        'General',
        'Racer',
        'Equipment Only'
    ];

    items.sort((a, b) => {
        const getIndex = (title) => {
            const match = order.findIndex(item => title.startsWith(item));
            return match === -1 ? order.length : match;
        };

        return getIndex(a.textContent.trim()) - getIndex(b.textContent.trim());
    });

    items.forEach((el) => {
        el.style.marginBottom = '15px';
        container.appendChild(el);
    });
}
