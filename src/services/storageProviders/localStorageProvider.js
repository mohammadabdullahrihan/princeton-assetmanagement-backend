const fs = require('fs');
const path = require('path');

class LocalStorageProvider {
  constructor() {
    this.uploadDir = 'uploads/';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getPublicUrl(filename) {
    return `/uploads/${filename}`;
  }

  async delete(filePath) {
    // filePath is expected to be like 'uploads/filename.ext'
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }
}

module.exports = new LocalStorageProvider();
