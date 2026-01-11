/**
 * AI_Step_Result 모델
 */
export type StepType = 'PLAN' | 'STRUCTURE' | 'DRAFT' | 'QUALITY' | 'PLATFORM';
export type StepStatus = 'success' | 'retry' | 'failed';

export interface AIStepResult {
  id: string;
  project_id: string;
  step_type: StepType;
  input_data: any; // JSON
  output_data: any; // JSON
  status: StepStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAIStepResultInput {
  project_id: string;
  step_type: StepType;
  input_data: any;
  output_data?: any;
  status?: StepStatus;
}

export interface UpdateAIStepResultInput {
  output_data?: any;
  status?: StepStatus;
}

