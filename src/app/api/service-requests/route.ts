import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServiceRequestSchema } from "@/lib/validations/serviceRequest";
import { serviceRequestService } from "@/services/serviceRequestService";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get("scope");

  if (session.user.role === "MECHANIC") {
    if (scope === "assigned") {
      const requests = await serviceRequestService.listAssignedToMechanic(session.user.id);
      return NextResponse.json(requests);
    }

    const requests = await serviceRequestService.listAvailable();
    return NextResponse.json(requests);
  }

  if (session.user.role === "ADMIN") {
    const requests = await serviceRequestService.listAll();
    return NextResponse.json(requests);
  }

  const requests = await serviceRequestService.listByClient(session.user.id);
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ message: "Solo clientes pueden crear solicitudes" }, { status: 403 });
  }

  const payload = await request.json();
  const data = createServiceRequestSchema.parse(payload);
  const created = await serviceRequestService.create({
    clientId: session.user.id,
    type: data.type,
    description: data.description,
    address: data.address,
    scheduledAt: data.scheduledAt,
    price: data.price,
  });

  return NextResponse.json(created, { status: 201 });
}
