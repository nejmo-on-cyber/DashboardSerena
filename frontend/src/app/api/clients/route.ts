import { NextRequest, NextResponse } from "next/server";
import { clientOperations } from "@/lib/airtable";

export async function GET() {
  try {
    const clients = await clientOperations.getAll();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientData = await request.json();
    const newClient = await clientOperations.create(clientData);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 },
    );
  }
}
