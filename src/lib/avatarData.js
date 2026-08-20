// Downscale a picked image to a small square JPEG data URL — used when a GUEST
// creator sets a photo during the brief. They have no session yet, so nothing
// can be uploaded to storage; instead we carry a compact base64 avatar in the
// setup blob and hand it to launch-contest, which uploads it to the new
// account server-side. Capping at 256px keeps the string well under localStorage
// and edge-payload limits (typically 20–40 KB).
export function fileToAvatarDataUrl(file, size = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });
}
