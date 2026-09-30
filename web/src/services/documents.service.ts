import api from "../api/axios";
import type { Document } from "../types/document";

const getDocuments = async (claimId: string): Promise<Document[]> => {
  const response = await api.get<Document[]>(`/documents/claim/${claimId}`);
  return response.data;
};

const uploadDocument = async (
  claimId: string,
  file: File,
): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<Document>(
    `/documents/upload/${claimId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

const getDocumentBlob = async (id: string): Promise<Blob> => {
  const response = await api.get(`/documents/${id}`, {
    responseType: "blob",
  });
  return response.data;
};

const deleteDocument = async (id: string): Promise<Document> => {
  const response = await api.delete<Document>(`/documents/${id}`);
  return response.data;
};

export default {
  getDocuments,
  uploadDocument,
  getDocumentBlob,
  deleteDocument,
};
