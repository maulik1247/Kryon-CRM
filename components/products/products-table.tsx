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
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import Link from "next/link";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { useAuth } from "@/lib/auth-provider";
import { ProductsMobileList } from "./products-mobile-list";
import { useCrmData } from "@/lib/crm-data-provider";
import { sortByCreatedAtDesc } from "@/lib/list-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import { getUserName } from "@/lib/user-helpers";
import type { Product } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RecordIdText } from "@/components/shared/record-id";

export function ProductsTable() {
  const { users } = useAuth();
  const { products, deleteProduct } = useCrmData();
  const { goToProduct } = useRecordNavigation();
  const [deleteProductRecord, setDeleteProductRecord] =
    React.useState<Product | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  const sortedProducts = React.useMemo(
    () => sortByCreatedAtDesc(products),
    [products]
  );

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(sortedProducts);

  const handleDeleteConfirm = () => {
    if (!deleteProductRecord) return;

    const removed = deleteProduct(deleteProductRecord.id);
    if (!removed) {
      setDeleteError(
        "Cannot delete a product linked to a deal. Reassign the deal first."
      );
      return;
    }

    setDeleteProductRecord(null);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.product}
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
          <Button asChild>
            <Link href={recordNewRoutes.product}>
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
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
                <Button asChild>
                  <Link href={recordNewRoutes.product}>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ProductsMobileList
              products={paginatedItems}
              users={users}
              onOpen={(product) => goToProduct(product.id)}
              onDelete={(product) => {
                setDeleteError("");
                setDeleteProductRecord(product);
              }}
            />
            {totalItems > 0 ? (
              <div className="overflow-hidden rounded-lg border bg-card shadow-sm md:hidden">
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </>
        )}

        <Card className="hidden overflow-hidden shadow-sm md:block">
          <MobileTableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Motor Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Voltage</TableHead>
                <TableHead>Wattage</TableHead>
                <TableHead>Poles</TableHead>
                <TableHead>Sensor</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
                <TableHead>Added on</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="p-0">
                    <EmptyState
                      icon={Package}
                      title="No products yet"
                      description="Add BLDC controllers and related SKUs to use in deals."
                      action={
                        <Button asChild>
                          <Link href={recordNewRoutes.product}>
                            <Plus className="h-4 w-4" />
                            Add Product
                          </Link>
                        </Button>
                      }
                      className="m-4 border-none bg-transparent shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
              paginatedItems.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => goToProduct(product.id)}
                >
                  <TableCell>
                    <RecordIdText id={product.id} />
                  </TableCell>
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
                  <TableCell className="whitespace-nowrap">
                    {formatDate(product.createdAt)}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate">
                    {getUserName(users, product.createdByUserId)}
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={() => goToProduct(product.id)}
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
          {totalItems > 0 ? (
            <TablePagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          ) : null}
        </Card>
        {deleteError && (
          <p className="text-sm text-destructive">{deleteError}</p>
        )}
      </div>

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
