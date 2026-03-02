import axios from "axios";

const API_URL = "http://localhost:4000/api/riders";

const useRiders = () => {
    const registerRider = async (payload) => {
        try {
            const response = await axios.post(API_URL, payload);
            return response.data;
        } catch (error) {
            console.error("Error registering rider:", error);
            throw error;
        }
    };

    return { registerRider };
};

export default useRiders;
