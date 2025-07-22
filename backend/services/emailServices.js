const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNotificationEmail = async (schoolName, teacherName, message) => {
  if (!process.env.TEAM_EMAILS) {
    console.error('TEAM_EMAILS environment variable is not defined');
    return;
  }

  const teamEmails = process.env.TEAM_EMAILS.split(',').map(email => email.trim());
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: teamEmails,
    subject: `New Query from ${teacherName} at ${schoolName}`,
    text: `Teacher ${teacherName} from ${schoolName} sent a new message:\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent to team');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendNotificationEmail };