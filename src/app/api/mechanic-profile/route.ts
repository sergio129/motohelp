import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mechanicProfileSchema } from "@/lib/validations/mechanicProfile";
import { mechanicProfileService } from "@/services/mechanicProfileService";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo mecánicos" }, { status: 403 });
  }

  const profile = await mechanicProfileService.getByUserId(session.user.id);
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo mecánicos" }, { status: 403 });
  }

  const formData = await request.formData();
  const experienceYears = formData.get("experienceYears");
  const specialty = formData.get("specialty");
  const serviceTypeIdsRaw = formData.get("serviceTypeIds");
  const serviceTypeIds = serviceTypeIdsRaw ? JSON.parse(String(serviceTypeIdsRaw)) : [];
  const parsed = mechanicProfileSchema.parse({ experienceYears, specialty, serviceTypeIds });

  let documentUrl: string | undefined;
  const document = formData.get("document");
  if (document && document instanceof File) {
    if (!allowedTypes.includes(document.type)) {
      return NextResponse.json({ message: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const bytes = await document.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "mechanics");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = document.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${session.user.id}-${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);
    documentUrl = `/uploads/mechanics/${filename}`;
  }

  const profile = await mechanicProfileService.upsert({
    userId: session.user.id,
    experienceYears: parsed.experienceYears,
    specialty: parsed.specialty,
    documentUrl,
    serviceTypeIds: parsed.serviceTypeIds,
  });

  return NextResponse.json(profile);
}
