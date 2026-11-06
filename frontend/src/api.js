import { getAccessToken } from "./auth.js";

const API_URL = import.meta.env.VITE_API_URL;

async function request(method, path) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

export async function listImages() {
  const { images } = await request("GET", "images");
  return images;
}

export async function searchImages(tag) {
  const { images } = await request("GET", `images/search?tag=${encodeURIComponent(tag)}`);
  return images;
}

export function deleteImage(imageId) {
  return request("DELETE", `images/${encodeURIComponent(imageId)}`);
}

// returns the new image id; processing then continues in the background on AWS
export async function uploadImage(file) {
  const { upload_url: uploadUrl, key } = await request("POST", "upload-url");
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
  return key.split("/").pop().replace(/\.jpg$/, "");
}
