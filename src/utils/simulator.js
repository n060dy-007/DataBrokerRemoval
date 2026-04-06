export const generateEmailTemplate = (broker, userData) => {
  const [id, name, cat, diff, url, method, data, time, email, types, status] = broker;
  const { fullName, email: userEmail, phone, address } = userData;

  const subject = `Data Deletion Request Under CCPA/GDPR - ${fullName}`;
  
  const body = `To whom it may concern at ${name},

My name is ${fullName} and I am writing to formally request the permanent deletion of any and all personal information you have collected, processed, or stored about me.

This request is made pursuant to applicable privacy laws (such as the CCPA, GDPR, or similar state/regional regulations).

My identifying information for cross-reference is:
- Full Name: ${fullName}
- Primary Email: ${userEmail}
${phone ? `- Phone Number: ${phone}` : ''}
${address ? `- Physical Address: ${address}` : ''}

I also request that you:
1. Cease the sale or sharing of my personal information to any third parties immediately.
2. Confirm in writing once the deletion process is complete.

I look forward to your confirmation within the legally required timeframe.

Best regards,
${fullName}`;

  return {
    to: email || 'privacy@' + (new URL(url).hostname.replace('www.', '')),
    subject,
    body,
    mailto: `mailto:${email || 'privacy@' + (new URL(url).hostname.replace('www.', ''))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  };
};
