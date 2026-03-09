import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const useRiders = () => {
    const registerRider = async (payload) => {
        try {
            const response = await axios.post(`${apiUrl}/riders`, payload);
            return response.data;
        } catch (error) {
            const serverMessage = error.response?.data?.message || "Rider registration failed.";
            console.error("Error registering rider:", serverMessage);
            return { success: false, message: serverMessage };
        }
    };
    const getRiderProfile = async (id) => {
        try {
            const response = await axios.get(`${apiUrl}/riders/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching rider profile:", error);
            throw error;
        }
    };

    const updateRiderProfile = async (id, data) => {
        try {
            const response = await axios.patch(`${apiUrl}/riders/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating rider profile:", error);
            throw error;
        }
    };

    const uploadRiderImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append("riderImage", file);

            const response = await axios.post(`${apiUrl}/riders/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data.url;
        } catch (error) {
            console.error("Error uploading rider image:", error);
            throw error;
        }
    };

    const uploadRiderDocuments = async (id, formData) => {
        try {
            const response = await axios.post(`${apiUrl}/riders/${id}/documents`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading rider documents:", error);
            throw error;
        }
    };

    return { registerRider, getRiderProfile, updateRiderProfile, uploadRiderImage, uploadRiderDocuments };
};

export default useRiders;
