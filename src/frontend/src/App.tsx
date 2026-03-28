import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useState } from "react";
import Billing from "./components/Billing";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import SalesReport from "./components/SalesReport";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const [activeTab, setActiveTab] = useState("dashboard");

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 5)}…` : "";

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-shell rounded-2xl shadow-shell p-8 max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/generated/kirana-logo-transparent.dim_80x80.png"
              alt="KiranaLink"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            KiranaLink
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Apni dukan ka poora hisaab, ek jagah
          </p>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={login}
            disabled={loginStatus === "logging-in"}
            data-ocid="login.primary_button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loginStatus === "logging-in" ? "Logging in…" : "Login to Continue"}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Secure login with Internet Identity
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto bg-shell rounded-2xl shadow-shell overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/assets/generated/kirana-logo-transparent.dim_80x80.png"
                alt=""
                className="w-8 h-8"
              />
              <span className="font-bold text-primary text-lg hidden sm:block">
                KiranaLink
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-ocid="header.notifications.button"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <div
                className="flex items-center gap-2 cursor-pointer"
                data-ocid="header.user.button"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {shortPrincipal.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold leading-none">
                    {shortPrincipal}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Store Owner
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive"
                data-ocid="header.logout.button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-card border-b border-border px-4 sm:px-6">
            <TabsList className="h-11 bg-transparent p-0 gap-0 w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-1.5 px-3 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground text-sm"
                data-ocid="nav.dashboard.tab"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="flex items-center gap-1.5 px-3 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground text-sm"
                data-ocid="nav.inventory.tab"
              >
                <Package className="w-4 h-4" /> Inventory
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="flex items-center gap-1.5 px-3 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground text-sm"
                data-ocid="nav.billing.tab"
              >
                <ShoppingCart className="w-4 h-4" /> Billing / POS
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-1.5 px-3 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground text-sm"
                data-ocid="nav.reports.tab"
              >
                <BarChart2 className="w-4 h-4" /> Sales Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6 bg-shell min-h-[calc(100vh-12rem)]">
            <TabsContent value="dashboard" className="mt-0">
              <Dashboard onNavigate={setActiveTab} />
            </TabsContent>
            <TabsContent value="inventory" className="mt-0">
              <Inventory />
            </TabsContent>
            <TabsContent value="billing" className="mt-0">
              <Billing />
            </TabsContent>
            <TabsContent value="reports" className="mt-0">
              <SalesReport />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <footer className="bg-[oklch(0.32_0.07_180)] text-[oklch(0.85_0.03_180)] px-6 py-3 text-center text-xs flex items-center justify-center gap-1">
          <Store className="w-3 h-3" />
          <span>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline underline-offset-2 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </span>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
