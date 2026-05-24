import { handleAuth, initiateLogin, initiateLogout } from './auth';
import { getAddressBook, Contact } from './addressBook';
import { mintGuardianshipAgreement } from './agreements';
import { createCoStewardshipProject } from './stewardship';

// UI Elements
const idpUrlInput = document.getElementById('idp-url') as HTMLInputElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

const heroUnauth = document.getElementById('hero-unauth') as HTMLElement;
const dashboard = document.getElementById('dashboard') as HTMLElement;

const userNameEl = document.getElementById('user-name') as HTMLElement;
const userWebidEl = document.getElementById('user-webid') as HTMLElement;
const contactListEl = document.getElementById('contact-list') as HTMLElement;

// Modal Elements
const agreementModal = document.getElementById('agreement-modal') as HTMLElement;
const modalAgentName = document.getElementById('modal-agent-name') as HTMLElement;
const domainSelect = document.getElementById('domain-select') as HTMLSelectElement;
const valuesSelect = document.getElementById('values-select') as HTMLSelectElement;
const cancelBtn = document.getElementById('cancel-agreement-btn') as HTMLButtonElement;
const mintBtn = document.getElementById('mint-agreement-btn') as HTMLButtonElement;

// ADP Elements
const adpDomainInput = document.getElementById('adp-domain-input') as HTMLInputElement;
const generateAdpBtn = document.getElementById('generate-adp-btn') as HTMLButtonElement;
const adpDnsOutput = document.getElementById('adp-dns-output') as HTMLElement;
const adpDnsCode = document.getElementById('adp-dns-code') as HTMLElement;

// Project Co-Stewardship Elements
const openProjectModalBtn    = document.getElementById('open-project-modal-btn') as HTMLButtonElement;
const projectModal           = document.getElementById('project-modal') as HTMLElement;
const projectNameInput       = document.getElementById('project-name') as HTMLInputElement;
const projectDescInput       = document.getElementById('project-description') as HTMLTextAreaElement;
const projectHomepageInput   = document.getElementById('project-homepage') as HTMLInputElement;
const coStewardSelect        = document.getElementById('co-steward-select') as HTMLSelectElement;
const projectPolicySelect    = document.getElementById('project-policy-select') as HTMLSelectElement;
const projectValuesSelect    = document.getElementById('project-values-select') as HTMLSelectElement;
const projectProviderSelect  = document.getElementById('project-provider-select') as HTMLSelectElement;
const providerDetailsContainer = document.getElementById('provider-details-container') as HTMLElement;
const providerNameInput      = document.getElementById('provider-name') as HTMLInputElement;
const providerUriInput       = document.getElementById('provider-uri') as HTMLInputElement;
const cancelProjectBtn       = document.getElementById('cancel-project-btn') as HTMLButtonElement;
const mintProjectBtn         = document.getElementById('mint-project-btn') as HTMLButtonElement;
const projectListEl          = document.getElementById('project-list') as HTMLElement;

let currentSession: any;
let targetAgentForAgreement: Contact | null = null;

// Initialization
window.addEventListener('load', async () => {
  currentSession = await handleAuth();

  if (currentSession.info.isLoggedIn) {
    // Show Dashboard
    heroUnauth.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    idpUrlInput.classList.add('hidden');

    const webId = currentSession.info.webId;
    userWebidEl.textContent = webId;
    userNameEl.textContent = "Sovereign User"; // Could fetch from profile

    // Load Address Book
    const contacts = await getAddressBook(webId);
    renderContacts(contacts);
  }
});

// Auth Listeners
loginBtn.addEventListener('click', () => {
  initiateLogin(idpUrlInput.value);
});
logoutBtn.addEventListener('click', () => {
  initiateLogout();
});

// Render Address Book
function renderContacts(contacts: Contact[]) {
  contactListEl.innerHTML = '';
  coStewardSelect.innerHTML = ''; // Reset multi-select options
  
  contacts.forEach(contact => {
    const li = document.createElement('li');
    li.className = 'contact-item';
    li.innerHTML = `
      <div>
        <h4>${contact.name}</h4>
        <small style="color: var(--text-secondary); word-break: break-all;">${contact.webId}</small>
      </div>
      <button class="btn primary-btn">Negotiate Role</button>
    `;
    
    // Bind Modal
    const btn = li.querySelector('button');
    btn?.addEventListener('click', () => {
      targetAgentForAgreement = contact;
      modalAgentName.textContent = contact.name;
      agreementModal.classList.remove('hidden');
    });

    contactListEl.appendChild(li);

    // Add to project co-steward dropdown
    const option = document.createElement('option');
    option.value = contact.webId;
    option.textContent = `${contact.name} (${contact.webId})`;
    coStewardSelect.appendChild(option);
  });
}

// Modal Listeners
cancelBtn.addEventListener('click', () => {
  agreementModal.classList.add('hidden');
  targetAgentForAgreement = null;
});

mintBtn.addEventListener('click', async () => {
  if (!targetAgentForAgreement) return;
  
  mintBtn.textContent = "Minting...";
  mintBtn.disabled = true;

  try {
    const webId = currentSession.info.webId;
    await mintGuardianshipAgreement(
      webId,
      targetAgentForAgreement.webId,
      domainSelect.value,
      valuesSelect.value,
      webId // Passing root profile as base for now
    );
    alert(`Agreement successfully stored in Pod for ${domainSelect.value}!`);
  } catch (error) {
    console.error(error);
    alert("Failed to store agreement. Note: Demo assumes /agreements/ exists with Write permissions on your Pod.");
  }

  agreementModal.classList.add('hidden');
  mintBtn.textContent = "Sign & Mint Agreement";
  mintBtn.disabled = false;
  targetAgentForAgreement = null;
});

// ADP Logic
generateAdpBtn.addEventListener('click', () => {
  const domain = adpDomainInput.value.trim();
  if (!domain) {
    alert("Please enter a domain name.");
    return;
  }
  
  const webId = currentSession?.info?.webId;
  if (!webId) {
    alert("You must be logged in to generate ADP records.");
    return;
  }

  // Generate standard DNS TXT record for ADP linking domain to WebID
  const txtRecordName = `_adp.${domain}`;
  const txtRecordValue = `v=adp1 webid=${webId}`;
  
  adpDnsCode.textContent = `Name: ${txtRecordName}\nType: TXT\nValue: "${txtRecordValue}"`;
  adpDnsOutput.classList.remove('hidden');
});

// Project Co-Stewardship Logic
openProjectModalBtn.addEventListener('click', () => {
  projectModal.classList.remove('hidden');
});

projectProviderSelect.addEventListener('change', () => {
  if (projectProviderSelect.value === 'other') {
    providerDetailsContainer.classList.remove('hidden');
  } else {
    providerDetailsContainer.classList.add('hidden');
  }
});

cancelProjectBtn.addEventListener('click', () => {
  projectModal.classList.add('hidden');
  projectNameInput.value = '';
  projectDescInput.value = '';
  projectHomepageInput.value = '';
  projectProviderSelect.value = 'self';
  providerDetailsContainer.classList.add('hidden');
  providerNameInput.value = '';
  providerUriInput.value = '';
});

mintProjectBtn.addEventListener('click', async () => {
  const projectName = projectNameInput.value.trim();
  const description = projectDescInput.value.trim();
  const homepageUrl = projectHomepageInput.value.trim();
  const selectedOptions = Array.from(coStewardSelect.selectedOptions);
  const stewards = selectedOptions.map(opt => opt.value);
  
  const providerType = projectProviderSelect.value as 'self' | 'other';
  const providerName = providerNameInput.value.trim();
  const providerUri = providerUriInput.value.trim();

  if (!projectName) {
    alert("Please enter a project name.");
    return;
  }
  if (stewards.length === 0) {
    alert("Please select at least one co-steward from the address book.");
    return;
  }
  if (providerType === 'other' && !providerName) {
    alert("Please enter the name of the hosting platform/organisation.");
    return;
  }

  mintProjectBtn.textContent = "Minting Graph...";
  mintProjectBtn.disabled = true;

  try {
    const webId = currentSession.info.webId;
    await createCoStewardshipProject({
      creatorWebId:     webId,
      projectName,
      description,
      homepageUrl,
      coStewardsWebIds: stewards,
      policyType:       projectPolicySelect.value as 'co-authorship' | 'delegated',
      valueConstraint:  projectValuesSelect.value,
      providerType,
      providerName:     providerType === 'other' ? providerName : undefined,
      providerUri:      providerType === 'other' && providerUri ? providerUri : undefined,
    });

    const providerLabel = providerType === 'self' ? 'Self (Personal Pod)' : providerName;

    alert(`Project '${projectName}' minted as doap:Project + schema:Project with ODRL & HEF equity graph on your Pod!`);

    // Enrich project list card
    const li = document.createElement('li');
    li.className = 'contact-item';
    li.innerHTML = `
      <div>
        <h4>${projectName}</h4>
        ${description ? `<p style="font-size:0.85rem; color:var(--text-secondary); margin: 0.3rem 0;">${description}</p>` : ''}
        <small style="color: var(--text-secondary);">
          ODRL: <strong>${projectPolicySelect.value}</strong> &nbsp;|&nbsp;
          Host: <strong>${providerLabel}</strong> &nbsp;|&nbsp;
          Co-Stewards: <strong>${stewards.length}</strong>
        </small>
        ${homepageUrl ? `<br/><a href="${homepageUrl}" target="_blank" style="font-size:0.8rem; color:var(--accent-color);">${homepageUrl}</a>` : ''}
      </div>
    `;
    projectListEl.appendChild(li);

  } catch (error) {
    console.error(error);
    alert("Failed to store project graph. Note: Demo assumes /projects/ exists with Write permissions on your Pod.");
  }

  projectModal.classList.add('hidden');
  mintProjectBtn.textContent = "Mint Project Graph";
  mintProjectBtn.disabled = false;
  projectNameInput.value = '';
  projectDescInput.value = '';
  projectHomepageInput.value = '';
  projectProviderSelect.value = 'self';
  providerDetailsContainer.classList.add('hidden');
  providerNameInput.value = '';
  providerUriInput.value = '';
});

