import { DetailGrid } from "@/components/shared/detail-grid";
import { formatMotorPoles } from "@/lib/product-constants";
import type { Product } from "@/lib/types";

export function ProductExpandedDetails({ product }: { product: Product }) {
  return (
    <DetailGrid
      items={[
        { label: "ID", value: product.id, mono: true },
        { label: "Motor / Controller Type", value: product.motorControllerType },
        { label: "SKU / Part Number", value: product.sku, mono: true },
        { label: "Voltage", value: `${product.voltage} V` },
        { label: "Wattage", value: `${product.wattage} W` },
        { label: "Poles", value: formatMotorPoles(product.poles) },
        { label: "Sensor Type", value: product.sensorType },
        { label: "HSN Code", value: product.hsnCode, mono: true },
        {
          label: "Selling Price (INR)",
          value: `₹${product.sellingPrice.toLocaleString("en-IN")}`,
          emphasis: true,
        },
        {
          label: "Description",
          value: product.description,
          className: "col-span-2",
        },
        {
          label: "Spec Sheet",
          value: product.specSheet?.name,
          className: "col-span-2",
        },
      ]}
    />
  );
}
