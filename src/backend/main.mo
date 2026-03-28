import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

persistent actor {
  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };

    public func compareByStock(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.stock, p2.stock);
    };

    public func compareByPrice(p1 : Product, p2 : Product) : Order.Order {
      Float.compare(p1.price, p2.price);
    };

    public func compareByName(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  module Sale {
    public func compare(s1 : Sale, s2 : Sale) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };

    public func compareByTotalAmount(s1 : Sale, s2 : Sale) : Order.Order {
      Float.compare(s1.totalAmount, s2.totalAmount);
    };

    public func compareByTimestamp(s1 : Sale, s2 : Sale) : Order.Order {
      Int.compare(s1.timestamp, s2.timestamp);
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Float;
    stock : Nat;
    unit : Text;
    lowStockThreshold : Nat;
  };

  type SaleItem = {
    productId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  type Sale = {
    id : Nat;
    items : [SaleItem];
    totalAmount : Float;
    timestamp : Time.Time;
  };

  type DashboardStats = {
    totalProducts : Nat;
    lowStockCount : Nat;
    totalSalesCount : Nat;
    totalSalesAmount : Float;
    recentSales : [Sale];
  };

  public type UserProfile = {
    name : Text;
  };

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data structures
  let products = Map.empty<Nat, Product>();
  let sales = Map.empty<Nat, Sale>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 1;
  var nextSaleId = 1;

  // Seed data on initialization
  func seedProducts() {
    let seedData : [Product] = [
      {
        id = 1;
        name = "Atta";
        category = "Grains";
        price = 40.0;
        stock = 50;
        unit = "kg";
        lowStockThreshold = 10;
      },
      {
        id = 2;
        name = "Dal";
        category = "Pulses";
        price = 70.0;
        stock = 30;
        unit = "kg";
        lowStockThreshold = 8;
      },
      {
        id = 3;
        name = "Oil";
        category = "Cooking";
        price = 120.0;
        stock = 20;
        unit = "litre";
        lowStockThreshold = 5;
      },
      {
        id = 4;
        name = "Sugar";
        category = "Essentials";
        price = 45.0;
        stock = 40;
        unit = "kg";
        lowStockThreshold = 12;
      },
      {
        id = 5;
        name = "Salt";
        category = "Essentials";
        price = 20.0;
        stock = 60;
        unit = "kg";
        lowStockThreshold = 15;
      },
      {
        id = 6;
        name = "Rice";
        category = "Grains";
        price = 50.0;
        stock = 35;
        unit = "kg";
        lowStockThreshold = 10;
      },
      {
        id = 7;
        name = "Chai";
        category = "Beverages";
        price = 90.0;
        stock = 25;
        unit = "kg";
        lowStockThreshold = 7;
      },
      {
        id = 8;
        name = "Biscuits";
        category = "Snacks";
        price = 30.0;
        stock = 80;
        unit = "pkt";
        lowStockThreshold = 20;
      },
      {
        id = 9;
        name = "Soap";
        category = "Personal Care";
        price = 25.0;
        stock = 45;
        unit = "pcs";
        lowStockThreshold = 10;
      },
      {
        id = 10;
        name = "Shampoo";
        category = "Personal Care";
        price = 60.0;
        stock = 15;
        unit = "btl";
        lowStockThreshold = 5;
      },
    ];

    for (product in seedData.values()) {
      products.add(product.id, product);
    };
    nextProductId := 11;
  };

  // User Profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product CRUD
  public shared ({ caller }) func addProduct(name : Text, category : Text, price : Float, stock : Nat, unit : Text, lowStockThreshold : Nat) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add new products");
    };
    let product : Product = {
      id = nextProductId;
      name;
      category;
      price;
      stock;
      unit;
      lowStockThreshold;
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, category : Text, price : Float, stock : Nat, unit : Text, lowStockThreshold : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    let updatedProduct : Product = {
      id;
      name;
      category;
      price;
      stock;
      unit;
      lowStockThreshold;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func removeProduct(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.name.contains(#text searchTerm) or product.category.contains(#text searchTerm);
      }
    );
  };

  // Sales
  public shared ({ caller }) func createSale(items : [SaleItem], totalAmount : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sales");
    };
    let sale : Sale = {
      id = nextSaleId;
      items;
      totalAmount;
      timestamp = Time.now();
    };

    sales.add(nextSaleId, sale);
    nextSaleId += 1;
    sale.id;
  };

  public query ({ caller }) func getSaleById(id : Nat) : async Sale {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };
    switch (sales.get(id)) {
      case (null) { Runtime.trap("Sale not found") };
      case (?sale) { sale };
    };
  };

  public query ({ caller }) func getAllSales() : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };
    sales.values().toArray().sort();
  };

  // Dashboard stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
    let lowStockCount = products.values().toArray().filter(
      func(product) {
        product.stock <= product.lowStockThreshold;
      }
    ).size();

    let totalSalesAmount = sales.values().toArray().foldLeft(
      0.0,
      func(acc, sale) { acc + sale.totalAmount },
    );

    let recentSales = sales.values().toArray().sort(Sale.compareByTimestamp).reverse();

    let totalSalesCount = sales.values().toArray().foldLeft(
      0,
      func(acc, _sale) { acc + 1 },
    );

    {
      totalProducts = products.values().toArray().foldLeft(
        0,
        func(acc, _product) { acc + 1 },
      );
      lowStockCount;
      totalSalesCount;
      totalSalesAmount;
      recentSales;
    };
  };

  // Additional utility functions and sorting
  public query ({ caller }) func getProductsSortedByStock() : async [Product] {
    products.values().toArray().sort(Product.compareByStock);
  };

  public query ({ caller }) func getProductsSortedByPrice() : async [Product] {
    products.values().toArray().sort(Product.compareByPrice);
  };

  public query ({ caller }) func getProductsSortedByName() : async [Product] {
    products.values().toArray().sort(Product.compareByName);
  };
};
