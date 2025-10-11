let isEarly, membershipLevel, eventId, eventLimits, registrationData, emailRecipientIds;

export async function execute(id, backend, token) {
    eventId = id;

    registrationData = await backend.fetchEventRegistrations(token, eventId);

    const allLimits = await backend.fetchLimits();
    eventLimits = allLimits.data.find(eventsWithLimits => eventsWithLimits.eventId == eventId)?.data || [];

    const eventDate = document.querySelector('div[id*=InfoEndDateStartDateTimePanel').textContent.trim().split(" - ")[0];
    const diffTime = Math.abs(new Date(eventDate) - new Date());
    isEarly = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 9;

    const userData = await backend.fetchUser();
    membershipLevel = userData?.MembershipLevel.Name;

    const userRegistrations = await backend.fetchUserRegistrations(token, userData.Id);
    if (userRegistrations && userRegistrations.length == 0) {
      const container = document.getElementById('idGeneralFormContainer');
      container.innerHTML = document.getElementById('new-user-alert').innerHTML + container.innerHTML;
    }

    emailRecipientIds = [27905286, 54159054, 27905257];

    styleSections();
    limitOptions();
    limitWithSubOptions();
    ticketTypeDependency();
    becomeMember();
    rainInsurance();
    gearRentals();
    cancellationTerms();
}

function styleSections() {
    document.querySelectorAll('.captionOuterContainer').forEach((section) => {
        const title = section.textContent.trim();
        if (!title.includes('LTF')) {
            let sectionDisplay;
            if (!title.includes('Policies') && !title.includes('General')) {
                sectionDisplay = '<div class="custom-section"><span class="custom-section-arrow open">▶</span>';
            } else {
                sectionDisplay = '<div class="custom-section" style="padding-left: 50px;">';
            }
            section.innerHTML = sectionDisplay + `<span>${title}</span></div>`;

            section.addEventListener('click', () => {
                const arrow = section.querySelector('.custom-section-arrow');
                if (arrow) {
                    arrow.classList.toggle('open');
                    
                    const content = section.nextElementSibling;
                    content.style.display = (content.style.display === 'none') ? 'block' : 'none';
                }
            });
        }
    });
}

function limitOptions() {
    const waitlistedFields = ['Class Attending'];
    const soldOutFields = [];
    const soldOutNames = [];

    const eventData = eventLimits.filter(item => !item.suboption).map(item => {
        item.limit = parseInt(item.limit);

        item.count = registrationData
            .map((data) =>
                data.RegistrationFields.find(field => field.FieldName.includes(item.name))
            )
            .filter((data) => {
                const label = Array.isArray(data.Value) ? data.Value[0]?.Label : data.Value?.Label;
                return label?.includes(item.option);
            }).length;

        return item;
    });

    eventData
        .filter(data => data.limit !== "" && data.count >= data.limit)
        .forEach(data => {
            const field = Array.from(document.querySelectorAll('div[class*="fieldContainer"]'))
                .filter((container) =>
                    container.querySelector('span[id*="titleLabel"]')?.textContent.includes(data.name)
                )[0];

            field.querySelectorAll('div[class*="fieldItem"]')
                .forEach((item) => {
                    const label = item.querySelector('label');

                    if (label.textContent.includes(data.option)) {
                        label.innerHTML = `<span style="text-decoration: line-through">${label.textContent}</span>`;
                        item.querySelector('input').disabled = true;
                    }
                });

            if (waitlistedFields.includes(data.name)) {
                if (!soldOutFields.includes(field)) soldOutFields.push(field);

                const index = waitlistedFields.indexOf(data.name);
                if (soldOutNames[index]) {
                    soldOutNames[index].push(data.option);
                } else {
                    soldOutNames.push([data.option]);
                }
            }
        });

    waitlistedFields.forEach((_, i) => {
        if (soldOutFields.length > 0) {
            addWaitlist(soldOutFields[i], soldOutNames[i]);
        }
    });
}

function limitWithSubOptions() {
    const eventData = eventLimits.filter(item => item.suboption).map(item => {
        item.limit = parseInt(item.limit);

        const itemName = item.name.split(" & ");
        item.count = registrationData
            .map((data) => ({
                main: data.RegistrationFields.find(field => field.FieldName.includes(itemName[0])),
                sub: data.RegistrationFields.find(field => field.FieldName.includes(itemName[1]))
            }))
            .filter((data) => {
                const mainLabel = Array.isArray(data.main.Value) ? data.main.Value[0]?.Label : data.main.Value?.Label;
                const subLabel = Array.isArray(data.sub.Value) ? data.sub.Value[0]?.Label : data.sub.Value?.Label;

                return mainLabel?.includes(item.option) && subLabel?.includes(item.suboption);
            }).length;

        return item;
    });

    [...new Set(eventData.map(data => data.name))].forEach(name => {
        const dataName = name.split(" & ");
        const fieldContainers = Array.from(document.querySelectorAll('div[class*="fieldContainer"]'));

        const mainField = fieldContainers.filter((container) =>
            container.querySelector('span[id*="titleLabel"]')?.textContent.includes(dataName[0])
        )[0];

        const subField = fieldContainers.filter((container) =>
            container.querySelector('span[id*="titleLabel"]')?.textContent.includes(dataName[1])
        )[0];

        const startSelected = Array.from(mainField.querySelectorAll('div[class*="fieldItem"]'))
            .filter((item) => item.querySelector('input').checked);

        if (startSelected.length > 0) {
            const selectedLabel = startSelected[0].querySelector('label').textContent;
            handleSubOptions(selectedLabel, eventData, name, subField);
        }

        mainField.addEventListener("change", (event) => {
            const selected = document.querySelector(`label[for*="${event.target.value}"]`).textContent;

            handleSubOptions(selected, eventData, name, subField);
        });

        mainField.querySelector('a.clearSelectionLabel').addEventListener('click', () => {
            subField.querySelectorAll('div[class*="fieldItem"]').forEach(item => {
                item.querySelector('span.textLine').style = '';
                item.querySelector('input').disabled = false;
            });
        });
    });
}

function handleSubOptions(selected, eventData, name, subField) {
    const limitSubOptions = eventData
        .filter((data) => name.includes(data.name) && selected.includes(data.option) && data.count >= data.limit)
        .map((data) => data.suboption);

    subField.querySelectorAll('div[class*="fieldItem"]').forEach(item => {
        item.querySelector('span.textLine').style = '';
        item.querySelector('input').disabled = false;
    });

    limitSubOptions.forEach((suboption) => {
        subField.querySelectorAll('div[class*="fieldItem"]').forEach(item => {
            const label = item.querySelector('span.textLine');

            if (label.textContent.includes(suboption)) {
                label.style = 'text-decoration: line-through';
                item.querySelector('input').disabled = true;
                item.querySelector('input').checked = false;
            }
        });
    });
}

function addWaitlist(soldOutField, soldOutNames) {
    soldOutField.querySelector('div[id*="RadioGroup"]')
        .innerHTML += `
        <div style="margin-bottom: 10px">
          <span>If your class is sold out... <button id="join-waitlist">Join the Waitlist</button></span>     
        </div>`;

    const modal = document.querySelector('.custom-modal#waitlist');

    soldOutNames.forEach((name) => {
        modal.querySelector('#options').innerHTML += `
        <label style="display: block; margin-bottom: 10px">
          <input type="radio" name="sold-out" value="${name}"> ${name}
        </label>`;
    });

    document.getElementById('join-waitlist').addEventListener('click', (event) => {
        event.preventDefault();
        modal.showModal();
    });

    const recipientIds = emailRecipientIds;
    modal.querySelector('.modal-button#complete').addEventListener('click', (event) => {
        event.preventDefault();
        sendWaitlistEmail(modal, recipientIds, eventId);
    });

    modal.querySelector('.modal-button#cancel').addEventListener('click', (event) => {
        event.preventDefault();
        modal.close();
    });
}

function sendWaitlistEmail(modal, emailRecipientIds, eventId) {
    toggleLoader(true, modal.querySelector('#inner-content'));

    const selected = modal.querySelector('input[name="sold-out"]:checked').value;
    const eventTitle = document.querySelector('.eventRegistrationInfoEvent .infoText').textContent.trim();
    const firstName = document.querySelector(`input[id*="TextBox7652926"]`).value;
    const lastName = document.querySelector(`input[id*="TextBox7652927"]`).value;
    const email = document.querySelector(`input[id*="TextBox7652925"]`).value;

    const emailBody = `<div><h4>${eventTitle}</h4><p><strong>Class:</strong> ${selected}</p><p><strong>Registrant:</strong> ${firstName} ${lastName} (<a href="mailto:${email}">${email}</a>)</p></div>`;

    const emailRecipients = emailRecipientIds.map(Id => ({ Id, Type: 'IndividualContactRecipient' }));

    const emailData = {
        Subject: 'Waitlist Request',
        Body: emailBody,
        Recipients: emailRecipients,
        EventId: eventId
    };

    fetch(`https://api.wildapricot.org/v2.2/rpc/189391/email/sendEmail`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
    }).then(() => {
        modal.querySelector('#message').innerHTML = `<span>Successfully added to the waitlist: <span style="font-style: italic">${selected}</span></span>`;
        modal.querySelector('#options').style.display = 'none';
        modal.querySelector('.modal-button#complete').style.display = 'none';
        modal.querySelector('.modal-button#cancel').textContent = 'OK';

        toggleLoader(false, modal.querySelector('#inner-content'));
    });
}

function ticketTypeDependency() {
    const ticketType = document.querySelector('.eventRegistrationInfoRegistrationType .infoText').textContent;
    
    if (ticketType && ticketType.includes('Equipment Only')) {
        const sectionHeader = Array.from(document.querySelectorAll('.captionOuterContainer'))
            .find((section) => section.textContent.trim().includes('Gear Rentals'));

        // TO DO, ALLOW TO CLICK NEXT
        if (sectionHeader) {
            sectionHeader.style.display = 'none';
            sectionHeader.nextElementSibling.style.display = 'none';
        }
    } else if (ticketType) {
        const div = Array.from(document.getElementsByClassName('fieldSubContainer'))
            .find(container => {
                const label = container.querySelector('span[id*="titleLabel"]');
                return label && label.textContent.includes('Class Attending');
            });

        div.querySelectorAll('div.fieldItem').forEach(item => {
            const span = item.querySelector('span.textLine');

            if (
                (ticketType.includes('Racer') && !span.textContent.includes('Practice'))
                || (!ticketType.includes('Racer') && span.textContent.includes('Practice'))
            ) {
                span.style.color = 'rgba(118, 118, 118, 0.8)';
                item.querySelector('input').disabled = true;
            }
        });
    }
}

function becomeMember() {
    if (!membershipLevel.includes('Standard')) {
        document.getElementsByClassName('captionOuterContainer')[0].style.display = 'none';

        Array.from(document.getElementsByClassName('fieldSubContainer'))
            .forEach(container => {
                const label = container.querySelector('span[id*="titleLabel"]');
                if (label && label.textContent.includes('Join Learn to Fly')) {
                    container.style.display = 'none';
                }
            });
    }
}

function rainInsurance() {
    const div = Array.from(document.getElementsByClassName('fieldSubContainer'))
        .find(container => {
            const label = container.querySelector('span[id*="titleLabel"]');
            return label && label.textContent.includes('Rain Insurance');
        });

    div.querySelectorAll('div.fieldItem').forEach(item => {
        const span = item.querySelector('span.textLine');

        let disable = false;
        if (membershipLevel.includes('Plus')) {
            if (span.textContent.includes('Plus')) {
                item.querySelector('input').checked = true;
            } else {
                disable = true;
            }
        } else {
            if (!isEarly || span.textContent.includes('Plus')) {
                disable = true;
            }

            const ticketType = document.querySelector('.eventRegistrationInfoRegistrationType .infoText').textContent;
            if (
                (ticketType && !span.textContent.includes('Bike'))
                && ((ticketType.includes('Racer') && !span.textContent.includes('Racer'))
                || (!ticketType.includes('Racer') && span.textContent.includes('Racer')))
            ) {
                disable = true;
            }
        }

        if (disable) {
            span.style.color = 'rgba(118, 118, 118, 0.8)';
            item.querySelector('input').disabled = true;
        }
    });
}

function gearRentals() {
    const sectionHeader = Array.from(document.querySelectorAll('.captionOuterContainer'))
        .find((section) => section.textContent.trim().includes('Gear Rentals'));

    if (sectionHeader) {
        const fieldContainers = Array.from(sectionHeader.nextElementSibling.querySelectorAll('.fieldContainer'));

        for (let i = 0; i < fieldContainers.length - 1; i += 2) {
            const checkboxes = fieldContainers[i].querySelectorAll('input[type="checkbox"]');
            
            const update = () => {
                const anyChecked = Array.from(checkboxes).some((checkbox) => checkbox.checked);

                fieldContainers[i + 1].style.display = anyChecked ? 'block' : 'none';
            };
            
            update();
            checkboxes.forEach((checkbox) => checkbox.addEventListener('change', update));
        }
    }

}

function cancellationTerms() {
    const modal = document.querySelector('.custom-modal#cancellation');

    if (modal) {
        document.body.addEventListener('click', (event) => {
            if (event.target && event.target.matches('input[id*="termsOfUseCheckBox"]')) {
                if (event.target.checked) modal.showModal();
            }
        });

        modal.querySelector('.modal-button#complete').addEventListener('click', (event) => {
            event.preventDefault();
            modal.close();
        });
    }
}