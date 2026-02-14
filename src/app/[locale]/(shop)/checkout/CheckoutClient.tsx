"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Checkbox } from "@/components/common/Checkbox";
import { Radio } from "@/components/common/Radio";
import { CountrySelect, type CountryOption } from "@/components/common/CountrySelect";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCustomer, getSavedAddressesFromCustomer, resolveCountryCode, type Customer, type SavedAddress } from "@/lib/api/customer";
import { featureFlags, type Locale } from "@/config/site";
import { MapPin, Check, ChevronDown, ChevronUp, Tag, X, Truck } from "lucide-react";
import { BundleItemsList, getBundleItems, getBundleItemsTotal, getBoxPrice, getPricingMode, getFixedPrice, getBundleTotal } from "@/components/cart/BundleItemsList";
import { PhoneInput } from "@/components/common/PhoneInput";

interface ShippingRate {
  rate_id: string;
  name: string;
  description: string;
  delivery_time: string;
  price: string;
  taxes: string;
  instance_id: number;
  method_id: string;
  meta_data: Array<{ key: string; value: string }>;
  selected: boolean;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
  free_shipping_min_amount?: number;
  free_shipping_eligible?: boolean;
}

interface ShippingPackage {
  package_id: number;
  name: string;
  destination: {
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  items: Array<{
    key: string;
    name: string;
    quantity: number;
  }>;
  shipping_rates: ShippingRate[];
}

interface PublicCoupon {
  code: string;
  description: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  amount: string;
  minimum_amount: string;
  free_shipping: boolean;
}

interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  method_title: string;
}

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  AED: "AE",
  BHD: "BH",
  KWD: "KW",
  OMR: "OM",
  QAR: "QA",
  SAR: "SA",
  USD: "US",
};

const PAYMENT_METHOD_COUNTRY_AVAILABILITY: Record<string, { type: "include" | "exclude"; countries: string[] }> = {
  tabby_installments: { type: "include", countries: ["AE", "SA", "KW", "BH", "QA"] },
  tabby_checkout: { type: "include", countries: ["AE", "SA", "KW", "BH", "QA"] },
  tabby: { type: "include", countries: ["AE", "SA", "KW", "BH", "QA"] },
  "tamara-gateway": { type: "include", countries: ["AE", "SA", "BH"] },
  tamara: { type: "include", countries: ["AE", "SA", "BH"] },
};

const isPaymentMethodAvailableForCountry = (methodId: string, countryCode: string): boolean => {
  const availability = PAYMENT_METHOD_COUNTRY_AVAILABILITY[methodId];
  if (!availability) {
    return true;
  }
  if (availability.type === "include") {
    return availability.countries.includes(countryCode);
  }
  return !availability.countries.includes(countryCode);
};

interface AddressFormData {
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

interface CheckoutFormData {
  shipping: AddressFormData;
  billing: AddressFormData;
  sameAsShipping: boolean;
  paymentMethod: string;
  orderNotes: string;
}

const emptyAddress: AddressFormData = {
  firstName: "",
  lastName: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "AE",
  phone: "",
  email: "",
};

export default function CheckoutClient() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
        const { cart, cartItems, cartSubtotal, cartTotal, clearCart, applyCoupon, removeCoupon, selectedCoupons, couponDiscount, clearSelectedCoupons, isLoading: isCartLoading } = useCart();
        const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
        const { currency, convertPrice, getCurrencyInfo } = useCurrency();
    const isRTL = locale === "ar";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customerData, setCustomerData] = useState<Customer | null>(null);
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressSelector, setShowAddressSelector] = useState(false);
        const [showBillingSection, setShowBillingSection] = useState(false);
        const [emptyCartCountdown, setEmptyCartCountdown] = useState<number | null>(null);
        const [paymentError, setPaymentError] = useState<string | null>(null);
        const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  
            const [couponCode, setCouponCode] = useState("");
        const [couponError, setCouponError] = useState("");
        const [couponLoading, setCouponLoading] = useState(false);
        const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);
        const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
        const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
        const [isLoadingGateways, setIsLoadingGateways] = useState(true);
        const [isMyFatoorahTestMode, setIsMyFatoorahTestMode] = useState(false);
        const [shippingPackages, setShippingPackages] = useState<ShippingPackage[]>([]);
        const [isLoadingShipping, setIsLoadingShipping] = useState(false);
        const [selectedShippingRate, setSelectedShippingRate] = useState<string | null>(null);
        const [shippingTotal, setShippingTotal] = useState<string>("0");
        const [shippingCountries, setShippingCountries] = useState<CountryOption[] | undefined>(undefined);
        
        const [createAccount, setCreateAccount] = useState(false);
        const [accountPassword, setAccountPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [passwordError, setPasswordError] = useState<string | null>(null);
        const [isCreatingAccount, setIsCreatingAccount] = useState(false);
        
        // Email registration check state
        const [isEmailRegistered, setIsEmailRegistered] = useState(false);
        const [isCheckingEmail, setIsCheckingEmail] = useState(false);
        const [showLoginPrompt, setShowLoginPrompt] = useState(false);
        const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

        const [addressErrors, setAddressErrors] = useState<{ shippingAddress?: string; shippingCity?: string; billingAddress?: string; billingCity?: string }>({});
  
  const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, currencyMinorUnit);

  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: { ...emptyAddress },
    billing: { ...emptyAddress },
    sameAsShipping: true,
    paymentMethod: "myfatoorah_v2",
    orderNotes: "",
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (isAuthenticated && user?.user_id) {
        setIsLoadingCustomer(true);
        try {
          const response = await getCustomer(user.user_id);
          if (response.success && response.data) {
            const customer = response.data;
            setCustomerData(customer);
            
            const addresses = getSavedAddressesFromCustomer(customer);
            setSavedAddresses(addresses);
            
            const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
            
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              const addressFormData: AddressFormData = {
                firstName: defaultAddress.first_name || "",
                lastName: defaultAddress.last_name || "",
                address: defaultAddress.address_1 || "",
                address2: defaultAddress.address_2 || "",
                city: defaultAddress.city || "",
                state: defaultAddress.state || "",
                postalCode: defaultAddress.postcode || "",
                country: resolveCountryCode(defaultAddress.country),
                phone: defaultAddress.phone || "",
                email: defaultAddress.email || customer.email || "",
              };
              
              setFormData(prev => ({
                ...prev,
                shipping: addressFormData,
                billing: prev.sameAsShipping ? addressFormData : prev.billing,
              }));
            } else {
              const shippingAddress: AddressFormData = {
                firstName: customer.shipping?.first_name || "",
                lastName: customer.shipping?.last_name || "",
                address: customer.shipping?.address_1 || "",
                address2: customer.shipping?.address_2 || "",
                city: customer.shipping?.city || "",
                state: customer.shipping?.state || "",
                postalCode: customer.shipping?.postcode || "",
                country: resolveCountryCode(customer.shipping?.country || ""),
                phone: customer.shipping?.phone || customer.billing?.phone || "",
                email: customer.billing?.email || customer.email || "",
              };
              
              const billingAddress: AddressFormData = {
                firstName: customer.billing?.first_name || "",
                lastName: customer.billing?.last_name || "",
                address: customer.billing?.address_1 || "",
                address2: customer.billing?.address_2 || "",
                city: customer.billing?.city || "",
                state: customer.billing?.state || "",
                postalCode: customer.billing?.postcode || "",
                country: resolveCountryCode(customer.billing?.country || ""),
                phone: customer.billing?.phone || "",
                email: customer.billing?.email || customer.email || "",
              };
              
              setFormData(prev => ({
                ...prev,
                shipping: shippingAddress,
                billing: prev.sameAsShipping ? shippingAddress : billingAddress,
              }));
            }
          }
        } catch (err) {
          console.error("Failed to fetch customer data:", err);
          if (user) {
            const nameParts = user.user_display_name?.split(" ") || ["", ""];
            setFormData(prev => ({
              ...prev,
              shipping: {
                ...prev.shipping,
                firstName: prev.shipping.firstName || nameParts[0] || "",
                lastName: prev.shipping.lastName || nameParts.slice(1).join(" ") || "",
                email: prev.shipping.email || user.user_email || "",
              },
              billing: prev.sameAsShipping ? {
                ...prev.shipping,
                firstName: prev.shipping.firstName || nameParts[0] || "",
                lastName: prev.shipping.lastName || nameParts.slice(1).join(" ") || "",
                email: prev.shipping.email || user.user_email || "",
              } : prev.billing,
            }));
          }
        } finally {
          setIsLoadingCustomer(false);
        }
      }
    };
      fetchCustomerData();
    }, [isAuthenticated, user?.user_id]);

        useEffect(() => {
          const fetchAvailableCoupons = async () => {
            setIsLoadingCoupons(true);
            try {
              const response = await fetch("/api/coupons");
              const data = await response.json();
              if (data.success && data.coupons) {
                setAvailableCoupons(data.coupons);
              }
            } catch (err) {
              console.error("Failed to fetch available coupons:", err);
            } finally {
              setIsLoadingCoupons(false);
            }
          };
          fetchAvailableCoupons();
        }, []);

        useEffect(() => {
          const fetchPaymentGateways = async () => {
            setIsLoadingGateways(true);
            try {
              const response = await fetch("/api/payment-gateways");
              const data = await response.json();
              if (data.success && data.gateways) {
                setPaymentGateways(data.gateways);
              }
              if (data.myfatoorah_test_mode !== undefined) {
                setIsMyFatoorahTestMode(data.myfatoorah_test_mode);
              }
            } catch (err) {
              console.error("Failed to fetch payment gateways:", err);
            } finally {
              setIsLoadingGateways(false);
            }
          };
                  fetchPaymentGateways();
                }, []);

        useEffect(() => {
          const fetchShippingCountries = async () => {
            try {
              const response = await fetch("/api/shipping-countries");
              const data = await response.json();
              if (data.success && data.countries) {
                const mapped: CountryOption[] = data.countries.map((c: { code: string; name: string }) => ({
                  value: c.code,
                  label: c.name,
                }));
                if (mapped.length > 0) {
                  setShippingCountries(mapped);
                }
              }
            } catch (err) {
              console.error("Failed to fetch shipping countries:", err);
            }
          };
          fetchShippingCountries();
        }, []);

        useEffect(() => {
          if (!currency) return;
          const mappedCountry = CURRENCY_TO_COUNTRY[currency];
          if (mappedCountry && mappedCountry !== formData.shipping.country) {
            setFormData((prev) => ({
              ...prev,
              shipping: { ...prev.shipping, country: mappedCountry },
              billing: prev.sameAsShipping ? { ...prev.shipping, country: mappedCountry } : prev.billing,
            }));
          }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currency]);

        const filteredPaymentGateways = useMemo(() => {
          const selectedCountry = formData.shipping.country;
          return paymentGateways.filter((gateway) =>
            isPaymentMethodAvailableForCountry(gateway.id, selectedCountry)
          );
        }, [paymentGateways, formData.shipping.country]);

        useEffect(() => {
          if (filteredPaymentGateways.length > 0) {
            const currentMethodAvailable = filteredPaymentGateways.some(
              (gateway) => gateway.id === formData.paymentMethod
            );
            if (!currentMethodAvailable) {
              setFormData((prev) => ({
                ...prev,
                paymentMethod: filteredPaymentGateways[0].id,
              }));
            }
          }
        }, [filteredPaymentGateways, formData.paymentMethod]);

        // Check for payment error from redirect (MyFatoorah, Tabby, Tamara)
        useEffect(() => {
          const verifyFailedPayment = async () => {
            const myFatoorahPaymentId = searchParams.get("paymentId");
            const tabbyPaymentId = searchParams.get("payment_id");
            const tamaraOrderId = searchParams.get("orderId");
            const orderId = searchParams.get("order_id");
            
            // Only verify if we have payment params and an order_id (indicates redirect from payment gateway)
            if (!orderId) return;
            
            const hasPaymentParams = myFatoorahPaymentId || tabbyPaymentId || tamaraOrderId;
            if (!hasPaymentParams) return;
            
            setIsVerifyingPayment(true);
            
            try {
              let verifyUrl = "";
              
              if (myFatoorahPaymentId) {
                verifyUrl = `/api/myfatoorah/verify-payment?paymentId=${myFatoorahPaymentId}`;
              } else if (tabbyPaymentId) {
                verifyUrl = `/api/tabby/verify-payment?payment_id=${tabbyPaymentId}`;
              } else if (tamaraOrderId) {
                verifyUrl = `/api/tamara/verify-payment?order_id=${tamaraOrderId}`;
              }
              
              if (verifyUrl) {
                const verifyResponse = await fetch(verifyUrl);
                const verifyData = await verifyResponse.json();
                
                if (verifyData.success && verifyData.payment_status === "failed") {
                  const errorMessage = verifyData.status_message || verifyData.error_message || 
                    (isRTL ? "فشل الدفع. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع مختلفة." : "Payment failed. Please try again or use a different payment method.");
                  setPaymentError(errorMessage);
                } else if (!verifyData.success) {
                  // API call failed, show generic error
                  setPaymentError(isRTL ? "فشل الدفع. يرجى المحاولة مرة أخرى." : "Payment failed. Please try again.");
                }
              }
            } catch (err) {
              console.error("Failed to verify payment:", err);
              setPaymentError(isRTL ? "فشل الدفع. يرجى المحاولة مرة أخرى." : "Payment failed. Please try again.");
            } finally {
              setIsVerifyingPayment(false);
            }
          };
          
          verifyFailedPayment();
        }, [searchParams, isRTL]);

// Empty cart detection and auto-redirect
        const isEmptyCart = !isCartLoading && cartItems.length === 0 && parseFloat(cartTotal) === 0;
        
        useEffect(() => {
          if (isEmptyCart) {
            setEmptyCartCountdown(10);
          } else {
            setEmptyCartCountdown(null);
          }
        }, [isEmptyCart]);

        useEffect(() => {
          if (emptyCartCountdown === null || emptyCartCountdown <= 0) return;
          
          const timer = setInterval(() => {
            setEmptyCartCountdown((prev) => {
              if (prev === null || prev <= 1) {
                router.push(`/${locale}`);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        }, [emptyCartCountdown, router, locale]);

        const fetchShippingMethods = async (country: string, city: string, postcode: string) => {
          setIsLoadingShipping(true);
          try {
            const subtotal = cartSubtotal ? parseFloat(String(cartSubtotal)) : 0;
            const weight = cart?.items_weight || 0;
            const params = new URLSearchParams({
              country: country || "AE",
              city: city || "",
              postcode: postcode || "",
              cart_subtotal: String(subtotal),
              cart_weight: String(weight),
              currency_code: currency || "AED",
            });
            const response = await fetch(`/api/shipping?${params.toString()}`);
            const data = await response.json();
            if (data.success && data.shipping_rates) {
              setShippingPackages(data.shipping_rates);
              if (data.totals?.shipping_total) {
                setShippingTotal(data.totals.shipping_total);
              }
              const allRates = data.shipping_rates.flatMap((pkg: ShippingPackage) => pkg.shipping_rates || []);
              const selectedRate = allRates.find((rate: ShippingRate) => rate.selected);
              if (selectedRate) {
                setSelectedShippingRate(selectedRate.rate_id);
              } else if (allRates.length > 0) {
                setSelectedShippingRate(allRates[0].rate_id);
                handleSelectShippingRate(allRates[0].rate_id, 0);
              }
            }
          } catch (err) {
            console.error("Failed to fetch shipping methods:", err);
          } finally {
            setIsLoadingShipping(false);
          }
        };

        useEffect(() => {
          if (formData.shipping.country) {
            const timeoutId = setTimeout(() => {
              fetchShippingMethods(
                formData.shipping.country,
                formData.shipping.city,
                formData.shipping.postalCode
              );
            }, 500);
            return () => clearTimeout(timeoutId);
          }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [formData.shipping.country, formData.shipping.city, formData.shipping.postalCode]);

        const handleSelectShippingRate = async (rateId: string, packageId: number = 0) => {
          setSelectedShippingRate(rateId);
          try {
            const response = await fetch("/api/shipping", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ rate_id: rateId, package_id: packageId, shipping_rates: shippingPackages }),
            });
            const data = await response.json();
            if (data.success) {
              if (data.shipping_rates) {
                setShippingPackages(data.shipping_rates);
              }
              if (data.totals?.shipping_total) {
                setShippingTotal(data.totals.shipping_total);
              }
            }
          } catch (err) {
            console.error("Failed to select shipping rate:", err);
          }
        };

        const handleApplyCoupon= async () => {
      if (!couponCode.trim()) return;
      setCouponLoading(true);
      setCouponError("");
      try {
        const couponData = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase().trim());
        const result = await applyCoupon(couponCode, couponData);
        if (!result.success) {
          setCouponError(result.error || (isRTL ? "كود الخصم غير صالح" : "Invalid coupon code"));
        } else {
          setCouponCode("");
        }
      } catch {
        setCouponError(isRTL ? "كود الخصم غير صالح" : "Invalid coupon code");
      } finally {
        setCouponLoading(false);
      }
    };

    const handleRemoveCoupon = async (code: string) => {
      try {
        await removeCoupon(code);
      } catch (error) {
        console.error("Failed to remove coupon:", error);
      }
    };

    const handleSelectCoupon = (code: string) => {
      setCouponCode(code);
    };

        const formatCouponDiscount = (coupon: PublicCoupon) => {
          if (coupon.discount_type === "percent") {
            return `${coupon.amount}%`;
          }
          return `${coupon.amount} ${currency}`;
        };

    const taxRate = useMemo(() => {
      const coCartSubtotal = parseFloat(cart?.totals?.subtotal || "0") || 0;
      const coCartShipping = parseFloat(cart?.totals?.shipping_total || "0") || 0;
      const coCartTotalTax = parseFloat(cart?.totals?.total_tax || "0") || 0;
      const taxableBase = coCartSubtotal + coCartShipping;
      return taxableBase > 0 ? coCartTotalTax / taxableBase : 0;
    }, [cart?.totals?.subtotal, cart?.totals?.shipping_total, cart?.totals?.total_tax]);

    const displayTax = useMemo(() => {
      if (shippingPackages.length > 0) {
        const subtotal = parseFloat(cartSubtotal) || 0;
        const shipping = parseFloat(shippingTotal) || 0;
        const discount = couponDiscount || 0;
        const newTaxableBase = subtotal - discount + shipping;
        return Math.round(newTaxableBase * taxRate);
      }
      return parseFloat(cart?.totals?.total_tax || "0") || 0;
    }, [cartSubtotal, shippingTotal, couponDiscount, taxRate, shippingPackages, cart?.totals?.total_tax]);

    const checkoutTotal = useMemo(() => {
      if (shippingPackages.length > 0) {
        const subtotal = parseFloat(cartSubtotal) || 0;
        const shipping = parseFloat(shippingTotal) || 0;
        const discount = couponDiscount || 0;
        return subtotal - discount + shipping + displayTax;
      }
      return parseFloat(cartTotal) || 0;
    }, [cartSubtotal, shippingTotal, couponDiscount, displayTax, shippingPackages, cartTotal]);

    const breadcrumbItems = [
    { name: isRTL ? "السلة" : "Cart", href: `/${locale}/cart` },
    { name: isRTL ? "الدفع" : "Checkout", href: `/${locale}/checkout` },
  ];

  const isNumericOnly = (value: string): boolean => {
    return /^[\d\s.,/-]+$/.test(value.trim());
  };

  const handleShippingChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
      billing: prev.sameAsShipping ? { ...prev.shipping, [field]: value } : prev.billing,
    }));
    setError(null);
    if (field === "address" && addressErrors.shippingAddress) {
      setAddressErrors((prev) => ({ ...prev, shippingAddress: undefined }));
    }
    if (field === "city" && addressErrors.shippingCity) {
      setAddressErrors((prev) => ({ ...prev, shippingCity: undefined }));
    }
  };

  const handleBillingChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billing: { ...prev.billing, [field]: value },
    }));
    setError(null);
    if (field === "address" && addressErrors.billingAddress) {
      setAddressErrors((prev) => ({ ...prev, billingAddress: undefined }));
    }
    if (field === "city" && addressErrors.billingCity) {
      setAddressErrors((prev) => ({ ...prev, billingCity: undefined }));
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsShipping: checked,
      billing: checked ? { ...prev.shipping } : prev.billing,
    }));
  };

  const handlePaymentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleNotesChange = (value: string) => {
    setFormData((prev) => ({ ...prev, orderNotes: value }));
  };

  // Check if email is registered (debounced)
  const checkEmailRegistration = useCallback(async (email: string) => {
    // Don't check if user is already authenticated
    if (isAuthenticated) {
      setIsEmailRegistered(false);
      setShowLoginPrompt(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setIsEmailRegistered(false);
      setShowLoginPrompt(false);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch(`/api/customer/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.success && data.data.isRegistered) {
        setIsEmailRegistered(true);
        // Auto-uncheck create account if email is already registered
        // This allows seamless guest checkout without extra clicks
        if (createAccount) {
          setCreateAccount(false);
          setAccountPassword("");
          setConfirmPassword("");
          setPasswordError(null);
        }
        setShowLoginPrompt(true);
      } else {
        setIsEmailRegistered(false);
        setShowLoginPrompt(false);
      }
    } catch (error) {
      console.error("Failed to check email registration:", error);
      setIsEmailRegistered(false);
      setShowLoginPrompt(false);
    } finally {
      setIsCheckingEmail(false);
    }
  }, [isAuthenticated, createAccount]);

  // Debounced email check when email changes
  useEffect(() => {
    const email = formData.shipping.email;
    
    // Clear any existing timeout
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    // Set a new timeout to check email after 500ms of no typing
    emailCheckTimeoutRef.current = setTimeout(() => {
      checkEmailRegistration(email);
    }, 500);

    // Cleanup on unmount
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, [formData.shipping.email, checkEmailRegistration]);

  const handleSelectSavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setShowAddressSelector(false);
    
    const addressFormData: AddressFormData = {
      firstName: address.first_name || "",
      lastName: address.last_name || "",
      address: address.address_1 || "",
      address2: address.address_2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postcode || "",
      country: resolveCountryCode(address.country),
      phone: address.phone || "",
      email: address.email || customerData?.email || "",
    };
    
    setFormData(prev => ({
      ...prev,
      shipping: addressFormData,
      billing: prev.sameAsShipping ? addressFormData : prev.billing,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setPasswordError(null);
    setAddressErrors({});

    try {
      const newAddressErrors: typeof addressErrors = {};
      if (formData.shipping.address && isNumericOnly(formData.shipping.address)) {
        newAddressErrors.shippingAddress = isRTL ? "يجب أن يحتوي العنوان على أحرف، ولا يمكن أن يكون أرقامًا فقط" : "Address must contain letters, not only numbers";
      }
      if (formData.shipping.city && isNumericOnly(formData.shipping.city)) {
        newAddressErrors.shippingCity = isRTL ? "يجب أن تحتوي المدينة على أحرف، ولا يمكن أن تكون أرقامًا فقط" : "City must contain letters, not only numbers";
      }
      if (!formData.sameAsShipping) {
        if (formData.billing.address && isNumericOnly(formData.billing.address)) {
          newAddressErrors.billingAddress = isRTL ? "يجب أن يحتوي العنوان على أحرف، ولا يمكن أن يكون أرقامًا فقط" : "Address must contain letters, not only numbers";
        }
        if (formData.billing.city && isNumericOnly(formData.billing.city)) {
          newAddressErrors.billingCity = isRTL ? "يجب أن تحتوي المدينة على أحرف، ولا يمكن أن تكون أرقامًا فقط" : "City must contain letters, not only numbers";
        }
      }
      if (Object.keys(newAddressErrors).length > 0) {
        setAddressErrors(newAddressErrors);
        setIsSubmitting(false);
        return;
      }

      // Validate password if creating account
      let newCustomerId: number | undefined;
      
      if (createAccount && !isAuthenticated) {
        // Validate passwords
        if (!accountPassword || accountPassword.length < 6) {
          setPasswordError(isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
          setIsSubmitting(false);
          return;
        }
        
        if (accountPassword !== confirmPassword) {
          setPasswordError(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
          setIsSubmitting(false);
          return;
        }
        
        // Create account
        setIsCreatingAccount(true);
        try {
          const customerResponse = await fetch("/api/customer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.shipping.email,
              username: formData.shipping.email,
              password: accountPassword,
              first_name: formData.shipping.firstName,
              last_name: formData.shipping.lastName,
              billing: {
                first_name: formData.shipping.firstName,
                last_name: formData.shipping.lastName,
                address_1: formData.shipping.address,
                address_2: formData.shipping.address2,
                city: formData.shipping.city,
                state: formData.shipping.state,
                postcode: formData.shipping.postalCode,
                country: formData.shipping.country,
                email: formData.shipping.email,
                phone: formData.shipping.phone,
              },
              shipping: {
                first_name: formData.shipping.firstName,
                last_name: formData.shipping.lastName,
                address_1: formData.shipping.address,
                address_2: formData.shipping.address2,
                city: formData.shipping.city,
                state: formData.shipping.state,
                postcode: formData.shipping.postalCode,
                country: formData.shipping.country,
                phone: formData.shipping.phone,
              },
            }),
          });
          
          const customerData = await customerResponse.json();
          
          if (!customerData.success) {
            const errorMessage = customerData.error?.message || (isRTL ? "فشل إنشاء الحساب" : "Failed to create account");
            setPasswordError(errorMessage);
            setIsSubmitting(false);
            setIsCreatingAccount(false);
            return;
          }
          
          newCustomerId = customerData.data?.id;
        } catch {
          setPasswordError(isRTL ? "حدث خطأ أثناء إنشاء الحساب" : "An error occurred while creating account");
          setIsSubmitting(false);
          setIsCreatingAccount(false);
          return;
        }
        setIsCreatingAccount(false);
      }

      // Create line items with price information to ensure bundle totals are correct
      // The subtotal/total from cart items include the full bundle price (box + bundled items)
      const lineItems = cartItems.map((item) => {
        const lineItem: {
          product_id: number;
          quantity: number;
          variation_id?: number;
          subtotal?: string;
          total?: string;
          meta_data?: Array<{ key: string; value: string }>;
        } = {
          product_id: item.id,
          quantity: item.quantity.value,
          variation_id: item.variation_id || undefined,
        };

        // Check if this is a bundle product and calculate correct total
        const bundleItems = getBundleItems(item);
        const isBundleProduct = bundleItems && bundleItems.length > 0;
        
        if (isBundleProduct) {
          // For bundle products, calculate the correct total based on pricing mode
          // CoCart only knows about the base WooCommerce product price, not the bundled items
          const bundleItemsTotal = getBundleItemsTotal(bundleItems);
          const boxPrice = getBoxPrice(item);
          const pricingMode = getPricingMode(item);
          const fixedPrice = getFixedPrice(item);
          const storedBundleTotal = getBundleTotal(item);
          
          // Calculate the correct bundle total per item based on pricing mode
          let correctBundleTotal: number;
          
          if (pricingMode === "fixed") {
            correctBundleTotal = fixedPrice || storedBundleTotal || boxPrice || 0;
          } else {
            const cartItemPriceAED = parseFloat(item.price) / divisor;
            correctBundleTotal = cartItemPriceAED > 0 ? cartItemPriceAED : bundleItemsTotal + (boxPrice || 0);
          }
          
          correctBundleTotal = convertPrice(correctBundleTotal);
          
          // Multiply by quantity for the line item total
          const quantity = item.quantity?.value || 1;
          const lineItemTotal = correctBundleTotal * quantity;
          
          lineItem.subtotal = lineItemTotal.toFixed(getCurrencyInfo().decimals);
          lineItem.total = lineItemTotal.toFixed(getCurrencyInfo().decimals);
          
          const metaData: Array<{ key: string; value: string }> = [];
          
          // Add structured bundle data for frontend order display (OrderBundleItemsList)
          // This allows the order details page to show the bundle breakdown
          metaData.push({
            key: "_bundle_items",
            value: JSON.stringify(bundleItems),
          });
          
          // Add box price as structured data for frontend
          if (boxPrice && boxPrice > 0) {
            metaData.push({
              key: "_box_price",
              value: boxPrice.toString(),
            });
          }
          
          // Add pricing mode for frontend order display
          metaData.push({
            key: "_pricing_mode",
            value: pricingMode,
          });
          
          // Add fixed price if applicable
          if (pricingMode === "fixed" && fixedPrice) {
            metaData.push({
              key: "_fixed_price",
              value: fixedPrice.toString(),
            });
          }
          
          // Add each bundle item as a separate meta entry for better display in WooCommerce admin
          bundleItems.forEach((bundleItem, index) => {
            const itemName = bundleItem.name || `Product #${bundleItem.product_id}`;
            const itemQty = bundleItem.quantity || 1;
            const itemPrice = typeof bundleItem.price === "string" 
              ? parseFloat(bundleItem.price) 
              : (bundleItem.price || 0);
            
                        // Format: "Product Name x1 - 145.00 USD"
                        const displayValue = itemPrice > 0 
                          ? `${itemName} x${itemQty} - ${itemPrice.toFixed(2)} ${currency}`
                          : `${itemName} x${itemQty}`;
            
            metaData.push({
              key: bundleItem.is_addon ? `Add-on ${index + 1}` : `Bundled Product ${index + 1}`,
              value: displayValue,
            });
          });
          
                    // Add human-readable totals for WooCommerce admin
                    if (bundleItemsTotal > 0) {
                      metaData.push({
                        key: "Items Total",
                        value: `${bundleItemsTotal.toFixed(2)} ${currency}`,
                      });
                    }
          
                    if (boxPrice && boxPrice > 0) {
                      metaData.push({
                        key: "Box Price",
                        value: `${boxPrice.toFixed(2)} ${currency}`,
                      });
                    }
          
          lineItem.meta_data = metaData;
        }

        if (!lineItem.subtotal) {
          const unitPrice = convertPrice(parseFloat(item.price) / divisor);
          const qty = item.quantity?.value || 1;
          const lineTotal = unitPrice * qty;
          lineItem.subtotal = lineTotal.toFixed(getCurrencyInfo().decimals);
          lineItem.total = lineTotal.toFixed(getCurrencyInfo().decimals);
        }

        return lineItem;
      });

      const billingData= formData.sameAsShipping ? formData.shipping : formData.billing;

      const couponLines = selectedCoupons.map(coupon => ({ code: coupon.code }));

      const shippingLines: Array<{ method_id: string; method_title: string; total: string }> = [];
      if (selectedShippingRate && shippingPackages.length > 0) {
        const allRates = shippingPackages.flatMap((pkg) => pkg.shipping_rates || []);
        const selectedRate = allRates.find((rate) => rate.rate_id === selectedShippingRate);
        if (selectedRate) {
          shippingLines.push({
            method_id: selectedRate.method_id,
            method_title: selectedRate.name,
            total: convertPrice(parseFloat(shippingTotal) / 100).toFixed(getCurrencyInfo().decimals),
          });
        }
      }

      const billingEmail = billingData.email || formData.shipping.email || (isAuthenticated && user?.user_email ? user.user_email : "");

      const orderPayload = {
        payment_method: formData.paymentMethod,
        currency: currency || "AED",
        billing: {
          first_name: billingData.firstName,
          last_name: billingData.lastName,
          address_1: billingData.address,
          address_2: billingData.address2,
          city: billingData.city,
          state: billingData.state,
          postcode: billingData.postalCode,
          country: billingData.country,
          email: billingEmail,
          phone: billingData.phone || formData.shipping.phone,
        },
        shipping: {
          first_name: formData.shipping.firstName,
          last_name: formData.shipping.lastName,
          address_1: formData.shipping.address,
          address_2: formData.shipping.address2,
          city: formData.shipping.city,
          state: formData.shipping.state,
          postcode: formData.shipping.postalCode,
          country: formData.shipping.country,
          phone: formData.shipping.phone,
        },
        line_items: lineItems,
        shipping_lines: shippingLines,
        coupon_lines: couponLines,
        customer_note: formData.orderNotes,
        ...(isAuthenticated && user?.user_id ? { customer_id: user.user_id } : newCustomerId ? { customer_id: newCustomerId } : {}),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to create order");
      }

            // Check payment method type and handle accordingly
            const isMyFatoorahPayment = formData.paymentMethod.startsWith("myfatoorah");
            const isTabbyPayment = formData.paymentMethod.startsWith("tabby");
            const isTamaraPayment = formData.paymentMethod.startsWith("tamara");
            const isExternalPayment = isMyFatoorahPayment || isTabbyPayment || isTamaraPayment;

            // Only clear cart for non-external payment methods (like COD)
            // For external payments, cart will be cleared in order-confirmation after payment is verified
            // Note: We don't await clearCart() to avoid blocking the redirect if the cart API is slow
            // The order is already created successfully, so we should redirect immediately
            if (!isExternalPayment) {
              if (clearCart) {
                clearCart().catch((err) => console.error("Failed to clear cart:", err));
              }
              clearSelectedCoupons();
            }
      
            const billingInfo = formData.sameAsShipping ? formData.shipping : formData.billing;
            const baseUrl = window.location.origin;
            
            // Use the order total from WooCommerce as the source of truth for payment amount
            // This ensures the payment gateway receives the exact amount calculated by the backend
            // and avoids any potential mismatch between frontend and backend calculations
            const orderTotal = parseFloat(data.order?.total) || 0;
            
            // Calculate frontend amount for comparison/logging purposes
            const cartTotalInMinorUnits = parseFloat(cartTotal) || 0;
            const frontendPaymentAmount = (cartTotalInMinorUnits / divisor) - couponDiscount;
            
            // Use the WooCommerce order total as the payment amount (rounded to 2 decimal places)
            const paymentAmount = Math.round(orderTotal * 100) / 100;
            
            // Log if there's a significant difference between frontend and backend calculations
            // This helps identify potential pricing discrepancies for debugging
            const amountDifference = Math.abs(paymentAmount - frontendPaymentAmount);
            if (amountDifference > 0.01) {
              console.warn("Payment amount mismatch detected:", {
                frontendAmount: frontendPaymentAmount,
                backendAmount: paymentAmount,
                difference: amountDifference,
                orderId: data.order_id,
              });
            }
      
            if (isMyFatoorahPayment) {
              // Initiate MyFatoorah payment (redirect flow)
              const mfResponse = await fetch("/api/myfatoorah/initiate-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  order_id: data.order_id,
                  order_key: data.order_key,
                  invoice_value: paymentAmount,
                  customer_name: `${billingInfo.firstName} ${billingInfo.lastName}`,
                  customer_email: billingInfo.email || formData.shipping.email,
                  customer_phone: billingInfo.phone || formData.shipping.phone,
                  currency_iso: data.order?.currency || "KWD",
                  language: locale === "ar" ? "ar" : "en",
                  callback_url: `${baseUrl}/${locale}/order-confirmation`,
                  error_url: `${baseUrl}/${locale}/order-confirmation`,
                }),
              });

              const mfData = await mfResponse.json();

              if (mfData.success && mfData.payment_url) {
                // Redirect to MyFatoorah payment page
                window.location.href = mfData.payment_url;
              } else {
                throw new Error(mfData.error?.message || "Failed to initiate MyFatoorah payment");
              }
            } else if (isTabbyPayment) {
              // Initiate Tabby payment directly
              const tabbyResponse = await fetch("/api/tabby/create-session", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  order_id: data.order_id,
                  order_key: data.order_key,
                  amount: paymentAmount,
                  currency: data.order?.currency || "AED",
                  description: `Order #${data.order_id}`,
                  buyer: {
                    name: `${billingInfo.firstName} ${billingInfo.lastName}`,
                    email: billingInfo.email || formData.shipping.email,
                    phone: billingInfo.phone || formData.shipping.phone,
                  },
                  shipping_address: {
                    city: formData.shipping.city,
                    address: formData.shipping.address,
                    zip: formData.shipping.postalCode,
                  },
                  order_items: cartItems.map((item) => ({
                    title: item.name,
                    quantity: item.quantity.value,
                    unit_price: parseFloat(item.totals.subtotal) / item.quantity.value / 100,
                    category: "General",
                  })),
                  language: locale === "ar" ? "ar" : "en",
                  success_url: `${baseUrl}/${locale}/order-confirmation`,
                  cancel_url: `${baseUrl}/${locale}/order-confirmation`,
                  failure_url: `${baseUrl}/${locale}/order-confirmation`,
                }),
              });

              const tabbyData = await tabbyResponse.json();

              if (tabbyData.success && tabbyData.payment_url) {
                window.location.href = tabbyData.payment_url;
              } else {
                throw new Error(tabbyData.error?.message || "Failed to initiate Tabby payment");
              }
            } else if (isTamaraPayment) {
              // Initiate Tamara payment directly
              const tamaraResponse = await fetch("/api/tamara/create-checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  order_id: data.order_id,
                  order_key: data.order_key,
                  total_amount: paymentAmount,
                  currency: data.order?.currency || "AED",
                  country_code: formData.shipping.country || "AE",
                  locale: locale === "ar" ? "ar_SA" : "en_US",
                  consumer: {
                    first_name: billingInfo.firstName,
                    last_name: billingInfo.lastName,
                    email: billingInfo.email || formData.shipping.email,
                    phone_number: billingInfo.phone || formData.shipping.phone,
                  },
                  billing_address: {
                    first_name: billingInfo.firstName,
                    last_name: billingInfo.lastName,
                    line1: billingInfo.address,
                    city: billingInfo.city,
                    country_code: billingInfo.country || "AE",
                    phone_number: billingInfo.phone,
                  },
                  shipping_address: {
                    first_name: formData.shipping.firstName,
                    last_name: formData.shipping.lastName,
                    line1: formData.shipping.address,
                    city: formData.shipping.city,
                    country_code: formData.shipping.country || "AE",
                    phone_number: formData.shipping.phone,
                  },
                  items: cartItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity.value,
                    unit_price: parseFloat(item.totals.subtotal) / item.quantity.value / 100,
                    sku: item.id?.toString() || "",
                  })),
                  success_url: `${baseUrl}/${locale}/order-confirmation`,
                  failure_url: `${baseUrl}/${locale}/order-confirmation`,
                  cancel_url: `${baseUrl}/${locale}/order-confirmation`,
                }),
              });

              const tamaraData = await tamaraResponse.json();

              if (tamaraData.success && tamaraData.checkout_url) {
                window.location.href = tamaraData.checkout_url;
              } else {
                throw new Error(tamaraData.error?.message || "Failed to initiate Tamara payment");
              }
            } else if (data.payment_url) {
              window.location.href = data.payment_url;
            } else {
              router.push(`/${locale}/order-confirmation?order_id=${data.order_id}&order_key=${data.order_key}`);
            }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while placing your order");
      setIsSubmitting(false);
    }
  };

  return (
                <div className="min-h-screen pb-32 md:pb-8 overflow-x-clip" style={{ backgroundColor: '#FAFAFA' }}>
                  <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">

        {/* Modern User Status Card */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-semibold ${isAuthenticated ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
              {isAuthenticated ? (user?.user_email?.charAt(0).toUpperCase() || 'U') : 'G'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isAuthenticated ? user?.user_email : (isRTL ? "ضيف" : "Guest")}
              </p>
              <p className="text-xs text-gray-500">
                {isAuthenticated 
                  ? (isRTL ? "حساب مسجل" : "Registered account")
                  : (isRTL ? "الدفع كضيف" : "Checkout as guest")}
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-emerald-700">{isRTL ? "متصل" : "Connected"}</span>
            </div>
          )}
        </div>

        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

        {error && (
          <div className="mb-6 rounded-lg border border-black/10 bg-white p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Payment Error from Gateway Redirect */}
        {isVerifyingPayment && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
              <span className="text-blue-700">
                {isRTL ? "جاري التحقق من حالة الدفع..." : "Verifying payment status..."}
              </span>
            </div>
          </div>
        )}

        {paymentError && !isVerifyingPayment && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  {isRTL ? "فشل الدفع" : "Payment Failed"}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {paymentError}
                </p>
                <p className="mt-2 text-sm text-red-600">
                  {isRTL ? "يرجى التحقق من تفاصيل الدفع والمحاولة مرة أخرى." : "Please check your payment details and try again."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

              {isLoadingCustomer && (
                <div className="mb-6 flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                  <span className="ml-2 text-gray-600">{isRTL ? "جاري تحميل بياناتك..." : "Loading your data..."}</span>
                </div>
              )}

              {/* Empty Cart Message with Auto-Redirect */}
              {isEmptyCart && emptyCartCountdown !== null && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    {isRTL ? "سلة التسوق فارغة" : "Your cart is empty"}
                  </h2>
                  <p className="mb-4 text-gray-600">
                    {isRTL 
                      ? "لا يمكنك المتابعة للدفع بدون منتجات في السلة." 
                      : "You cannot proceed to checkout without any products in your cart."}
                  </p>
                  <p className="text-sm text-amber-700">
                    {isRTL 
                      ? `سيتم توجيهك إلى الصفحة الرئيسية خلال ${emptyCartCountdown} ثانية...` 
                      : `Redirecting to home page in ${emptyCartCountdown} seconds...`}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}`)}
                    className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    {isRTL ? "العودة للرئيسية الآن" : "Go to Home Now"}
                  </button>
                </div>
              )}

            {!isEmptyCart && (
            <form id="checkout-form" onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white shadow-sm">1</span>
                              {isRTL ? "معلومات الاتصال" : "Contact Information"}
                            </h2>
              <div className={`grid gap-4 ${isAuthenticated ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
                {!isAuthenticated && (
                <div className="relative">
                  <Input
                    label={isRTL ? "البريد الإلكتروني" : "Email"}
                    type="email"
                    required
                    value={formData.shipping.email}
                    onChange={(e) => handleShippingChange("email", e.target.value)}
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-9 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  )}
                </div>
                )}
                <PhoneInput
                  label={isRTL ? "رقم الهاتف" : "Phone"}
                  required
                  value={formData.shipping.phone}
                  onChange={(phone) => handleShippingChange("phone", phone)}
                  countryCode={formData.shipping.country}
                  isRTL={isRTL}
                />
              </div>
              
              {/* Login Prompt for Registered Email */}
              {showLoginPrompt && !isAuthenticated && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-800">
                        {isRTL ? "هذا البريد الإلكتروني مسجل بالفعل" : "This email is already registered"}
                      </h3>
                      <p className="mt-1 text-sm text-amber-700">
                        {isRTL 
                          ? "يرجى تسجيل الدخول لربط هذا الطلب بحسابك وتتبع طلباتك بسهولة."
                          : "Please log in to link this order to your account and easily track your orders."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/checkout`)}`)}
                        >
                          {isRTL ? "تسجيل الدخول" : "Log In"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLoginPrompt(false)}
                        >
                          {isRTL ? "المتابعة كضيف" : "Continue as Guest"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Create Account Option - Only for guest users with unregistered email */}
              {!isAuthenticated && !isEmailRegistered && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="create-account"
                      checked={createAccount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCreateAccount(checked);
                        if (!checked) {
                          setAccountPassword("");
                          setConfirmPassword("");
                          setPasswordError(null);
                        }
                      }}
                    />
                    <div className="flex-1">
                      <label htmlFor="create-account" className="cursor-pointer text-sm font-medium text-gray-900">
                        {isRTL ? "إنشاء حساب لتتبع طلباتك" : "Create an account to track your orders"}
                      </label>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {isRTL ? "يمكنك تتبع طلباتك وحفظ عناوينك" : "Track your orders and save your addresses"}
                      </p>
                    </div>
                  </div>
                  
                  {createAccount && (
                    <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                      {passwordError && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                          {passwordError}
                        </div>
                      )}
                      {isCreatingAccount && (
                        <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-600">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
                          {isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}
                        </div>
                      )}
                      <Input
                        label={isRTL ? "كلمة المرور" : "Password"}
                        type="password"
                        required={createAccount}
                        value={accountPassword}
                        onChange={(e) => {
                          setAccountPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        placeholder={isRTL ? "أدخل كلمة المرور" : "Enter password"}
                        disabled={isCreatingAccount}
                      />
                      <Input
                        label={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                        type="password"
                        required={createAccount}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                        disabled={isCreatingAccount}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white shadow-sm">2</span>
                              {isRTL ? "عنوان الشحن" : "Delivery"}
                            </h2>

              {/* Show saved addresses selector for authenticated users */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full rounded-lg border border-black/10 bg-gray-50 p-4 text-left hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      onClick={() => setShowAddressSelector(!showAddressSelector)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedAddressId 
                                ? savedAddresses.find(a => a.id === selectedAddressId)?.label || (isRTL ? "العنوان المحدد" : "Selected Address")
                                : (isRTL ? "اختر عنوان محفوظ" : "Select a saved address")}
                            </p>
                            {selectedAddressId && (
                              <p className="mt-1 text-sm text-gray-600">
                                {(() => {
                                  const addr = savedAddresses.find(a => a.id === selectedAddressId);
                                  if (!addr) return "";
                                  return `${addr.first_name} ${addr.last_name}${addr.address_1 ? `, ${addr.address_1}` : ""}${addr.city ? `, ${addr.city}` : ""}`;
                                })()}
                              </p>
                            )}
                          </div>
                        </div>
                        {showAddressSelector ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </button>
                    
                    {showAddressSelector && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-lg max-h-64 overflow-y-auto">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              selectedAddressId === address.id ? "bg-gray-50" : ""
                            }`}
                            onClick={() => handleSelectSavedAddress(address)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{address.label}</p>
                                  {address.is_default && (
                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                      {isRTL ? "افتراضي" : "Default"}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {address.first_name} {address.last_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {address.address_1}
                                  {address.city && `, ${address.city}`}
                                  {address.country && `, ${address.country}`}
                                </p>
                              </div>
                              {selectedAddressId === address.id && (
                                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={isRTL ? "الاسم الأول" : "First Name"}
                  required
                  value={formData.shipping.firstName}
                  onChange={(e) => handleShippingChange("firstName", e.target.value)}
                />
                <Input
                  label={isRTL ? "اسم العائلة" : "Last Name"}
                  required
                  value={formData.shipping.lastName}
                  onChange={(e) => handleShippingChange("lastName", e.target.value)}
                />
                <div className="sm:col-span-2">
                  <Input
                    label={isRTL ? "العنوان" : "Address"}
                    required
                    value={formData.shipping.address}
                    onChange={(e) => handleShippingChange("address", e.target.value)}
                    error={addressErrors.shippingAddress}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label={isRTL ? "العنوان (سطر 2)" : "Address Line 2"}
                    value={formData.shipping.address2}
                    onChange={(e) => handleShippingChange("address2", e.target.value)}
                    placeholder={isRTL ? "شقة، جناح، وحدة، إلخ. (اختياري)" : "Apartment, suite, unit, etc. (optional)"}
                  />
                </div>
                <Input
                  label={isRTL ? "المدينة" : "City"}
                  required
                  value={formData.shipping.city}
                  onChange={(e) => handleShippingChange("city", e.target.value)}
                  error={addressErrors.shippingCity}
                />
                <Input
                  label={isRTL ? "المنطقة" : "State/Province"}
                  value={formData.shipping.state}
                  onChange={(e) => handleShippingChange("state", e.target.value)}
                />
                <Input
                  label={isRTL ? "الرمز البريدي" : "Postal Code"}
                  value={formData.shipping.postalCode}
                  onChange={(e) => handleShippingChange("postalCode", e.target.value)}
                />
                <CountrySelect
                  label={isRTL ? "الدولة" : "Country"}
                  required
                  value={formData.shipping.country}
                  onChange={(value) => handleShippingChange("country", value)}
                  isRTL={isRTL}
                  availableCountries={shippingCountries}
                />
              </div>
            </div>

            {/* Shipping Method Selection */}
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white shadow-sm">3</span>
                {isRTL ? "طريقة الشحن" : "Shipping Method"}
              </h2>
              
              {isLoadingShipping ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                  <span className="ml-2 text-gray-600">{isRTL ? "جاري تحميل طرق الشحن..." : "Loading shipping methods..."}</span>
                </div>
              ) : shippingPackages.length === 0 || shippingPackages.every(pkg => !pkg.shipping_rates || pkg.shipping_rates.length === 0) ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    {isRTL 
                      ? "يرجى إدخال عنوان الشحن لعرض طرق الشحن المتاحة" 
                      : "Please enter your shipping address to see available shipping methods"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingPackages.map((pkg) => (
                    <div key={pkg.package_id}>
                      {pkg.shipping_rates && pkg.shipping_rates.map((rate) => {
                        const ratePrice = parseFloat(rate.price) / Math.pow(10, rate.currency_minor_unit || 2);
                        const isSelected = selectedShippingRate === rate.rate_id;
                        
                        return (
                          <div
                            key={rate.rate_id}
                            className={`rounded-lg border p-4 transition-colors ${
                              rate.method_id === "free_shipping" && rate.free_shipping_eligible === false
                                ? "border-black/5 bg-gray-50/50 opacity-60"
                                : isSelected
                                  ? "border-gray-900 bg-gray-50 cursor-pointer"
                                  : "border-black/10 hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (rate.method_id === "free_shipping" && rate.free_shipping_eligible === false) return;
                              handleSelectShippingRate(rate.rate_id, pkg.package_id);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <Truck className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <Radio
                                  name="shipping_method"
                                  value={rate.rate_id}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (rate.method_id === "free_shipping" && rate.free_shipping_eligible === false) return;
                                    handleSelectShippingRate(rate.rate_id, pkg.package_id);
                                  }}
                                  label={rate.name}
                                  description={rate.delivery_time || rate.description || ""}
                                  disabled={rate.method_id === "free_shipping" && rate.free_shipping_eligible === false}
                                />
                                {rate.method_id === "free_shipping" && rate.free_shipping_min_amount && rate.free_shipping_min_amount > 0 && (
                                  <p className={`mt-1 text-xs ${
                                    rate.free_shipping_eligible === false ? "text-amber-600" : "text-green-600"
                                  }`}>
                                    {rate.free_shipping_eligible === false
                                      ? (isRTL
                                          ? `الحد الأدنى للشراء ${rate.free_shipping_min_amount} ${rate.currency_code}`
                                          : `Minimum purchase of ${rate.free_shipping_min_amount} ${rate.currency_code} required`)
                                      : (isRTL
                                          ? `الحد الأدنى للشراء ${rate.free_shipping_min_amount} ${rate.currency_code} - تم الاستيفاء!`
                                          : `Minimum purchase of ${rate.free_shipping_min_amount} ${rate.currency_code} met!`)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                {ratePrice === 0 ? (
                                  <span className={`font-semibold ${
                                    rate.method_id === "free_shipping" && rate.free_shipping_eligible === false
                                      ? "text-gray-400"
                                      : "text-green-600"
                                  }`}>
                                    {isRTL ? "مجاني" : "Free"}
                                  </span>
                                ) : (
                                  <FormattedPrice
                                    price={ratePrice}
                                    className="font-semibold"
                                    iconSize="xs"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing Address */}
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white shadow-sm">4</span>
                                  {isRTL ? "عنوان الفاتورة" : "Billing Address"}
                                </h2>
                <button
                  type="button"
                  onClick={() => setShowBillingSection(!showBillingSection)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showBillingSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* Same as shipping checkbox */}
              <div className="rounded-lg border border-black/10 p-4 hover:bg-gray-50 transition-colors">
                <Checkbox
                  checked={formData.sameAsShipping}
                  onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                  label={isRTL ? "نفس عنوان الشحن" : "Same as shipping address"}
                />
              </div>

              {/* Billing address form - only show if not same as shipping */}
              {(!formData.sameAsShipping || showBillingSection) && !formData.sameAsShipping && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label={isRTL ? "الاسم الأول" : "First Name"}
                    required
                    value={formData.billing.firstName}
                    onChange={(e) => handleBillingChange("firstName", e.target.value)}
                  />
                  <Input
                    label={isRTL ? "اسم العائلة" : "Last Name"}
                    required
                    value={formData.billing.lastName}
                    onChange={(e) => handleBillingChange("lastName", e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label={isRTL ? "العنوان" : "Address"}
                      required
                      value={formData.billing.address}
                      onChange={(e) => handleBillingChange("address", e.target.value)}
                      error={addressErrors.billingAddress}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label={isRTL ? "العنوان (سطر 2)" : "Address Line 2"}
                      value={formData.billing.address2}
                      onChange={(e) => handleBillingChange("address2", e.target.value)}
                      placeholder={isRTL ? "شقة، جناح، وحدة، إلخ. (اختياري)" : "Apartment, suite, unit, etc. (optional)"}
                    />
                  </div>
                  <Input
                    label={isRTL ? "المدينة" : "City"}
                    required
                    value={formData.billing.city}
                    onChange={(e) => handleBillingChange("city", e.target.value)}
                    error={addressErrors.billingCity}
                  />
                  <Input
                    label={isRTL ? "المنطقة" : "State/Province"}
                    value={formData.billing.state}
                    onChange={(e) => handleBillingChange("state", e.target.value)}
                  />
                  <Input
                    label={isRTL ? "الرمز البريدي" : "Postal Code"}
                    value={formData.billing.postalCode}
                    onChange={(e) => handleBillingChange("postalCode", e.target.value)}
                  />
                  <CountrySelect
                    label={isRTL ? "الدولة" : "Country"}
                    required
                    value={formData.billing.country}
                    onChange={(value) => handleBillingChange("country", value)}
                    isRTL={isRTL}
                  />
                  <PhoneInput
                    label={isRTL ? "رقم الهاتف" : "Phone"}
                    value={formData.billing.phone}
                    onChange={(phone) => handleBillingChange("phone", phone)}
                    countryCode={formData.billing.country}
                    isRTL={isRTL}
                  />
                  <Input
                    label={isRTL ? "البريد الإلكتروني" : "Email"}
                    type="email"
                    value={formData.billing.email}
                    onChange={(e) => handleBillingChange("email", e.target.value)}
                  />
                </div>
              )}
            </div>

                        {/* Payment Method */}
                        <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
                                        <h2 className="mb-5 flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white shadow-sm">5</span>
                                          {isRTL ? "طريقة الدفع" : "Payment Method"}
                                        </h2>
                          
                          {/* MyFatoorah Test Mode Banner */}
                          {isMyFatoorahTestMode && (
                            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3">
                              <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-sm font-medium text-amber-800">
                                  {isRTL ? "وضع الاختبار - لن يتم خصم أي مبالغ حقيقية" : "Test Mode - No real charges will be made"}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            {isLoadingGateways ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                                <span className="ml-2 text-gray-600">{isRTL ? "جاري تحميل طرق الدفع..." : "Loading payment methods..."}</span>
                              </div>
                            ) : filteredPaymentGateways.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                {isRTL ? "لا توجد طرق دفع متاحة" : "No payment methods available"}
                              </div>
                            ) : (
                              filteredPaymentGateways.map((gateway) => {
                                                                const getGatewayLabel = (id: string, title: string) => {
                                                                  const labels: Record<string, { en: string; ar: string }> = {
                                                                    tabby_installments: { en: "Pay with Tabby", ar: "الدفع مع تابي" },
                                                                    tabby_checkout: { en: "Pay with Tabby", ar: "الدفع مع تابي" },
                                                                    tabby: { en: "Pay with Tabby", ar: "الدفع مع تابي" },
                                                                    tamara: { en: "Tamara - Buy Now Pay Later", ar: "تمارا - اشترِ الآن وادفع لاحقاً" },
                                                                    "tamara-gateway": { en: "Tamara - Buy Now Pay Later", ar: "تمارا - اشترِ الآن وادفع لاحقاً" },
                                                                    bacs: { en: "Bank Transfer", ar: "تحويل بنكي" },
                                                                    cheque: { en: "Check Payment", ar: "الدفع بشيك" },
                                                                    paypal: { en: "PayPal", ar: "باي بال" },
                                                                    stripe: { en: "Credit Card", ar: "بطاقة ائتمان" },
                                                                    card: { en: "Credit Card", ar: "بطاقة ائتمان" },
                                                                    myfatoorah_v2: { en: "Credit/Debit Card", ar: "بطاقة ائتمان/خصم" },
                                                                    myfatoorah: { en: "Credit/Debit Card", ar: "بطاقة ائتمان/خصم" },
                                                                    myfatoorah_cards: { en: "Credit/Debit Card", ar: "بطاقة ائتمان/خصم" },
                                                                    myfatoorah_embedded: { en: "Credit/Debit Card", ar: "بطاقة ائتمان/خصم" },
                                                                  };
                                                                  return labels[id]?.[isRTL ? "ar" : "en"] || title;
                                                                };

                                                                const getGatewayDescription = (id: string, description: string) => {
                                                                  const descriptions: Record<string, { en: string; ar: string }> = {
                                                                    tabby_installments: { en: "Split your payment into 4 interest-free installments", ar: "قسّم دفعتك إلى 4 أقساط بدون فوائد" },
                                                                    tabby_checkout: { en: "Split your payment into 4 interest-free installments", ar: "قسّم دفعتك إلى 4 أقساط بدون فوائد" },
                                                                    tabby: { en: "Split your payment into 4 interest-free installments", ar: "قسّم دفعتك إلى 4 أقساط بدون فوائد" },
                                                                    tamara: { en: "Pay in easy installments with Tamara", ar: "ادفع بأقساط سهلة مع تمارا" },
                                                                    "tamara-gateway": { en: "Pay in easy installments with Tamara", ar: "ادفع بأقساط سهلة مع تمارا" },
                                                                    bacs: { en: "Make payment directly to our bank account", ar: "قم بالدفع مباشرة إلى حسابنا البنكي" },
                                                                    cheque: { en: "Pay with a check", ar: "الدفع بشيك" },
                                                                    paypal: { en: "Pay securely with PayPal", ar: "ادفع بأمان مع باي بال" },
                                                                    stripe: { en: "Pay securely with your card", ar: "ادفع بأمان ببطاقتك" },
                                                                    card: { en: "Pay securely with your card", ar: "ادفع بأمان ببطاقتك" },
                                                                    myfatoorah_v2: { en: "Pay securely with KNET, VISA, Mastercard, MADA, Apple Pay", ar: "ادفع بأمان عبر كي نت، فيزا، ماستركارد، مدى، أبل باي" },
                                                                    myfatoorah: { en: "Pay securely with KNET, VISA, Mastercard, MADA, Apple Pay", ar: "ادفع بأمان عبر كي نت، فيزا، ماستركارد، مدى، أبل باي" },
                                                                    myfatoorah_cards: { en: "Pay securely with KNET, VISA, Mastercard, MADA, Apple Pay", ar: "ادفع بأمان عبر كي نت، فيزا، ماستركارد، مدى، أبل باي" },
                                                                    myfatoorah_embedded: { en: "Pay securely with KNET, VISA, Mastercard, MADA, Apple Pay", ar: "ادفع بأمان عبر كي نت، فيزا، ماستركارد، مدى، أبل باي" },
                                                                  };
                                                                  return descriptions[id]?.[isRTL ? "ar" : "en"] || description || "";
                                                                };

                                                                const getGatewayIcon = (id: string) => {
                                                                  if (id === "tabby" || id === "tabby_installments" || id === "tabby_checkout") {
                                                                    return (
                                                                      <Image
                                                                        src="/images/payment/tabby.png"
                                                                        alt="Tabby"
                                                                        width={60}
                                                                        height={32}
                                                                        className="h-8 w-auto object-contain"
                                                                      />
                                                                    );
                                                                  }
                                                                  if (id === "tamara" || id === "tamara-gateway" || id.startsWith("tamara")) {
                                                                    return (
                                                                      <Image
                                                                        src="/images/payment/tamara.png"
                                                                        alt="Tamara"
                                                                        width={60}
                                                                        height={32}
                                                                        className="h-8 w-auto object-contain"
                                                                      />
                                                                    );
                                                                  }
                                                                  if (id === "myfatoorah_v2" || id === "myfatoorah" || id === "myfatoorah_cards" || id === "myfatoorah_embedded") {
                                                                    return (
                                                                      <Image
                                                                        src="/images/payment/credit-debit-card.png"
                                                                        alt="Credit/Debit Card"
                                                                        width={80}
                                                                        height={32}
                                                                        className="h-8 w-auto object-contain"
                                                                      />
                                                                    );
                                                                  }
                                  if (id === "paypal") {
                                    return (
                                      <div className="flex h-8 w-12 items-center justify-center rounded bg-[#003087] px-1">
                                        <span className="text-xs font-bold text-white">PayPal</span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                      <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                      </svg>
                                    </div>
                                  );
                                };

                                return (
                                  <div
                                    key={gateway.id}
                                    className={`rounded-lg border p-4 transition-colors cursor-pointer ${
                                      formData.paymentMethod === gateway.id
                                        ? "border-gray-900 bg-gray-50"
                                        : "border-black/10 hover:bg-gray-50"
                                    }`}
                                    onClick={() => handlePaymentChange(gateway.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      {getGatewayIcon(gateway.id)}
                                      <div className="flex-1">
                                        <Radio
                                          name="payment"
                                          value={gateway.id}
                                          checked={formData.paymentMethod === gateway.id}
                                          onChange={(e) => handlePaymentChange(e.target.value)}
                                          label={getGatewayLabel(gateway.id, gateway.title)}
                                          description={getGatewayDescription(gateway.id, gateway.description)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

            {/* Order Notes */}
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white shadow-sm">6</span>
                              {isRTL ? "ملاحظات الطلب" : "Order Notes"}
                            </h2>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                rows={4}
                placeholder={
                  isRTL
                    ? "ملاحظات إضافية حول طلبك (اختياري)"
                    : "Additional notes about your order (optional)"
                }
                value={formData.orderNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
                            <h2 className="mb-5 text-base md:text-lg font-semibold text-gray-900">
                              {isRTL ? "ملخص الطلب" : "Order Summary"}
                            </h2>

                            {/* Cart Items with Thumbnails */}
                            <div className="space-y-4 border-b border-gray-100 pb-4 md:max-h-80 md:overflow-y-auto">
                                {cartItems.map((item, index) => (
                                  <div key={item.item_key} className="flex items-center gap-3">
                                    {/* Product Thumbnail */}
                                    <div className="relative h-16 w-16 flex-shrink-0">
                                      <div className="h-full w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                      {item.featured_image ? (
                                        <Image
                                          src={item.featured_image}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                          sizes="64px"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}
                                      </div>
                                      {/* Item Number Badge */}
                                      <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                                        {index + 1}
                                      </span>
                                    </div>
                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {isRTL ? "الكمية:" : "Qty:"} {item.quantity.value}
                                    </p>
                                    <BundleItemsList item={item} locale={locale} compact />
                                  </div>
                                  {/* Price */}
                                  <FormattedPrice
                                    price={parseFloat(item.price) * item.quantity.value / divisor}
                                    className="text-sm font-medium"
                                    iconSize="xs"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Coupon Code Section */}
                            {featureFlags.enableCoupons && (
                            <div className="border-b border-gray-100 py-4">
                              <div className="mb-3">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <Tag className="h-4 w-4" />
                                  {isRTL ? "كود الخصم" : "Coupon Code"}
                                </label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <Input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder={isRTL ? "أدخل كود الخصم" : "Enter coupon code"}
                                    className="flex-1 min-w-0"
                                    error={couponError}
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    isLoading={couponLoading}
                                    disabled={couponLoading || !couponCode.trim()}
                                    size="sm"
                                    className="w-full sm:w-auto flex-shrink-0"
                                  >
                                    {isRTL ? "تطبيق" : "Apply"}
                                  </Button>
                                </div>
                              </div>

                              {/* Applied Coupons */}
                              {selectedCoupons.length > 0 && (
                                <div className="mb-3 space-y-2">
                                  {selectedCoupons.map((coupon) => (
                                    <div
                                      key={coupon.code}
                                      className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2"
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Tag className="h-4 w-4 text-green-600 flex-shrink-0" />
                                        <span className="text-sm font-medium text-green-700 truncate">
                                          {coupon.code}
                                        </span>
                                                                                <span className="text-xs text-green-600 flex-shrink-0">
                                                                                  ({coupon.discount_type === "percent" ? `${coupon.amount}%` : `${coupon.amount} ${currency}`})
                                                                                </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveCoupon(coupon.code)}
                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Available Coupons */}
                              {availableCoupons.length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    {isRTL ? "أكواد الخصم المتاحة:" : "Available coupons:"}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {availableCoupons.slice(0, 3).map((coupon) => (
                                      <button
                                        key={coupon.code}
                                        type="button"
                                        onClick={() => handleSelectCoupon(coupon.code)}
                                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100"
                                        title={coupon.description || `${formatCouponDiscount(coupon)} off`}
                                      >
                                        <Tag className="h-3 w-3" />
                                        {coupon.code}
                                        <span className="text-amber-600">({formatCouponDiscount(coupon)})</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {isLoadingCoupons && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-600"></div>
                                  {isRTL ? "جاري تحميل الأكواد..." : "Loading coupons..."}
                                </div>
                              )}
                            </div>
                            )}

                                          {/* Totals */}
                            <div className="space-y-3 border-b border-gray-100 py-4">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                                <FormattedPrice
                                  price={parseFloat(cartSubtotal) / divisor}
                                  iconSize="xs"
                                />
                              </div>
                              {couponDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>{isRTL ? "الخصم" : "Discount"}</span>
                                  <span className="inline-flex items-center gap-1">
                                    -<FormattedPrice
                                      price={couponDiscount / divisor}
                                      iconSize="xs"
                                    />
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>{isRTL ? "الشحن" : "Shipping"}</span>
                                {parseFloat(shippingTotal) > 0 ? (
                                  <FormattedPrice
                                    price={parseFloat(shippingTotal) / divisor}
                                    iconSize="xs"
                                  />
                                ) : parseFloat(cart?.totals?.shipping_total || "0") > 0 ? (
                                  <FormattedPrice
                                    price={parseFloat(cart?.totals?.shipping_total || "0") / divisor}
                                    iconSize="xs"
                                  />
                                ) : (
                                  <span className="text-green-600 font-medium">{isRTL ? "مجاني" : "Free"}</span>
                                )}
                              </div>
                              {/* VAT/Tax */}
                              {displayTax > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>{isRTL ? "ضريبة القيمة المضافة" : "VAT"}</span>
                                  <FormattedPrice
                                    price={displayTax / divisor}
                                    iconSize="xs"
                                  />
                                </div>
                              )}
                            </div>

              <div className="hidden py-4 text-lg font-bold text-gray-900 lg:flex lg:justify-between">
                <span>{isRTL ? "الإجمالي" : "Total"}</span>
                <FormattedPrice
                  price={checkoutTotal / divisor}
                  iconSize="sm"
                />
              </div>

              <Button
                type="submit"
                className="hidden w-full lg:flex"
                size="lg"
                isLoading={isSubmitting || isAuthLoading}
                disabled={isAuthLoading}
              >
                {isRTL ? "تأكيد الطلب" : "Place Order"}
              </Button>

              <p className="mt-4 hidden text-center text-xs text-gray-500 lg:block">
                {isRTL
                  ? "بالنقر على تأكيد الطلب، فإنك توافق على شروط الخدمة وسياسة الخصوصية."
                  : "By clicking Place Order, you agree to our Terms of Service and Privacy Policy."}
              </p>

              {/* WhatsApp Help */}
              <div className="mt-6 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 text-center">
                <p className="text-sm text-gray-700">
                  {isRTL ? "هل تحتاج مساعدة في طلبك؟" : "Need help with your order?"}
                </p>
                <a
                  href="https://wa.me/971506071405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {isRTL ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
      )}
      </div>

      {/* Mobile Sticky Order Summary - positioned above bottom nav bar */}
      {!isEmptyCart && (
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-black/10 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">{isRTL ? "الإجمالي" : "Total"}</span>
            <FormattedPrice
              price={checkoutTotal / divisor}
              className="text-lg font-bold text-gray-900"
              iconSize="sm"
            />
          </div>
          <Button 
            type="submit"
            form="checkout-form"
            size="lg" 
            className="flex-1 max-w-[200px]"
            isLoading={isSubmitting || isAuthLoading}
            disabled={isAuthLoading}
          >
            {isRTL ? "تأكيد الطلب" : "Place Order"}
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}
