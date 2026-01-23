export interface SentimentJobData {
  projectId: string;
  userId: string;
}

export interface SentimentJobResult {
  success: boolean;
  scanId?: string;
  globalScore?: number;
  errorMessage?: string;
}
