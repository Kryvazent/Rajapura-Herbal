import { useState } from "react";

export interface ValidationErrors {
  [key: string]: string;
}

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(true);

  const validateLogin = (username: string, password: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    else if (username.trim().length < 3) newErrors.username = "Minimum 3 characters";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const validateProduct = (product: any): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!product.name?.trim()) newErrors.name = "Product name is required";
    if (!product.sinhalaName?.trim()) newErrors.sinhalaName = "Sinhala name required";
    if (!product.category?.trim()) newErrors.category = "Category required";
    if (!product.price || isNaN(Number(product.price))) newErrors.price = "Valid price required";
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, isValid, validateLogin, validateProduct };
};