const WILD_APRICOT_DEV_ID = "__WILD_APRICOT_DEV_ID__";

let backend, dataJSON;

async function insertHTMLCSS() {
  const html = await backend.fetchHTMLCSS([
    'manage-registrations/manage-registrations.html',
    'manage-registrations/manage-registrations.css',
    'style.css'
  ]);

  document.querySelector('.zoneHeader4 .gadgetStyleBody').innerHTML = html;
}

function toggleLoader(display) {
  document.getElementById('loader-container').style.display = display ? 'flex' : 'none';
  document.getElementById('content').style.display = display ? 'none' : 'block';

  document.getElementById('dropdown').disabled = display;
  document.getElementById('save').disabled = display;
}

async function deleteFile() {
  await fetch('/resources/Admin_Registration_Management.json', {
      method: 'DELETE'
    });
}

async function uploadFile(file) {
  const body = new FormData();
  body.append('file', file);

  await fetch('/resources', {
    method: 'POST',
    body
  });

  getEvents();
}

function dataFromTable(tableId) {
  const table = document.getElementById(tableId);
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim().toLowerCase());
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  const data = rows.map(row => {
    const cells = row.querySelectorAll('td');
    let obj = {};

    headers.filter(header => header !== 'registered').forEach((header, index) => {
      header = header.toLowerCase().replace(' ', '');
      const cell = cells[index];
      if (header === 'limit') {
        let input = cell.querySelector('input');
        if (!input) {
          input = cells[index - 1].querySelector('input');
        }
        obj[header] = input ? input.value : null;
      } else {
        obj[header] = cell ? cell.innerText.trim() : null;
      }
    });

    return obj;
  });

  return data;
}

async function onSaveData() {
  const eventId = document.getElementById('dropdown').value;
  saveData(eventId);

  const jsonString = JSON.stringify(dataJSON, null, 2);
  const file = new File([jsonString], 'Admin_Registration_Management.json', {
    type: 'application/json',
  });

  toggleLoader(true);
  await deleteFile();
  await uploadFile(file);
}

function saveData(eventId) {
  const eventData = dataJSON.data.find(data => data.eventId == eventId);

  updatedData = {
    eventId: eventId,
    data: dataFromTable('management-table')
  };

  if (eventData) {
    dataJSON.data[dataJSON.data.indexOf(eventData)] = updatedData;
  } else {
    dataJSON.data.push(updatedData);
  }
}

function eventDropdown(events) {
  const dropdown = document.getElementById('dropdown');
  dropdown.innerHTML = '';

  events.forEach(event => {
    dropdown.innerHTML += `<option value="${event.Id}">${event.Name}</option>`;
  });
  getEventData(events[0].Id);

  dropdown?.addEventListener('change', function () {
    getEventData(this.value);
  });
}

function setupRegistrations(fieldOptions, registrationData) {
  const fieldsOnly = registrationData.map(item => item.RegistrationFields);
  let registrationsCurrent = {};

  fieldOptions.forEach(option => {
    const specifics = fieldsOnly.map((fields, i) => {
      let field = fields.find(field => field.FieldName.includes(option.main));
      let returnValue = field.Value ? (field.Value?.Label || field.Value[0]?.Label) : null;

      if (returnValue && option.sub) {
        field = fields.find(field => field.FieldName.includes(option.sub));
        returnValue = `${returnValue} && ${field.Value ? (field.Value?.Label || field.Value[0]?.Label) : null}`;
      }

      return returnValue;
    });

    const optionMap = {};
    for (const item of specifics) {
      optionMap[item] = (optionMap[item] || 0) + 1;
    }

    registrationsCurrent = Object.assign({}, registrationsCurrent, optionMap);
  });

  return registrationsCurrent;
}

function setupTable(event, storedOptions, registrations) {
  const fieldOptions = [
    { main: 'Class Attending', sub: '' },
    { main: 'Data Driven Coaching', sub: '' },
    { main: 'Bike Selection', sub: 'Rental Dates' },
    { main: 'Discounted Dunlop Tires', sub: '' },
  ];

  displayTable(getData(event, storedOptions, fieldOptions, setupRegistrations(fieldOptions, registrations)));
}

function getData(event, storedOptions, fieldOptions, registrationsCurrent) {
  const dataOptions = [];

  fieldOptions.forEach(fieldOption => {
    let name = fieldOption.main;
    let fieldDetails = event.Details.EventRegistrationFields
      .find(field => field.FieldName.includes(fieldOption.main));

    if (fieldDetails) {
      fieldDetails.AllowedValues
        .map(value => value.Label)
        .filter(value => value && !value.includes('Equipment Only'))
        .forEach(option => {
          if (option) {
            if (fieldOption.sub) {
              name = `${fieldOption.main} & ${fieldOption.sub}`;

              let subFieldOptions = event.Details.EventRegistrationFields
                .find(field => field.FieldName.includes(fieldOption.sub))
                .AllowedValues
                  .filter(value => value.Label)
                  .map(value => value.Label.split(' ')).flat();

              subFieldOptions = [...new Set(subFieldOptions)]
                .filter(value => value.length > 5 && !value.includes(','));

              subFieldOptions.forEach(suboption => {
                const limit = storedOptions.data?.find(stored => option.includes(stored.option) && suboption.includes(stored.suboption))?.limit || '';
                let registered = 0;
                const regristrations = Object.keys(registrationsCurrent)
                  .filter(current => current.includes(option) && current.includes(suboption));

                regristrations.forEach(current => registered += registrationsCurrent[current]);

                dataOptions.push({ name, option, suboption, limit, registered });
              });
            } else {
              const suboption = '';
              const limit = storedOptions.data?.find(stored => option.includes(stored.option))?.limit || '';
              const registered = registrationsCurrent[option] || 0;

              dataOptions.push({ name, option, suboption, limit, registered });
            }
          }
        });
    }
  });

  return dataOptions;
}

function displayTable(tableData) {
  const table = document.getElementById('table-body');
  table.innerHTML = '';

  tableData.forEach((data, i) => {
    const isSameName = data.name === tableData[i - 1]?.name;
    const isSameOption = data.option === tableData[i - 1]?.option;
    const sameColumnStyle = 'border-bottom: none; border-top: none; color: white';

    let rowStyle = '';
    let nameStyle = sameColumnStyle;
    let optionStyle = sameColumnStyle;
    let suboptionStyle = '';

    if (!isSameName) {
      rowStyle = 'border-top: 2px solid #40b2cf;';
      nameStyle = 'border-bottom: none;';
    }

    if (!isSameOption) {
      optionStyle = 'border-bottom: none;';
    }

    if (i == (tableData.length - 1)) {
      rowStyle += ' border-bottom: 2px solid #40b2cf;';
    }

    const input = `<input type="number" id="class-${i}" min="0" step="1" value="${data.limit}" placeholder="Unlimited" style="width: 80px">`;

    table.innerHTML += `
      <tr style="${rowStyle}">
        <td style="${nameStyle}">${data.name}</td>
        <td style="${optionStyle}" colspan="${data.suboption ? 1 : 2}">${data.option}</td>
        ${data.suboption ? `<td style="${suboptionStyle}">${data.suboption}</td>` : ''}
        <td>${input}</td>
        <td style="opacity: 0.5">${data.registered || 0}</td>
      </tr>`;

    setTimeout(() => {
      const input = document.getElementById(`class-${i}`);

      if (input) {
        input.addEventListener('input', function () {
          this.style.borderColor = '#40b2cf';
          document.getElementById('save').disabled = false;
        });

        input.addEventListener('wheel', function (event) {
          event.preventDefault();
        });
      }
    }, 0);
  });
}

async function getEventData(eventId) {
  toggleLoader(true);

  const token = await backend.fetchToken();
  const event = await backend.fetchEvent(eventId);
  const registrations = await backend.fetchEventRegistrations(token, eventId);

  const limits = dataJSON.data.find(data => data.eventId == eventId);
  setupTable(event, (limits || []), registrations);

  toggleLoader(false);

  document.getElementById('save').disabled = true;
}

async function getEvents() {
  toggleLoader(true);

  const limits = await backend.fetchLimits();
  const events = await backend.fetchAllEvents();

  const eventIds = events.Events.map(event => `${event.Id}`);
  dataJSON = {
    data: limits ? limits.data.filter(limit => eventIds.includes(`${limit.eventId}`)) : []
  };

  eventDropdown(events.Events.reverse());
}

async function execute() {
  let baseUrl = 'https://mariannekenney.github.io/penguin/src/'
  if (localStorage.getItem('developer') === WILD_APRICOT_DEV_ID) {
    baseUrl = baseUrl.split('src').join('dev/src');
    console.log('DEV env .js');
  }

  backend = await import(`${baseUrl}backend.js`);

  await insertHTMLCSS();
  await getEvents();
}

execute().catch((err) => {
  console.error(err);

  document.getElementById('registration-management').innerHTML = `
    <div id="registration-management-error">
      <h3>Error Fetching Data</h3>
      <p>Try refreshing the page, otherwise...</p>
      <p>Open developer's console for more information or contact developer.</p>
    <div>`;
})