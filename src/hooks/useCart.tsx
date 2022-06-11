import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    //localStorage.clear();
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productAPI: Product = await api.get<Product>(`products/${productId}`).then((response) => {
        return response.data;
      });
      const productsStock: Stock = await api.get<Stock>(`stock/${productId}`).then((responseStock) => {
        return responseStock.data;
      });
      const cartProduct = cart.find((item) => item.id === productId);
      const amountProduct = cartProduct ? cartProduct.amount + 1 : 1;

      if (productsStock.amount < amountProduct) {
        toast.error("Quantidade solicitada fora de estoque");
      } else {
        let newCart: Product[];
        if (cartProduct) {
          newCart = cart.map((item) => {
            if (item.id === productId) {
              item.amount += 1;
            }
            return item;
          });
          setCart(newCart);
        } else {
          newCart = [
            ...cart,
            {
              ...productAPI,
              amount: 1,
            },
          ];
          setCart(newCart);
        }
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      await api.get<Stock>(`stock/${productId}`).then((responseStock) => {
        //console.log("responseStock", responseStock.data);
      });
      if (amount <= 0) {
        toast.error("Quantidade solicitada fora de estoque");
      }

      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
