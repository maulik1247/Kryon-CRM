"use client";

import { useRouter } from "next/navigation";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";

export function useRecordNavigation() {
  const router = useRouter();

  return {
    goToCustomer: (id: string) => router.push(recordRoutes.customer(id)),
    goToContact: (id: string) => router.push(recordRoutes.contact(id)),
    goToProduct: (id: string) => router.push(recordRoutes.product(id)),
    goToSupplier: (id: string) => router.push(recordRoutes.supplier(id)),
    goToDocument: (id: string) => router.push(recordRoutes.document(id)),
    goToDeal: (id: string) => router.push(recordRoutes.deal(id)),
    goToTask: (id: string) => router.push(recordRoutes.task(id)),
    goToActivity: (id: string) => router.push(recordRoutes.activity(id)),
    goToNewContact: () => router.push(recordNewRoutes.contact),
    goToNewProduct: () => router.push(recordNewRoutes.product),
    goToNewSupplier: () => router.push(recordNewRoutes.supplier),
    goToNewDocument: () => router.push(recordNewRoutes.document),
    goToNewTask: () => router.push(recordNewRoutes.task),
    goToNewActivity: () => router.push(recordNewRoutes.activity),
  };
}
