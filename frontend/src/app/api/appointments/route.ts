import { NextRequest, NextResponse } from "next/server";
import { appointmentOperations } from "@/lib/airtable";

export async function GET() {
  try {
    const appointments = await appointmentOperations.getAll();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    const newAppointment = await appointmentOperations.create(appointmentData);
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
