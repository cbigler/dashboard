import { asyncSleep } from '@density/lib-common-helpers';
import core from '../../client/core';
import { fetchObject } from '../fetch-all-objects';

// Convert a file or blob to a data URL
export async function fileToDataURI(file: File | Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => { resolve(reader.result as string); }; 
  });
}

// Upload media using a signed S3 upload link, and poll until done
export default async function uploadMedia(path: string, file: File, quantity=1, retries=10) {
  
  // Request a new signed S3 link
  let request;
  try {
    request = await core().post(path, {'content_type': file.type, 'file_name': file.name});
  } catch (e) {
    return e;
  }
  const { upload_id, upload_url } = request.data;

  // PUT the data to S3 directly
  await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });

  // Poll `retries` times (default 10) until at least `quantity` uploads are done (default 1)
  let status: any = null;
  for (let i = 0; i < retries; i++) {
    await asyncSleep(1000);
    status = await fetchObject(`/uploads/${upload_id}`, { cache: false });
    if (status.media.length >= quantity) { break; }
  }

  // Return the upload status with any attached media
  return status;
}
