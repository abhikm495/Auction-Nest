import axios from "axios";
const VITE_API = import.meta.env.VITE_API;

export const getCategories = async (formData) => {
    try {
        const res = await axios.get(`${VITE_API}/categories`,
            formData,
            { withCredentials: true }
        );
        console.log("get categories response",res);
        
        return res.data.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update password")
        throw error;
    }
}