"use client";

import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Drawer } from "@/components/common/Drawer";
import { Button } from "@/components/common/Button";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  dictionary: {
    myAccount: string;
    orders: string;
    addresses: string;
    wishlist: string;
    settings: string;
    logout: string;
    welcome: string;
    login: string;
    register: string;
    notLoggedIn: string;
    profile?: string;
  };
}

interface MenuItem {
  icon: typeof User;
  label: string;
  href: string;
}

export function AccountDrawer({
  isOpen,
  onClose,
  locale,
  dictionary,
}: AccountDrawerProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const isRTL = locale === "ar";

  const handleLogout = () => {
    logout();
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      icon: User,
      label: dictionary.profile || "Profile",
      href: `/${locale}/account/profile`,
    },
    {
      icon: Package,
      label: dictionary.orders,
      href: `/${locale}/account/orders`,
    },
    {
      icon: MapPin,
      label: dictionary.addresses,
      href: `/${locale}/account/addresses`,
    },
    {
      icon: Heart,
      label: dictionary.wishlist,
      href: `/${locale}/account/wishlist`,
    },
    {
      icon: Settings,
      label: dictionary.settings,
      href: `/${locale}/account`,
    },
  ];

  const renderAuthenticatedContent = () => (
    <>
      <div className="border-b p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">{dictionary.welcome}</p>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {user?.user_display_name}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.user_email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{dictionary.logout}</span>
        </button>
      </div>
    </>
  );

  const renderGuestContent = () => (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
        <User className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {dictionary.myAccount}
      </h3>
      <p className="mb-8 text-gray-500">{dictionary.notLoggedIn}</p>
      <div className="flex w-full flex-col gap-3">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href={`/${locale}/login`} onClick={onClose}>
            {dictionary.login}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={`/${locale}/register`} onClick={onClose}>
            {dictionary.register}
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      size="sm"
      title={dictionary.myAccount}
      titleIcon={<User className="h-5 w-5" />}
      dir={isRTL ? "rtl" : "ltr"}
      showCloseButton={true}
      bodyClassName="p-0"
    >
      <div className="flex h-full flex-col">
        {isAuthenticated && user
          ? renderAuthenticatedContent()
          : renderGuestContent()}
      </div>
    </Drawer>
  );
}
