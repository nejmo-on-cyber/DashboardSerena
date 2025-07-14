import { NextRequest, NextResponse } from "next/server";
import { clientOperations } from "@/lib/airtable";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const updates = await request.json();
    const updatedClient = await clientOperations.update(params.id, updates);
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 },
    );
  }
}
