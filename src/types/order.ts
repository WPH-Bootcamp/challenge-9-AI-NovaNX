export type OrderItem = {
  menuId: string;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt?: string;
  items: OrderItem[];
  total?: number;
};
