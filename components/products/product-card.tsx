import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatMotorPoles } from "@/lib/product-constants";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const specs = [
    { label: "Voltage", value: `${product.voltage} V` },
    { label: "Wattage", value: `${product.wattage} W` },
    { label: "Poles", value: formatMotorPoles(product.poles) },
    { label: "Sensor Type", value: product.sensorType },
    { label: "HSN Code", value: product.hsnCode },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <Badge variant="default" className="w-fit">
          {product.motorControllerType}
        </Badge>
        <CardTitle className="font-display text-xl">{product.model}</CardTitle>
        <CardDescription className="text-sm tracking-tight">
          {product.sku}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        {product.description ? (
          <p className="mb-4 text-sm text-muted-foreground">
            {product.description}
          </p>
        ) : null}
        <Table>
          <TableBody>
            {specs.map((spec) => (
              <TableRow key={spec.label}>
                <TableCell className="text-muted-foreground">
                  {spec.label}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {spec.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-4" />
        <div>
          <Label className="text-xs font-normal text-muted-foreground">
            Current Selling Price (INR)
          </Label>
          <p className="font-display text-2xl font-semibold">
            ₹{product.sellingPrice.toLocaleString("en-IN")}
          </p>
          {product.specSheet ? (
            <p className="mt-2 truncate text-xs text-muted-foreground">
              Spec: {product.specSheet.name}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
