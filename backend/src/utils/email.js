const nodemailer = require("nodemailer");

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendEnrollmentConfirmation = async (userEmail, userName, courseName, amount) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("⚠️  SMTP not configured — skipping email for:", userEmail);
            return { success: false, reason: "SMTP not configured" };
        }

        const transporter = createTransporter();

        const displayAmount = (amount / 100).toLocaleString("en-IN");

        const mailOptions = {
            from: `"JetVau Aerospace" <${process.env.FROM_EMAIL}>`,
            to: userEmail,
            subject: `✅ Enrollment Confirmed — ${courseName}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
                    <div style="background: #0F172A; color: white; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">JetVau Aerospace</h1>
                        <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Drone Training Institute</p>
                    </div>
                    
                    <div style="padding: 32px; background: white;">
                        <h2 style="color: #0F172A; margin-top: 0;">Welcome aboard, ${userName}! 🎉</h2>
                        <p style="color: #475569; line-height: 1.6;">
                            Your enrollment for <strong>${courseName}</strong> has been confirmed.
                        </p>
                        
                        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b;">Course</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0F172A;">${courseName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b;">Amount Paid</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0F172A;">₹${displayAmount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b;">Status</td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #475569; line-height: 1.6;">
                            Our team will contact you shortly with batch details and the training schedule.
                            If you have any questions, feel free to reply to this email.
                        </p>
                    </div>
                    
                    <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} JetVau Aerospace. All rights reserved.</p>
                        <p>Jabalpur, Madhya Pradesh, India</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Confirmation email sent to ${userEmail}`);
        return { success: true };
    } catch (error) {
        console.error("Email send error:", error.message);
        return { success: false, reason: error.message };
    }
};

module.exports = { sendEnrollmentConfirmation };
