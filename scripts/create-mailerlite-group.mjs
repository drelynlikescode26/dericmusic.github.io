// Run on the command line only. Never ship a token to the GitHub Pages frontend.
import { pathToFileURL } from 'node:url';

export async function setupMailerLite({
  token = process.env.MAILERLITE_API_TOKEN,
  checkOnly = false,
  fetchImpl = fetch,
  log = console.log
} = {}) {
  const groupName = 'Deric Updates';
  if (!token?.trim()) {
    throw new Error('MAILERLITE_API_TOKEN is not available. Use the secure environment secret field, or create the embedded form in MailerLite and share only its public embed code.');
  }

  const api = async (path, options = {}) => {
    let response;
    try {
      response = await fetchImpl(`https://connect.mailerlite.com/api${path}`, {
        ...options,
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.trim()}`,
          ...(options.body ? { 'Content-Type': 'application/json' } : {})
        }
      });
    } catch {
      // Never echo request details or an exception that might contain credentials.
      throw new Error('MailerLite request failed or timed out. Check connectivity and try again.');
    }
    if (!response.ok) throw new Error(`MailerLite API returned HTTP ${response.status}.`);
    try {
      return await response.json();
    } catch {
      throw new Error('MailerLite returned an invalid JSON response.');
    }
  };

  async function list(path) {
    const items = [];
    for (let page = 1; page <= 100; page += 1) {
      const result = await api(`${path}?limit=100&page=${page}`);
      if (!Array.isArray(result.data) || !result.links || !Object.hasOwn(result.links, 'next')) {
        throw new Error('MailerLite returned an incomplete list response; no changes made.');
      }
      items.push(...result.data);
      if (!result.links.next) return items;
    }
    throw new Error('MailerLite pagination limit reached; no changes made.');
  }

  const groups = await list('/groups');
  let group = groups.find((item) => item.name?.toLowerCase() === groupName.toLowerCase());
  if (checkOnly) {
    const forms = await list('/forms/embedded');
    const status = {
      group: group ? { id: group.id, name: group.name } : null,
      embeddedForms: forms.map(({ id, name, active, has_content, is_broken, double_optin }) =>
        ({ id, name, active, has_content, is_broken, double_optin }))
    };
    log(JSON.stringify(status, null, 2));
    log('Read-only check complete. Confirm the form targets Deric Updates in the account editor, obtain its public embed code, and verify a consented signup and confirmation before switching Formspree.');
    return status;
  }

  if (group) {
    log(`MailerLite group already exists: ${group.name} (${group.id}).`);
  } else {
    const result = await api('/groups', {
      method: 'POST', body: JSON.stringify({ name: groupName })
    });
    group = result.data;
    if (!group?.id || group.name !== groupName) {
      throw new Error('Unexpected group creation response. Inspect the account before retrying.');
    }
    log(`Created MailerLite group: ${group.name} (${group.id}).`);
  }
  return group;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--check')) {
    console.error('Usage: node scripts/create-mailerlite-group.mjs [--check]');
    process.exitCode = 1;
  } else {
    try {
      await setupMailerLite({ checkOnly: args.includes('--check') });
    } catch (error) {
      console.error(`Could not check/setup MailerLite: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
