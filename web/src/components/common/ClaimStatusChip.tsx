import { Chip } from "@mui/material";

interface ClaimStatusChipProps {
  status: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "info"
      | "warning";
  }
> = {
  SUBMITTED: {
    label: "Submitted",
    color: "info",
  },
  CASE_ASSIGNED: {
    label: "Case Assigned",
    color: "primary",
  },
  SURVEY_PENDING: {
    label: "Survey Pending",
    color: "warning",
  },
  SURVEY_COMPLETED: {
    label: "Survey Completed",
    color: "info",
  },
  ADJUDICATION_PENDING: {
    label: "Adjudication Pending",
    color: "warning",
  },
  APPROVED: {
    label: "Approved",
    color: "success",
  },
  REJECTED: {
    label: "Rejected",
    color: "error",
  },
  REPAIR_IN_PROGRESS: {
    label: "Repair In Progress",
    color: "primary",
  },
  REPAIR_COMPLETED: {
    label: "Repair Completed",
    color: "info",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    color: "warning",
  },
  CLOSED: {
    label: "Closed",
    color: "success",
  },
};

export default function ClaimStatusChip({ status }: ClaimStatusChipProps) {
  const config = statusConfig[status] || {
    label: status,
    color: "default" as const,
  };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
    />
  );
}
