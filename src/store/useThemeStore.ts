
// import { create } from "zustand";

// type ThemeState = {
//   theme: "light" | "dark";
//   toggleTheme: () => void;
// };

// // Retrieve saved theme or default to light
// const getInitialTheme = (): "light" | "dark" => {
//   if (typeof window !== "undefined") {
//     return (localStorage.getItem("theme") as "light" | "dark") || "light";
//   }
//   return "light";
// };

// export const useThemeStore = create<ThemeState>((set) => ({
//   theme: getInitialTheme(),
//   toggleTheme: () =>
//     set((state) => {
//       const newTheme = state.theme === "light" ? "dark" : "light";
//       localStorage.setItem("theme", newTheme);
//       document.documentElement.classList.toggle("dark", newTheme === "dark");
//       return { theme: newTheme };
//     }),
// }));
