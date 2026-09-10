import api from "./axios";

export async function getConfessions() {
    const response = await api.get("confessions/");

    return Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
}

export async function reportConfession(
    confessionId,
    data
) {
    const response = await api.post(
        `confessions/${confessionId}/report/`,
        data
    );

    return response.data;
}