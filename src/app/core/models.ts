// Modelos del dominio tal como los expone el backend (a través de Kong).

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  stock: number;
  price: number;
  status: string;
  createdAt?: string;
  category?: Category;
}

export interface InvoiceItemRequest {
  productId: number;
  quantity: number;
  price: number;
}

export interface InvoiceRequest {
  numberInvoice?: string;
  description?: string;
  customerId: number;
  items: InvoiceItemRequest[];
}

export interface Invoice {
  id: number;
  numberInvoice: string;
  description: string;
  customerId: number;
  createdAt: string;
  state: string; // PENDING | CONFIRMED | CANCELLED
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product?: Product;
  }>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
