import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import claimsService from "../../services/claims.service";
import documentsService from "../../services/documents.service";
import type { Claim } from "../../types/claim";
import type { Document } from "../../types/document";

interface DocumentRow extends Document {
  claimNumber: string;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentRow | null>(
    null,
  );
  const [deleteDocument, setDeleteDocument] = useState<DocumentRow | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const {
    data: claims,
    isLoading: claimsLoading,
    isError: claimsError,
  } = useQuery({
    queryKey: ["claims"],
    queryFn: () => claimsService.getClaims(),
  });

  const {
    data: documentsByClaim,
    isLoading: documentsLoading,
    isError: documentsError,
  } = useQuery({
    queryKey: ["all-documents", claims?.map((claim) => claim.id)],
    queryFn: async () => {
      const accessibleClaims = claims ?? [];
      const results = await Promise.all(
        accessibleClaims.map(async (claim) => {
          const documents = await documentsService.getDocuments(claim.id);
          return documents.map((document) => ({
            ...document,
            claimNumber: claim.claimNumber,
          }));
        }),
      );
      return results.flat();
    },
    enabled: !!claims,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClaimId || !selectedFile) {
        throw new Error("Claim and document are required");
      }
      return documentsService.uploadDocument(selectedClaimId, selectedFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-documents"] });
      queryClient.invalidateQueries({
        queryKey: ["documents", selectedClaimId],
      });
      setUploadOpen(false);
      setSelectedClaimId("");
      setSelectedFile(null);
      setUploadError("");
      setSuccessMessage("Document uploaded successfully.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to upload document.";

      setUploadError(Array.isArray(message) ? message.join(", ") : message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-documents"] });
      setDeleteDocument(null);
      setSuccessMessage("Document deleted successfully.");
    },
  });

  const rows = useMemo<DocumentRow[]>(() => {
    return documentsByClaim ?? [];
  }, [documentsByClaim]);

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handlePreview = async (document: DocumentRow) => {
    try {
      const blob = await documentsService.getDocumentBlob(document.id);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewDocument(document);
      setPreviewOpen(true);
    } catch {
      setSuccessMessage("Unable to preview document.");
    }
  };

  const handleDownload = async (document: DocumentRow) => {
    try {
      const blob = await documentsService.getDocumentBlob(document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setSuccessMessage("Unable to download document.");
    }
  };

  const columns: GridColDef<DocumentRow>[] = [
    {
      field: "claimNumber",
      headerName: "Claim Number",
      flex: 1.2,
    },
    {
      field: "originalName",
      headerName: "File Name",
      flex: 2,
    },
    {
      field: "mimeType",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "fileSize",
      headerName: "Size",
      flex: 0.8,
      valueFormatter: (value) => formatFileSize(value),
    },
    {
      field: "uploadedAt",
      headerName: "Uploaded",
      flex: 1,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => handlePreview(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => handleDownload(params.row)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDocument(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (claimsLoading || documentsLoading) {
    return <CircularProgress />;
  }

  if (claimsError || documentsError) {
    return <Alert severity="error">Unable to load documents.</Alert>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">Documents</Typography>
          <Typography color="text.secondary">
            Manage documents associated with insurance claims.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => setUploadOpen(true)}
        >
          Upload Document
        </Button>
      </Box>

      <Box sx={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  No documents uploaded yet.
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>

      <Dialog
        open={uploadOpen}
        onClose={() => {
          if (!uploadMutation.isPending) {
            setUploadOpen(false);
            setSelectedClaimId("");
            setSelectedFile(null);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="document-claim-label">Claim</InputLabel>
              <Select
                labelId="document-claim-label"
                value={selectedClaimId}
                label="Claim"
                onChange={(event) => setSelectedClaimId(event.target.value)}
                disabled={uploadMutation.isPending}
              >
                {(claims ?? []).map((claim: Claim) => (
                  <MenuItem key={claim.id} value={claim.id}>
                    {claim.claimNumber} - {claim.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              disabled={uploadMutation.isPending}
            >
              {selectedFile ? selectedFile.name : "Choose PDF, JPEG or PNG"}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null);
                }}
              />
            </Button>

            {uploadError && <Alert severity="error">{uploadError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUploadOpen(false)}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => uploadMutation.mutate()}
            disabled={
              !selectedClaimId || !selectedFile || uploadMutation.isPending
            }
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(null);
          setPreviewDocument(null);
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>{previewDocument?.originalName}</DialogTitle>
        <DialogContent>
          {previewDocument?.mimeType === "application/pdf" ? (
            <iframe
              src={previewUrl ?? ""}
              title={previewDocument.originalName}
              style={{
                width: "100%",
                height: "70vh",
                border: 0,
              }}
            />
          ) : (
            <Box
              component="img"
              src={previewUrl ?? ""}
              alt={previewDocument?.originalName}
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "70vh",
                mx: "auto",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteDocument}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteDocument(null);
          }
        }}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteDocument?.originalName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDocument(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteDocument && deleteMutation.mutate(deleteDocument.id)
            }
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={2500}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Box>
  );
}
