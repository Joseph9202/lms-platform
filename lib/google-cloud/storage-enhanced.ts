import { Storage } from '@google-cloud/storage';

// Configuración alternativa usando credenciales en variables de entorno
const getStorageConfig = () => {
  // Opción 1: Usar archivo de credenciales (desarrollo)
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    return {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    };
  }

  // Opción 2: Usar credenciales en variables de entorno (producción)
  if (process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64, 'base64').toString()
    );
    
    return {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials,
    };
  }

  // Opción 3: Para ambientes que usan autenticación por defecto (Google Cloud Run, etc.)
  return {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  };
};

// Inicializar cliente de Storage
const storage = new Storage(getStorageConfig());

// Nombre del bucket
const BUCKET_NAME = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'lms-videos-bucket';

export const bucket = storage.bucket(BUCKET_NAME);

// Función mejorada para subir video con mejor manejo de errores
export async function uploadVideoToGCS(
  file: Buffer, 
  fileName: string,
  options: {
    isPublic?: boolean;
    metadata?: Record<string, string>;
  } = {}
): Promise<string> {
  try {
    const { isPublic = true, metadata = {} } = options;
    
    // Validar que el bucket existe
    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
      throw new Error(`Bucket ${BUCKET_NAME} does not exist`);
    }

    const fileUpload = bucket.file(`videos/${fileName}`);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000', // Cache por 1 año
        metadata: {
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      },
      public: isPublic,
      resumable: false, // Para archivos < 10MB
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Error uploading video to GCS:', error);
        reject(new Error(`Upload failed: ${error.message}`));
      });

      stream.on('finish', async () => {
        try {
          if (isPublic) {
            // Hacer el archivo público
            await fileUpload.makePublic();
          }
          
          // URL pública del video
          const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/videos/${fileName}`;
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      stream.end(file);
    });
  } catch (error) {
    console.error('Error in uploadVideoToGCS:', error);
    throw error;
  }
}

// Función para obtener URL firmada para videos privados
export async function getSignedVideoUrl(
  fileName: string, 
  expirationHours: number = 1
): Promise<string> {
  try {
    const options = {
      version: 'v4' as const,
      action: 'read' as const,
      expires: Date.now() + expirationHours * 60 * 60 * 1000,
    };

    const [url] = await bucket.file(`videos/${fileName}`).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

// Función para eliminar video
export async function deleteVideoFromGCS(fileName: string): Promise<void> {
  try {
    await bucket.file(`videos/${fileName}`).delete();
    console.log(`Video ${fileName} deleted successfully from GCS`);
  } catch (error) {
    console.error('Error deleting video from GCS:', error);
    throw error;
  }
}

// Función para verificar si un video existe
export async function videoExistsInGCS(fileName: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(`videos/${fileName}`).exists();
    return exists;
  } catch (error) {
    console.error('Error checking video existence in GCS:', error);
    return false;
  }
}

// Función para obtener metadatos del video
export async function getVideoMetadataFromGCS(fileName: string) {
  try {
    const [metadata] = await bucket.file(`videos/${fileName}`).getMetadata();
    return {
      size: metadata.size,
      contentType: metadata.contentType,
      created: metadata.timeCreated,
      updated: metadata.updated,
      etag: metadata.etag,
    };
  } catch (error) {
    console.error('Error getting video metadata from GCS:', error);
    throw error;
  }
}

// Función para listar todos los videos
export async function listVideosFromGCS(prefix: string = 'videos/') {
  try {
    const [files] = await bucket.getFiles({ prefix });
    
    return files.map(file => ({
      name: file.name,
      publicUrl: `https://storage.googleapis.com/${BUCKET_NAME}/${file.name}`,
      metadata: file.metadata,
    }));
  } catch (error) {
    console.error('Error listing videos from GCS:', error);
    throw error;
  }
}