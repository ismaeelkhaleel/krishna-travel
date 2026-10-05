import dotenv from 'dotenv';
dotenv.config();

export const ipAllowlist = (req, res, next) => {
  const allowedIp1 = process.env.ALLOWED_IP_1;
  const allowedIp2 = process.env.ALLOWED_IP_2;
  
  // Express handles X-Forwarded-For securely when 'trust proxy' is configured.
  // req.ip will contain the actual client IP.
  let clientIp = req.ip;

  // Handle IPv4 mapped as IPv6
  if (clientIp && clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.replace('::ffff:', '');
  }
  
  // Allowlist array
  const allowedIps = [];
  if (allowedIp1) allowedIps.push(allowedIp1);
  if (allowedIp2) allowedIps.push(allowedIp2);

  if (allowedIps.includes(clientIp)) {
    next();
  } else {
    // Console log for debugging, but you might want to remove this in pure production
    console.warn(`Unauthorized IP access attempt: ${clientIp}`);
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};
