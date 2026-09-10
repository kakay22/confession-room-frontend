import api from "./axios";

export async function reactToConfession(
    confessionId,
    reactionType
) {
    const response = await api.post(
        `confessions/${confessionId}/react/`,
        {
            reaction_type: reactionType,
        }
    );

    return response.data;
}