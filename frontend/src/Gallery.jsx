import { useCallback, useEffect, useState } from "react";

import { deleteImage, listImages, searchImages, uploadImage } from "./api.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PROCESSING_POLLS = 10;
const POLL_INTERVAL_MS = 2000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Gallery({ onSignOut }) {
  const [images, setImages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState("");

  const load = useCallback(async (tag) => {
    setError("");
    try {
      setImages(tag ? await searchImages(tag) : await listImages());
      setActiveTag(tag);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setStatus("");
    }
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  function search(tag) {
    setSearchText(tag);
    load(tag.trim().toLowerCase());
  }

  // S3 triggers the processing Lambda, so the image appears a few seconds after upload
  async function waitForProcessing(imageId) {
    for (let attempt = 0; attempt < PROCESSING_POLLS; attempt++) {
      await wait(POLL_INTERVAL_MS);
      const latest = await listImages();
      if (latest.some((image) => image.image_id === imageId)) {
        return latest;
      }
    }
    throw new Error("The image is taking longer than expected. Refresh in a moment.");
  }

  async function handleUpload(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (file.type !== "image/jpeg") {
      setError("Please choose a JPEG image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Please choose an image under 10 MB.");
      return;
    }

    setError("");
    try {
      setStatus("Uploading...");
      const imageId = await uploadImage(file);
      setStatus("Tagging your image...");
      setImages(await waitForProcessing(imageId));
      setSearchText("");
      setActiveTag("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setStatus("");
    }
  }

  async function handleDelete(imageId) {
    setError("");
    try {
      await deleteImage(imageId);
      setImages((current) => current.filter((image) => image.image_id !== imageId));
    } catch (failure) {
      setError(failure.message);
    }
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Image Gallery</h1>
          <button type="button" onClick={onSignOut} className="text-sm text-slate-700 underline">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              search(searchText);
            }}
          >
            <input
              aria-label="Search by tag"
              placeholder="Search by tag, e.g. dog"
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none sm:w-64"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button
              type="submit"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100"
            >
              Search
            </button>
          </form>

          <label className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-center font-medium text-white hover:bg-slate-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-slate-900">
            Upload JPEG
            <input
              type="file"
              accept="image/jpeg"
              className="sr-only"
              onChange={handleUpload}
            />
          </label>
        </div>

        {activeTag && (
          <p className="mb-4 text-sm text-slate-700">
            Showing images tagged <strong>{activeTag}</strong>.{" "}
            <button type="button" className="underline" onClick={() => search("")}>
              Show all
            </button>
          </p>
        )}

        <div aria-live="polite">
          {status && <p className="mb-4 text-sm text-slate-700">{status}</p>}
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {images.length === 0 && !status && !error && (
          <p className="py-16 text-center text-slate-600">
            {activeTag ? "No images with this tag." : "No images yet. Upload your first one."}
          </p>
        )}

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <li
              key={image.image_id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <img
                src={image.thumbnail_url}
                alt={image.tags?.join(", ") || "Uploaded image"}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-2 p-3">
                {image.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {image.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => search(tag)}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(image.image_id)}
                  className="text-xs text-red-700 underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
