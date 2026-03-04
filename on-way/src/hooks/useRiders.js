import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const useRiders = () => {
    const registerRider = async (payload) => {
        try {
            const response = await axios.post(apiUrl, payload);
            return response.data;
        } catch (error) {
            console.error("Error registering rider:", error);
            throw error;
        }
    };

    return { registerRider };
};

export default useRiders;
