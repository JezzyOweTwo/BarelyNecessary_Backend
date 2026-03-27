const baseURL:string = `http://${process.env.APP_HOST}:${process.env.APP_PORT}`;

type ApiResponse<T> = {
    success: boolean;
    data: T;
};

type HttpMethod = "POST" | "PUT" | "DELETE" | "GET";

async function api_request<T>(method: HttpMethod, route: string, body?: object): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {}
    };

    // Only set Content-Type and body for non-GET requests
    if (method !== "GET") {
        options.headers = { "Content-Type": "application/json" };
        if (body) options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseURL}${route}`, options);

    if (!response.ok) {
        throw new Error(`${method} request failed: ${response.status}`);
    }

    let result: ApiResponse<T>;
    try {
        result = await response.json();
    } catch (err) {
        throw new Error(`${method} request returned invalid JSON`);
    }

    if (!result.success) {
        throw new Error(`${method} request returned success=false`);
    }

    return result.data;
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