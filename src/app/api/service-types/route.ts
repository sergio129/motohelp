import { NextResponse } from "next/server";
import { serviceTypeService } from "@/services/serviceTypeService";

export async function GET() {
  const types = await serviceTypeService.listActive();
  return NextResponse.json(types);
}
