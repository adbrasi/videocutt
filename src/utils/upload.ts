export async function uploadVideoToServer(file: File): Promise<{
  id: string;
  name: string;
  serverPath: string;
  thumbnail: string;
  duration: number;
  fps: number;
  resolution: { width: number; height: number };
}> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Map server response to expected format
  return {
    ...result,
    serverPath: result.path, // Map 'path' to 'serverPath'
  };
}