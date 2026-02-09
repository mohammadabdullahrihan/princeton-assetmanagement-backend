const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class ImgBBStorageProvider {
  constructor() {
    this.apiKey = process.env.IMGBB_API_KEY;
    if (!this.apiKey) {
      console.warn('IMGBB_API_KEY is not defined in environment variables');
    }
  }

  async upload(file) {
    if (!this.apiKey) throw new Error('ImgBB API Key not configured');

    const form = new FormData();
    
    // Handle both memory storage (buffer) and disk storage (path)
    if (file.buffer) {
      // Memory storage (Vercel/serverless)
      form.append('image', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
    } else if (file.path) {
      // Disk storage (local development)
      form.append('image', fs.createReadStream(file.path));
    } else {
      throw new Error('File has neither buffer nor path');
    }

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${this.apiKey}`, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      if (response.data && response.data.success) {
        return {
          id: response.data.data.id,
          url: response.data.data.url,
          displayUrl: response.data.data.display_url,
          deleteUrl: response.data.data.delete_url,
        };
      } else {
        throw new Error('ImgBB upload failed');
      }
    } catch (error) {
      console.error('ImgBB Upload Error:', error.response?.data || error.message);
      throw error;
    } finally {
      // Clean up local temp file only if it exists (disk storage)
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  getPublicUrl(url) {
    return url;
  }

  async delete(url) {
    // ImgBB API free version doesn't support easy deletion via API 
    // without a specific delete_url or through their web panel.
    // For now, we return true to avoid blocking the asset deletion process.
    console.log('ImgBB Delete requested for (API limit):', url);
    return true;
  }
}

module.exports = new ImgBBStorageProvider();
