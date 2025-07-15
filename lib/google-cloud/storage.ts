import { Storage } from '@google-cloud/storage';

// Configuración de Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // Ruta al archivo de credenciales JSON
});

// Nombre del bucket para videos
const BUCKET_NAME = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'lms-videos-bucket';

export const bucket = storage.bucket(BUCKET_NAME);

// Función para subir video
export async function uploadVideo(file: Buffer, fileName: string): Promise<string> {
  try {
    const fileUpload = bucket.file(`videos/${fileName}`);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000', // Cache por 1 año
      },
      public: true, // Hacer el archivo público
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Error uploading video:', error);
        reject(error);
      });

      stream.on('finish', () => {
        // URL pública del video
        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/videos/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(file);
    });
  } catch (error) {
    console.error('Error in uploadVideo:', error);
    throw error;
  }
}

// Función para eliminar video
export async function deleteVideo(fileName: string): Promise<void> {
  try {
    await bucket.file(`videos/${fileName}`).delete();
    console.log(`Video ${fileName} deleted successfully`);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

// Función para obtener URL firmada (para videos privados)
export async function getSignedUrl(fileName: string, expirationMinutes: number = 60): Promise<string> {
  try {
    const options = {
      version: 'v4' as const,
      action: 'read' as const,
      expires: Date.now() + expirationMinutes * 60 * 1000, // Expira en X minutos
    };

    const [url] = await bucket.file(`videos/${fileName}`).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

// Función para verificar si un video existe
export async function videoExists(fileName: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(`videos/${fileName}`).exists();
    return exists;
  } catch (error) {
    console.error('Error checking video existence:', error);
    return false;
  }
}

// Función para obtener metadatos del video
export async function getVideoMetadata(fileName: string) {
  try {
    const [metadata] = await bucket.file(`videos/${fileName}`).getMetadata();
    return {
      size: metadata.size,
      contentType: metadata.contentType,
      created: metadata.timeCreated,
      updated: metadata.updated,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    throw error;
  }
}