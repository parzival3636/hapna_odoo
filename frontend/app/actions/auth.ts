"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${API_BASE_URL}/users/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.detail || "Invalid email or password" };
    }

    const data = await res.json();
    const cookieStore = await cookies();

    // Fetch user profile to get the role
    const userRes = await fetch(`${API_BASE_URL}/users/me/`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${data.access}` },
    });
    
    let role = "customer";
    if (userRes.ok) {
      const userData = await userRes.json();
      role = userData.role || "customer";
    }

    // Set cookies
    cookieStore.set("access_token", data.access, { httpOnly: false, path: "/" });
    cookieStore.set("refresh_token", data.refresh, { httpOnly: true, path: "/" });
    cookieStore.set("user_role", role, { path: "/" });
    
    return { success: true, role, token: data.access };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_role");
}

export async function registerUser(formData: FormData, role: string) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  
  // Create first and last name from full name
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  try {
    const res = await fetch(`${API_BASE_URL}/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username: email, // Backend uses email as username
        email, 
        password,
        first_name: firstName,
        last_name: lastName,
        role: role
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.username?.[0] || errorData.email?.[0] || errorData.detail || "Registration failed" };
    }

    // After successful registration, log them in automatically
    return await loginUser(formData);
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
