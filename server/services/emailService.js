/**
 * Email Service
 * Handles sending notification emails for interview scheduling,
 * application status updates, etc.
 * Falls back to console logging when SMTP is not configured.
 */

const nodemailer = require('nodemailer');

let transporter = null;

function initializeTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log('✅ Email transporter initialized');
  } else {
    console.log('📧 Email: No SMTP configured — emails will be logged to console');
  }
}

async function sendEmail({ to, subject, html, text }) {
  const emailData = { to, subject, html, text, from: process.env.SMTP_USER || 'noreply@talentflow.ai' };

  if (transporter) {
    try {
      const info = await transporter.sendMail(emailData);
      console.log(`📧 Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Email failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  } else {
    // Log to console in development
    console.log('═══════════════════════════════════════');
    console.log('📧 EMAIL (Console Mode)');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text || '(HTML content)'}`);
    console.log('═══════════════════════════════════════');
    return { success: true, messageId: 'console-log' };
  }
}

// Pre-built email templates

async function sendInterviewScheduled({ candidateEmail, candidateName, jobTitle, interviewDate, interviewType, meetingLink, interviewerNames }) {
  const formattedDate = new Date(interviewDate).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return sendEmail({
    to: candidateEmail,
    subject: `Interview Scheduled — ${jobTitle} at TalentFlow`,
    text: `Hi ${candidateName},\n\nYour ${interviewType} interview for the ${jobTitle} position has been scheduled.\n\nDate: ${formattedDate}\n${meetingLink ? `Meeting Link: ${meetingLink}` : ''}\n${interviewerNames ? `Interviewers: ${interviewerNames.join(', ')}` : ''}\n\nBest regards,\nTalentFlow AI Hiring Team`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Interview Scheduled</h2>
        <p>Hi <strong>${candidateName}</strong>,</p>
        <p>Your <strong>${interviewType}</strong> interview for the <strong>${jobTitle}</strong> position has been scheduled.</p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
          ${meetingLink ? `<p style="margin: 4px 0;"><strong>🔗 Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
          ${interviewerNames ? `<p style="margin: 4px 0;"><strong>👥 Interviewers:</strong> ${interviewerNames.join(', ')}</p>` : ''}
        </div>
        <p>Best regards,<br>TalentFlow AI Hiring Team</p>
      </div>
    `
  });
}

async function sendApplicationStatusUpdate({ candidateEmail, candidateName, jobTitle, newStatus }) {
  const statusMessages = {
    screening: 'Your application is now being reviewed by our team.',
    interview: 'Congratulations! You have been selected for an interview.',
    assessment: 'You have been moved to the assessment stage.',
    offer: 'We are pleased to inform you that an offer is being prepared!',
    hired: 'Congratulations! You have been hired!',
    rejected: 'After careful consideration, we have decided to move forward with other candidates.'
  };

  return sendEmail({
    to: candidateEmail,
    subject: `Application Update — ${jobTitle}`,
    text: `Hi ${candidateName},\n\n${statusMessages[newStatus] || `Your application status has been updated to: ${newStatus}`}\n\nBest regards,\nTalentFlow AI Hiring Team`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Application Update</h2>
        <p>Hi <strong>${candidateName}</strong>,</p>
        <p>${statusMessages[newStatus] || `Your application status has been updated to: <strong>${newStatus}</strong>`}</p>
        <p>Position: <strong>${jobTitle}</strong></p>
        <p>Best regards,<br>TalentFlow AI Hiring Team</p>
      </div>
    `
  });
}

module.exports = {
  initializeTransporter,
  sendEmail,
  sendInterviewScheduled,
  sendApplicationStatusUpdate
};
