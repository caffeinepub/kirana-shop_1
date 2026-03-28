import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAllProducts, useCreateSale } from "../hooks/useQueries";

interface CartItem {
  product: Product;
  quantity: number;
}

interface BillReceipt {
  id: bigint;
  items: CartItem[];
  total: number;
  timestamp: Date;
}

export default function Billing() {
  const { data: products = [] } = useAllProducts();
  const createSale = useCreateSale();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipt, setReceipt] = useState<BillReceipt | null>(null);

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch("");
  }

  function updateQty(productId: bigint, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId
            ? { ...c, quantity: c.quantity + delta }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }

  function removeFromCart(productId: bigint) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }

  const total = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);

  async function handleGenerateBill() {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    try {
      const items = cart.map((c) => ({
        productId: c.product.id,
        quantity: BigInt(c.quantity),
        unitPrice: c.product.price,
      }));
      const saleId = await createSale.mutateAsync({
        items,
        totalAmount: total,
      });
      setReceipt({
        id: saleId,
        items: [...cart],
        total,
        timestamp: new Date(),
      });
      setCart([]);
      toast.success("Bill generated!");
    } catch {
      toast.error("Failed to generate bill");
    }
  }

  if (receipt) {
    return (
      <div className="max-w-md mx-auto" data-ocid="billing.receipt.card">
        <Card className="border-0 shadow-xs">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-2">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Bill Receipt</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sale #{receipt.id.toString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {receipt.timestamp.toLocaleString("en-IN")}
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 mb-4">
              {receipt.items.map((c) => (
                <div
                  key={c.product.id.toString()}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {c.product.name} × {c.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{(c.product.price * c.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{receipt.total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full mt-6 bg-primary text-primary-foreground"
              onClick={() => setReceipt(null)}
              data-ocid="billing.new_sale.button"
            >
              New Sale
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      data-ocid="billing.section"
    >
      {/* Left: Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-0 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search product to add…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="billing.search_input"
              />
            </div>
            {filtered.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                {filtered.slice(0, 6).map((p) => (
                  <button
                    type="button"
                    key={p.id.toString()}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 border-b last:border-b-0 text-left"
                    onClick={() => addToCart(p)}
                    data-ocid="billing.product.button"
                  >
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {p.stock.toString()} {p.unit}
                      </Badge>
                      <span className="font-semibold text-primary">
                        ₹{p.price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {search && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No products found
              </p>
            )}
            {!search && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Type to search products
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Cart */}
      <Card className="border-0 shadow-xs h-fit" data-ocid="billing.cart.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Cart
            {cart.length > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {cart.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="billing.cart.empty_state"
            >
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.map((item, i) => (
                  <div
                    key={item.product.id.toString()}
                    className="flex items-center gap-2"
                    data-ocid={`billing.cart.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQty(item.product.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQty(item.product.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs font-semibold">
                      ₹{(item.product.price * item.quantity).toFixed(0)}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold mb-4">
                <span>Total</span>
                <span className="text-primary text-lg">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleGenerateBill}
                disabled={createSale.isPending}
                data-ocid="billing.generate_bill.button"
              >
                {createSale.isPending ? "Processing…" : "Generate Bill"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
