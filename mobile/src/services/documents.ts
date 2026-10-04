import { apiRequest } from "./api";

export interface ClaimDocument {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedAt: string;
  claimId: string;
}

export async function getDocuments(
  claimId: string,
  token: string,
): Promise<ClaimDocument[]> {
  return apiRequest<ClaimDocument[]>(`/documents/claim/${claimId}`, {}, token);
}

export async function uploadDocument(
  claimId: string,
  file: {
    uri: string;
    name: string;
    mimeType: string;
  },
  token: string,
): Promise<ClaimDocument> {
  const formData = new FormData();

  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as any);

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/documents/upload/${claimId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const text = await response.text();

  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof data.message === "string"
        ? data.message
        : "Unable to upload document";

    throw new Error(message);
  }

  return data as ClaimDocument;
}

export async function deleteDocument(
  id: string,
  token: string,
): Promise<ClaimDocument> {
  return apiRequest<ClaimDocument>(
    `/documents/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
}
