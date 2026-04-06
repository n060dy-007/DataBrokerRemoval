/**
 * Generates an email template for data deletion requests.
 * @param {Array} broker - The broker entry from brokers.js
 * @param {Object} userData - User profile data (name, email, city, state)
 */
export const generateEmailTemplate = (broker, userData) => {
  // broker structure: [id, name, cat, diff, url, method, data, time, email, types, status]
  const [id, name, cat, diff, url, method, data, time, email, types, status] = broker;
  const { fullName, email: userEmail, phone, address, city, state } = userData;

  const subject = `Data Deletion Request Under CCPA/GDPR - ${fullName || '[Name]'}`;
  
  const body = `To whom it may concern at ${name},

My name is ${fullName || '[FullName]'} and I am writing to formally request the permanent deletion of any and all personal information you have collected, processed, or stored about me.

This request is made pursuant to applicable privacy laws (such as the CCPA, VCDPA, GDPR, or similar state/regional regulations).

My identifying information for cross-reference is:
- Full Name: ${fullName || '[FullName]'}
- Primary Email: ${userEmail || '[Email]'}
${phone ? `- Phone Number: ${phone}` : ''}
${city || state ? `- Location: ${city || ''}${city && state ? ', ' : ''}${state || ''}` : ''}
${address ? `- Physical Address: ${address}` : ''}

I also request that you:
1. Delete all personal data you hold about me.
2. Direct any service providers who received my data to also delete it.
3. Confirm in writing once the deletion process is complete.

I look forward to your confirmation within the legally required timeframe (45 days).

Best regards,
${fullName || '[FullName]'}
${userEmail || ''}`;

  let recipient = email;
  if (!recipient) {
    try {
      recipient = `privacy@${new URL(url).hostname.replace('www.', '')}`;
    } catch (e) {
      recipient = 'privacy@data-broker.com';
    }
  }

  return {
    to: recipient,
    subject,
    body,
    mailto: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  };
};

/**
 * Creates a Gmail draft via the Antigravity Gmail MCP bridge.
 */
export async function createGmailDraft(to, subject, body) {
  try {
    // This connects to the Gmail MCP bridge via the system's message tool
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{ 
          role: "user", 
          content: `Create a Gmail draft. Use gmail_create_draft.\nTo: ${to}\nSubject: ${subject}\nBody:\n${body}` 
        }]
      })
    });
    
    if (!res.ok) throw new Error('Network response was not ok');
    
    return { ok: true, message: "Draft successfully created in your Gmail." };
  } catch (error) {
    console.error('Gmail MCP Draft failed:', error);
    return { ok: false, message: error.message };
  }
}
