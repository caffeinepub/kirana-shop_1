import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Package, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useAddProduct,
  useAllProducts,
  useRemoveProduct,
  useUpdateProduct,
} from "../hooks/useQueries";

const CATEGORIES = [
  "Atta/Dal",
  "Oil & Ghee",
  "Spices",
  "Snacks",
  "Beverages",
  "Dairy",
  "Cleaning",
  "Other",
];
const UNITS = ["kg", "litre", "piece", "packet"];

const emptyForm = {
  name: "",
  category: "Other",
  price: "",
  stock: "",
  unit: "kg",
  lowStockThreshold: "5",
};

export default function Inventory() {
  const { data: products = [], isLoading } = useAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const removeProduct = useRemoveProduct();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm({ ...emptyForm });
    setEditProduct(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      stock: p.stock.toString(),
      unit: p.unit,
      lowStockThreshold: p.lowStockThreshold.toString(),
    });
    setEditProduct(p);
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload = {
      name: form.name,
      category: form.category,
      price: Number.parseFloat(form.price),
      stock: BigInt(form.stock),
      unit: form.unit,
      lowStockThreshold: BigInt(form.lowStockThreshold || "5"),
    };
    try {
      if (editProduct) {
        await updateProduct.mutateAsync({ id: editProduct.id, ...payload });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync(payload);
        toast.success("Product added!");
      }
      setShowModal(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await removeProduct.mutateAsync(id);
      toast.success("Product removed");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete product");
    }
  }

  function stockStatus(p: Product) {
    if (p.stock === BigInt(0))
      return {
        label: "Out of Stock",
        class: "bg-destructive/10 text-destructive border-destructive/20",
      };
    if (p.stock <= p.lowStockThreshold)
      return {
        label: "Low Stock",
        class: "bg-kpi-peach text-orange-700 border-orange-200",
      };
    return {
      label: "In Stock",
      class: "bg-kpi-mint text-emerald-700 border-emerald-200",
    };
  }

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-4" data-ocid="inventory.section">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="inventory.search_input"
          />
        </div>
        <Button
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          onClick={openAdd}
          data-ocid="inventory.add_product.button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="inventory.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-xs">
          <CardContent
            className="py-16 text-center text-muted-foreground"
            data-ocid="inventory.empty_state"
          >
            <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              {search ? "No matching products" : "No products yet"}
            </p>
            <p className="text-sm mt-1">
              {!search && "Click 'Add Product' to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const status = stockStatus(p);
            return (
              <Card
                key={p.id.toString()}
                className="border-0 shadow-xs"
                data-ocid={`inventory.item.${i + 1}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {p.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.category}
                      </p>
                    </div>
                    <Badge variant="outline" className={status.class}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-bold text-primary text-lg">
                      ₹{p.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      {p.stock.toString()} {p.unit}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => openEdit(p)}
                      data-ocid={`inventory.edit_button.${i + 1}`}
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(p.id)}
                      data-ocid={`inventory.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="inventory.product.dialog">
          <DialogHeader>
            <DialogTitle>
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label className="text-xs mb-1 block">Product Name *</Label>
              <Input
                placeholder="e.g. Aashirvaad Atta 5kg"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="inventory.product.name.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger data-ocid="inventory.product.category.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                >
                  <SelectTrigger data-ocid="inventory.product.unit.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Price (₹) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  data-ocid="inventory.product.price.input"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Stock *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  data-ocid="inventory.product.stock.input"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Low Stock Alert</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      lowStockThreshold: e.target.value,
                    }))
                  }
                  data-ocid="inventory.product.threshold.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="inventory.product.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="inventory.product.submit_button"
            >
              {isPending ? "Saving…" : editProduct ? "Update" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent data-ocid="inventory.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="inventory.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={removeProduct.isPending}
              data-ocid="inventory.delete.confirm_button"
            >
              {removeProduct.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
