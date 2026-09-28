import { z } from "zod";

export const createClaimSchema = z.object({
  policyId: z.string().min(1, "Policy is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  incidentLocation: z.string().min(3, "Location is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});
export type CreateClaimFormData = z.infer<typeof createClaimSchema>;
