import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import documentsService from "../../services/documents.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

interface ClaimDocumentsProps {
  claimId: string;
}

export default function ClaimDocuments({ claimId }: ClaimDocumentsProps) {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<any | null>(null);
  const [deleteDocument, setDeleteDocument] = useState<any | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    data: documents,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["documents", claimId],
    queryFn: () => documentsService.getDocuments(claimId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsService.uploadDocument(claimId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", claimId] });
    },
  });

  const uploadErrorMessage = (() => {
    const error = uploadMutation.error as any;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to upload document.";
    return Array.isArray(message) ? message.join(", ") : message;
  })();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", claimId] });
      setDeleteDocument(null);
      setSnackbarOpen(true);
    },
  });

  const handleUpload = (file: File) => {
    uploadMutation.reset();
    uploadMutation.mutate(file);
  };

  const handlePreview = async (document: any) => {
    const blob = await documentsService.getDocumentBlob(document.id);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setPreviewDocument(document);
  };

  const handleDelete = (document: any) => {
    setDeleteDocument(document);
  };

  const handleDownload = async (doc: any) => {
    try {
      const blob = await documentsService.getDocumentBlob(doc.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = doc.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (isLoading) {
    return <Paper sx={{ p: 3 }}>Loading documents...</Paper>;
  }

  if (isError) {
    return <Paper sx={{ p: 3 }}>Unable to load documents.</Paper>;
  }

  if (!documents?.length) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Documents</Typography>
          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
            <input
              type="file"
              hidden
              id="document-upload"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleUpload(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
          </Button>
        </Box>

        {uploadMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {uploadErrorMessage}
          </Alert>
        )}

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No documents uploaded yet.
        </Typography>
      </Paper>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "originalName",
      headerName: "File Name",
      flex: 2,
    },
    {
      field: "fileSize",
      headerName: "Size",
      flex: 1,
      valueFormatter: (value: number) => {
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
      },
    },
    {
      field: "mimeType",
      headerName: "Type",
      flex: 1,
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
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => handlePreview(params.row)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => handleDownload(params.row)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Documents
          </Typography>

          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
            <input
              type="file"
              hidden
              id="document-upload"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleUpload(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
          </Button>
        </Box>

        {uploadMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadErrorMessage}
          </Alert>
        )}

        <Box sx={{ height: 300 }}>
          <DataGrid
            rows={documents ?? []}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog
        open={!!previewDocument}
        maxWidth="lg"
        fullWidth
        onClose={() => setPreviewDocument(null)}
      >
        <DialogTitle>{previewDocument?.originalName}</DialogTitle>
        <DialogContent>
          {previewDocument && (
            <img
              src={previewUrl ?? ""}
              alt={previewDocument.originalName}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDocument} onClose={() => setDeleteDocument(null)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete
            <strong> {deleteDocument?.originalName}</strong>?
          </Typography>
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button onClick={() => setDeleteDocument(null)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => deleteMutation.mutate(deleteDocument.id)}
            >
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
        >
          Document deleted successfully.
        </Alert>
      </Snackbar>
    </>
  );
}
