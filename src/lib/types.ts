/** Shared client-side shapes for API entities. */

export interface PsychiatristPublic {
  _id: string;
  name: string;
  expertise: string;
  bio: string;
  specializations: string[];
  education: string[];
  years_of_experience: number;
  degrees: string;
  gender?: string;
  availability: { startTime: string; endTime: string; workingDays: string[] };
  isApproved: boolean;
}

export interface Appointment {
  _id: string;
  patient: string;
  psychiatrist: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "completed" | "cancelled";
  patientName: string;
  psychiatristName: string;
  patientEmail: string;
  psychiatristEmail: string;
}

export interface ReportEntity {
  _id: string;
  report_name: string;
  report_type: "testing" | "learning-plan" | "learning-plan-completed";
  user_id: string;
  report_data: Record<string, unknown>;
  created_at: string;
}

export interface LearningPlanEntity {
  _id: string;
  user_id: string;
  module_number: 1 | 2;
  learning_plan_paragraph: string;
  report_id: string;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partnerModel: string;
  partnerName: string;
  partnerRole: "patient" | "psychiatrist";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface MessageEntity {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  isRead: boolean;
  senderName: string;
  senderRole: "patient" | "psychiatrist";
  createdAt: string;
}

export interface RosterPatient {
  _id: string;
  name: string;
  email: string;
  appointmentCount: number;
  lastAppointment: string;
  nextAppointment: string | null;
  status: string;
}
