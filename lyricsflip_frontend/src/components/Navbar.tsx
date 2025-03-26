// "use client";
// import React, { useState, useEffect } from "react";
// import { useThemeStore } from "../store/useThemeStore";
// import { Sun, Moon, Settings, ChevronDown } from "lucide-react"; // Added ChevronDown icon
// import Link from "next/link";

// const Navbar = () => {
//   const { theme, toggleTheme } = useThemeStore();
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
//   const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

//   // Set the dark class on the body element when the theme is updated
//   useEffect(() => {
//     if (theme === "dark") {
//       document.body.classList.add("dark");
//     } else {
//       document.body.classList.remove("dark");
//     }
//   }, [theme]);

//   return (
//     <nav
//       className={`flex justify-between items-center px-6 py-4 shadow-md ${
//         theme === "dark" ? "bg-gray-900" : "bg-white"
//       }`}
//     >
//       <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//         Lyric<span className="text-green-500">Flip</span>
//       </div>

//       <div className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-200">
//         <Link href="/home" className="hover:text-indigo-500 dark:hover:text-indigo-400">
//           Home
//         </Link>
//         <Link href="/wallet" className="hover:text-indigo-500 dark:hover:text-indigo-400">
//           Wallet
//         </Link>
//         <Link href="/leaderboard" className="hover:text-indigo-500 dark:hover:text-indigo-400">
//           Leaderboard
//         </Link>
//         <Link href="/notifications" className="hover:text-indigo-500 dark:hover:text-indigo-400">
//           Notifications
//         </Link>
//         <Link href="/profile" className="hover:text-indigo-500 dark:hover:text-indigo-400">
//           Profile
//         </Link>
//         <Link href="/more" className="hover:text-indigo-500 dark:hover:text-indigo-400">
//           More
//         </Link>
//       </div>

//       <div className="flex items-center space-x-4">
//         {/* Settings Icon */}
//         <div className="relative">
//           <button
//             onClick={toggleSettings}
//             className="p-2 border-2 border-gray-400 dark:border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
//           >
//             <Settings size={20} />
//           </button>

//           {isSettingsOpen && (
//             <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4">
//               <div className="flex items-center space-x-2">
//                 <p className="text-gray-700 dark:text-gray-200">Theme Toggle</p>
//                 <button
//                   onClick={toggleTheme}
//                   className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//                 >
//                   {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Dropdown Button with Icon */}
//         <div className="relative">
//           <button
//             onClick={toggleDropdown}
//             className="flex items-center space-x-1 p-2 border-2 border-gray-400 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
//           >
//             <span className="text-gray-700 dark:text-gray-200">More</span>
//             <ChevronDown size={18} />
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2">
//               <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
//                 Settings
//               </Link>
//               <Link href="/logout" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
//                 Logout
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
