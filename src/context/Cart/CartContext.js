import { createContext } from "react";

const CartContext = createContext();

export default CartContext;

// import React, { useState, useEffect } from "react";

// const CartContext = ({ children }) => {
//   const [cart, setCart] = useState([]);

//   const addToCart = (item) => {
//     setCart([...cart, item]);
//   };

//   const removeFromCart = (item) => {
//     const newCart = cart.filter((cartItem) => cartItem.id !== item.id);
//     setCart(newCart);
//   };

//   const clearCart = () => {
//     setCart([]);
//   };

//   const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

//   const totalAmount = cart.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0
//   );

//   const increaseQuantity = (item) => {
//     const newCart = [...cart];
//     const index = newCart.findIndex((cartItem) => cartItem.id === item.id);
//     newCart[index].quantity++;
//     setCart(newCart);
//   };

//   const decreaseQuantity = (item) => {
//     const newCart = [...cart];
//     const index = newCart.findIndex((cartItem) => cartItem.id === item.id);
//     if (newCart[index].quantity > 1) {
//       newCart[index].quantity--;
//       setCart(newCart);
//     } else {
//       removeFromCart(item);
//     }
//   };

//   return (
//     <CartContext.Provider
//       value={{ cart, addToCart, removeFromCart, clearCart }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
