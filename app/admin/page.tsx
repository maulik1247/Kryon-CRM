"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { MasterDataListEditor } from "@/components/admin/master-data-list-editor";
import { PipelineStagesAdmin } from "@/components/admin/pipeline-stages-admin";
import { UsersAdminTable } from "@/components/admin/users-admin-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <AppShell
      title="Administration"
      subtitle="Manage dropdown master data, users, and pipeline configuration"
    >
      <AdminGuard>
        <Tabs defaultValue="master-data" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="master-data">Master Data</TabsTrigger>
            <TabsTrigger value="users">Users & Access</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
          </TabsList>

          <TabsContent value="master-data" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <MasterDataListEditor
                title="OEM Segments"
                description="Categories shown on Customer Master."
                listKey="oemSegments"
              />
              <MasterDataListEditor
                title="Lead Sources"
                description="How customers entered the pipeline."
                listKey="leadSources"
              />
              <MasterDataListEditor
                title="Account Owners"
                description="Sales owners for customers and deals."
                listKey="accountOwners"
              />
              <MasterDataListEditor
                title="Product Types"
                description="Motor controller categories in Products."
                listKey="productTypes"
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <UsersAdminTable />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-4">
            <PipelineStagesAdmin />
          </TabsContent>
        </Tabs>
      </AdminGuard>
    </AppShell>
  );
}
