export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToImage(base64) {
  return new Promise((resolve, reject) => {
    // 自动识别是否包含 Data URI 前缀
    let mime = 'image/png';
    let data = base64;

    if (base64.includes(',')) {
      const arr = base64.split(',');
      mime = arr[0].match(/:(.*?);/)[1];
      data = arr[1];
    }

    try {
      const byteString = atob(data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      resolve(new Blob([ab], { type: mime }));
    } catch (e) {
      reject(new Error('Invalid base64 string'));
    }
  });
}

export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
