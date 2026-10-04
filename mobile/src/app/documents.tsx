import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  ClaimDocument,
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "@/services/documents";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsScreen() {
  const { claimId } = useLocalSearchParams<{ claimId?: string }>();
  const { token } = useAuth();

  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!claimId || !token) {
      setError("Claim information is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getDocuments(claimId, token);
      setDocuments(result);
    } catch (err: any) {
      setError(err?.message ?? "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, [claimId, token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleUpload() {
    if (!claimId || !token) return;

    try {
      setError("");

      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      if (asset.size && asset.size > MAX_FILE_SIZE) {
        setError("File is too large. Maximum size is 10 MB.");
        return;
      }

      const mimeType = asset.mimeType ?? "application/octet-stream";

      if (!ALLOWED_TYPES.includes(mimeType)) {
        setError("Only PDF, JPEG and PNG files are allowed.");
        return;
      }

      setUploading(true);

      await uploadDocument(
        claimId,
        {
          uri: asset.uri,
          name: asset.name,
          mimeType,
        },
        token,
      );

      await loadDocuments();
    } catch (err: any) {
      setError(err?.message ?? "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(document: ClaimDocument) {
    Alert.alert("Delete Document", `Delete "${document.originalName}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!token) return;

          try {
            setError("");

            await deleteDocument(document.id, token);

            setDocuments((current) =>
              current.filter((item) => item.id !== document.id),
            );
          } catch (err: any) {
            setError(err?.message ?? "Unable to delete document.");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Claim Documents</Text>

      <Text style={styles.subtitle}>
        Upload supporting documents for this claim.
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Accepted files</Text>

        <Text style={styles.infoText}>PDF, JPEG and PNG</Text>

        <Text style={styles.infoText}>Maximum size: 10 MB</Text>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.primaryButton, uploading && styles.disabledButton]}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Upload Document</Text>
        )}
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Uploaded Documents</Text>

        <Pressable onPress={loadDocuments}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {documents.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No documents uploaded</Text>

          <Text style={styles.emptyText}>
            Upload photos, PDFs or other supporting documents for the claim.
          </Text>
        </View>
      ) : (
        documents.map((document) => (
          <View key={document.id} style={styles.documentCard}>
            <Text style={styles.documentName}>{document.originalName}</Text>

            <Text style={styles.documentMeta}>{document.mimeType}</Text>

            <Text style={styles.documentMeta}>
              {formatFileSize(document.fileSize)}
            </Text>

            <Text style={styles.documentMeta}>
              Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
            </Text>

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDelete(document)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        ))
      )}

      <Pressable
        style={styles.backButton}
        onPress={() =>
          router.replace({
            pathname: "/claims/[id]",
            params: { id: claimId ?? "" },
          })
        }
      >
        <Text style={styles.backButtonText}>Back to Claim</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  errorCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#ffebee",
    marginBottom: 12,
  },
  error: {
    color: "#c62828",
  },
  primaryButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  refreshText: {
    fontSize: 14,
    fontWeight: "600",
  },
  documentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  documentMeta: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c62828",
  },
  deleteButtonText: {
    color: "#c62828",
    fontWeight: "600",
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
