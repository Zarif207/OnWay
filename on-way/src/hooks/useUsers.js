"use client";

export const useUsers = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const usersApi = `${baseUrl}/passenger`;

    const findUser = async (email) => {
        try {
            const res = await fetch(usersApi);
            if (!res.ok) throw new Error("Failed to fetch users");

            const result = await res.json();

            if (result.success && Array.isArray(result.data)) {
                return result.data.find(u => u.email === email);
            }
            return null;
        } catch (error) {
            console.error("Fetch Error:", error);
            return null;
        }
    };

    const registerUser = async (userData) => {
        try {
            const res = await fetch(usersApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
            });

            const result = await res.json();

            if (res.ok) {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || "Registration failed" };
            }
        } catch (error) {
            console.error("Post Error:", error);
            return { success: false, message: "Server connection failed. Is your backend running?" };
        }
    };

    return { findUser, registerUser };
};