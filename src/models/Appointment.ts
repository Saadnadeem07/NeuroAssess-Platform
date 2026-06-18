import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  psychiatrist: Types.ObjectId;
  date: Date;
  timeSlot: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  patientName: string;
  psychiatristName: string;
  patientEmail: string;
  psychiatristEmail: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    psychiatrist: { type: Schema.Types.ObjectId, ref: "Psychiatrist", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    notes: { type: String, default: "" },
    patientName: { type: String, required: true },
    psychiatristName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    psychiatristEmail: { type: String, required: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ psychiatrist: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment =
  (mongoose.models.Appointment as Model<IAppointment>) ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
