import { useState, useCallback } from 'react';

interface ScannedDocument {
  file: File;
  originalName: string;
  newName: string;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }
  interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>;
  }
}

export const useDocumentScanner = () => {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Derivar isSetup directamente de localStorage en cada render
  const isSetup = localStorage.getItem('scanDirectorySetup') === 'true' &&
                  localStorage.getItem('scanDirectoryName') &&
                  localStorage.getItem('scanDirectoryName') !== 'No configurado';

  // Configurar directorio de escaneo una sola vez (showDirectoryPicker solo funciona con HTTPS o localhost)
  const setupScanDirectory = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Tu navegador no soporta acceso automático a directorios. Usa Chrome o Edge.');
      return false;
    }

    try {
      const handle = await window.showDirectoryPicker!();
      setDirectoryHandle(handle);
  // isSetup ahora se deriva de localStorage, no de estado
      localStorage.setItem('scanDirectorySetup', 'true');
      localStorage.setItem('scanDirectoryName', handle.name);
      return true;
    } catch (error) {
      console.error('Error configurando directorio:', error);
      return false;
    }
  }, []);

  // Buscar el documento más reciente en el directorio (sin referencia de pedido)
  const getLatestScannedDocument = useCallback(async (): Promise<ScannedDocument | null> => {
    //console.log('Buscando en directorio:', directoryHandle);
    if (!directoryHandle) return null;

    try {
      let latestFile: File | null = null;
      let latestTime = 0;
      let latestName = '';

      for await (const [name, fileHandle] of directoryHandle.entries()) {
        if (fileHandle.kind === 'file') {
          const file = await (fileHandle as FileSystemFileHandle).getFile();
          
          // Solo archivos de imagen o PDF
          if (file.type.includes('image') || file.type.includes('pdf')) {
            if (file.lastModified > latestTime) {
              latestFile = file;
              latestTime = file.lastModified;
              latestName = name;
            }
          }
        }
      }

      if (latestFile) {
        const extension = latestName.split('.').pop();
        // Usar timestamp temporal, será renombrado en el backend con la referencia real
        const tempName = `temp_${Date.now()}.${extension}`;
        
        // Crear nuevo File con nombre temporal
        const renamedFile = new File([latestFile], tempName, { type: latestFile.type });
        
        return {
          file: renamedFile,
          originalName: latestName,
          newName: tempName
        };
      }

      return null;
    } catch (error) {
      console.error('Error accediendo al directorio:', error);
      return null;
    }
  }, [directoryHandle]);

  // Procesar archivo manualmente (drag & drop o input)
  const processManualFile = useCallback((file: File, orderReference: string): ScannedDocument => {
    const extension = file.name.split('.').pop();
    const newName = `${orderReference}_${Date.now()}.${extension}`;
    
    const renamedFile = new File([file], newName, { type: file.type });
    
    return {
      file: renamedFile,
      originalName: file.name,
      newName
    };
  }, []);

  return {
    setupScanDirectory,
    getLatestScannedDocument,
    processManualFile,
    directoryHandle,
  isSetup,
    supportsDirectoryAccess: 'showDirectoryPicker' in window
  };
};