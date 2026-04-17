const baseURL:string = `http://${process.env.APP_HOST}:${process.env.APP_PORT}`;
import {get_server_auth_token} from "@/lib/server_init";

type ApiResponse<T> = {
    success: boolean;
    data: T;
};

type HttpMethod = "POST" | "PUT" | "DELETE" | "GET";

async function api_request<T>(method: HttpMethod, route: string, body?: object): Promise<T> { 
    const server_auth_token = `Bearer ${await get_server_auth_token()}`;
    const options: RequestInit = {
        method,
        headers:{authorization: server_auth_token}
    };
    
    // Only set Content-Type and body for non-GET requests
    if (method !== "GET") {
        options.headers = {
            "Content-Type": "application/json",
            authorization: server_auth_token,
        };
        if (body) options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${baseURL}${route}`, options);
        
        if (!response.ok) {
            if (response.status === 404) 
                throw new Error(`API route not found: ${route}`);
            else if (response.status === 500) 
                throw new Error(`Server error while processing ${method} request to ${route}`);
            else if (response.status === 401)
                throw new Error(`Unauthorized: Invalid or missing authentication token for ${method} request to ${route}`);
            else if (response.status === 403)
                throw new Error(`Forbidden: You do not have permission to perform ${method} request to ${route}`);
            else if (response.status === 400)
                throw new Error(`Bad Request: The server could not understand the ${method} request to ${route} due to invalid syntax.`);   

            else 
                throw new Error(`Error Completing ${method}`);
        }

        const result: ApiResponse<T> = await response.json();
        return result.data;
    } 
    
    catch (err) {
        throw err;
    }
}

export function api_post<T>(route: string, body?: object): Promise<T> {
    return api_request<T>("POST", route, body);
}

export function api_put<T>(route: string, body?: object): Promise<T> {
    return api_request<T>("PUT", route, body);
}

export function api_delete<T>(route: string, body?: object): Promise<T> {
    return api_request<T>("DELETE", route, body);
}

export function api_get<T>(route: string): Promise<T> {
    return api_request<T>("GET", route);
}