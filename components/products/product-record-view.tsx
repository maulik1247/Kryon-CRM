"use client";

import { ProductForm } from "@/components/products/product-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes } from "@/lib/record-routes";

export function ProductRecordView({ productId }: { productId: string }) {
  const { getProductById } = useCrmData();
  const product = getProductById(productId);

  if (!product) {
    return (
      <RecordNotFound
        backHref={recordListRoutes.product}
        backLabel="products"
      />
    );
  }

  return <ProductForm productId={productId} />;
}
