// Run once after MAILERLITE_API_TOKEN is available in the environment.
// The token stays server-side and is never used by the GitHub Pages site.
const token = process.env.MAILERLITE_API_TOKEN;
const groupName = 'Deric Updates';

if (!token) {
  console.error('MAILERLITE_API_TOKEN is required to create the MailerLite group.');
  process.exitCode = 1;
} else {
  const api = async (path, options = {}) => {
    const response = await fetch(`https://connect.mailerlite.com/api${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`MailerLite API returned HTTP ${response.status}.`);
    }
    return response.json();
  };

  try {
    let existing;
    for (let page = 1; page <= 100; page += 1) {
      const result = await api(`/groups?limit=100&page=${page}`);
      existing = result.data?.find((group) => group.name?.toLowerCase() === groupName.toLowerCase());
      if (existing || !result.links?.next) break;
    }

    if (!existing) {
      const result = await api('/groups', {
        method: 'POST',
        body: JSON.stringify({ name: groupName })
      });
      existing = result.data;
      console.log(`Created MailerLite group: ${existing.name} (${existing.id}).`);
    } else {
      console.log(`MailerLite group already exists: ${existing.name} (${existing.id}).`);
    }
  } catch (error) {
    console.error(`Could not set up MailerLite group: ${error.message}`);
    process.exitCode = 1;
  }
}
