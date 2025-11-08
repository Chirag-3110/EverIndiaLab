import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  GridIcon,
  TableIcon,
  ChevronDownIcon,
  HorizontaLDots,
  UserIcon,
  PaperPlaneIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  BadgeIndianRupee,
  Building2,
  Hospital,
  LogOut,
  LogOutIcon,
  NotebookPen,
  NotebookText,
  Package,
  Settings,
  TableProperties,
  Ticket,
  TvIcon,
  User,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  // {
  //   icon: <GridIcon />,
  //   name: "Dashboard",
  //   subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  // },
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <TableProperties />,
    name: "Category Management",
    path: "/category-management",
  },
  // {
  //   icon: <User />,
  //   name: "Users",
  //   path: "/users",
  // },
  {
    icon: <UsersRound />,
    name: "Phlebotomist",
    path: "/Staff",
  },
  {
    icon: <Package />,
    name: "Package Management",
    subItems: [{ name: "Packages", path: "/packages", pro: false }],
  },
  // {
  //   icon: <Hospital />,
  //   name: "Lab Management",
  //   subItems: [
  //     { name: "Labs", path: "/labs", pro: false },
  //     { name: "Lab Management", path: "/lab-management", pro: false },
  //   ],
  // },
  {
    icon: <NotebookPen />,
    name: "Test Management",
    subItems: [{ name: "Test", path: "/test-form", pro: false }],
  },
  {
    icon: <NotebookText />,
    name: "Booking Management",
    subItems: [{ name: "Booking", path: "/booking-list", pro: false }],
  },
  // {
  //   icon: <TableProperties />,
  //   name: "Rental Properties",
  //   path: "/property",
  // },
  // {
  //   icon: <Building2 />,
  //   name: "Convention Space",
  //   path: "/convention",
  // },
  // {
  //   icon: <TvIcon />,
  //   name: "Ads",
  //   path: "/ads",
  // },
  // {
  //   icon: <Ticket />,
  //   name: "Ticket",
  //   path: "/tickets",
  // },
  // {
  //   icon: <BadgeIndianRupee />,
  //   name: "Set Charges",
  //   path: "/charges",
  // },
  // {
  //   icon: <Settings />,
  //   name: "Settings",
  //   subItems: [
  //     { name: "Contact", path: "/contact", pro: false },
  //     { name: "Email Logs", path: "/email-logs", pro: false },
  //     { name: "Faq", path: "/faq", pro: false },
  //     { name: "Site Setting", path: "/site-settings", pro: false },
  //     { name: "CMS", path: "/cms", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleLogout = () => {
    logout();
    navigate("/signin");
    toast.success("Logged out Successfully..!");
  };

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          setOpenSubmenu(index);
        }
      });
    });
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            // <img
            //   className="dark:hidden"
            //   src="/images/logo/logo.svg"
            //   alt="Logo"
            //   width={150}
            //   height={40}
            // />
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              {/* <Warehouse className="h-6 w-6 text-primary text-[#07868D]" /> */}

              <img src="/logo.png" alt="" className="w-[180px]" />
            </div>
          ) : (
            // <img
            //   src="/images/logo/logo-icon.svg"
            //   alt="Logo"
            //   width={32}
            //   height={32}
            // />
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <img src="/lo.png" alt="" className="w-[40px]" />
            </div>
          )}
        </Link>
      </div>

      {/* Main Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="h-[650px] flex flex-col">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <HorizontaLDots className="size-6" />
            )}
          </h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <button
                    onClick={() => handleSubmenuToggle(index)}
                    className={`menu-item group ${
                      openSubmenu === index
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    } cursor-pointer ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "lg:justify-start"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        openSubmenu === index
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <ChevronDownIcon
                        className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                          openSubmenu === index
                            ? "rotate-180 text-brand-500"
                            : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  nav.path && (
                    <Link
                      to={nav.path}
                      className={`menu-item group ${
                        isActive(nav.path)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </Link>
                  )
                )}
                {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                  <div
                    ref={(el) => {
                      subMenuRefs.current[`${index}`] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu === index
                          ? `${subMenuHeight[`${index}`]}px`
                          : "0px",
                    }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            className={`menu-dropdown-item ${
                              isActive(subItem.path)
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-auto px-0">
            <button
              onClick={handleLogout}
              className={`menu-item border mb-4 group cursor-pointer w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                isExpanded || isHovered || isMobileOpen
                  ? "justify-start text-gray-900 hover:bg-[#FF0800] hover:text-white transition-all"
                  : "justify-center"
              }`}
            >
              <LogOutIcon
                className={`menu-item-icon-size ${
                  isExpanded || isHovered || isMobileOpen
                    ? "text-gray-900 "
                    : "text-gray-800"
                }`}
              />
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">Logout</span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
