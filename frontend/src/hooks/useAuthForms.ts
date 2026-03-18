"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/* ─── Login ─── */
export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const u = { ...prev };
        delete u[name];
        return u;
      });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (): Promise<boolean> => {
    if (!validate()) return false;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/");
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, loading, handleChange, submit };
}

/* ─── Register ─── */
export function useRegister() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "seller",
    referral_code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const u = { ...prev };
        delete u[name];
        return u;
      });
  };

  const setRole = (role: "user" | "seller") =>
    setFormData((prev) => ({ ...prev, role }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (): Promise<boolean> => {
    if (!validate()) return false;
    setLoading(true);
    try {
      await register(formData);
      router.push("/");
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, loading, handleChange, setRole, submit };
}
