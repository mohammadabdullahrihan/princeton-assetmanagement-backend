const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveStorageProvider {
  constructor() {
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const keyPath = process.env.GOOGLE_DRIVE_KEY_PATH || path.join(process.cwd(), 'google-drive-key.json');

    if (fs.existsSync(keyPath)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      this.drive = google.drive({ version: 'v3', auth });
      console.log('Google Drive Provider Initialized');
    } else {
      console.warn('Google Drive Key file not found at:', keyPath);
    }
  }

  async upload(file) {
    if (!this.drive) throw new Error('Google Drive not initialized');

    const fileMetadata = {
      name: file.filename,
      parents: [this.folderId],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    try {
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      // Set permission to public view
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return {
        id: response.data.id,
        url: this.getPublicUrl(response.data.id), 
        webViewLink: response.data.webViewLink
      };
    } catch (error) {
      console.error('Google Drive Upload Error:', error);
      throw error;
    } finally {
      // Clean up local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  getPublicUrl(id) {
    // Return a direct link structure for previewing
    return `https://docs.google.com/uc?export=view&id=${id}`;
  }

  async delete(fileId) {
    if (!this.drive) return false;
    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Google Drive Delete Error:', error);
      return false;
    }
  }
}

module.exports = new GoogleDriveStorageProvider();
