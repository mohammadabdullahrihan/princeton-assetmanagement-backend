const QRCode = require('qrcode');

const generateQRCode = async (data, options) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const qrOptions = { ...defaultOptions, ...options };

    const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

const generateQRCodeBuffer = async (data, options) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
    };

    const qrOptions = { ...defaultOptions, ...options };

    const buffer = await QRCode.toBuffer(data, qrOptions);
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

const generateAssetQRData = (assetId, assetName) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return JSON.stringify({
    assetId,
    assetName,
    url: `${baseUrl}/assets/${assetId}`,
    timestamp: new Date().toISOString(),
  });
};

const generateBarcode = (data) => {
  return data;
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
  generateAssetQRData,
  generateBarcode,
};
