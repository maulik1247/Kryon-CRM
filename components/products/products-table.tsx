"use client";

import * as React from "react";
import { Plus, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { TableActions } from "@/components/shared/table-actions";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { ProductSheet } from "./product-sheet";
import { ProductsMobileList } from "./products-mobile-list";
import { useCrmData } from "@/lib/crm-data-provider";
import type { Product } from "@/lib/types";

export function ProductsTable() {
  const { products, deleteProduct } = useCrmData();
  const [sheetProduct, setSheetProduct] = React.useState<Product | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [deleteProductRecord, setDeleteProductRecord] =
    React.useState<Product | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const openSheet = (product: Product | null) => {
    setSheetProduct(product);
    setSheetOpen(true);
  };

  const openSheetById = React.useCallback(
    (id: string) => {
      const product = products.find((entry) => entry.id === id);
      if (product) openSheet(product);
    },
    [products]
  );

  const handleDeleteConfirm = () => {
    if (!deleteProductRecord) return;

    const removed = deleteProduct(deleteProductRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a product linked to a deal. Reassign the deal first."
      );
      return;
    }

    if (sheetProduct?.id === deleteProductRecord.id) {
      setSheetOpen(false);
      setSheetProduct(null);
    }
    setDeleteProductRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openSheetById}
          canOpen={(id) => products.some((entry) => entry.id === id)}
        />
      </React.Suspense>

      <PageToolbar
        description="Kryon product catalog — linked to quotes, PFI, and PO modules."
        meta={
          <span>
            <span className="font-medium text-foreground">{products.length}</span>{" "}
            {products.length === 1 ? "product" : "products"}
          </span>
        }
        actions={
          <Button onClick={() => openSheet(null)}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="md:hidden">
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add BLDC controllers and related SKUs to use in deals."
              action={
                <Button onClick={() => openSheet(null)}>
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              }
            />
          </div>
        ) : (
          <ProductsMobileList
            products={products}
            onOpen={openSheet}
            onDelete={(product) => {
              setDeleteError("");
              setDeleteProductRecord(product);
            }}
          />
        )}

        <Card className="hidden shadow-sm md:block">
          <MobileTableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motor Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Voltage</TableHead>
                <TableHead>Wattage</TableHead>
                <TableHead>Poles</TableHead>
                <TableHead>Sensor</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="p-0">
                    <EmptyState
                      icon={Package}
                      title="No products yet"
                      description="Add BLDC controllers and related SKUs to use in deals."
                      action={
                        <Button onClick={() => openSheet(null)}>
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Button>
                      }
                      className="m-4 border-none bg-transparent shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => openSheet(product)}
                >
                  <TableCell>
                    <Badge variant="default">{product.motorControllerType}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate font-medium">
                    {product.model}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate font-mono text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.voltage} V</TableCell>
                  <TableCell>{product.wattage} W</TableCell>
                  <TableCell>{product.poles}</TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {product.sensorType}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate font-mono text-xs">
                    {product.hsnCode}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {product.sellingPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={() => openSheet(product)}
                      onDelete={() => {
                        setDeleteError("");
                        setDeleteProductRecord(product);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
          </MobileTableScroll>
        </Card>
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
      </div>

      <ProductSheet
        product={sheetProduct}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSheetProduct(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteProductRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteProductRecord(null);
        }}
        title="Delete product?"
        description={`This will permanently remove ${deleteProductRecord?.model ?? "this product"}.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
