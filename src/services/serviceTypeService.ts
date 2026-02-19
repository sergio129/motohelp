import { serviceTypeRepository } from "@/repositories/serviceTypeRepository";

export const serviceTypeService = {
  listActive() {
    return serviceTypeRepository.listActive();
  },
  listAll() {
    return serviceTypeRepository.listAll();
  },
  create(data: { name: string; category: string; description?: string | null }) {
    return serviceTypeRepository.create(data);
  },
  update(id: string, data: { name?: string; category?: string; description?: string | null; active?: boolean }) {
    return serviceTypeRepository.update(id, data);
  },
  remove(id: string) {
    return serviceTypeRepository.remove(id);
  },
};
