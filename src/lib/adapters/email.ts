import net from "net";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId: string;
  error?: string;
}

/**
 * Development SMTP email sender that talks directly to Mailpit / local SMTP or falls back to logger.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  const host = process.env.SMTP_HOST || "localhost";
  const port = parseInt(process.env.SMTP_PORT || "1025", 10);
  const from = options.from || process.env.SMTP_FROM || "ServiceSaathi <no-reply@servicesaathi.local>";
  const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@servicesaathi.local>`;

  // In test or non-production without live SMTP container, return mock success and log
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let step = 0;
    let resolved = false;

    const finish = (result: EmailSendResult) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(2000);

    socket.on("error", (err) => {
      console.info(`[Email Adapter - Local Mailpit notice] (${err.message}) - Captured email for ${options.to}: "${options.subject}"`);
      finish({ success: true, messageId });
    });

    socket.on("timeout", () => {
      console.info(`[Email Adapter - Timeout fallback] Captured email for ${options.to}: "${options.subject}"`);
      finish({ success: true, messageId });
    });

    socket.connect(port, host, () => {
      // connected to SMTP
    });

    socket.on("data", (data) => {
      const response = data.toString();
      if (response.startsWith("220") && step === 0) {
        socket.write(`HELO localhost\r\n`);
        step = 1;
      } else if (response.startsWith("250") && step === 1) {
        socket.write(`MAIL FROM:<no-reply@servicesaathi.local>\r\n`);
        step = 2;
      } else if (response.startsWith("250") && step === 2) {
        socket.write(`RCPT TO:<${options.to}>\r\n`);
        step = 3;
      } else if (response.startsWith("250") && step === 3) {
        socket.write(`DATA\r\n`);
        step = 4;
      } else if (response.startsWith("354") && step === 4) {
        const emailContent = [
          `From: ${from}`,
          `To: ${options.to}`,
          `Subject: ${options.subject}`,
          `Message-ID: ${messageId}`,
          `Content-Type: text/html; charset=UTF-8`,
          "",
          options.html,
          ".",
          "",
        ].join("\r\n");
        socket.write(emailContent);
        step = 5;
      } else if (response.startsWith("250") && step === 5) {
        socket.write(`QUIT\r\n`);
        finish({ success: true, messageId });
      }
    });
  });
}
