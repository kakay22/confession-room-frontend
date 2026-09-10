import api from "./axios";

export async function getComments(confessionId) {
    const response = await api.get(
        `confessions/${confessionId}/comments/`
    );

    return Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
}

export async function createComment(
    confessionId,
    content
) {
    const response = await api.post(
        `confessions/${confessionId}/comments/`,
        { content }
    );

    return response.data;
}