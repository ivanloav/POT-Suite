import { useCallback } from 'react';
import { useDocumentScanner } from './useDocumentScanner';

interface UseAutoDocumentScannerProps {
  onDocumentFound?: (file: File, originalName: string) => void;
  onError?: (error: string) => void;
}

export const useAutoDocumentScanner = ({ 
  onDocumentFound, 
  onError 
}: UseAutoDocumentScannerProps = {}) => {
  const { getLatestScannedDocument, isSetup, supportsDirectoryAccess } = useDocumentScanner();

  const scanForDocument = useCallback(async (): Promise<File | null> => {
    // Solo intentar si está disponible y configurado
    if (!supportsDirectoryAccess || !isSetup) {
      return null;
    }

    try {
      const scannedDoc = await getLatestScannedDocument();
      console.log('Documento escaneado encontrado:', scannedDoc);
      if (scannedDoc) {
        onDocumentFound?.(scannedDoc.file, scannedDoc.originalName);
        return scannedDoc.file;
      } else {
        const message = 'No se encontraron documentos nuevos en el directorio configurado';
        onError?.(message);
        return null;
      }
    } catch (error) {
      const message = 'Error al buscar documentos automáticamente';
      console.error('Auto scan error:', error);
      onError?.(message);
      return null;
    }
  }, [getLatestScannedDocument, isSetup, supportsDirectoryAccess, onDocumentFound, onError]);

  return {
    scanForDocument,
    isAvailable: supportsDirectoryAccess && isSetup,
    isConfigured: isSetup,
    supportsFeature: supportsDirectoryAccess
  };
};