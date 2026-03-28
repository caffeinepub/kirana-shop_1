import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SaleItem {
    productId: bigint;
    quantity: bigint;
    unitPrice: number;
}
export type Time = bigint;
export interface Sale {
    id: bigint;
    totalAmount: number;
    timestamp: Time;
    items: Array<SaleItem>;
}
export interface DashboardStats {
    totalProducts: bigint;
    totalSalesAmount: number;
    lowStockCount: bigint;
    totalSalesCount: bigint;
    recentSales: Array<Sale>;
}
export interface Product {
    id: bigint;
    lowStockThreshold: bigint;
    name: string;
    unit: string;
    stock: bigint;
    category: string;
    price: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: string, price: number, stock: bigint, unit: string, lowStockThreshold: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSale(items: Array<SaleItem>, totalAmount: number): Promise<bigint>;
    getAllProducts(): Promise<Array<Product>>;
    getAllSales(): Promise<Array<Sale>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getProduct(id: bigint): Promise<Product>;
    getProductsSortedByName(): Promise<Array<Product>>;
    getProductsSortedByPrice(): Promise<Array<Product>>;
    getProductsSortedByStock(): Promise<Array<Product>>;
    getSaleById(id: bigint): Promise<Sale>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeProduct(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    updateProduct(id: bigint, name: string, category: string, price: number, stock: bigint, unit: string, lowStockThreshold: bigint): Promise<void>;
}
