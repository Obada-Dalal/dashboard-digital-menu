import { NavLink } from "react-router-dom";
import { FaHamburger, FaThLarge, FaStoreAlt } from "react-icons/fa";

export default function Sidebar() {
  const menuItems = [
    { path: "/admin-panel/products", label: "المنتجات", icon: <FaHamburger /> },
    { path: "/admin-panel/categories", label: "الأصناف", icon: <FaThLarge /> },
    { path: "/admin-panel/ads", label: "اللوجو", icon: <FaStoreAlt /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">لوحة التحكم</div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
