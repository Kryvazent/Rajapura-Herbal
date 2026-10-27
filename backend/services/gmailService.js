import tls from "node:tls";
import { randomUUID } from "node:crypto";

const formatAmount = (amount, currency) =>
  `${currency} ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

const getSafePaymentSlipUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
};

const getOrderEmailContent = (order, customer, contactNumber, role) => {
  const currency = order.currency || "USD";
  const lines = order.products.map((item) => ({
    name: item.name,
    qty: item.qty,
    unitPrice: item.price > 0 ? formatAmount(item.price, currency) : "Contact for price",
    lineTotal: item.price > 0 ? formatAmount(item.price * item.qty, currency) : "Contact for price",
  }));
  const total = order.products.some((item) => item.price <= 0)
    ? "Contact for price"
    : formatAmount(order.products.reduce((sum, item) => sum + item.price * item.qty, 0), currency);
  const orderCode = order._id.toString().slice(-7).toUpperCase();
  const isStore = role === "store";
  const heading = isStore ? "A new order has arrived" : "Thank you for your order";
  const intro = isStore
    ? "A customer has placed an order. Review the details below and follow up to confirm fulfillment."
    : "Your order has been received. We’ll review it and contact you with the next steps.";
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";
  const slipUrl = getSafePaymentSlipUrl(order.paymentSlipUrl);
  const itemRows = lines.map((item) => `<tr>
    <td style="padding:14px 12px;border-bottom:1px solid #e9e5da;color:#29451c;font-size:14px;line-height:1.5;">
      <strong style="font-weight:700;">${escapeHtml(item.name)}</strong><br>
      <span style="color:#766f62;">Qty ${escapeHtml(item.qty)} &middot; ${escapeHtml(item.unitPrice)} each</span>
    </td>
    <td align="right" style="padding:14px 12px;border-bottom:1px solid #e9e5da;color:#29451c;font-size:14px;font-weight:700;white-space:nowrap;">${escapeHtml(item.lineTotal)}</td>
  </tr>`).join("");

  const plainText = [
    "RAJAPURA HERBAL",
    heading,
    intro,
    `Order #${orderCode}${date ? ` · ${date}` : ""}`,
    "",
    "ORDER ITEMS",
    ...lines.map((item) => `- ${item.name} x ${item.qty} | ${item.unitPrice} each | ${item.lineTotal}`),
    `Estimated total: ${total}`,
    "",
    "DELIVERY & PAYMENT",
    `Customer: ${customer.name}`,
    `Email: ${customer.email}`,
    `Contact: ${contactNumber}`,
    `Address: ${order.address}`,
    `Country: ${order.country}`,
    `Payment method: ${order.paymentMethod}`,
    ...(order.paymentSlipUrl ? [`Payment slip: ${order.paymentSlipUrl}`] : []),
    ...(order.additionalNote ? [`Additional note: ${order.additionalNote}`] : []),
    "",
    "Pure · Natural · Authentic Ayurvedic Heritage",
    "www.rajapuraherbal.lk",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f1eee6;color:#35432c;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(intro)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1eee6;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#fffdf8;border:1px solid #e5e0d3;border-radius:18px;overflow:hidden;">
        <tr><td style="height:6px;background:#d4a017;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:25px 30px;background:#244516;color:#fffdf5;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:1.5px;font-weight:bold;">RAJAPURA</div>
          <div style="margin-top:4px;color:#d9c98f;font-size:10px;letter-spacing:2px;">HERBAL COMPANY</div>
        </td></tr>
        <tr><td style="padding:30px 30px 22px;">
          <div style="margin-bottom:9px;color:#9a6942;font-size:11px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;">${isStore ? "Store notification" : "Order confirmation"}</div>
          <h1 style="margin:0;color:#244516;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:normal;line-height:1.25;">${escapeHtml(heading)}</h1>
          <p style="margin:12px 0 0;color:#71695e;font-size:14px;line-height:1.7;">${escapeHtml(intro)}</p>
          <div style="display:inline-block;margin-top:19px;padding:9px 13px;border:1px solid #dfe4d2;border-radius:20px;background:#f2f4e9;color:#31551f;font-size:13px;font-weight:bold;">Order #${orderCode}${date ? ` &nbsp;&middot;&nbsp; ${escapeHtml(date)}` : ""}</div>
        </td></tr>
        <tr><td style="padding:0 30px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e8e4d9;border-radius:12px;background:#fffefa;">
            <tr><td colspan="2" style="padding:15px 12px 11px;color:#8b5e3c;font-size:10px;font-weight:bold;letter-spacing:1.5px;">ORDER ITEMS</td></tr>
            ${itemRows}
            <tr><td style="padding:16px 12px;color:#29451c;font-size:14px;font-weight:bold;">Estimated total</td><td align="right" style="padding:16px 12px;color:#244516;font-size:16px;font-weight:bold;white-space:nowrap;">${escapeHtml(total)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 30px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius:12px;background:#f4f2e9;">
            <tr><td colspan="2" style="padding:16px 16px 8px;color:#8b5e3c;font-size:10px;font-weight:bold;letter-spacing:1.5px;">DELIVERY &amp; PAYMENT</td></tr>
            <tr><td style="padding:5px 16px;color:#766f62;font-size:12px;">Customer</td><td align="right" style="padding:5px 16px;color:#29451c;font-size:13px;font-weight:bold;">${escapeHtml(customer.name)}</td></tr>
            <tr><td style="padding:5px 16px;color:#766f62;font-size:12px;">Email</td><td align="right" style="padding:5px 16px;color:#29451c;font-size:13px;">${escapeHtml(customer.email)}</td></tr>
            <tr><td style="padding:5px 16px;color:#766f62;font-size:12px;">Contact</td><td align="right" style="padding:5px 16px;color:#29451c;font-size:13px;">${escapeHtml(contactNumber)}</td></tr>
            <tr><td style="padding:5px 16px;color:#766f62;font-size:12px;vertical-align:top;">Address</td><td align="right" style="padding:5px 16px 8px;color:#29451c;font-size:13px;line-height:1.5;">${escapeHtml(order.address)}<br>${escapeHtml(order.country)}</td></tr>
            <tr><td style="padding:8px 16px 16px;color:#766f62;font-size:12px;">Payment method</td><td align="right" style="padding:8px 16px 16px;color:#29451c;font-size:13px;font-weight:bold;">${escapeHtml(order.paymentMethod)}</td></tr>
          </table>
          ${slipUrl ? `<p style="margin:15px 0 0;"><a href="${escapeHtml(slipUrl)}" style="display:inline-block;padding:10px 16px;border-radius:22px;background:#31551f;color:#fffdf5;font-size:13px;font-weight:bold;text-decoration:none;">View payment slip</a></p>` : ""}
          ${order.additionalNote ? `<div style="margin-top:15px;padding:13px 15px;border-left:3px solid #d4a017;background:#fbf8ef;color:#625b4f;font-size:13px;line-height:1.6;"><strong style="color:#31551f;">Additional note</strong><br>${escapeHtml(order.additionalNote)}</div>` : ""}
        </td></tr>
        <tr><td align="center" style="padding:20px 24px;border-top:1px solid #e9e5da;background:#f8f6ef;color:#81796c;font-size:11px;line-height:1.7;">
          Pure &middot; Natural &middot; Authentic Ayurvedic Heritage<br>
          <a href="https://www.rajapuraherbal.lk" style="color:#31551f;text-decoration:none;font-weight:bold;">www.rajapuraherbal.lk</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { plainText, html };
};

class SmtpResponseReader {
  constructor(socket) {
    this.socket = socket;
    this.buffer = "";
    this.waiters = [];
    socket.on("data", (chunk) => {
      this.buffer += chunk.toString("utf8");
      this.flush();
    });
    socket.on("error", (error) => this.rejectAll(error));
    socket.on("end", () => this.rejectAll(new Error("Gmail SMTP connection closed unexpectedly.")));
  }

  read() {
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject, timer: setTimeout(() => {
        this.waiters = this.waiters.filter((item) => item !== waiter);
        reject(new Error("Gmail SMTP response timed out."));
      }, 15000) };
      this.waiters.push(waiter);
      this.flush();
    });
  }

  flush() {
    while (this.waiters.length) {
      const lines = this.buffer.split(/\r?\n/);
      const endIndex = lines.findIndex((line) => /^\d{3} /.test(line));
      if (endIndex < 0) return;
      const response = lines.slice(0, endIndex + 1).join("\r\n");
      this.buffer = lines.slice(endIndex + 1).join("\r\n");
      const waiter = this.waiters.shift();
      clearTimeout(waiter.timer);
      waiter.resolve(response);
    }
  }

  rejectAll(error) {
    for (const waiter of this.waiters.splice(0)) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }
}

const expectResponse = (response, acceptedCodes, step) => {
  const code = Number(response.slice(0, 3));
  if (!acceptedCodes.includes(code)) {
    throw new Error(`Gmail SMTP ${step} failed (${code}): ${response.replace(/\r?\n/g, " ")}`);
  }
};

const encodeBase64Lines = (value) => Buffer.from(value, "utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n") ?? "";

const sendGmailMessage = async ({ user, appPassword, fromName, to, subject, plainText, html }) => {
  const host = "smtp.gmail.com";
  const socket = tls.connect({ host, port: 465, servername: host });
  const reader = new SmtpResponseReader(socket);
  try {
    await new Promise((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });
    expectResponse(await reader.read(), [220], "connection");

    const command = async (value, accepted, step) => {
      socket.write(`${value}\r\n`);
      expectResponse(await reader.read(), accepted, step);
    };
    await command("EHLO rajapura-herbal.local", [250], "EHLO");
    await command("AUTH LOGIN", [334], "authentication start");
    await command(Buffer.from(user).toString("base64"), [334], "username authentication");
    await command(Buffer.from(appPassword).toString("base64"), [235], "password authentication");
    await command(`MAIL FROM:<${user}>`, [250], "sender");
    await command(`RCPT TO:<${to}>`, [250, 251], "recipient");
    await command("DATA", [354], "message start");

    const displayName = `=?UTF-8?B?${Buffer.from(fromName).toString("base64")}?=`;
    const boundary = `Rajapura_${randomUUID().replace(/-/g, "")}`;
    const message = [
      `From: ${displayName} <${user}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${randomUUID()}@gmail.com>`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64Lines(plainText),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64Lines(html),
      `--${boundary}--`,
    ].join("\r\n").replace(/^\./gm, "..");
    socket.write(`${message}\r\n.\r\n`);
    expectResponse(await reader.read(), [250], "message delivery");
    await command("QUIT", [221], "disconnect");
  } finally {
    socket.end();
  }
};

export async function sendOrderNotifications(order, customer, contactNumber) {
  const user = process.env.GMAIL_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const fromName = process.env.GMAIL_FROM_NAME?.trim() || "Rajapura Herbal";
  const storeEmail = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (!user || !appPassword || !storeEmail) {
    return {
      sent: [],
      failures: [{ recipient: "configuration", reason: "Set GMAIL_USER, GMAIL_APP_PASSWORD, and ORDER_NOTIFICATION_EMAIL." }],
    };
  }

  const orderCode = order._id.toString().slice(-7).toUpperCase();
  const recipients = new Map([
    [customer.email.toLowerCase(), { role: "customer", email: customer.email, subject: `Rajapura order #${orderCode} received` }],
    [storeEmail.toLowerCase(), { role: "store", email: storeEmail, subject: `New Rajapura order #${orderCode}` }],
  ]);
  const results = await Promise.all([...recipients.entries()].map(async ([email, recipient]) => {
    try {
      const content = getOrderEmailContent(order, customer, contactNumber, recipient.role);
      await sendGmailMessage({ user, appPassword, fromName, to: recipient.email, subject: recipient.subject, ...content });
      return { role: recipient.role, email, success: true };
    } catch (error) {
      return { role: recipient.role, email, success: false, reason: error.message };
    }
  }));

  return {
    sent: results.filter((result) => result.success).map(({ role }) => role),
    failures: results.filter((result) => !result.success),
  };
}

export async function sendOrderStatusNotification(order, customer, changes) {
  const user = process.env.GMAIL_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const fromName = process.env.GMAIL_FROM_NAME?.trim() || "Rajapura Herbal";
  if (!user || !appPassword) {
    return { success: false, reason: "Set GMAIL_USER and GMAIL_APP_PASSWORD." };
  }
  if (!customer?.email) return { success: false, reason: "Customer email is not available." };

  const orderCode = order._id.toString().slice(-7).toUpperCase();
  const statusRows = Object.entries(changes).map(([field, change]) => {
    const label = field === "orderStatus" ? "Order status" : "Payment status";
    return `<tr><td style="padding:12px;border-bottom:1px solid #e9e5da;color:#766f62;font-size:13px;">${label}</td><td align="right" style="padding:12px;border-bottom:1px solid #e9e5da;color:#29451c;font-size:13px;font-weight:bold;">${escapeHtml(change.previous)} &rarr; ${escapeHtml(change.current)}</td></tr>`;
  }).join("");
  const statusText = Object.entries(changes).map(([field, change]) =>
    `${field === "orderStatus" ? "Order status" : "Payment status"}: ${change.previous} -> ${change.current}`);
  const subject = `Rajapura order #${orderCode} status update`;
  const plainText = [
    `Hello ${customer.name},`,
    "",
    `There is an update to your Rajapura order #${orderCode}.`,
    ...statusText,
    "",
    "View your order details in your Rajapura customer account.",
    "Pure | Natural | Authentic Ayurvedic Heritage",
    "www.rajapuraherbal.lk",
  ].join("\n");
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f1eee6;color:#35432c;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1eee6;padding:28px 12px;"><tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fffdf8;border:1px solid #e5e0d3;border-radius:18px;overflow:hidden;">
        <tr><td style="height:6px;background:#d4a017;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:24px 28px;background:#244516;color:#fffdf5;"><div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:1.5px;font-weight:bold;">RAJAPURA</div><div style="margin-top:4px;color:#d9c98f;font-size:10px;letter-spacing:2px;">HERBAL COMPANY</div></td></tr>
        <tr><td style="padding:28px;"><div style="margin-bottom:9px;color:#9a6942;font-size:11px;font-weight:bold;letter-spacing:1.8px;">ORDER UPDATE</div>
          <h1 style="margin:0;color:#244516;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:normal;line-height:1.25;">Your order status has changed</h1>
          <p style="margin:12px 0 18px;color:#71695e;font-size:14px;line-height:1.7;">Hello ${escapeHtml(customer.name)}, there is an update to your order.</p>
          <div style="display:inline-block;margin-bottom:16px;padding:9px 13px;border:1px solid #dfe4d2;border-radius:20px;background:#f2f4e9;color:#31551f;font-size:13px;font-weight:bold;">Order #${orderCode}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e8e4d9;border-radius:12px;background:#fffefa;"><tr><td colspan="2" style="padding:14px 12px 4px;color:#8b5e3c;font-size:10px;font-weight:bold;letter-spacing:1.5px;">STATUS CHANGES</td></tr>${statusRows}</table>
        </td></tr>
        <tr><td align="center" style="padding:20px 24px;border-top:1px solid #e9e5da;background:#f8f6ef;color:#81796c;font-size:11px;line-height:1.7;">Pure &middot; Natural &middot; Authentic Ayurvedic Heritage<br><a href="https://www.rajapuraherbal.lk" style="color:#31551f;text-decoration:none;font-weight:bold;">www.rajapuraherbal.lk</a></td></tr>
      </table>
    </td></tr></table></body></html>`;

  try {
    await sendGmailMessage({ user, appPassword, fromName, to: customer.email, subject, plainText, html });
    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}
