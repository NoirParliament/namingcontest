// Reusable file upload to the shared public "uploads" bucket.
//
// Files are stored under the signed-in user's own folder (RLS-enforced),
// namespaced by `folder` — "avatar" now, "logos" for report branding later.
// Returns the file's public URL, ready to drop into <img>, an email, or a PDF.
import { supabase } from './supabaseClient';

const BUCKET = 'uploads';

export async function uploadUserFile({ file, folder }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to upload.');

  const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
  // Timestamped filename → the returned URL is always fresh (no stale cache).
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
