const sharp = require('sharp');
const fs = require('fs');

// First create a square PNG
sharp('icon.png')
  .resize(256, 256, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .toFile('icon-square.png')
  .then(() => console.log('Square PNG created'))
  .catch(err => console.error('Error creating square PNG:', err));
