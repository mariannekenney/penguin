const WILD_FRUIT_MONKEY_KEY = "__WILD_FRUIT_MONKEY_KEY__";

let registrationType, registrationInfo;

class RegistrationType {
  constructor() {
  }

  execute() {
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
}

class RegistrationInfo {
  constructor(isEarly, isMember, eventId, eventLimits, registrationData) {
    this.isEarly = isEarly;
    this.isMember = isMember;
    this.eventId = eventId;
    this.eventLimits = eventLimits;
    this.registrationData = registrationData;
    this.emailRecipientIds = [27905286, 54159054, 27905257];
  }

  execute() {
    this.limitOptions();
    this.limitWithSubOptions();
    this.becomeMember();
    this.rainInsurance();
    this.cancellationTerms();
  }

  limitOptions() {
    const waitlistedFields = ['Class Attending'];
    const soldOutFields = [];
    const soldOutNames = [];

    const eventData = this.eventLimits.filter(item => !item.suboption).map(item => {
      item.limit = parseInt(item.limit);

      item.count = this.registrationData
        .map(data =>
          data.RegistrationFields.find(field => field.FieldName.includes(item.name))
        )
        .filter(data => {
          const label = Array.isArray(data.Value) ? data.Value[0]?.Label : data.Value?.Label;
          return label?.includes(item.option);
        }).length;

      return item;
    });

    eventData
      .filter(data => data.limit && data.count >= data.limit)
      .forEach(data => {
        const field = Array.from(document.querySelectorAll('div[class*="fieldContainer"]'))
          .filter(container =>
            container.querySelector('span[id*="titleLabel"]')?.textContent.includes(data.name)
          )[0];

        field.querySelectorAll('div[class*="fieldItem"]')
          .forEach(item => {
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
        this.addWaitlist(soldOutFields[i], soldOutNames[i]);
      }
    });
  }

  limitWithSubOptions() {
    const eventData = this.eventLimits.filter(item => item.suboption).map(item => {
      item.limit = parseInt(item.limit);

      const itemName = item.name.split(" & ");
      item.count = this.registrationData
        .map(data =>
        ({
          main: data.RegistrationFields.find(field => field.FieldName.includes(itemName[0])),
          sub: data.RegistrationFields.find(field => field.FieldName.includes(itemName[1]))
        })
        )
        .filter(data => {
          const mainLabel = Array.isArray(data.main.Value) ? data.main.Value[0]?.Label : data.main.Value?.Label;
          const subLabel = Array.isArray(data.sub.Value) ? data.sub.Value[0]?.Label : data.sub.Value?.Label;

          return mainLabel?.includes(item.option) && subLabel?.includes(item.suboption);
        }).length;

      return item;
    });

    [...new Set(eventData.map(data => data.name))].forEach(name => {
      const dataName = name.split(" & ");
      const fieldContainers = Array.from(document.querySelectorAll('div[class*="fieldContainer"]'));

      const mainField = fieldContainers.filter(container =>
        container.querySelector('span[id*="titleLabel"]')?.textContent.includes(dataName[0])
      )[0];

      const subField = fieldContainers.filter(container =>
        container.querySelector('span[id*="titleLabel"]')?.textContent.includes(dataName[1])
      )[0];

      const startSelected = Array.from(mainField.querySelectorAll('div[class*="fieldItem"]'))
        .filter(item => item.querySelector('input').checked);

      if (startSelected.length > 0) {
        const selectedLabel = startSelected[0].querySelector('label').textContent;
        this.handleSubOptions(selectedLabel, eventData, name, subField);
      }

      mainField.addEventListener("change", (event) => {
        const selected = document.querySelector(`label[for*="${event.target.value}"]`).textContent;

        this.handleSubOptions(selected, eventData, name, subField);
      });

      mainField.querySelector('a.clearSelectionLabel').addEventListener("click", () => {
        subField.querySelectorAll('div[class*="fieldItem"]').forEach(item => {
          item.querySelector('span.textLine').style = '';
          item.querySelector('input').disabled = false;
        });
      });
    });
  }

  handleSubOptions(selected, eventData, name, subField) {
    const limitSubOptions = eventData
      .filter(data => name.includes(data.name) && selected.includes(data.option) && data.count >= data.limit)
      .map(data => data.suboption);

    subField.querySelectorAll('div[class*="fieldItem"]').forEach(item => {
      item.querySelector('span.textLine').style = '';
      item.querySelector('input').disabled = false;
    });

    limitSubOptions.forEach(suboption => {
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

  addWaitlist(soldOutField, soldOutNames) {
    soldOutField.querySelector('div[id*="RadioGroup"]')
      .innerHTML += `
        <div style="margin-bottom: 10px">
          <span>If your class is sold out... <button id="join-waitlist">Join the Waitlist</button></span>     
        </div>`;

    const modal = document.querySelector('.custom-modal#waitlist');

    soldOutNames.forEach(name => {
      modal.querySelector('#options').innerHTML += `
        <label style="display: block; margin-bottom: 10px">
          <input type="radio" name="sold-out" value="${name}"> ${name}
        </label>`;
    });

    document.getElementById('join-waitlist').addEventListener('click', (event) => {
      event.preventDefault();
      modal.showModal();
    });

    const recipientIds = this.emailRecipientIds;
    modal.querySelector('.modal-button#complete').addEventListener('click', (event) => {
      event.preventDefault();
      sendWaitlistEmail(modal, recipientIds, this.eventId);
    });

    modal.querySelector('.modal-button#cancel').addEventListener('click', (event) => {
      event.preventDefault();
      modal.close();
    });
  }

  sendWaitlistEmail(modal, emailRecipientIds, eventId) {
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

  becomeMember() {
    // Remove label and link to join if already a member
    if (this.isMember) {
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

  rainInsurance() {
    // Remove rain date options if it is too late
    if (!this.isEarly) {
      const div = Array.from(document.getElementsByClassName('fieldSubContainer'))
        .find(container => {
          const label = container.querySelector('span[id*="titleLabel"]');
          return label && label.textContent.includes('Rain Insurance');
        });

      if (div) {
        div.querySelectorAll('div.fieldItem').forEach(item => {
          const span = item.querySelector('span.textLine');

          if (span && !span.textContent.includes('No')) {
            span.style.textDecoration = 'line-through';
            item.querySelector('input').disabled = true;
          }
        });
      }
    }
  }

  cancellationTerms() {
    // When user selects cancellation terms, show popup
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
}

function toggleLoader(display) {
  let container = document.querySelector('#idGeneralFormContainer');
  container.style.display = display ? 'none' : 'block';

  container = document.querySelector('#loader-container');
  container.style.display = display ? 'flex' : 'none';
}

function watchForChanges() {
  const observer = new MutationObserver(() => {
    execute();
  });

  observer.observe(document.querySelector('h3.formTitle'), { childList: true, subtree: true, attributes: true });
}

async function insertElements() {
  let links = [
    'https://mariannekenney.github.io/penguin/src/event-registration/event-registration.html',
    'https://mariannekenney.github.io/penguin/src/event-registration/event-registration.css',
    'https://mariannekenney.github.io/penguin/src/style.css'
  ];

  if (localStorage.getItem('developer') === '66619561') {
    links.forEach((url) => {
      url = url.split('src').join('dev/src');
    });
    console.log('DEV env .html & .css');
  }

  links
    .filter((url) => url.includes('.css'))
    .forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    });

  const response = await fetch(links.find((url) => url.includes('.html')));
  const html = await response.text();

  const container = document.getElementById('idRegistrationFormContainer')
    || document.getElementById('idSelectRegistrationTypeContainer')
    || document.getElementById('idIdentifyUserContainer');
  container.innerHTML += html;
}

async function handleUserData(token, userData) {
  try {
    const fetchRegistrationData = await fetch(`https://api.wildapricot.org/v2.2/accounts/189391/eventregistrations?contactId=${userData.Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const registrationData = await fetchRegistrationData.json();

    if (registrationData && registrationData.length == 0) {
      const container = document.getElementById('idGeneralFormContainer');
      container.innerHTML = document.getElementById('new-user-alert').innerHTML + container.innerHTML;
    }
  } catch (error) {
    console.error('Error fetching user registration data:', error);
  }
}

async function fetchToken(apiKey) {
  const base64 = btoa(`APIKEY:${apiKey}`);

  try {
    const authResponse = await fetch('https://oauth.wildapricot.org/auth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=auto',
    });
    const authData = await authResponse.json();
    return authData.access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}

async function fetchUserData() {
  try {
    const fetchUser = await fetch('/sys/api/v2/accounts/189391/contacts/me', {
      method: 'GET',
      headers: { 'clientId': 'devUser' },
      cache: 'no-store'
    });
    return await fetchUser.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function handleGuest(token, id) {
  try {
    const fetchGuest = await fetch(`https://api.wildapricot.org/v2.2/accounts/189391/eventregistrations/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return await fetchGuest.json();
  } catch (error) {
    console.error(error);
  }
}

async function fetchRegistrationInfoData(token, eventId, userData) {
  try {
    const fetchRegistrationData = await fetch(`https://api.wildapricot.org/v2.2/accounts/189391/eventregistrations?eventId=${eventId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const registrationData = await fetchRegistrationData.json();

    for (registration of registrationData) {
      const guests = registration.GuestRegistrationsSummary?.GuestRegistrations;
      if (guests?.length > 0) {
        for (guest of guests) {
          const guestRegistration = await handleGuest(token, guest.Id);

          if (guestRegistration) {
            registrationData.push(guestRegistration);
          }
        }
      }
    }

    const fetchLimits = await fetch('/resources/Admin_Registration_Management.json');
    const allLimits = await fetchLimits.json();

    const eventLimits = allLimits.data.find(eventsWithLimits => eventsWithLimits.eventId == eventId)?.data || [];

    const eventDate = document.querySelector('div[id*=InfoEndDateStartDateTimePanel').textContent.trim().split(" - ")[0];
    const diffTime = Math.abs(new Date(eventDate) - new Date());
    const isEarly = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 9;

    const isMember = userData?.MembershipLevel.Name !== 'Standard Penguin Account';

    registrationInfo = new RegistrationInfo(isEarly, isMember, eventId, eventLimits, registrationData);
    registrationInfo.execute();
  } catch (error) {
    console.error('Error fetching registration info data:', error);
  }
}

async function execute() {
  const title = document.querySelector('h3.formTitle')?.textContent.trim();
  const eventId = document.querySelector('a[href*="event-"]')?.href.split('event-')[1];

  await insertElements();
  toggleLoader(true);

  const token = await fetchToken(WILD_FRUIT_MONKEY_KEY);
  const userData = await fetchUserData();

  if (userData) {
    await handleUserData(token, userData);

    if (title === 'Choose ticket type') {
      registrationType = new RegistrationType();
      registrationType.execute();

      toggleLoader(false);
    } else if (title === 'Enter registration information') {
      await fetchRegistrationInfoData(token, eventId, userData);
      toggleLoader(false);
    } else {
      toggleLoader(false);
    }

    watchForChanges();
  } else {
    toggleLoader(false);

    document.getElementById('idGeneralFormContainer').innerHTML = document.getElementById('user-login-alert').innerHTML;
  }
}

execute();
